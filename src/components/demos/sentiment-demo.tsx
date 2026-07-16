"use client";

import { useMemo, useState } from "react";

/**
 * A working miniature of the sentiment-analysis project: a multinomial
 * Naive Bayes classifier (Laplace smoothing + negation marking) trained
 * right here in the browser on the labeled examples below. No API calls,
 * no libraries — the point is to show the technique, not to wrap one.
 */

// ---------------------------------------------------------------------------
// Training data: 64 short, tweet-flavored examples (32 positive / 32 negative)
// ---------------------------------------------------------------------------
const POSITIVE = [
  "absolutely love the new update",
  "this app is amazing and so fast",
  "great support team, fixed my issue in minutes",
  "the redesign looks beautiful",
  "works perfectly on my phone now",
  "best purchase i've made this year",
  "setup was quick and painless",
  "the new feature saved me hours of work",
  "clean interface and super intuitive",
  "shipping was fast and the quality is excellent",
  "honestly impressed with the performance",
  "customer service was helpful and friendly",
  "runs smooth even on my old laptop",
  "the api docs are clear and well written",
  "huge improvement over the last version",
  "love how simple the onboarding is",
  "this made my workflow so much easier",
  "brilliant idea, executed really well",
  "the battery life is incredible",
  "five stars, would recommend to anyone",
  "finally an app that just works",
  "the team keeps shipping great features",
  "not bad at all, pleasantly surprised",
  "no complaints so far, everything works",
  "can't believe how good this is",
  "the demo won me over instantly",
  "so happy with the results",
  "excellent value for the price",
  "the fix worked, thanks for the quick response",
  "loving the dark mode, looks awesome",
  "smart design and thoughtful details",
  "my whole team switched and we're thrilled",
];

const NEGATIVE = [
  "the app keeps crashing on startup",
  "worst customer service i've ever dealt with",
  "totally broken after the update",
  "slow, buggy, and constantly freezing",
  "i want a refund, this is useless",
  "the site has been down all day",
  "terrible experience, would not recommend",
  "my order arrived damaged and late",
  "support never replied to my ticket",
  "the ui is confusing and cluttered",
  "hate the new layout, bring back the old one",
  "payment failed three times in a row",
  "this update ruined everything",
  "awful quality for such an expensive product",
  "the battery drains in two hours",
  "can't log in and the reset email never arrives",
  "disappointed with the lack of features",
  "the export button does nothing",
  "laggy scrolling makes it unusable",
  "they charged me twice and won't respond",
  "the docs are outdated and wrong",
  "not worth the money at all",
  "this is not working on my device",
  "the installer fails with a weird error",
  "lost all my data after syncing",
  "ads everywhere, deleted the app",
  "the meeting audio cuts out constantly",
  "horrible onboarding, gave up halfway",
  "no response from the team in weeks",
  "the search feature is completely broken",
  "angry that my subscription renewed without warning",
  "everything about this release feels rushed",
];

// ---------------------------------------------------------------------------
// Tokenizer with stopword removal and negation marking: content words after
// "not / never / can't / …" get a not_ prefix, so "not working" trains and
// scores separately from "working". Stopwords carry no sentiment — dropping
// them keeps the tiny corpus from learning noise like "a" or "the".
// ---------------------------------------------------------------------------
const NEGATORS = new Set([
  "not", "no", "never", "nothing", "hardly", "barely",
  "dont", "don't", "cant", "can't", "wont", "won't", "aint", "ain't",
  "isnt", "isn't", "wasnt", "wasn't", "doesnt", "doesn't", "didnt", "didn't",
  "couldnt", "couldn't", "wouldnt", "wouldn't", "shouldnt", "shouldn't",
]);

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "so", "of", "to", "in", "on", "at",
  "for", "with", "from", "by", "as", "is", "are", "was", "were", "be", "been",
  "am", "it", "its", "it's", "this", "that", "these", "those", "i", "i've",
  "i'm", "my", "me", "we", "we're", "our", "you", "your", "they", "them",
  "their", "he", "she", "his", "her", "has", "have", "had", "do", "does",
  "did", "will", "would", "can", "could", "s", "t",
]);

function tokenize(text: string): string[] {
  const raw = text.toLowerCase().match(/[a-z']+/g) ?? [];
  const out: string[] = [];
  let negate = 0;
  for (const t of raw) {
    if (NEGATORS.has(t)) {
      negate = 2; // mark the next two content words as negated
      continue;
    }
    if (STOPWORDS.has(t)) continue; // negation scope skips over stopwords
    out.push(negate > 0 ? "not_" + t : t);
    if (negate > 0) negate--;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Multinomial Naive Bayes with Laplace (add-one) smoothing
// ---------------------------------------------------------------------------
type Model = {
  logPriorPos: number;
  logPriorNeg: number;
  counts: Map<string, { pos: number; neg: number }>;
  totalPos: number;
  totalNeg: number;
  vocabSize: number;
  trainMs: number;
};

function train(): Model {
  const t0 = performance.now();
  const counts = new Map<string, { pos: number; neg: number }>();
  let totalPos = 0;
  let totalNeg = 0;

  const add = (docs: string[], cls: "pos" | "neg") => {
    for (const doc of docs) {
      for (const tok of tokenize(doc)) {
        const c = counts.get(tok) ?? { pos: 0, neg: 0 };
        c[cls]++;
        counts.set(tok, c);
        if (cls === "pos") totalPos++;
        else totalNeg++;
      }
    }
  };
  add(POSITIVE, "pos");
  add(NEGATIVE, "neg");

  const total = POSITIVE.length + NEGATIVE.length;
  return {
    logPriorPos: Math.log(POSITIVE.length / total),
    logPriorNeg: Math.log(NEGATIVE.length / total),
    counts,
    totalPos,
    totalNeg,
    vocabSize: counts.size,
    trainMs: performance.now() - t0,
  };
}

/** Log-likelihood ratio of one token: >0 pushes positive, <0 pushes negative. */
function tokenLLR(model: Model, tok: string): number {
  const c = model.counts.get(tok) ?? { pos: 0, neg: 0 };
  const pPos = (c.pos + 1) / (model.totalPos + model.vocabSize);
  const pNeg = (c.neg + 1) / (model.totalNeg + model.vocabSize);
  return Math.log(pPos) - Math.log(pNeg);
}

function classify(model: Model, text: string) {
  const tokens = tokenize(text);
  const contributions = tokens.map((tok) => ({ tok, llr: tokenLLR(model, tok), known: model.counts.has(tok) }));
  const score =
    model.logPriorPos - model.logPriorNeg + contributions.reduce((s, c) => s + c.llr, 0);
  const pPos = 1 / (1 + Math.exp(-score)); // posterior from the log-odds
  return { tokens, contributions, score, pPos };
}

// ---------------------------------------------------------------------------

const SAMPLES = [
  "just got early access and the new dashboard is honestly amazing",
  "app crashed twice during checkout and support never replied",
  "not bad for a first release",
  "the update is not working and i can't log in",
];

export function SentimentDemo() {
  const model = useMemo(() => train(), []);
  const [input, setInput] = useState(SAMPLES[0]);

  const result = useMemo(
    () => (input.trim() ? classify(model, input) : null),
    [model, input],
  );

  const verdict = !result
    ? null
    : result.pPos > 0.55
      ? ("positive" as const)
      : result.pPos < 0.45
        ? ("negative" as const)
        : ("uncertain" as const);

  const topSignals = result
    ? [...result.contributions]
        .filter((c) => c.known)
        .sort((a, b) => Math.abs(b.llr) - Math.abs(a.llr))
        .slice(0, 3)
    : [];

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Input side */}
      <div>
        <label htmlFor="sentiment-input" className="font-mono text-xs uppercase tracking-widest text-muted">
          input
        </label>
        <textarea
          id="sentiment-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder="type a tweet-length take…"
          className="mt-2 w-full rounded-lg border bg-background px-4 py-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {SAMPLES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setInput(s)}
              className="rounded-full border px-3 py-1 text-left font-mono text-[11px] text-muted transition-colors hover:border-accent hover:text-foreground"
            >
              {s.length > 38 ? s.slice(0, 36) + "…" : s}
            </button>
          ))}
        </div>
        <p className="mt-4 font-mono text-[11px] leading-relaxed text-muted">
          multinomial naive bayes · laplace smoothing · stopwords dropped · negation marking
          <br />
          trained in your browser on {POSITIVE.length + NEGATIVE.length} labeled examples
          ({model.vocabSize} token vocab, {model.trainMs.toFixed(1)}ms) · zero network calls
        </p>
      </div>

      {/* Analysis side */}
      <div>
        <div className="font-mono text-xs uppercase tracking-widest text-muted">classification</div>
        {!result || verdict === null ? (
          <p className="mt-2 font-mono text-sm text-muted">— waiting for input</p>
        ) : (
          <>
            <p className="mt-2 font-mono text-2xl font-semibold tracking-tight">
              <span className={verdict === "positive" ? "text-accent" : verdict === "negative" ? "text-foreground" : "text-muted"}>
                {verdict.toUpperCase()}
              </span>{" "}
              <span className="text-sm font-normal text-muted">
                P(positive) = {(result.pPos * 100).toFixed(1)}%
              </span>
            </p>

            {/* Per-token contribution bars */}
            <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-2">
              {result.contributions.map((c, i) => (
                <span key={i} className="inline-flex flex-col items-start" title={`log-likelihood ratio ${c.llr >= 0 ? "+" : ""}${c.llr.toFixed(2)}${c.known ? "" : " (unseen token)"}`}>
                  <span className={`font-mono text-xs ${Math.abs(c.llr) < 0.05 ? "text-muted" : "text-foreground"}`}>{c.tok}</span>
                  <span
                    className={`mt-1 h-0.5 rounded-full ${c.llr >= 0 ? "bg-accent" : "bg-muted"}`}
                    style={{ width: `${Math.min(Math.max(Math.abs(c.llr) * 18, 2), 56)}px` }}
                  />
                </span>
              ))}
            </div>

            {topSignals.length > 0 && (
              <p className="mt-5 font-mono text-xs text-muted">
                strongest signals:{" "}
                {topSignals.map((c, i) => (
                  <span key={i}>
                    {i > 0 && " · "}
                    <span className="text-foreground">{c.tok}</span> ({c.llr >= 0 ? "+" : ""}
                    {c.llr.toFixed(2)})
                  </span>
                ))}
              </p>
            )}

            <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted">
              <span className="mr-1 inline-block h-0.5 w-4 translate-y-[-2px] rounded-full bg-accent" />
              pushes positive ·
              <span className="mx-1 inline-block h-0.5 w-4 translate-y-[-2px] rounded-full bg-muted" />
              pushes negative · bar length = |log-likelihood ratio| · not_x = negation-marked token
            </p>
          </>
        )}
      </div>
    </div>
  );
}
