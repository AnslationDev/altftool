// src/app/tradeon/components/shared/Logo.jsx
"use client";

import { cn } from "../../utils/cn";

/**
 * Tradeon brand lockup: a clean, solid "E" monogram mark (no gradients) + the
 * full "Tradeon" wordmark. Reads premium in both light and dark themes.
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
          <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none">
            <path
              d="M7 4.5 V19.5"
              stroke="var(--tdn-mark-fg)"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path d="M7 5.4 H18" stroke="var(--tdn-mark-fg)" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M7 12 H15.5" stroke="var(--tdn-mark-fg)" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M7 18.6 H18" stroke="var(--tdn-mark-fg)" strokeWidth="2.6" strokeLinecap="round" />
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
