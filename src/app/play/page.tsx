import type { Metadata } from "next";
import Link from "next/link";
import { RunnerGame } from "@/components/runner-game";
import { ShortcutK } from "@/components/shortcut-key";

export const metadata: Metadata = { title: "Play — hidden game" };

export default function PlayPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-20">
      <p className="font-mono text-sm text-accent">you found the secret</p>
      <h1 className="mt-3 font-display text-5xl font-bold tracking-tight">Block Runner</h1>
      <p className="mt-3 text-muted">A little something hidden behind <ShortcutK />. Your high score is saved on your machine.</p>
      <div className="mt-10">
        <RunnerGame />
      </div>
      <Link href="/" className="mt-10 font-mono text-sm text-accent hover:underline">
        ← back home
      </Link>
    </main>
  );
}
