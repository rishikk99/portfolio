import { ImageResponse } from "next/og";
import { rkDataUri } from "@/lib/rk-svg";

/** Home-screen / touch icon: the same "rk." mark as icon.tsx, at 180px. iOS rounds the corners itself. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function AppleIcon() {
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={rkDataUri({ rx: 0 })} width={180} height={180} alt="" />
    ),
    size,
  );
}
