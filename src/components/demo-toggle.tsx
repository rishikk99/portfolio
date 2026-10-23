"use client";

import { useEffect, useRef, useState } from "react";
import { SentimentDemo } from "@/components/demos/sentiment-demo";

const DEMOS = { sentiment: SentimentDemo } as const;
type DemoId = keyof typeof DEMOS;
const isDemoId = (v: unknown): v is DemoId => typeof v === "string" && v in DEMOS;

/**
 * A link that opens a project's in-page demo underneath it. Also opens from
 * a `?demo=<id>` link (replayed as a `demo:open` event).
 */
export function DemoToggle({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      if ((e as CustomEvent<{ id?: string }>).detail?.id === id) setOpen(true);
    };
    window.addEventListener("demo:open", onOpen);
    if (new URLSearchParams(window.location.search).get("demo") === id) {
      // Replay it as a `demo:open` event, so state is only set from the listener.
      window.history.replaceState(null, "", window.location.pathname + window.location.hash);
      window.dispatchEvent(new CustomEvent("demo:open", { detail: { id } }));
    }
    return () => window.removeEventListener("demo:open", onOpen);
  }, [id]);

  useEffect(() => {
    if (open) ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [open]);

  if (!isDemoId(id)) return null;
  const Demo = DEMOS[id];

  return (
    <>
      <button type="button" className="text-link text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? "Hide the demo" : "Try a browser rebuild of the classifier"}
      </button>
      {open && (
        <div ref={ref} className="mt-4 rounded-lg border bg-surface p-4">
          <p className="mb-3 text-sm text-muted">
            A small rebuild of the technique (Naive Bayes, trained in your browser on 64 examples), not the original
            project.
          </p>
          <Demo />
        </div>
      )}
    </>
  );
}
