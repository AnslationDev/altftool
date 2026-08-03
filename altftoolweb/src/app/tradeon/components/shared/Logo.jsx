// src/app/tradeon/components/shared/Logo.jsx
"use client";

import { cn } from "../../utils/cn";

/**
 * Tradeon brand lockup: a clean, solid uptrend mark (no gradients, no letter
 * monogram) + the full "Tradeon" wordmark. Reads premium in both light and dark
 * themes.
 */
export default function Logo({ className, mark = true, wordmark = true, size = 30 }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {mark && (
        <span
          className="relative inline-grid place-items-center"
          style={{
            width: size,
            height: size,
            borderRadius: Math.round(size * 0.28),
            background: "var(--tdn-mark-bg)",
            boxShadow: "inset 0 0 0 1px var(--tdn-mark-ring)",
          }}
          aria-hidden
        >
          <svg
            width={size * 0.6}
            height={size * 0.6}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--tdn-mark-fg)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </span>
      )}
      {wordmark && (
        <span className="tdn-display text-[1.22rem] font-bold tracking-tight" style={{ color: "var(--tdn-fg-strong)" }}>
          Trade<span style={{ color: "var(--tdn-accent-text)" }}>on</span>
        </span>
      )}
    </span>
  );
}
