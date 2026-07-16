"use client";

// Lightweight "3D-style" SVG illustrations — gradient fills + soft layered
// shadows approximate the reference's 3D renders without shipping heavy assets.
// Palette: ALTFTool teal (primary) + cyan, with blue as the additional accent
// the brief allows. Each illustration is self-contained and theme-neutral
// (they sit on their own gradient panels), and scales via the `size` prop.

const TEAL = "#14B8A6";
const TEAL_D = "#0D9488";
const CYAN = "#22D3EE";
const BLUE = "#3B82F6";
const BLUE_D = "#2563EB";
const VIOLET = "#8B5CF6";

function Defs({ id }) {
  return (
    <defs>
      <linearGradient id={`${id}-tealBlue`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={TEAL} />
        <stop offset="1" stopColor={BLUE} />
      </linearGradient>
      <linearGradient id={`${id}-blue`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={BLUE} />
        <stop offset="1" stopColor={BLUE_D} />
      </linearGradient>
      <linearGradient id={`${id}-teal`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={TEAL} />
        <stop offset="1" stopColor={TEAL_D} />
      </linearGradient>
      <linearGradient id={`${id}-cyan`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={CYAN} />
        <stop offset="1" stopColor={TEAL} />
      </linearGradient>
    </defs>
  );
}

export function Calendar3D({ size = 120, className = "" }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} role="img" aria-label="Calendar">
      <Defs id="cal" />
      <rect x="18" y="30" width="84" height="74" rx="12" fill={`url(#cal-blue)`} />
      <rect x="18" y="30" width="84" height="24" rx="12" fill={BLUE_D} />
      <rect x="26" y="60" width="68" height="38" rx="6" fill="#fff" opacity="0.92" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <rect key={`${r}-${c}`} x={31 + c * 15} y={65 + r * 11} width="9" height="7" rx="2" fill={r === 1 && c === 2 ? TEAL : "#CBD5E1"} />
        )),
      )}
      <rect x="36" y="20" width="8" height="20" rx="4" fill="#94A3B8" />
      <rect x="76" y="20" width="8" height="20" rx="4" fill="#94A3B8" />
    </svg>
  );
}

export function Hourglass3D({ size = 96, className = "" }) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} className={className} role="img" aria-label="Hourglass">
      <Defs id="hg" />
      <rect x="22" y="14" width="52" height="8" rx="4" fill={TEAL_D} />
      <rect x="22" y="74" width="52" height="8" rx="4" fill={TEAL_D} />
      <path d="M28 22 H68 L50 48 L68 74 H28 L46 48 Z" fill={`url(#hg-cyan)`} opacity="0.9" />
      <path d="M34 26 H62 L48 46 Z" fill={BLUE} opacity="0.85" />
      <path d="M48 50 L60 70 H36 Z" fill={BLUE} opacity="0.85" />
      <circle cx="48" cy="49" r="3" fill={BLUE_D} />
    </svg>
  );
}

export function Cake3D({ size = 120, className = "" }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} role="img" aria-label="Birthday cake">
      <Defs id="cake" />
      <ellipse cx="60" cy="98" rx="46" ry="8" fill="#0F172A" opacity="0.12" />
      <rect x="20" y="70" width="80" height="28" rx="8" fill={`url(#cake-blue)`} />
      <rect x="26" y="52" width="68" height="26" rx="8" fill={`url(#cake-teal)`} />
      <path d="M26 60 q17 12 34 0 t34 0 v10 H26 Z" fill="#fff" opacity="0.9" />
      <rect x="57" y="30" width="6" height="20" rx="3" fill={CYAN} />
      <circle cx="60" cy="26" r="5" fill={VIOLET} />
      {[34, 60, 86].map((x) => (
        <g key={x}>
          <rect x={x - 3} y="40" width="6" height="16" rx="3" fill={BLUE} />
          <circle cx={x} cy="36" r="4" fill="#FBBF24" />
        </g>
      ))}
    </svg>
  );
}

export function Gift3D({ size = 96, className = "" }) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} className={className} role="img" aria-label="Gift box">
      <Defs id="gift" />
      <rect x="18" y="42" width="60" height="42" rx="8" fill={`url(#gift-blue)`} />
      <rect x="14" y="34" width="68" height="16" rx="6" fill={`url(#gift-teal)`} />
      <rect x="42" y="34" width="12" height="50" fill={CYAN} opacity="0.9" />
      <path d="M48 34 C36 20 22 30 48 34 C74 30 60 20 48 34 Z" fill={VIOLET} />
    </svg>
  );
}

export function Trophy3D({ size = 96, className = "" }) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} className={className} role="img" aria-label="Trophy">
      <Defs id="trophy" />
      <path d="M30 20 H66 V40 a18 18 0 0 1 -36 0 Z" fill={`url(#trophy-teal)`} />
      <path d="M30 24 H18 a10 10 0 0 0 12 12 Z" fill={TEAL_D} />
      <path d="M66 24 H78 a10 10 0 0 1 -12 12 Z" fill={TEAL_D} />
      <rect x="43" y="56" width="10" height="14" fill={BLUE} />
      <rect x="32" y="70" width="32" height="8" rx="3" fill={BLUE_D} />
      <rect x="36" y="78" width="24" height="6" rx="3" fill={TEAL_D} />
      <circle cx="48" cy="34" r="7" fill="#FBBF24" />
    </svg>
  );
}

export function Calculator3D({ size = 110, className = "" }) {
  return (
    <svg viewBox="0 0 110 110" width={size} height={size} className={className} role="img" aria-label="Calculator">
      <Defs id="calc" />
      <rect x="26" y="16" width="58" height="78" rx="12" fill={`url(#calc-blue)`} />
      <rect x="34" y="24" width="42" height="18" rx="5" fill="#fff" opacity="0.92" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <circle key={`${r}-${c}`} cx={41 + c * 14} cy={54 + r * 14} r="4.5" fill={r === 2 && c === 2 ? TEAL : "#E2E8F0"} />
        )),
      )}
    </svg>
  );
}
