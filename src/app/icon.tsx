import { ImageResponse } from "next/og";

/**
 * Browser-tab favicon, generated at build time: the header wordmark's
 * "r." monogram on the site's dark background.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 7,
          color: "#f2f3f5",
          fontSize: 21,
          fontWeight: 700,
        }}
      >
        r<span style={{ color: "#a3e635" }}>.</span>
      </div>
    ),
    size,
  );
}
