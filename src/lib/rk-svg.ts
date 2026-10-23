import { RK_DOT, RK_PATHS, RK_STROKE } from "@/components/logo-mark";

/** The "rk." mark as a standalone SVG data URI, for the generated icons and link-preview image. */
export function rkDataUri({ tile = "#1c1b19", ink = "#f7f6f2", dot = "#c2410c", rx = 16 } = {}): string {
  const paths = RK_PATHS.map((d) => `<path d="${d}"/>`).join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="${rx}" fill="${tile}"/>` +
    `<g fill="none" stroke="${ink}" stroke-width="${RK_STROKE}" stroke-linecap="round" stroke-linejoin="round">${paths}</g>` +
    `<circle cx="${RK_DOT.cx}" cy="${RK_DOT.cy}" r="${RK_DOT.r}" fill="${dot}"/>` +
    `</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
