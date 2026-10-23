# Rishik Kanchanapally

Personal site. Next.js 16 (App Router), React 19, TypeScript, Tailwind v4.

A plain, one-column page: a short intro, projects, experience, education. A few things worth knowing:

- **Live workout card.** The hevy-mcp entry shows my most recent workout, fetched in the browser from
  [hevy-mcp](https://github.com/rishikk99/hevy-mcp)'s one public endpoint
  (`/public/last-workout`). It only ever returns a generic label, days ago, sets and minutes. If the
  endpoint can't be reached, the card doesn't render.
- **Sentiment demo.** A small browser rebuild of the classifier technique (multinomial Naive Bayes
  with Laplace smoothing and negation marking, trained in the tab on 64 examples). It isn't the
  original project, and the page says so.
- **Light and dark mode:** follows the device setting; the sun/moon button overrides it and is remembered.
- **Section list:** on wide screens, a list of sections on the left marks the one you're reading.
- **404 page:** a small canvas runner game, also at `/play`.
- **Generated assets:** the favicon, touch icon and Open Graph card are rendered from code at build
  time (`src/app/icon.tsx`, `opengraph-image.tsx`).

All content lives in [`src/lib/site.ts`](src/lib/site.ts). Design notes are in
[`ART_DIRECTION.md`](ART_DIRECTION.md). `npm run build:resume` renders `scripts/resume.html` to
`public/resume.pdf` with headless Chrome.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```
