import type { Metadata } from "next";
import Link from "next/link";
import { RunnerGame } from "@/components/runner-game";

export const metadata: Metadata = { title: "Play — hidden game" };

export default function PlayPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-20">
      <p className="text-sm text-muted">you found it</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Block Runner</h1>
      <p className="mt-3 text-muted">A small game that also lives on the 404 page. Your high score is saved in your browser.</p>
      <div className="mt-10">
        <RunnerGame />
      </div>
      <Link href="/" className="mt-10 text-sm text-link">
        Back home
      </Link>
    </main>
  );
}
