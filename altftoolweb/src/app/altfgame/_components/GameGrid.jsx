"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GameCard from "./GameCard";

// Lays out game cards either as a responsive grid or a horizontal snap rail.
// The rail gets scroll arrows and an edge fade so partially visible cards
// read as "scroll for more" instead of looking cut off.
export default function GameGrid({ games, variant = "grid" }) {
  const railRef = useRef(null);

  if (variant === "rail") {
    const scroll = (dir) => {
      railRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
    };
    return (
      <div className="relative">
        <div ref={railRef} className="flex snap-x gap-3 overflow-x-auto pb-2 no-scrollbar sm:gap-4">
          {games.map((g) => (
            <GameCard key={g.slug} game={g} className="w-44 shrink-0 snap-start sm:w-48" />
          ))}
        </div>

        {/* right edge fade — signals there is more to scroll */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-background to-transparent" />

        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className="absolute -left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-foreground shadow-md transition hover:scale-105 sm:grid"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className="absolute -right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-foreground shadow-md transition hover:scale-105 sm:grid"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
      {games.map((g) => (
        <GameCard key={g.slug} game={g} />
      ))}
    </div>
  );
}
