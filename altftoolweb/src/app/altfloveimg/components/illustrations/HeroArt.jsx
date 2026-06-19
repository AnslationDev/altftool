"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Premium animated "image studio" illustration for the hero. */
export default function HeroArt({ className = "" }) {
  const reduce = useReducedMotion();
  const float = (dur, dist = 8) =>
    reduce ? {} : { animate: { y: [0, -dist, 0] }, transition: { duration: dur, repeat: Infinity, ease: "easeInOut" } };
  const pulse = (dur) =>
    reduce ? {} : { animate: { opacity: [0.3, 1, 0.3], scale: [0.85, 1, 0.85] }, transition: { duration: dur, repeat: Infinity, ease: "easeInOut" } };

  return (
    <svg viewBox="0 0 560 500" className={className} fill="none" role="img" aria-label="Image editing studio illustration">
      <defs>
        <linearGradient id="ha-sky" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#bae6fd" /><stop offset="1" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="ha-sun" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fde68a" /><stop offset="1" stopColor="#fb923c" />
        </linearGradient>
        <linearGradient id="ha-m1" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#6366f1" /><stop offset="1" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="ha-m2" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#22d3ee" /><stop offset="1" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="ha-brand" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#38bdf8" /><stop offset="0.5" stopColor="#2563eb" /><stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="ha-win" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffffff" /><stop offset="1" stopColor="#eef2fb" />
        </linearGradient>
        <filter id="ha-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="22" stdDeviation="26" floodColor="#2563eb" floodOpacity="0.20" />
        </filter>
        <clipPath id="ha-photo"><rect x="118" y="150" width="300" height="196" rx="14" /></clipPath>
      </defs>

      {/* ambient rings */}
      <circle cx="300" cy="250" r="220" stroke="url(#ha-brand)" strokeOpacity="0.12" strokeWidth="2" />
      <circle cx="300" cy="250" r="168" stroke="url(#ha-brand)" strokeOpacity="0.10" strokeWidth="2" strokeDasharray="4 8" />

      {/* main editor window */}
      <g filter="url(#ha-shadow)">
        <rect x="92" y="96" width="352" height="300" rx="22" fill="url(#ha-win)" stroke="#dbe3f1" />
        {/* title bar */}
        <circle cx="116" cy="120" r="5" fill="#fb7185" />
        <circle cx="134" cy="120" r="5" fill="#fbbf24" />
        <circle cx="152" cy="120" r="5" fill="#34d399" />
        <rect x="300" y="113" width="120" height="14" rx="7" fill="#eef2fb" />
        <rect x="92" y="138" width="352" height="1.5" fill="#e6eaf2" />

        {/* photo */}
        <g clipPath="url(#ha-photo)">
          <rect x="118" y="150" width="300" height="196" fill="url(#ha-sky)" />
          <circle cx="350" cy="200" r="26" fill="url(#ha-sun)" />
          <path d="M118 322 L196 232 L262 300 L300 262 L360 322 Z" fill="url(#ha-m2)" />
          <path d="M180 346 L266 240 L352 346 Z" fill="url(#ha-m1)" />
          <rect x="118" y="318" width="300" height="28" fill="#1e3a8a" fillOpacity="0.18" />
        </g>
        <rect x="118" y="150" width="300" height="196" rx="14" stroke="#dbe3f1" />

        {/* before/after divider */}
        <motion.g {...(reduce ? {} : { animate: { x: [-26, 26, -26] }, transition: { duration: 6, repeat: Infinity, ease: "easeInOut" } })}>
          <rect x="266" y="150" width="3" height="196" fill="#ffffff" />
          <circle cx="267.5" cy="248" r="15" fill="#ffffff" stroke="#dbe3f1" />
          <path d="M262 244 l-5 4 5 4 M273 244 l5 4 -5 4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>

        {/* slider control row */}
        <rect x="118" y="362" width="190" height="8" rx="4" fill="#eef2fb" />
        <rect x="118" y="362" width="120" height="8" rx="4" fill="url(#ha-brand)" />
        <circle cx="238" cy="366" r="8" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
        <rect x="330" y="358" width="90" height="16" rx="8" fill="url(#ha-brand)" fillOpacity="0.14" />
        <rect x="342" y="364" width="66" height="4" rx="2" fill="#2563eb" fillOpacity="0.5" />
      </g>

      {/* floating tool rail */}
      <motion.g {...float(5, 9)}>
        <rect x="40" y="190" width="46" height="150" rx="16" fill="#ffffff" stroke="#dbe3f1" filter="url(#ha-shadow)" />
        {[214, 246, 278, 310].map((cy, i) => (
          <g key={cy}>
            <rect x="52" y={cy - 12} width="22" height="22" rx="7" fill={i === 0 ? "url(#ha-brand)" : "#eef2fb"} />
          </g>
        ))}
      </motion.g>

      {/* floating compress badge */}
      <motion.g {...float(4.4, 11)}>
        <rect x="400" y="150" width="118" height="58" rx="16" fill="#ffffff" stroke="#dbe3f1" filter="url(#ha-shadow)" />
        <circle cx="428" cy="179" r="15" fill="#dcfce7" />
        <path d="M422 179 l4 4 8 -9" stroke="#16a34a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <text x="452" y="175" fontFamily="Geist, sans-serif" fontSize="17" fontWeight="700" fill="#0f1729">−82%</text>
        <text x="452" y="191" fontFamily="Geist, sans-serif" fontSize="10" fill="#64748b">file size</text>
      </motion.g>

      {/* floating layers card */}
      <motion.g {...float(5.6, 8)}>
        <rect x="406" y="300" width="126" height="96" rx="16" fill="#ffffff" stroke="#dbe3f1" filter="url(#ha-shadow)" />
        <rect x="420" y="316" width="60" height="9" rx="4.5" fill="#0f1729" fillOpacity="0.8" />
        {[336, 354, 372].map((y, i) => (
          <g key={y}>
            <rect x="420" y={y} width="14" height="10" rx="3" fill="url(#ha-brand)" fillOpacity={0.9 - i * 0.25} />
            <rect x="440" y={y + 1} width="78" height="8" rx="4" fill="#eef2fb" />
          </g>
        ))}
      </motion.g>

      {/* sparkles */}
      <motion.g {...pulse(2.6)}>
        <path d="M70 120 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4 z" fill="url(#ha-brand)" />
      </motion.g>
      <motion.g {...pulse(3.2)}>
        <path d="M498 96 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" fill="#7c3aed" />
      </motion.g>
      <motion.g {...pulse(2.2)}>
        <circle cx="120" cy="430" r="5" fill="#22d3ee" />
      </motion.g>
    </svg>
  );
}
