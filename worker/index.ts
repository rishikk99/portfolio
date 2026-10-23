// The site's Worker. It serves the static build in out/ and handles the one
// dynamic route, POST /api/contact, which validates a message, stores it with
// the sender's IP in D1, and emails it to the owner.

import { EmailMessage } from "cloudflare:email";

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  MAILER: SendEmail;
  /** Turnstile secret. When unset, the form works without the human check. */
  TURNSTILE_SECRET?: string;
}

const HOST = "rishikk.com";
const FROM = `contact@${HOST}`;
const TO = "rishik.kanchanapally@gmail.com";

const LIMITS = { name: 100, email: 200, message: 5000 };
const PER_IP_PER_HOUR = 3;
const PER_DAY = 50;

// Generated images are built without a file extension, so give them their type.
const IMAGES = new Set(["/icon", "/apple-icon", "/opengraph-image"]);

// Until the site is finished: every response asks search engines not to index
// it, and the out-of-date résumé isn't served. Set to true at launch, and put
// resumeUrl back in src/lib/site.ts.
const LAUNCHED = false;
const HIDDEN_UNTIL_LAUNCH = new Set(["/resume.pdf"]);

const TIME_ZONE = "America/Chicago";

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname === `www.${HOST}`) {
      url.hostname = HOST;
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, { Allow: "POST" });
      return handleContact(request, env);
    }
    if (!LAUNCHED && HIDDEN_UNTIL_LAUNCH.has(url.pathname)) {
      return env.ASSETS.fetch(new Request(new URL("/404", url), request)).then(
        (r) => new Response(r.body, { status: 404, headers: noindex(r.headers) }),
      );
    }
    const response = await env.ASSETS.fetch(request);
    const headers = LAUNCHED ? new Headers(response.headers) : noindex(response.headers);
    if (IMAGES.has(url.pathname) && response.ok) headers.set("Content-Type", "image/png");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
} satisfies ExportedHandler<Env>;

function noindex(source: Headers): Headers {
  const headers = new Headers(source);
  headers.set("X-Robots-Tag", "noindex, nofollow");
  return headers;
}

/** e.g. "Oct 20, 2026, 11:59 PM CDT" */
function localTime(iso: string): string {
  const when = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, dateStyle: "medium", timeStyle: "short" });
  return `${when.format(new Date(iso))} ${zoneName(iso)}`;
}

function zoneName(iso: string): string {
  return (
    new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "short" })
      .formatToParts(new Date(iso))
      .find((p) => p.type === "timeZoneName")?.value ?? ""
  );
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

type Fields = { name: string; email: string; message: string; company: string; token: string };

/** Reads and trims the form fields; returns an error message if any is unusable. */
function readFields(body: unknown): Fields | string {
  if (!body || typeof body !== "object") return "Invalid request.";
  const b = body as Record<string, unknown>;
  const text = (k: string) => (typeof b[k] === "string" ? (b[k] as string).trim() : "");
  const f = { name: text("name"), email: text("email"), message: text("message"), company: text("company"), token: text("token") };
  if (!f.name || f.name.length > LIMITS.name) return "Please enter your name.";
  // No characters that could break out of an email header (<, >, quotes, commas...).
  if (f.email.length > LIMITS.email || !/^[^\s@<>"(),;:\\]+@[^\s@<>"(),;:\\]+\.[^\s@<>"(),;:\\]+$/.test(f.email)) {
    return "Please enter a valid email address.";
  }
  if (!f.message || f.message.length > LIMITS.message) return `Please enter a message (up to ${LIMITS.message} characters).`;
  return f;
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  if (!(request.headers.get("Content-Type") ?? "").includes("application/json")) {
    return json({ error: "Invalid request." }, 415);
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
  const fields = readFields(body);
  if (typeof fields === "string") return json({ error: fields }, 400);

  // The hidden "company" field is invisible to people; bots fill it in. Pretend it worked.
  if (fields.company) return json({ ok: true });

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";

  if (env.TURNSTILE_SECRET && !(await turnstileOk(env.TURNSTILE_SECRET, fields.token, ip))) {
    return json({ error: "The human check didn't pass. Please try again." }, 403);
  }

  const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
  const counts = await env.DB.prepare(
    "SELECT (SELECT COUNT(*) FROM messages WHERE ip = ?1 AND created_at > ?2) AS per_ip," +
      " (SELECT COUNT(*) FROM messages WHERE created_at > ?3) AS per_day",
  )
    .bind(ip, hourAgo, dayAgo)
    .first<{ per_ip: number; per_day: number }>();
  if ((counts?.per_ip ?? 0) >= PER_IP_PER_HOUR || (counts?.per_day ?? 0) >= PER_DAY) {
    return json({ error: "Too many messages. Please try again later, or email me directly." }, 429);
  }

  const cf = (request as Request & { cf?: { country?: string } }).cf;
  const row = {
    created_at: new Date().toISOString(),
    country: cf?.country ?? null,
    user_agent: (request.headers.get("User-Agent") ?? "").slice(0, 300),
  };
  const inserted = await env.DB.prepare(
    "INSERT INTO messages (created_at, name, email, message, ip, country, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id",
  )
    .bind(row.created_at, fields.name, fields.email, fields.message, ip, row.country, row.user_agent)
    .first<{ id: number }>();

  // The message is safe in D1 from here; a failed email is recorded, not lost.
  try {
    const raw = buildEmail({ ...fields, ip, ...row, id: inserted?.id ?? 0 });
    await env.MAILER.send(new EmailMessage(FROM, TO, raw));
    await env.DB.prepare("UPDATE messages SET delivered = 1 WHERE id = ?").bind(inserted?.id).run();
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    await env.DB.prepare("UPDATE messages SET error = ? WHERE id = ?").bind(error.slice(0, 500), inserted?.id).run();
    console.log(JSON.stringify({ contact: "email_failed", id: inserted?.id, error }));
  }
  return json({ ok: true });
}

async function turnstileOk(secret: string, token: string, ip: string): Promise<boolean> {
  if (!token) return false;
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  form.append("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

/** Header-safe: no line breaks, so a sender can't inject headers. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

/** RFC 2047 encoded-word. Always encoded, so punctuation in a sender's name can't change the header's meaning. */
function encodeHeader(s: string): string {
  return `=?UTF-8?B?${b64(s)}?=`;
}

function b64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function buildEmail(m: Fields & { ip: string; id: number; created_at: string; country: string | null; user_agent: string }): string {
  const name = oneLine(m.name);
  const email = oneLine(m.email);
  const text = [
    m.message,
    "",
    "—",
    `From: ${name} <${email}>`,
    `IP: ${m.ip}${m.country ? ` (${m.country})` : ""}`,
    `Sent: ${localTime(m.created_at)}`,
    `Browser: ${m.user_agent || "unknown"}`,
    `Message #${m.id}, stored in the site's database.`,
  ].join("\r\n");
  const body = b64(text).replace(/.{1,76}/g, "$&\r\n");
  return [
    `From: ${encodeHeader("rishikk.com contact form")} <${FROM}>`,
    `To: <${TO}>`,
    `Reply-To: ${encodeHeader(name)} <${email}>`,
    `Subject: ${encodeHeader(`Message from ${name}`)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${HOST}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    body,
  ].join("\r\n");
}
