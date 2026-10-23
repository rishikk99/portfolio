/**
 * The site's mark: a connected "rk." The r's shoulder reaches over and joins
 * the k's stem, and a rust dot closes it like a period. It draws with the site's
 * tokens, so it inverts in dark mode (black tile in light, cream tile in dark).
 *
 * The favicon, touch icon and link-preview image redraw the same paths with
 * fixed colors (src/app/icon.tsx and friends): keep them in sync with these.
 */

export const RK_PATHS = [
  "M17 26 L17 48", // r stem
  "M17 34 C17 28 22 24.6 33 25", // r shoulder, joining the k's stem
  "M33 15 L33 48", // k stem
  "M46 24 L33 37.5", // k arm
  "M38.2 32.4 L47 48", // k leg
];
export const RK_DOT = { cx: 53, cy: 46.4, r: 3.2 };
export const RK_STROKE = 5;

export function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="rk" className="shrink-0">
      <rect width="64" height="64" rx="16" style={{ fill: "var(--foreground)" }} />
      <g fill="none" strokeWidth={RK_STROKE} strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--background)" }}>
        {RK_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <circle {...RK_DOT} style={{ fill: "var(--accent)" }} />
    </svg>
  );
}
