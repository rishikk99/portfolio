"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type Phase = "ready" | "playing" | "over";

// Best score lives in localStorage; useSyncExternalStore keeps the display in
// sync without a hydration mismatch (server snapshot is 0).
const BEST_KEY = "runner-best";
function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY) || 0);
  } catch {
    return 0;
  }
}
function subscribeBest(cb: () => void) {
  window.addEventListener("runner-best:change", cb);
  return () => window.removeEventListener("runner-best:change", cb);
}

/**
 * Easter egg: a tiny canvas endless-runner. Jump the blocks with Space / ↑ / tap.
 * Rendered on the 404 page and at /play. Demonstrates a real game loop,
 * physics, collision detection, and requestAnimationFrame cleanup.
 */
export function RunnerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const best = useSyncExternalStore(subscribeBest, readBest, () => 0);
  const phaseRef = useRef<Phase>("ready");

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    const resize = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Draw in the page's own colors, so the game follows light and dark mode.
    const tokens = getComputedStyle(document.documentElement);
    const colFg = tokens.getPropertyValue("--foreground").trim() || "#1c1b19";
    const colGround = tokens.getPropertyValue("--border").trim() || "#e2ded3";
    const colAccent = tokens.getPropertyValue("--accent").trim() || "#c2410c";

    const groundY = () => H - 26;

    // Mutable game state (kept out of React to run at 60fps)
    let obstacles: { x: number; w: number; h: number }[] = [];
    let speed = 4.4;
    let spawn = 60;
    let tick = 0;
    let scoreVal = 0;
    let raf = 0;
    const G = 0.7;
    const JUMP = -11.8;
    const player = { x: 46, y: 0, w: 22, h: 22, vy: 0, onGround: true };
    player.y = groundY() - player.h;

    const reset = () => {
      obstacles = [];
      speed = 4.4;
      spawn = 60;
      tick = 0;
      scoreVal = 0;
      player.y = groundY() - player.h;
      player.vy = 0;
      player.onGround = true;
      setScore(0);
    };

    const endGame = () => {
      setPhase("over");
      try {
        localStorage.setItem(BEST_KEY, String(Math.max(readBest(), scoreVal)));
      } catch {}
      window.dispatchEvent(new Event("runner-best:change"));
    };

    const jump = () => {
      const p = phaseRef.current;
      if (p === "ready") {
        setPhase("playing");
      } else if (p === "over") {
        reset();
        setPhase("playing");
        return;
      }
      if (player.onGround) {
        player.vy = JUMP;
        player.onGround = false;
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    const onPointer = (e: PointerEvent) => {
      e.preventDefault();
      jump();
    };
    window.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", onPointer);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = colGround;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY() + 1);
      ctx.lineTo(W, groundY() + 1);
      ctx.stroke();

      if (phaseRef.current === "playing") {
        tick++;
        player.vy += G;
        player.y += player.vy;
        const gy = groundY() - player.h;
        if (player.y >= gy) {
          player.y = gy;
          player.vy = 0;
          player.onGround = true;
        }

        spawn--;
        if (spawn <= 0) {
          obstacles.push({ x: W + 12, w: 12 + Math.random() * 16, h: 18 + Math.random() * 26 });
          spawn = Math.max(38, 84 - tick / 50) + Math.random() * 34;
        }
        speed += 0.0018;
        for (const o of obstacles) o.x -= speed;
        obstacles = obstacles.filter((o) => o.x + o.w > -12);

        if (tick % 3 === 0) {
          scoreVal++;
          setScore(scoreVal);
        }

        for (const o of obstacles) {
          const oy = groundY() - o.h;
          if (player.x < o.x + o.w && player.x + player.w > o.x && player.y < oy + o.h && player.y + player.h > oy) {
            endGame();
            break;
          }
        }
      }

      // player (with a little eye)
      ctx.fillStyle = colAccent;
      ctx.fillRect(player.x, player.y, player.w, player.h);
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(player.x + player.w - 8, player.y + 6, 4, 4);

      ctx.fillStyle = colFg;
      for (const o of obstacles) ctx.fillRect(o.x, groundY() - o.h, o.w, o.h);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between font-mono text-xs text-muted">
        <span>
          SCORE <span className="text-foreground">{String(score).padStart(4, "0")}</span>
        </span>
        <span>
          BEST <span className="text-foreground">{String(best).padStart(4, "0")}</span>
        </span>
      </div>

      <div className="relative h-[260px] w-full overflow-hidden rounded-xl border bg-surface">
        <canvas ref={canvasRef} className="h-full w-full touch-none select-none" />
        {phase !== "playing" && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
            <p className="font-display text-lg font-semibold text-foreground">
              {phase === "ready" ? "Press Space / Tap to jump" : "Game over"}
            </p>
            <p className="font-mono text-xs text-muted">
              {phase === "ready" ? "an endless runner, hidden where a 404 should be" : `you scored ${score} — Space / tap to retry`}
            </p>
          </div>
        )}
      </div>

      <p className="mt-3 font-mono text-xs text-muted">Controls: Space / ↑ / tap · jump the blocks.</p>
    </div>
  );
}
