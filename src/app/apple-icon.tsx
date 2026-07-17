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
          backgroundColor: "#110d0b",
          color: "#f4f1ed",
          fontSize: 118,
          fontWeight: 700,
        }}
      >
        r<span style={{ color: "#ffb330" }}>.</span>
      </div>
    ),
    size,
  );
}
