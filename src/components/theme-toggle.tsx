"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

// The theme script in layout.tsx sets html[data-theme] before first paint:
// the visitor's saved choice, else the system setting.
const read = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

function subscribe(cb: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  // With no saved choice, follow the system setting as it changes.
  const onSystem = () => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("theme");
    } catch {}
    if (!saved) {
      document.documentElement.dataset.theme = media.matches ? "dark" : "light";
      cb();
    }
  };
  media.addEventListener("change", onSystem);
  window.addEventListener("theme:change", cb);
  return () => {
    media.removeEventListener("change", onSystem);
    window.removeEventListener("theme:change", cb);
  };
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {}
  window.dispatchEvent(new Event("theme:change"));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="rounded-full p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {theme === "dark" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </>
        ) : (
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        )}
      </svg>
    </button>
  );
}
