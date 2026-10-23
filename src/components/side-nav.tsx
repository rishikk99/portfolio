"use client";

import { useEffect, useState } from "react";

export type NavItem = { id: string; label: string };

/**
 * The section list down the left side on wide screens. A line runs through
 * the sections; the one you're reading is marked as you scroll.
 */
export function SideNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    // A section counts as current once its top passes 30% down the screen.
    const update = () => {
      const line = window.innerHeight * 0.3;
      let current = sections[0]?.id;
      for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s.id;
      // At the very bottom, the last section is current even if it's short.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = sections[sections.length - 1]?.id;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

  return (
    <nav aria-label="Sections" className="sticky top-24 hidden lg:block">
      <ol className="relative border-l text-sm">
        {items.map((item) => {
          const on = item.id === active;
          return (
            <li key={item.id} className="relative">
              <span
                aria-hidden
                className={`absolute -left-[5px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full border transition-colors ${
                  on ? "border-foreground bg-foreground" : "border-border bg-background"
                }`}
              />
              <a
                href={`#${item.id}`}
                aria-current={on ? "location" : undefined}
                className={`block py-2 pl-5 transition-colors ${on ? "font-medium text-foreground" : "text-muted hover:text-foreground"}`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
