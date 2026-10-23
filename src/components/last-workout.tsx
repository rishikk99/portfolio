"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

type Summary = { label: string; days_ago: number; sets: number; minutes: number };

const ago = (days: number) => (days === 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`);

/**
 * "Live from the connector": the newest workout, read from hevy-mcp's one
 * public endpoint each time the page loads. The endpoint only ever returns a
 * generic label, days ago, sets and minutes. If it can't be reached, the card
 * doesn't render at all rather than showing stale or placeholder numbers.
 */
export function LastWorkout() {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(site.featured.liveUrl, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Summary | null) => d && setData(d))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  if (!data) return null;

  return (
    <div className="mt-5 rounded-lg border bg-surface p-4">
      <div className="flex items-center gap-2 text-sm text-muted">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        Live from the connector
      </div>
      <p className="mt-3 text-sm text-muted">My last workout</p>
      <p className="text-xl font-semibold">
        {data.label} <span className="font-normal text-muted">· {ago(data.days_ago)}</span>
      </p>
      <p className="text-sm tabular-nums text-muted">
        {data.sets} sets · {data.minutes} min
      </p>
    </div>
  );
}
