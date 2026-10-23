# Art Direction

The brief: a portfolio that reads like a person made it. Effort goes into the content; the design
stays out of the way. One personal touch (the live workout card) instead of many effects.

## Rules
- One column of text, about 660px wide. On wide screens a section list sits to its left and
  marks the current section. Plain section labels with a hairline under them.
- One font: Geist for everything. JetBrains Mono only inside the sentiment demo and the game.
- Light and dark. Light is warm paper and near-black ink; dark is the same, inverted. The page
  follows the device setting until the visitor uses the sun/moon button.
- Color is for meaning, not decoration. The rust accent appears only as the "live" dot and inside
  the demo.
- Links are underlined text, not buttons.
- No cards except the avatar tile, the live workout card and the open demo. No shadows, gradients, grids or glow.

## Tokens (`src/app/globals.css`)

| Token | Value | Role |
| --- | --- | --- |
| background | `#f7f6f2` | page |
| surface | `#ffffff` | the live card, the demo |
| foreground | `#1c1b19` | text |
| muted | `#6f6a60` | secondary text, labels, dates |
| border | `#e2ded3` | hairlines |
| accent | `#c2410c` | the live dot; demo highlights |

Dark mode redefines the same tokens (`#161513` background, `#ece9e2` text, `#fb923c` accent).

The generated favicon and Open Graph image hardcode these values.

## Writing
- Short, specific sentences in the first person. Numbers over adjectives.
- Say what a demo is: a rebuild of a technique, not the original project.

## Where things live
- Content: `src/lib/site.ts` (edit this first).
- Avatar: `src/components/avatar.tsx` (drawn in the theme colors).
- Live card: `src/components/last-workout.tsx`.
- Demo toggle: `src/components/demo-toggle.tsx`, demo in `src/components/demos/`.
- Theme button: `src/components/theme-toggle.tsx`; the pre-paint theme script is in `src/app/layout.tsx`.
- Section list: `src/components/side-nav.tsx`.
- Game: `src/components/runner-game.tsx` (404 page and `/play`).
- Résumé: `scripts/resume.html` renders `public/resume.pdf` via `npm run build:resume`. Keep it in
  sync with `resume.txt`.
