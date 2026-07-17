import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

/**
 * The social-share card (LinkedIn, Slack, iMessage…), generated at build
 * time to match the site: dark, dotted grid, one accent.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — ${site.role}`;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 88,
          backgroundColor: "#110d0b",
          backgroundImage: "radial-gradient(circle at 1px 1px, #322c28 1.5px, transparent 0)",
          backgroundSize: "34px 34px",
        }}
      >
        <div style={{ display: "flex", color: "#ffb330", fontSize: 30 }}>
          {"// " + site.location.toLowerCase()}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            color: "#f4f1ed",
            fontSize: 82,
            fontWeight: 700,
            letterSpacing: -2,
          }}
        >
          {site.name}
          <span style={{ color: "#ffb330" }}>.</span>
        </div>
        <div style={{ display: "flex", marginTop: 14, color: "#a59d95", fontSize: 42 }}>
          {site.role}
        </div>
        <div style={{ display: "flex", marginTop: 56, color: "#a59d95", fontSize: 27 }}>
          {site.tagline}
        </div>
      </div>
    ),
    size,
  );
}
