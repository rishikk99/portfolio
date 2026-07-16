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
          backgroundColor: "#14161d",
          backgroundImage: "radial-gradient(circle at 1px 1px, #2b2e37 1.5px, transparent 0)",
          backgroundSize: "34px 34px",
        }}
      >
        <div style={{ display: "flex", color: "#a3e635", fontSize: 30 }}>
          {"// " + site.location.toLowerCase()}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            color: "#f2f3f5",
            fontSize: 82,
            fontWeight: 700,
            letterSpacing: -2,
          }}
        >
          {site.name}
          <span style={{ color: "#a3e635" }}>.</span>
        </div>
        <div style={{ display: "flex", marginTop: 14, color: "#9aa0ab", fontSize: 42 }}>
          {site.role}
        </div>
        <div style={{ display: "flex", marginTop: 56, color: "#9aa0ab", fontSize: 27 }}>
          {site.tagline}
        </div>
      </div>
    ),
    size,
  );
}
