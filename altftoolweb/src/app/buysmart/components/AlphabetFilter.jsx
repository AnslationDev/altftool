"use client";

import { forwardRef, useRef, useState } from "react";
import { AlphabetFilterSkeleton } from "@/components/ui/skeleton";

const alphabets = ["All", "0-9", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

const AlphabetFilter = forwardRef(function AlphabetFilter(
  { onSelect, selectedLetter, loading = false },
  ref,
) {
  const [active, setActive] = useState("All");
  const stripRef = useRef(null);
  const activeValue = selectedLetter || active;

  if (loading) {
    return <AlphabetFilterSkeleton />;
  }

  return (
    <div
      ref={ref}
      className="sticky top-0 z-40 mx-auto flex flex-col items-start rounded-[var(--anslation-ds-radius)] bg-(--background) py-2 lg:items-center"
    >
      <div className="section-header w-full">
        <h2 className="section-title">Choose Your Brand A-Z</h2>
        <p className="section-subtitle">Explore all shopping categories alphabetically</p>
      </div>

      <div className="w-full overflow-x-auto scroll-smooth no-scrollbar">
        <div
          ref={stripRef}
          className="flex w-max min-w-full flex-nowrap gap-1 overflow-x-auto py-3 no-scrollbar sm:gap-1.5 sm:py-4"
        >
          {alphabets.map((char) => {
            const isActive = activeValue === char;

            return (
              <button
                data-alpha={char}
                key={char}
                type="button"
                onClick={() => {
                  setActive(char);
                  onSelect?.(char);
                }}
                className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--anslation-ds-radius-xs)] border text-xs font-semibold transition hover:-translate-y-0.5 hover:border-(--primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) motion-reduce:transform-none sm:h-9 sm:w-9 sm:text-[13px] lg:h-10 lg:w-10 lg:text-sm ${
                  isActive
                    ? "border-(--primary) bg-(--primary) text-(--primary-foreground) shadow-[var(--anslation-ds-shadow-sm)]"
                    : "border-(--border) bg-(--card) text-(--muted-foreground)"
                }`}
              >
                <span>{char}</span>
                {isActive ? (
                  <span className="absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-(--primary-foreground)" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default AlphabetFilter;
