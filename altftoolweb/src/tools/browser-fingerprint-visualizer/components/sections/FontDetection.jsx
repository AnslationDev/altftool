"use client";

import { useState } from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

const skeletonFontWidths = [48, 72, 64, 90, 58, 82, 52, 76, 68, 96, 60, 86];

export function FontDetection({ fonts, loading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const allFonts = fonts?.fonts || [];
  const displayFonts = showAll ? allFonts : allFonts.slice(0, 14);
  const hasMore = allFonts.length > 14;

  const getEntropyVariant = (count) => {
    if (count > 30) return { variant: "red",    label: "Very High Entropy" };
    if (count > 15) return { variant: "yellow", label: "High Entropy" };
    if (count > 5)  return { variant: "blue",   label: "Medium Entropy" };
    return               { variant: "green",  label: "Low Entropy" };
  };

  const entropy = fonts ? getEntropyVariant(fonts.count) : null;

  return (
    <Card hoverable={false}>

      {/* ── Header — always visible, click to toggle ── */}
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10
                         border border-[var(--primary)]/20
                         flex items-center justify-center text-lg flex-shrink-0">
            🔤
          </div>

          {/* Title + quick summary when collapsed */}
          <div>
            <h3 className="text-sm font-semibold font-primary text-[var(--card-foreground)]">
              Font Detection
            </h3>

            {!isOpen && !loading && fonts && (
              <p className="text-xs text-[var(--primary)] font-secondary font-medium mt-0.5">
                {fonts.count} fonts detected
              </p>
            )}
            {!isOpen && loading && (
              <div className="h-3 w-24 bg-[var(--muted)] rounded animate-pulse mt-1" />
            )}
          </div>
        </div>

        {/* Right: entropy badge + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!loading && entropy && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-secondary
              ${entropy.variant === "red"    ? "text-red-400 bg-red-500/10 border-red-500/20" : ""}
              ${entropy.variant === "yellow" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" : ""}
              ${entropy.variant === "blue"   ? "text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/20" : ""}
              ${entropy.variant === "green"  ? "text-green-400 bg-green-500/10 border-green-500/20" : ""}
            `}>
              {entropy.label}
            </span>
          )}

          {/* Chevron */}
          <svg
            className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform duration-300
                        ${isOpen ? "rotate-180" : "rotate-0"}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/*  Expandable Content  */}
      <div className={`overflow-hidden transition-all duration-400 ease-in-out
                      ${isOpen ? "max-h-[800px] opacity-100 mt-4" : "max-h-0 opacity-0"}`}>

        {/* Divider */}
        <div className="h-px bg-[var(--border)] mb-4" />

        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-3">
            <div className="h-16 bg-[var(--muted)] rounded-xl animate-pulse" />
            <div className="flex flex-wrap gap-2">
              {skeletonFontWidths.map((width, i) => (
                <div
                  key={i}
                  className="h-7 rounded-full bg-[var(--muted)] animate-pulse"
                  style={{ width: `${width}px` }}
                />
              ))}
            </div>
          </div>

        ) : (
          <div>
            {/* Count summary */}
            <div className="flex items-center gap-4 mb-4 p-3 rounded-xl
                            bg-[var(--muted)] border border-[var(--border)]">
              <span className="text-3xl font-primary font-black text-[var(--primary)] leading-none">
                {fonts?.count || 0}
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--card-foreground)] font-secondary">
                  Fonts Detected
                </p>
                <p className="text-[11px] text-[var(--muted-foreground)] font-secondary">
                  out of 200+ probed — each adds fingerprint entropy
                </p>
              </div>
            </div>

            {/* Font pills */}
            {displayFonts.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {displayFonts.map((font, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full
                               bg-[var(--primary)]/8 text-[var(--primary)]
                               border border-[var(--primary)]/15
                               transition-colors hover:bg-[var(--primary)]/15"
                    style={{ fontFamily: `'${font}', sans-serif` }}
                    title={font}
                  >
                    {font}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--muted-foreground)] font-secondary py-2">
                No fonts detected. Canvas API may be blocked in this browser.
              </p>
            )}

            {/* Show more / less toggle */}
            {hasMore && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // card toggle mat ho
                  setShowAll((prev) => !prev);
                }}
                className="text-xs text-[var(--primary)] font-secondary
                           hover:underline transition-all duration-150 mt-1 mb-3 block"
              >
                {showAll
                  ? "↑ Show fewer fonts"
                  : `↓ Show all ${fonts?.count} detected fonts`}
              </button>
            )}

            {/* Detection method note */}
            <div className="mt-2 p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
              <p className="text-[11px] text-[var(--muted-foreground)] font-secondary leading-relaxed">
                🔎 Detection method: text width measurement on canvas.
                If a font is installed, its text renders at a different width than the fallback.
                No permission required — completely invisible to the user.
              </p>
            </div>
          </div>
        )}
      </div>

    </Card>
  );
}
