# Art Direction

The brief: a job-seeker portfolio that looks **intentional**, not template-generated —
and proves engineering skill through the experience itself (a ⌘K command palette, a
hidden game, a console message for recruiters).

## Identity
A restrained "developer terminal" aesthetic: near-monochrome base, one electric accent,
generous whitespace, mono type used as UI chrome (labels, hints, metadata). Dark by default.

## Type
- **Display / headings:** Space Grotesk — geometric, a little characterful.
- **Body:** Geist — clean and quiet so it never competes with the headings.
- **Mono:** JetBrains Mono — labels, the command palette, code-flavored details.

Fonts load via `next/font/google` in `src/app/layout.tsx` and are exposed as the CSS
variables `--font-grotesk`, `--font-geist`, `--font-jbmono`, mapped to the Tailwind
utilities `font-display`, `font-sans`, `font-mono`.

## Color (OKLCH, defined in `src/app/globals.css`)
Semantic tokens that auto-switch with the `.dark` class — components only ever use
`bg-background`, `text-foreground`, `text-muted`, `border`, `bg-accent`, etc.

| Token              | Role                                  |
| ------------------ | ------------------------------------- |
| background         | page background                       |
| surface            | cards, palette, game canvas           |
| foreground         | primary text                          |
| muted              | secondary text, metadata              |
| border             | hairlines, dividers, the dotted grid  |
| accent             | the one electric color — use sparingly |
| accent-foreground  | text/!icons sitting on the accent     |

**Accent = amber ("ember", the default).** It's the only saturated color on the page.
Used for: section numbers, the cursor `›` in the palette, active palette row, hover
states, the game player. If everything is accent, nothing is — keep it rare.

Four alternate schemes — lime, ice, rose, violet — live as `html[data-palette]` token
overrides in `globals.css`, switchable from ⌘K → "Color scheme: …". The choice persists
in localStorage (`palette`) and is applied before first paint by the theme script in
`layout.tsx`. The console greeting and runner game read `--accent` at runtime; the
generated favicon/OG images hardcode the ember hex values (`#110d0b` bg, `#ffb330` accent).

## Layout rules (what keeps it un-generic)
- Left-aligned and asymmetric. **No** centered hero + symmetric 3-icon card grid.
- Big display type against lots of empty space.
- Mono "section numbers" (`01 — ABOUT`) instead of plain headings.
- One idea per section; let it breathe.

## Things to deliberately avoid
- Default Tailwind palette (indigo/violet, slate-on-white).
- Inter / system-font-only stacks.
- Purple→blue gradients.
- Drop-shadowed rounded cards everywhere.

## Where things live
- Content: `src/lib/site.ts` (edit this first).
- Command palette: `src/components/command-palette.tsx`.
- Console easter egg: `src/components/console-greeting.tsx`.
- Hidden game: `src/components/runner-game.tsx` (shown on the 404 page and `/play`).
- Live project demos: `src/components/demos/` hosted by `src/components/projects-section.tsx`
  (opened from the cards, ⌘K, or `/?demo=pipeline` / `/?demo=sentiment`).
- Perf HUD easter egg: `src/components/perf-hud.tsx` (⌘K → "Toggle live perf HUD").
- Résumé: `scripts/resume.html` is the print source — `npm run build:resume` renders
  `public/resume.pdf` with headless Chrome/Edge. Keep it in sync with `resume.txt`.
