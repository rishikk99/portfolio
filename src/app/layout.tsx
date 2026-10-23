import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
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

// Resolve the theme before first paint (saved choice, else the system setting)
// so there's no flash of the wrong one.
// ?palette= and ?theme= are for the /colors comparison page only; remove with it.
const themeScript = `(function(){var d=document.documentElement;try{var q=new URLSearchParams(location.search);if(q.get('palette'))d.dataset.palette=q.get('palette');var t=q.get('theme')||localStorage.getItem('theme');d.dataset.theme=t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${jbmono.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full antialiased">
        {children}
      </body>
    </html>
  );
}
