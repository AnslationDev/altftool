"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Friendly empty / upload illustration. */
export function UploadArt({ size = 132, className = "" }) {
  const id = `up-${useId().replace(/:/g, "")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#14B8A6" /><stop offset="0.5" stopColor="#38BDF8" /><stop offset="1" stopColor="#0D9488" />
        </linearGradient>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#bae6fd" /><stop offset="1" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="138" rx="52" ry="9" fill="#14B8A6" fillOpacity="0.10" />
      {/* image frame */}
      <rect x="30" y="44" width="100" height="74" rx="12" fill="#ffffff" stroke="#dbe3f1" strokeWidth="2" />
      <clipPath id={`${id}-c`}><rect x="36" y="50" width="88" height="62" rx="8" /></clipPath>
      <g clipPath={`url(#${id}-c)`}>
        <rect x="36" y="50" width="88" height="62" fill={`url(#${id}-s)`} />
        <circle cx="104" cy="68" r="9" fill="#fcd34d" />
        <path d="M36 104 L60 80 L78 98 L92 86 L124 112 L36 112 Z" fill="#60a5fa" />
        <path d="M58 112 L86 84 L114 112 Z" fill="#14B8A6" />
      </g>
      {/* upload badge */}
      <circle cx="116" cy="106" r="20" fill={`url(#${id}-g)`} />
      <path d="M116 116 L116 98 M108 105 L116 97 L124 105" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** Animated success / done illustration. */
export function SuccessArt({ size = 110, className = "" }) {
  const id = `ok-${useId().replace(/:/g, "")}`;
  const reduce = useReducedMotion();
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#22c55e" /><stop offset="1" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <motion.circle
        cx="70" cy="70" r="40" fill={`url(#${id}-g)`}
        initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }}
      />
      <motion.path
        d="M52 71 l12 12 24 -26" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"
        initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.18, duration: 0.45, ease: "easeOut" }}
      />
      {[[26, 40, "#14B8A6"], [112, 36, "#38BDF8"], [30, 104, "#22D3EE"], [110, 102, "#0D9488"]].map(([x, y, c], i) => (
        <motion.circle
          key={i} cx={x} cy={y} r="4" fill={c}
          initial={reduce ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.9] }}
          transition={{ delay: 0.35 + i * 0.06, duration: 0.5 }}
        />
      ))}
    </svg>
  );
}
