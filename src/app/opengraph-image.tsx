import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { rkDataUri } from "@/lib/rk-svg";

/**
 * The social-share card (LinkedIn, Slack, iMessage…), generated at build
 * time to match the site: paper background, the "rk." mark, and the name.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";
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
          backgroundColor: "#f7f6f2",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={rkDataUri()} width={104} height={104} alt="" style={{ marginBottom: 40 }} />
        <div style={{ display: "flex", color: "#6f6a60", fontSize: 30 }}>
          {site.location}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            color: "#1c1b19",
            fontSize: 82,
            fontWeight: 600,
            letterSpacing: -1,
          }}
        >
          {site.name}
        </div>
        <div style={{ display: "flex", marginTop: 14, color: "#6f6a60", fontSize: 42 }}>
          {site.role}
        </div>
        <div style={{ display: "flex", marginTop: 56, color: "#6f6a60", fontSize: 27 }}>
          {site.tagline}
        </div>
      </div>
    ),
    size,
  );
}
