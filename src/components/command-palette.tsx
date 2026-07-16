"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { site } from "@/lib/site";
import { ShortcutK } from "@/components/shortcut-key";

type Command = {
  id: string;
  label: string;
  group: "Navigate" | "Demos" | "Actions" | "Links" | "Fun";
  hint?: string;
  keywords?: string;
  perform: () => void;
};

/**
 * The signature feature: an IDE-style ⌘K / Ctrl+K command palette.
 * Opens on the keyboard shortcut or a "palette:open" custom event
 * (fired by <PaletteTrigger />). Navigates the page, runs actions,
 * toggles the theme, and hides the route to the secret game.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const flash = useCallback((msg: string) => setToast(msg), []);

  // Auto-dismiss the toast; re-showing a message extends its life via cleanup
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const goto = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else router.push("/#" + id);
    },
    [router],
  );

  const toggleTheme = useCallback(() => {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {}
    flash(dark ? "Switched to dark" : "Switched to light");
  }, [flash]);

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      flash("Copied " + site.email);
    } catch {
      flash(site.email);
    }
  }, [flash]);

  // Open an in-page project demo. If the projects section isn't mounted
  // (e.g. on /play or the 404 page), navigate home with ?demo= instead.
  const openDemo = useCallback(
    (id: string) => {
      if (document.getElementById("projects")) {
        window.dispatchEvent(new CustomEvent("demo:open", { detail: { id } }));
        document.getElementById("projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        router.push("/?demo=" + id);
      }
    },
    [router],
  );

  const commands: Command[] = useMemo(
    () => [
      { id: "top", group: "Navigate", label: "Go to top", keywords: "home hero start", perform: () => goto("top") },
      { id: "about", group: "Navigate", label: "About", keywords: "bio who", perform: () => goto("about") },
      { id: "skills", group: "Navigate", label: "Skills & stack", keywords: "tech tools", perform: () => goto("skills") },
      { id: "projects", group: "Navigate", label: "Projects & work", keywords: "portfolio", perform: () => goto("projects") },
      { id: "contact", group: "Navigate", label: "Contact", keywords: "email reach", perform: () => goto("contact") },
      { id: "demo-pipeline", group: "Demos", label: "Run the trading-bot pipeline", hint: "▸ live", keywords: "demo project trading keyword regex latency whisper", perform: () => openDemo("pipeline") },
      { id: "demo-sentiment", group: "Demos", label: "Run the sentiment classifier", hint: "▸ live", keywords: "demo project nlp naive bayes tweets ml", perform: () => openDemo("sentiment") },
      { id: "copy", group: "Actions", label: "Copy email address", hint: site.email, perform: copyEmail },
      { id: "resume", group: "Actions", label: "Open résumé", keywords: "cv download", perform: () => window.open(site.resumeUrl, "_blank", "noopener") },
      { id: "theme", group: "Actions", label: "Toggle light / dark", keywords: "mode color theme", perform: toggleTheme },
      ...(site.socials.github
        ? [{ id: "github", group: "Links", label: "GitHub", hint: "↗", perform: () => window.open(site.socials.github, "_blank", "noopener") } as Command]
        : []),
      { id: "linkedin", group: "Links", label: "LinkedIn", hint: "↗", perform: () => window.open(site.socials.linkedin, "_blank", "noopener") },
      { id: "mail", group: "Actions", label: "Email me", hint: site.email, perform: () => { window.location.href = "mailto:" + site.email; } },
      { id: "play", group: "Fun", label: "Play the hidden game", hint: "▸", keywords: "easter egg dino runner secret", perform: () => router.push("/play") },
      { id: "perf", group: "Fun", label: "Toggle live perf HUD", hint: "vitals", keywords: "performance web vitals lcp cls inp metrics easter egg", perform: () => window.dispatchEvent(new CustomEvent("perfhud:toggle")) },
    ],
    [goto, copyEmail, toggleTheme, router, openDemo],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => (c.label + " " + c.group + " " + (c.keywords ?? "")).toLowerCase().includes(q));
  }, [query, commands]);

  // Opening always starts from a clean query/selection
  const openPalette = useCallback(() => {
    setQuery("");
    setActive(0);
    setOpen(true);
  }, []);

  // Global shortcut + custom open event
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) setOpen(false);
        else openPalette();
      }
    };
    const onOpen = () => openPalette();
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", onOpen as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", onOpen as EventListener);
    };
  }, [open, openPalette]);

  // Focus + scroll lock when opening
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 10);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Keep the highlighted row in view
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const run = useCallback((cmd?: Command) => {
    if (!cmd) return;
    setOpen(false);
    cmd.perform();
  }, []);

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(filtered[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <>
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full border bg-surface px-4 py-2 font-mono text-xs text-foreground shadow-lg">
          {toast}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Command menu">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative w-full max-w-lg overflow-hidden rounded-xl border bg-surface shadow-2xl">
            <div className="flex items-center gap-3 border-b px-4">
              <span className="font-mono text-sm text-accent">&rsaquo;</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKey}
                placeholder="Type a command or search…"
                className="w-full bg-transparent py-4 font-mono text-sm text-foreground outline-none placeholder:text-muted"
                aria-label="Command input"
              />
              <kbd className="hidden rounded border px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">esc</kbd>
            </div>

            <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center font-mono text-sm text-muted">No matches. Try “projects”.</p>
              ) : (
                filtered.map((cmd, i) => (
                  <button
                    key={cmd.id}
                    data-idx={i}
                    onClick={() => run(cmd)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      i === active ? "bg-accent text-accent-foreground" : "text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`font-mono text-[10px] uppercase tracking-wider ${i === active ? "text-accent-foreground/70" : "text-muted"}`}>
                        {cmd.group}
                      </span>
                      {cmd.label}
                    </span>
                    {cmd.hint && (
                      <span className={`font-mono text-xs ${i === active ? "text-accent-foreground/80" : "text-muted"}`}>{cmd.hint}</span>
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="flex items-center justify-between border-t px-4 py-2 font-mono text-[10px] text-muted">
              <span>↑↓ navigate · ↵ select</span>
              <span><ShortcutK /></span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
