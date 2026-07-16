import Link from "next/link";
import { RunnerGame } from "@/components/runner-game";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-20">
      <p className="font-mono text-sm text-accent">error 404</p>
      <h1 className="mt-3 font-display text-5xl font-bold tracking-tight">This page ran off.</h1>
      <p className="mt-3 text-muted">
        The page you wanted doesn&apos;t exist — but since you&apos;re here, jump a few blocks.
      </p>
      <div className="mt-10">
        <RunnerGame />
      </div>
      <Link href="/" className="mt-10 font-mono text-sm text-accent hover:underline">
        ← back home
      </Link>
    </main>
  );
}
