"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Easter egg #3: a live Web-Vitals readout measured on the visitor's own
 * device with PerformanceObserver — no analytics script, nothing leaves the
 * tab. Toggled from the ⌘K palette via a `perfhud:toggle` CustomEvent;
 * visibility persists in localStorage.
 */

type Metrics = {
  ttfb: number | null;
  fcp: number | null;
  lcp: number | null;
  cls: number;
  inp: number | null;
};

// web.dev thresholds: [good, needs-improvement]
const THRESHOLDS: Record<keyof Metrics, [number, number]> = {
  ttfb: [800, 1800],
  fcp: [1800, 3000],
  lcp: [2500, 4000],
  cls: [0.1, 0.25],
  inp: [200, 500],
};

function rating(key: keyof Metrics, value: number): "good" | "ok" | "poor" {
  const [good, ok] = THRESHOLDS[key];
  return value <= good ? "good" : value <= ok ? "ok" : "poor";
}

type EventTimingEntry = PerformanceEntry & { interactionId?: number; duration: number };
type LayoutShiftEntry = PerformanceEntry & { value: number; hadRecentInput: boolean };

// Visibility lives in localStorage (in-memory fallback when storage is blocked)
// and is exposed to React through useSyncExternalStore, so the server render
// stays hidden and no hydration mismatch is possible.
let memVisible = false;
function readVisible() {
  try {
    const v = localStorage.getItem("perfhud");
    if (v !== null) return v === "1";
  } catch {}
  return memVisible;
}
function subscribeVisible(cb: () => void) {
  window.addEventListener("perfhud:change", cb);
  return () => window.removeEventListener("perfhud:change", cb);
}

export function PerfHud() {
  const visible = useSyncExternalStore(subscribeVisible, readVisible, () => false);
  const [m, setM] = useState<Metrics>({ ttfb: null, fcp: null, lcp: null, cls: 0, inp: null });

  // The palette (and our ✕ button) fire perfhud:toggle; flip the store and notify
  useEffect(() => {
    const onToggle = () => {
      const next = !readVisible();
      memVisible = next;
      try {
        localStorage.setItem("perfhud", next ? "1" : "0");
      } catch {}
      window.dispatchEvent(new Event("perfhud:change"));
    };
    window.addEventListener("perfhud:toggle", onToggle);
    return () => window.removeEventListener("perfhud:toggle", onToggle);
  }, []);

  // Observers stay cheap and passive, so they run regardless of visibility —
  // buffered entries mean late-opened HUDs still show the page's real numbers.
  useEffect(() => {
    const observers: PerformanceObserver[] = [];
    const observe = (type: string, cb: (entries: PerformanceEntry[]) => void, extra?: object) => {
      try {
        const po = new PerformanceObserver((list) => cb(list.getEntries()));
        po.observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
        observers.push(po);
      } catch {} // older browsers: skip that metric
    };

    observe("navigation", (entries) => {
      const nav = entries[0] as PerformanceNavigationTiming | undefined;
      if (nav) setM((prev) => ({ ...prev, ttfb: nav.responseStart }));
    });
    observe("paint", (entries) => {
      const fcp = entries.find((e) => e.name === "first-contentful-paint");
      if (fcp) setM((prev) => ({ ...prev, fcp: fcp.startTime }));
    });
    observe("largest-contentful-paint", (entries) => {
      const last = entries[entries.length - 1];
      if (last) setM((prev) => ({ ...prev, lcp: last.startTime }));
    });
    observe("layout-shift", (entries) => {
      const shift = (entries as LayoutShiftEntry[])
        .filter((e) => !e.hadRecentInput)
        .reduce((s, e) => s + e.value, 0);
      if (shift > 0) setM((prev) => ({ ...prev, cls: prev.cls + shift }));
    });
    // Worst interaction ≈ INP for sessions with <50 interactions
    observe(
      "event",
      (entries) => {
        const worst = (entries as EventTimingEntry[])
          .filter((e) => e.interactionId)
          .reduce((mx, e) => Math.max(mx, e.duration), 0);
        if (worst > 0) setM((prev) => ({ ...prev, inp: Math.max(prev.inp ?? 0, worst) }));
      },
      { durationThreshold: 40 },
    );

    return () => observers.forEach((po) => po.disconnect());
  }, []);

  if (!visible) return null;

  const rows: { key: keyof Metrics; label: string; value: string | null; r: "good" | "ok" | "poor" | null }[] = (
    [
      ["ttfb", "ttfb", m.ttfb, (v: number) => `${v.toFixed(0)}ms`],
      ["fcp", "fcp", m.fcp, (v: number) => `${v.toFixed(0)}ms`],
      ["lcp", "lcp", m.lcp, (v: number) => `${v.toFixed(0)}ms`],
      ["cls", "cls", m.cls, (v: number) => v.toFixed(3)],
      ["inp", "inp", m.inp, (v: number) => `${v.toFixed(0)}ms`],
    ] as const
  ).map(([key, label, value, fmt]) => ({
    key,
    label,
    value: value === null ? null : fmt(value),
    r: value === null ? null : rating(key, value),
  }));

  return (
    <aside
      aria-label="Live performance metrics"
      className="fixed bottom-4 left-4 z-40 w-44 rounded-lg border bg-surface/95 p-3 font-mono text-[11px] shadow-lg backdrop-blur print:hidden"
    >
      <div className="flex items-center justify-between">
        <span className="uppercase tracking-widest text-accent">perf — live</span>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("perfhud:toggle"))}
          aria-label="Close performance HUD"
          className="text-muted transition-colors hover:text-foreground"
        >
          ✕
        </button>
      </div>
      <ul className="mt-2 space-y-1">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-2">
            <span className="text-muted">{row.label}</span>
            <span className="flex items-center gap-1.5 text-foreground">
              {row.value ?? "—"}
              {row.r === "good" && <span className="text-accent" title="good">●</span>}
              {row.r === "ok" && <span className="text-muted" title="needs improvement">●</span>}
              {row.r === "poor" && <span title="poor">▲</span>}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 leading-snug text-muted">
        measured on your device via PerformanceObserver · nothing leaves this tab
      </p>
    </aside>
  );
}
