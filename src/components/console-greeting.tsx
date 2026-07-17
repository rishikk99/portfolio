"use client";

import { useEffect } from "react";
import { site } from "@/lib/site";

/**
 * Easter egg #1: a greeting for anyone who opens DevTools, plus a global
 * contact() function that prints how to reach me. Written for the kind of
 * visitor who inspects a site before trusting it.
 */
export function ConsoleGreeting() {
  useEffect(() => {
    // Follow the active color scheme; fall back to the ember accent.
    const accentColor =
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#ffb330";
    const accent = "color:" + accentColor + ";font-weight:bold";
    const dim = "color:#9ca3af";
    const k = /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent) ? "⌘K" : "Ctrl+K";

    console.log("%c👋 hey there, fellow dev.", "font-size:14px;font-weight:bold;color:" + accentColor);
    console.log("%cRun %ccontact()%c if you want to reach me.", dim, accent, dim);
    console.log("%cAlso: press %c" + k + "%c and type \"demo\" — two of my projects run live on this page.", dim, accent, dim);

    // Define a global contact() the curious can run.
    (window as unknown as { contact?: () => string }).contact = () => {
      console.log("%c" + site.name + " — " + site.role, "font-size:13px;" + accent);
      console.log("📧  " + site.email);
      if (site.socials.github) console.log("🐙  " + site.socials.github);
      console.log("💼  " + site.socials.linkedin);
      return "Copy my email → " + site.email;
    };

    return () => {
      delete (window as unknown as { contact?: () => string }).contact;
    };
  }, []);

  return null;
}
