"use client";

let n = 0;

/**
 * ALTF Love IMG brand mark — a gradient squircle holding two overlapping
 * image frames (a "stack") with a sun/horizon motif and a spark. Reads
 * instantly as an image studio, scales cleanly to favicon size.
 */
export default function Logo({ size = 36, withWordmark = false, className = "" }) {
  const id = `ali-logo-${++n}`;
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-bg`} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38bdf8" />
            <stop offset="0.5" stopColor="#2563eb" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id={`${id}-sun`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fde68a" />
            <stop offset="1" stopColor="#fb923c" />
          </linearGradient>
        </defs>

        {/* gradient squircle */}
        <rect x="3" y="3" width="42" height="42" rx="13" fill={`url(#${id}-bg)`} />
        <rect x="3" y="3" width="42" height="42" rx="13" fill="#fff" fillOpacity="0.05" />

        {/* back frame (offset, translucent) */}
        <rect x="13.5" y="11" width="20" height="16" rx="3.4" fill="#fff" fillOpacity="0.35" />

        {/* front frame (the photo) */}
        <g>
          <rect x="11" y="17" width="22" height="18" rx="3.6" fill="#fff" />
          {/* sun */}
          <circle cx="27" cy="23" r="2.6" fill={`url(#${id}-sun)`} />
          {/* mountains */}
          <path d="M13 33 l4.6 -5.4 3.4 3.8 3-3.4 4 5 Z" fill="#2563eb" />
          <path d="M13 33 l3.2 -3.6 2.4 2.6 -1 1 Z" fill="#7c3aed" fillOpacity="0.85" />
        </g>

        {/* spark */}
        <path d="M35 12 l1.1 2.7 2.7 1.1 -2.7 1.1 -1.1 2.7 -1.1 -2.7 -2.7 -1.1 2.7 -1.1 z" fill="#fff" />
      </svg>
      {withWordmark && (
        <span className="text-[17px] font-bold tracking-tight">
          ALTF <span className="ali-gradient-text">Love IMG</span>
        </span>
      )}
    </span>
  );
}
