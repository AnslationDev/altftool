// src/app/tradeon/components/shared/Ring.jsx
"use client";

import { clamp } from "../../lib/format";

/** Circular progress ring with a centered value — used for confidence / risk / ratings. */
export default function Ring({ value = 0, size = 96, stroke = 8, color = "var(--tdn-iris)", label, sub, suffix = "%" }) {
  const v = clamp(value, 0, 100);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  return (
    <div className="inline-flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--tdn-border-strong)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.2,0.8,0.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="tdn-mono font-bold" style={{ color: "var(--tdn-fg-strong)", fontSize: size * 0.24 }}>
            {Math.round(v)}
            <span style={{ fontSize: size * 0.13, color: "var(--tdn-faint)" }}>{suffix}</span>
          </span>
        </div>
      </div>
      {label && <span className="text-[0.68rem] font-semibold mt-1" style={{ color: "var(--tdn-muted)" }}>{label}</span>}
      {sub && <span className="text-[0.6rem]" style={{ color: "var(--tdn-faint)" }}>{sub}</span>}
    </div>
  );
}
