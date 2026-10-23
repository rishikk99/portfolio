import Link from "next/link";
import { RunnerGame } from "@/components/runner-game";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-20">
      <p className="text-sm text-muted">error 404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Nothing here.</h1>
      <p className="mt-3 text-muted">
        That page doesn&apos;t exist. Since you&apos;re here, there&apos;s a small game.
      </p>
      <div className="mt-10">
        <RunnerGame />
      </div>
      <Link href="/" className="mt-10 text-sm text-link">
        Back home
      </Link>
    </main>
  );
}
