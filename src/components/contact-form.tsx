"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The contact form. It posts to /api/contact (worker/index.ts), which stores the
 * message with the sender's IP and emails it to the owner. With a Turnstile site
 * key set at build time (NEXT_PUBLIC_TURNSTILE_SITE_KEY), it also shows
 * Cloudflare's human check.
 */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type Status = { kind: "idle" | "sending" | "sent" } | { kind: "error"; message: string };

const field =
  "w-full rounded-md border bg-surface px-3 py-2 text-[16px] text-foreground outline-none placeholder:text-muted focus:border-foreground";

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [token, setToken] = useState("");
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!SITE_KEY || !widget.current) return;
    const el = widget.current;
    const render = () => {
      if (window.turnstile && !widgetId.current) {
        widgetId.current = window.turnstile.render(el, {
          sitekey: SITE_KEY,
          theme: "auto",
          callback: (t: string) => setToken(t),
          "expired-callback": () => setToken(""),
        });
      }
    };
    if (window.turnstile) return render();
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = render;
    document.head.appendChild(script);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, token }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && body.ok) {
        form.reset();
        setStatus({ kind: "sent" });
      } else {
        setStatus({ kind: "error", message: body.error ?? "Something went wrong. Please try again." });
      }
    } catch {
      setStatus({ kind: "error", message: "Couldn't reach the server. Please try again." });
    } finally {
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
      setToken("");
    }
  }

  if (status.kind === "sent") {
    return <p className="rounded-md border bg-surface px-4 py-3">Thanks, your message is on its way. I&apos;ll reply by email.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Name</span>
          <input name="name" required maxLength={100} autoComplete="name" className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Email</span>
          <input name="email" type="email" required maxLength={200} autoComplete="email" className={field} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm text-muted">Message</span>
        <textarea name="message" required maxLength={5000} rows={5} className={field} />
      </label>
      {/* Hidden from people; bots tend to fill it in. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {SITE_KEY && <div ref={widget} />}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="submit"
          disabled={status.kind === "sending" || (!!SITE_KEY && !token)}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {status.kind === "sending" ? "Sending…" : "Send"}
        </button>
        {status.kind === "error" && <p className="text-sm text-accent">{status.message}</p>}
      </div>
      <p className="text-xs text-muted">Your message and IP address are stored to prevent spam.</p>
    </form>
  );
}
