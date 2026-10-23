import { ImageResponse } from "next/og";
import { rkDataUri } from "@/lib/rk-svg";

/** Browser-tab favicon, generated at build time: the "rk." mark (src/components/logo-mark.tsx). */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function Icon() {
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={rkDataUri()} width={32} height={32} alt="" />
    ),
    size,
  );
}
