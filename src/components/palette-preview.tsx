"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Dev-only tool for comparing candidate color schemes on the real site.
 * Sets data-palette on <html>; the token overrides live in globals.css.
 * Only mounted when NODE_ENV === "development" (see layout.tsx) — delete
 * this file and the CSS blocks once a scheme wins.
 */

const PALETTES = [
  { id: "", label: "lime", swatch: "oklch(0.86 0.19 124)" },
  { id: "ice", label: "ice", swatch: "oklch(0.85 0.13 210)" },
  { id: "ember", label: "ember", swatch: "oklch(0.82 0.16 75)" },
  { id: "rose", label: "rose", swatch: "oklch(0.75 0.17 350)" },
  { id: "violet", label: "violet", swatch: "oklch(0.78 0.15 300)" },
] as const;

const STORAGE_KEY = "palette-preview";

// The selection lives in localStorage (like the perf HUD's visibility) and is
// exposed through useSyncExternalStore: server snapshot "" = default palette.
function readActive() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}
function subscribeActive(cb: () => void) {
  window.addEventListener("palette-preview:change", cb);
  return () => window.removeEventListener("palette-preview:change", cb);
}

export function PalettePreview() {
  const active = useSyncExternalStore(subscribeActive, readActive, () => "");

  // Mirror the selection onto <html data-palette> (also restores it on load)
  useEffect(() => {
    if (active) document.documentElement.dataset.palette = active;
    else delete document.documentElement.dataset.palette;
  }, [active]);

  const pick = (id: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
    window.dispatchEvent(new Event("palette-preview:change"));
  };

  return (
    <aside
      aria-label="Palette preview (dev only)"
      className="fixed bottom-4 right-4 z-40 rounded-lg border bg-surface/95 p-2 font-mono text-[11px] shadow-lg backdrop-blur"
    >
      <div className="px-1 pb-1.5 uppercase tracking-widest text-muted">palette · dev</div>
      <div className="flex gap-1">
        {PALETTES.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => pick(p.id)}
            className={`flex items-center gap-1.5 rounded-md border px-2 py-1 transition-colors ${
              active === p.id ? "border-accent text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.swatch }} />
            {p.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
