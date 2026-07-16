"use client";

import { useSyncExternalStore } from "react";

/**
 * Renders the command-palette shortcut for the visitor's platform: ⌘K on
 * Apple devices, Ctrl K everywhere else. The platform never changes, so this
 * is a constant store — the server snapshot (Ctrl form, most visitors) is
 * replaced on hydration without a mismatch.
 */
const subscribeNever = () => () => {};
const readIsApple = () => /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);

export function useIsApple() {
  return useSyncExternalStore(subscribeNever, readIsApple, () => false);
}

export function ShortcutK() {
  const isApple = useIsApple();
  return <>{isApple ? "⌘K" : "Ctrl K"}</>;
}
