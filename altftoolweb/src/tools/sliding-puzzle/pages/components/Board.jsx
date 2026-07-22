"use client";

/**
 * The play area. Fixed vivid palette (game art) on its own dark backdrop so
 * the board stays legible in both light and dark page themes. All chrome
 * around it uses design tokens; only the board itself uses fixed colors.
 */

const FONT_SIZE_BY_SIZE = {
  3: "clamp(1.5rem, 8vw, 2.25rem)",
  4: "clamp(1.15rem, 6vw, 1.75rem)",
  5: "clamp(0.95rem, 4.5vw, 1.4rem)",
};

function tileBackground(value, total) {
  const fraction = total <= 2 ? 0 : (value - 1) / (total - 2);
  const hue = 265 - Math.round(fraction * 70);
  return `linear-gradient(145deg, hsl(${hue} 85% 62%), hsl(${hue - 18} 80% 46%))`;
}

export default function Board({ board, size, status, reducedMotion, onTileClick }) {
  const total = size * size;
  const interactive = status === "playing";

  return (
    <div
      role="group"
      aria-label={`${size} by ${size} sliding puzzle board`}
      className="mx-auto w-full max-w-md select-none rounded-lg"
      style={{
        aspectRatio: "1 / 1",
        background: "#171233",
        boxShadow: "inset 0 2px 12px rgba(0, 0, 0, 0.5)",
        padding: 6,
        touchAction: "manipulation",
      }}
    >
      <div className="relative h-full w-full">
        {board.map((value, index) => {
          if (value === 0) return null;
          const row = Math.floor(index / size);
          const col = index % size;
          const isHome = value === index + 1;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onTileClick(index)}
              disabled={!interactive}
              aria-label={`Move tile ${value}`}
              className="absolute focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
              style={{
                width: `${100 / size}%`,
                height: `${100 / size}%`,
                transform: `translate(${col * 100}%, ${row * 100}%)`,
                transition: reducedMotion ? "none" : "transform 160ms ease",
                willChange: "transform",
                padding: size === 5 ? 3 : 4,
                background: "transparent",
                border: "none",
                cursor: interactive ? "pointer" : "default",
              }}
            >
              <span
                aria-hidden="true"
                className="flex h-full w-full items-center justify-center rounded-md font-bold"
                style={{
                  background: tileBackground(value, total),
                  color: "#ffffff",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.45)",
                  fontSize: FONT_SIZE_BY_SIZE[size] || FONT_SIZE_BY_SIZE[4],
                  boxShadow: isHome
                    ? "0 2px 6px rgba(0, 0, 0, 0.35), inset 0 0 0 2px rgba(255, 255, 255, 0.35)"
                    : "0 2px 6px rgba(0, 0, 0, 0.35)",
                }}
              >
                {value}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
