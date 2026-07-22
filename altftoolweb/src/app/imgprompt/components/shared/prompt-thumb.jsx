import * as React from "react";
import { Images } from "lucide-react";
import { cn, seededRandom } from "../../lib/utils";

const PALETTES = [
  ["#8b5cf6", "#6366f1", "#22d3ee"],
  ["#d946ef", "#8b5cf6", "#3b82f6"],
  ["#f59e0b", "#ef4444", "#8b5cf6"],
  ["#10b981", "#14b8a6", "#3b82f6"],
  ["#ec4899", "#8b5cf6", "#22d3ee"],
  ["#3b82f6", "#0ea5e9", "#8b5cf6"],
  ["#f43f5e", "#f59e0b", "#ec4899"],
  ["#22c55e", "#84cc16", "#14b8a6"],
];

/** Deterministic gradient fallback — same seed always renders the same art. */
function gradientFor(seed, gradient) {
  const palette = gradient
    ? [gradient[0], gradient[1], gradient[0]]
    : PALETTES[Math.floor(seededRandom(seed + "p") * PALETTES.length)];
  const a = Math.floor(seededRandom(seed + "a") * 360);
  const x1 = Math.floor(seededRandom(seed + "x1") * 100);
  const y1 = Math.floor(seededRandom(seed + "y1") * 100);
  const x2 = Math.floor(seededRandom(seed + "x2") * 100);
  const y2 = Math.floor(seededRandom(seed + "y2") * 100);
  return `
    radial-gradient(60% 80% at ${x1}% ${y1}%, ${palette[2]}cc 0%, transparent 60%),
    radial-gradient(70% 90% at ${x2}% ${y2}%, ${palette[1]}dd 0%, transparent 55%),
    linear-gradient(${a}deg, ${palette[0]} 0%, ${palette[1]} 50%, ${palette[2]} 100%)
  `;
}

/**
 * Deterministic photo thumbnail — same seed always renders the same real
 * image (via Picsum's seeded photo endpoint, no API key required). Falls
 * back to the generated gradient if the image fails to load, so cards never
 * break if the network is unavailable.
 */
export function PromptThumb({ seed, emoji, gradient, className, count, rounded = "rounded-xl" }) {
  const [failed, setFailed] = React.useState(false);
  const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(seed)}/640/480`;

  return (
    <div className={cn("relative overflow-hidden", rounded, className)} style={failed ? { background: gradientFor(seed, gradient) } : undefined}>
      {!failed && (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/10" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
      {emoji && (
        <div className="absolute bottom-2.5 left-2.5 grid h-8 w-8 place-items-center rounded-lg bg-black/45 text-base backdrop-blur">
          {emoji}
        </div>
      )}
      {count && count > 1 && (
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-lg bg-black/45 px-2 py-1 text-xs font-medium text-white backdrop-blur">
          <Images className="h-3.5 w-3.5" />
          {count}
        </div>
      )}
    </div>
  );
}
