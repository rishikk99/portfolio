import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page is static, so the site builds to plain files in out/. Cloudflare
  // serves them, and a small Worker (worker/index.ts) handles the contact form.
  output: "export",
};

export default nextConfig;
