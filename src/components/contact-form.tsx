"use client";

import { useState } from "react";
import { site } from "@/lib/site";

/**
 * A real-looking contact form that composes a pre-filled email to you.
 * Zero backend required — submitting opens the visitor's mail app addressed
 * to you. (Upgrade path: swap the submit handler for a Web3Forms/Formspree
 * fetch to send without leaving the page.)
 */
export function ContactForm() {
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio message from ${name || "someone"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}${from ? ` (${from})` : ""}`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
  };

  const field =
    "w-full rounded-lg border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" className={field} aria-label="Your name" />
        <input value={from} onChange={(e) => setFrom(e.target.value)} type="email" placeholder="Your email" className={field} aria-label="Your email" />
      </div>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} placeholder="What's on your mind?" className={field} aria-label="Message" />
      <button
        type="submit"
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
      >
        Send message →
      </button>
      <p className="font-mono text-[11px] text-muted">Opens in your email app, addressed to me.</p>
    </form>
  );
}
