"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A working miniature of the trading bot's audio→signal pipeline.
 * The audio feed and order fills are simulated (the real bot listened to
 * live event streams); everything in between is real: the regex engine
 * runs against a rolling transcript window on every chunk, detection is
 * micro-benchmarked with performance.now(), and rules are one-shot
 * "staged orders" exactly like the real execution tooling.
 */

type Speaker = "op" | "ceo" | "cfo" | "analyst";

// Fictional earnings call. Word count drives the simulated audio clock (~150 wpm).
const TRANSCRIPT: { speaker: Speaker; text: string }[] = [
  { speaker: "op", text: "good afternoon and welcome to the ACME Robotics second quarter earnings call" },
  { speaker: "op", text: "joining today are the chief executive and chief financial officers" },
  { speaker: "ceo", text: "thanks operator — q2 was the strongest quarter in company history" },
  { speaker: "ceo", text: "we shipped over forty thousand units and demand keeps accelerating" },
  { speaker: "ceo", text: "revenue came in at a record — record revenue of 2.4 billion dollars" },
  { speaker: "cfo", text: "gross margin expanded to 61 percent on manufacturing efficiencies" },
  { speaker: "cfo", text: "operating expenses grew slower than revenue for the fourth straight quarter" },
  { speaker: "ceo", text: "customer feedback on the new platform has been outstanding" },
  { speaker: "cfo", text: "given that strength, we are raising our full-year guidance to 9.8 billion" },
  { speaker: "cfo", text: "we expect margins to hold at current levels through year end" },
  { speaker: "ceo", text: "the board has also approved a two billion dollar share buyback" },
  { speaker: "ceo", text: "we'll now open the line for questions" },
  { speaker: "analyst", text: "congrats on the quarter — how durable is the demand you're seeing" },
  { speaker: "ceo", text: "backlog now extends into the third quarter of next year" },
  { speaker: "op", text: "that concludes today's call — thank you for joining" },
];

const MS_PER_WORD = 400; // ≈150 wpm spoken pace
const WINDOW_CHARS = 160; // rolling detection window over the transcript tail
const BENCH_RUNS = 32; // detection is micro-benchmarked to beat timer granularity

type Rule = {
  id: number;
  pattern: string;
  side: "YES" | "NO";
  fired: boolean;
};

const DEFAULT_RULES: Rule[] = [
  { id: 1, pattern: "record revenue", side: "YES", fired: false },
  { id: 2, pattern: "raising\\s+(\\S+\\s+){0,4}guidance", side: "YES", fired: false },
  { id: 3, pattern: "(cutting|lowering)\\s+(\\S+\\s+){0,4}guidance", side: "NO", fired: false },
  { id: 4, pattern: "buyback", side: "YES", fired: false },
];

type Line =
  | { kind: "asr"; id: number; at: string; speaker: Speaker; text: string }
  | { kind: "match"; id: number; pattern: string; side: "YES" | "NO"; detectUs: number }
  | { kind: "exec"; id: number; fillMs: number; e2eMs: number; ingestMs: number; asrMs: number }
  | { kind: "info"; id: number; text: string };

// Omit that distributes over the Line union (plain Omit collapses it)
type NewLine = Line extends infer L ? (L extends Line ? Omit<L, "id"> : never) : never;

const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const fmtClock = (ms: number) => `+${(ms / 1000).toFixed(1)}s`;

export function PipelineDemo() {
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);
  const [lines, setLines] = useState<Line[]>([
    { kind: "info", id: 0, text: "feed ready — press run to start the simulated call" },
  ]);
  const [status, setStatus] = useState<"idle" | "running" | "paused" | "done">("idle");
  const [speed, setSpeed] = useState(4);
  const [chunkCount, setChunkCount] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [lastE2e, setLastE2e] = useState<number | null>(null);

  const [newPattern, setNewPattern] = useState("");
  const [newSide, setNewSide] = useState<"YES" | "NO">("YES");
  const [ruleError, setRuleError] = useState<string | null>(null);

  const [detectTimes, setDetectTimes] = useState<number[]>([]);
  const [cursor, setCursor] = useState(0);

  const buffer = useRef("");
  const simClock = useRef(0);
  const lineId = useRef(1);
  const feedRef = useRef<HTMLDivElement>(null);
  const stickBottom = useRef(true);

  // Autoscroll the feed unless the user scrolled up to read
  useEffect(() => {
    const el = feedRef.current;
    if (el && stickBottom.current) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const push = useCallback((...ls: NewLine[]) => {
    const withIds = ls.map((l) => ({ ...l, id: lineId.current++ }) as Line);
    setLines((prev) => [...prev, ...withIds]);
  }, []);

  // The playback loop. While running, each effect pass owns exactly one timer:
  // wait out the previous chunk's spoken duration, then emit the chunk at
  // `cursor`, run real regex detection over the rolling window, and advance.
  // Pausing, changing speed, or editing rules just re-runs the effect.
  useEffect(() => {
    if (status !== "running" || cursor >= TRANSCRIPT.length) return;

    const delay = cursor === 0 ? 400 : (TRANSCRIPT[cursor - 1].text.split(/\s+/).length * MS_PER_WORD) / speed;

    const id = window.setTimeout(() => {
      const chunk = TRANSCRIPT[cursor];
      const durMs = chunk.text.split(/\s+/).length * MS_PER_WORD;
      simClock.current += durMs;
      buffer.current = (buffer.current + " " + chunk.text).slice(-2000);
      const win = buffer.current.slice(-WINDOW_CHARS);

      push({ kind: "asr", at: fmtClock(simClock.current), speaker: chunk.speaker, text: chunk.text });
      setChunkCount((c) => c + 1);

      // Real detection: compile armed rules, micro-benchmark the scan, collect hits
      const armed = rules
        .filter((r) => !r.fired)
        .map((r) => {
          try {
            return { rule: r, re: new RegExp(r.pattern, "i") };
          } catch {
            return null;
          }
        })
        .filter((x): x is { rule: Rule; re: RegExp } => x !== null);

      if (armed.length > 0) {
        const t0 = performance.now();
        for (let i = 0; i < BENCH_RUNS; i++) for (const a of armed) a.re.test(win);
        const detectUs = ((performance.now() - t0) / BENCH_RUNS) * 1000;
        setDetectTimes((prev) => [...prev, detectUs]);

        const hits = armed.filter((a) => a.re.test(win));
        if (hits.length > 0) {
          setRules((prev) => prev.map((r) => (hits.some((h) => h.rule.id === r.id) ? { ...r, fired: true } : r)));
          for (const h of hits) {
            // Simulated stage latencies, sized to the real bot's measured budget
            const ingestMs = rand(850, 1150);
            const asrMs = rand(160, 320);
            const fillMs = rand(120, 260);
            const e2eMs = ingestMs + asrMs + detectUs / 1000 + fillMs;
            setMatchCount((m) => m + 1);
            setLastE2e(e2eMs);
            push(
              { kind: "match", pattern: h.rule.pattern, side: h.rule.side, detectUs },
              { kind: "exec", fillMs, e2eMs, ingestMs, asrMs },
            );
          }
        }
      }

      if (cursor + 1 >= TRANSCRIPT.length) {
        setStatus("done");
        push({ kind: "info", text: "feed ended — reset to run it again (or edit the rules first)" });
      } else {
        setCursor(cursor + 1);
      }
    }, delay);

    return () => window.clearTimeout(id);
  }, [status, cursor, speed, rules, push]);

  const reset = () => {
    buffer.current = "";
    simClock.current = 0;
    setCursor(0);
    setDetectTimes([]);
    setChunkCount(0);
    setMatchCount(0);
    setLastE2e(null);
    setRules((prev) => prev.map((r) => ({ ...r, fired: false })));
    setStatus("idle");
    setLines([{ kind: "info", id: lineId.current++, text: "reset — rules re-armed, feed ready" }]);
  };

  const run = () => {
    if (status === "running") return;
    if (status === "done") reset();
    push({ kind: "info", text: status === "paused" ? "▶ resumed" : "▶ feed started (simulated audio · real detection)" });
    setStatus("running");
  };

  const pause = () => {
    setStatus("paused");
    push({ kind: "info", text: "⏸ paused" });
  };

  const addRule = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pattern = newPattern.trim();
    if (!pattern) return;
    try {
      new RegExp(pattern, "i");
    } catch {
      setRuleError("invalid regex");
      return;
    }
    setRuleError(null);
    setRules((prev) => [...prev, { id: Date.now(), pattern, side: newSide, fired: false }]);
    setNewPattern("");
  };

  const removeRule = (id: number) => setRules((prev) => prev.filter((r) => r.id !== id));

  const sortedDetect = [...detectTimes].sort((a, b) => a - b);
  const p50 = sortedDetect.length ? sortedDetect[Math.floor(sortedDetect.length / 2)] : null;

  const speakerLabel: Record<Speaker, string> = { op: "operator", ceo: "ceo", cfo: "cfo", analyst: "analyst" };

  return (
    <div>
      {/* Metrics strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-xs text-muted">
        <span>
          feed <span className={status === "running" ? "text-accent" : "text-foreground"}>{status}</span>
        </span>
        <span>
          chunks <span className="text-foreground">{chunkCount}/{TRANSCRIPT.length}</span>
        </span>
        <span>
          matches <span className="text-foreground">{matchCount}</span>
        </span>
        <span>
          detect p50{" "}
          <span className="text-foreground">{p50 === null ? "—" : p50 < 1 ? "<1µs" : `${p50.toFixed(0)}µs`}</span>
          <span className="text-muted"> (measured)</span>
        </span>
        <span>
          last e2e{" "}
          <span className="text-foreground">{lastE2e === null ? "—" : `${(lastE2e / 1000).toFixed(2)}s`}</span>
          <span className="text-muted"> (sim)</span>
        </span>
      </div>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_19rem]">
        {/* Terminal feed */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {status === "running" ? (
              <button type="button" onClick={pause} className="rounded-full border px-4 py-1.5 font-mono text-xs transition-colors hover:border-accent">
                ⏸ pause
              </button>
            ) : (
              <button type="button" onClick={run} className="rounded-full bg-accent px-4 py-1.5 font-mono text-xs font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5">
                ▶ {status === "paused" ? "resume" : "run"}
              </button>
            )}
            <button type="button" onClick={() => reset()} className="rounded-full border px-4 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-foreground">
              ↺ reset
            </button>
            <div className="ml-auto flex items-center gap-1 font-mono text-xs text-muted">
              speed
              {[1, 4, 16].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`rounded-full px-2.5 py-1 transition-colors ${speed === s ? "bg-accent text-accent-foreground" : "border text-muted hover:text-foreground"}`}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>

          <div
            ref={feedRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              stickBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
            }}
            className="mt-3 h-72 overflow-y-auto rounded-lg border bg-background p-4 font-mono text-xs leading-relaxed"
            aria-live="off"
          >
            {lines.map((l) => {
              if (l.kind === "info")
                return (
                  <p key={l.id} className="text-muted">
                    ── {l.text}
                  </p>
                );
              if (l.kind === "asr")
                return (
                  <p key={l.id} className="text-muted">
                    <span className="text-foreground/70">{l.at}</span> [{speakerLabel[l.speaker]}] {l.text}
                  </p>
                );
              if (l.kind === "match")
                return (
                  <p key={l.id} className="text-accent">
                    ▸ MATCH /{l.pattern}/ → buy {l.side} · detect {l.detectUs < 1 ? "<1µs" : `${l.detectUs.toFixed(0)}µs`}
                  </p>
                );
              // exec line + latency breakdown bar
              const total = l.e2eMs;
              const seg = (ms: number) => `${Math.max((ms / total) * 100, 0.5)}%`;
              return (
                <div key={l.id} className="mb-1">
                  <p className="text-foreground">
                    order filled in {l.fillMs.toFixed(0)}ms · e2e audio→fill {(l.e2eMs / 1000).toFixed(2)}s (sim)
                  </p>
                  <div className="mt-1 flex h-1 w-full max-w-xs overflow-hidden rounded-full" title={`ingest ${l.ingestMs.toFixed(0)}ms · asr ${l.asrMs.toFixed(0)}ms · detect <1ms · fill ${l.fillMs.toFixed(0)}ms`}>
                    <span className="bg-border" style={{ width: seg(l.ingestMs) }} />
                    <span className="bg-muted" style={{ width: seg(l.asrMs) }} />
                    <span className="bg-accent" style={{ width: seg(l.fillMs) }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-2 font-mono text-[11px] text-muted">
            latency bar: <span className="text-foreground/80">ingest</span> ·{" "}
            <span className="text-foreground/80">asr</span> · detect (µs, invisible) ·{" "}
            <span className="text-accent">fill</span> — sized to the real bot&apos;s ~1.5s budget
          </p>
        </div>

        {/* Staged rules */}
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-muted">staged rules</div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Each rule is a pre-staged order: it submits the moment its regex first matches the
            rolling {WINDOW_CHARS}-char transcript window, then disarms — one shot, like the real
            execution tooling.
          </p>
          <ul className="mt-4 space-y-2">
            {rules.map((r) => (
              <li
                key={r.id}
                className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 font-mono text-xs ${r.fired ? "opacity-50" : ""}`}
              >
                <span className="min-w-0 break-all">
                  /{r.pattern}/ → <span className={r.fired ? "" : "text-accent"}>buy {r.side}</span>
                </span>
                {r.fired ? (
                  <span className="shrink-0 text-muted">✓ filled</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeRule(r.id)}
                    aria-label={`Remove rule ${r.pattern}`}
                    className="shrink-0 text-muted transition-colors hover:text-foreground"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
          <form onSubmit={addRule} className="mt-3 space-y-2">
            <input
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              placeholder="add a regex… e.g. margin\s+expanded"
              aria-label="New rule regex"
              className="w-full rounded-lg border bg-background px-3 py-2 font-mono text-xs text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNewSide(newSide === "YES" ? "NO" : "YES")}
                className="rounded-full border px-3 py-1 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-foreground"
              >
                buy {newSide} ⇄
              </button>
              <button type="submit" className="rounded-full border px-3 py-1 font-mono text-xs transition-colors hover:border-accent">
                + stage rule
              </button>
              {ruleError && <span className="font-mono text-xs italic text-muted">{ruleError}</span>}
            </div>
          </form>
          <p className="mt-4 font-mono text-[11px] leading-relaxed text-muted">
            simulated: audio feed (fictional $ACME call) &amp; fill times.
            <br />
            real: regex engine, rolling window, µs timings — all measured live in your tab.
          </p>
        </div>
      </div>
    </div>
  );
}
