"use client";

import { useId } from "react";

// CSS-only hover/focus tooltip — no portal, no positioning library. Good
// enough for short one-line explanations attached to metric cards.
export default function Tooltip({ label, children, className = "" }) {
  const id = useId();
  if (!label) return children;

  return (
    <span className={`group/tooltip relative inline-flex ${className}`}>
      <span aria-describedby={id} className="inline-flex">
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[240px] -translate-x-1/2 scale-95 rounded-lg bg-(--foreground) px-3 py-2 text-xs leading-snug text-(--background) opacity-0 shadow-lg transition-all duration-150 group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100 group-focus-within/tooltip:scale-100 group-focus-within/tooltip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
