import { ImageResponse } from "next/og";

/** Home-screen / touch icon: same "r." monogram as icon.tsx, at 180px. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#14161d",
          color: "#f2f3f5",
          fontSize: 118,
          fontWeight: 700,
        }}
      >
        r<span style={{ color: "#a3e635" }}>.</span>
      </div>
    ),
    size,
  );
}
