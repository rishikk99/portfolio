"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { PipelineDemo } from "@/components/demos/pipeline-demo";
import { SentimentDemo } from "@/components/demos/sentiment-demo";

/**
 * The projects grid plus an expandable live-demo panel. Demos exist because
 * most of this work has no public repo to link — instead of dead links, the
 * technique runs right here. Opens via the card buttons, a `demo:open`
 * CustomEvent (fired by the ⌘K palette), or a `?demo=<id>` URL param.
 */

const DEMOS = {
  pipeline: {
    title: "event-market trading bot",
    note: "audio→signal pipeline, rebuilt for the browser",
    Component: PipelineDemo,
  },
  sentiment: {
    title: "social-media sentiment analysis",
    note: "the classifier, retrained live in your tab",
    Component: SentimentDemo,
  },
} as const;

type DemoId = keyof typeof DEMOS;

const isDemoId = (v: string | null | undefined): v is DemoId => v === "pipeline" || v === "sentiment";

export function ProjectsShowcase() {
  const [openDemo, setOpenDemo] = useState<DemoId | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Open from the ⌘K palette (demo:open) or a ?demo= link, e.g. /?demo=pipeline —
  // the URL param just replays the same event the palette fires.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const id = (e as CustomEvent<{ id?: string }>).detail?.id;
      if (isDemoId(id)) setOpenDemo(id);
    };
    window.addEventListener("demo:open", onOpen);
    const param = new URLSearchParams(window.location.search).get("demo");
    if (isDemoId(param)) {
      window.history.replaceState(null, "", window.location.pathname + window.location.hash);
      window.dispatchEvent(new CustomEvent("demo:open", { detail: { id: param } }));
    }
    return () => window.removeEventListener("demo:open", onOpen);
  }, []);

  // Bring the panel into view once it exists; ESC closes it
  useEffect(() => {
    if (!openDemo) return;
    const id = window.setTimeout(
      () => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
      30,
    );
    const onKey = (e: KeyboardEvent) => {
      // leave ESC alone while the command palette (a dialog) has it
      if (e.key === "Escape" && !(e.target as Element | null)?.closest?.('[role="dialog"]')) {
        setOpenDemo(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [openDemo]);

  const active = openDemo ? DEMOS[openDemo] : null;

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {site.projects.map((p) => {
          const demoId = isDemoId(p.demo) ? p.demo : null;
          return (
            <article key={p.name} className="group flex flex-col rounded-xl border p-5 transition-colors hover:border-accent">
              <h3 className="font-display text-lg font-semibold">{p.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.blurb}</p>
              <ul className="mt-4 flex flex-wrap gap-2 font-mono text-xs text-muted">
                {p.tech.map((t) => (
                  <li key={t} className="rounded-full border px-2 py-0.5">{t}</li>
                ))}
              </ul>
              {(demoId || p.live || p.code) && (
                <div className="mt-4 flex items-center gap-4 font-mono text-xs">
                  {demoId && (
                    <button
                      type="button"
                      onClick={() => setOpenDemo(openDemo === demoId ? null : demoId)}
                      aria-expanded={openDemo === demoId}
                      className="text-accent hover:underline"
                    >
                      {openDemo === demoId ? "● running below" : "▸ run it live"}
                    </button>
                  )}
                  {p.live && (
                    <a href={p.live} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">live ↗</a>
                  )}
                  {p.code && (
                    <a href={p.code} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">code ↗</a>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {active && (
        <div ref={panelRef} className="mt-6 scroll-mt-24 rounded-xl border bg-surface/60">
          <div className="flex items-center justify-between gap-4 border-b px-5 py-3">
            <p className="min-w-0 truncate font-mono text-xs uppercase tracking-widest">
              <span className="text-accent">demo</span>
              <span className="text-muted"> — {active.title} · {active.note}</span>
            </p>
            <button
              type="button"
              onClick={() => setOpenDemo(null)}
              className="shrink-0 font-mono text-xs text-muted transition-colors hover:text-foreground"
            >
              esc ✕
            </button>
          </div>
          <div className="p-5 sm:p-6">
            <active.Component />
          </div>
        </div>
      )}
    </div>
  );
}
