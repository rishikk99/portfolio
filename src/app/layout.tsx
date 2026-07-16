import type { Metadata } from "next";
import { Geist, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CommandPalette } from "@/components/command-palette";
import { ConsoleGreeting } from "@/components/console-greeting";
import { PerfHud } from "@/components/perf-hud";
import { PalettePreview } from "@/components/palette-preview";
import { site } from "@/lib/site";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"], display: "swap" });
const jbmono = JetBrains_Mono({ variable: "--font-jbmono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  // metadataBase makes social-share URLs absolute; skipped until site.url is set.
  ...(site.url ? { metadataBase: new URL(site.url) } : {}),
  title: `${site.name} — ${site.role}`,
  description: site.intro,
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.tagline,
    siteName: site.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.tagline,
  },
};

// Apply the saved theme before first paint to avoid a flash. Defaults to dark.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark', t ? t==='dark' : true);}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${grotesk.variable} ${jbmono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full antialiased">
        {children}
        <CommandPalette />
        <ConsoleGreeting />
        <PerfHud />
        {process.env.NODE_ENV === "development" && <PalettePreview />}
      </body>
    </html>
  );
}
