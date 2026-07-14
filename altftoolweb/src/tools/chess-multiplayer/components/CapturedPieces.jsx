// components/CapturedPieces.jsx
"use client";

import { PIECE_GLYPH } from "../engine/chess";

// Shows pieces captured BY a given colour, plus the material advantage.
export default function CapturedPieces({ captured, advantage, leader, color }) {
  const list = captured || [];
  return (
    <div className="flex min-h-[28px] flex-wrap items-center gap-1">
      {list.length === 0 ? (
        <span className="text-xs text-(--muted-foreground)">No captures</span>
      ) : (
        list.map((p, i) => (
          <span
            key={i}
            className={`text-lg leading-none ${
              p.c === "w"
                ? "text-(--background) [-webkit-text-stroke:1.5px_var(--foreground)]"
                : "text-(--foreground)"
            }`}
            aria-label={`captured ${p.c === "w" ? "white" : "black"} ${p.t}`}
          >
            {PIECE_GLYPH[p.c][p.t]}
          </span>
        ))
      )}
      {leader === color && advantage > 0 && (
        <span className="ml-1 rounded-full bg-(--primary)/15 px-2 py-0.5 text-xs font-bold text-(--primary)">
          +{advantage}
        </span>
      )}
    </div>
  );
}
