"use client";

/* Reusable decorative background layers — soft, subtle depth. */

export function GlowField({ className = "" }) {
  return (
    <div className={`ali-blobs ${className}`} aria-hidden="true">
      <span className="ali-blob ali-blob-1" />
      <span className="ali-blob ali-blob-2" />
      <span className="ali-blob ali-blob-3" />
    </div>
  );
}

/** Faint dotted texture as an absolutely-positioned SVG. */
export function DotGrid({ className = "", opacity = 0.5 }) {
  return (
    <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true" style={{ opacity }}>
      <defs>
        <pattern id="ali-dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
        </pattern>
        <radialGradient id="ali-dots-fade" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="70%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="ali-dots-mask">
          <rect width="100%" height="100%" fill="url(#ali-dots-fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#ali-dots)" mask="url(#ali-dots-mask)" style={{ color: "var(--ali-border-strong)" }} />
    </svg>
  );
}

/** Decorative wave separator. */
export function WaveDivider({ flip = false, color = "var(--ali-surface)" }) {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className="block h-[60px] w-full"
      style={{ transform: flip ? "scaleY(-1)" : undefined }}
      aria-hidden="true"
    >
      <path d="M0 40 C 360 90, 1080 -10, 1440 40 L1440 80 L0 80 Z" fill={color} />
    </svg>
  );
}
