"use client";

import { ShortcutK } from "@/components/shortcut-key";

/**
 * A button that opens the command palette by firing a custom event the
 * CommandPalette listens for. Lets server components (header, hero, contact)
 * trigger the palette without prop-drilling state.
 */
export function PaletteTrigger({
  className = "",
  label = <ShortcutK />,
}: {
  className?: string;
  label?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label="Open command menu"
      onClick={() => window.dispatchEvent(new CustomEvent("palette:open"))}
      className={className}
    >
      {label}
    </button>
  );
}
