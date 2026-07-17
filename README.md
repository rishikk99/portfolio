# rishikkanchanapally.

Personal site. Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4.

**The interesting parts:**

- **Command palette** (`Ctrl K` / `⌘K`) — IDE-style navigation for the whole site: sections, actions, light/dark, five color schemes, and a few things that aren't in the nav.
- **Live project demos** — instead of dead links to private repos, two projects run in the page: a miniature of a trading bot's audio→signal pipeline (real regex detection, micro-benchmarked with `performance.now()`), and a multinomial Naive Bayes sentiment classifier trained in your browser tab (Laplace smoothing, negation marking, per-token log-likelihood bars). No libraries, no API calls.
- **Perf HUD** — live Core Web Vitals (TTFB/FCP/LCP/CLS/INP) measured on the visitor's own device with `PerformanceObserver`. Nothing leaves the tab.
- **404 page** — a playable canvas endless-runner. Also hiding at `/play`.
- **Generated assets** — the favicon, touch icon, and Open Graph card are rendered from code at build time (`src/app/icon.tsx`, `opengraph-image.tsx`), so they always match the design tokens.

**Architecture notes:**

- All content lives in one typed file, [`src/lib/site.ts`](src/lib/site.ts) — swapping a project or updating experience never touches a component.
- Design tokens are OKLCH CSS variables with class-based dark mode (default). [`ART_DIRECTION.md`](ART_DIRECTION.md) documents the design system.
- `npm run build:resume` renders `scripts/resume.html` to `public/resume.pdf` with headless Chrome — the résumé is an artifact of the repo, not an upload.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```
