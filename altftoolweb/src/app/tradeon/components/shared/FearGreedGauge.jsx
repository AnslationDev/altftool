// src/app/tradeon/components/shared/FearGreedGauge.jsx
"use client";

import { clamp } from "../../lib/format";

/** Semicircular Fear & Greed gauge (0 = extreme fear, 100 = extreme greed). */
export default function FearGreedGauge({ value = 50, size = 180 }) {
  const v = clamp(value, 0, 100);
  const label =
    v < 25 ? "Extreme Fear" : v < 45 ? "Fear" : v < 55 ? "Neutral" : v < 75 ? "Greed" : "Extreme Greed";
  const color =
    v < 25 ? "#f5426c" : v < 45 ? "#f7885a" : v < 55 ? "#f7b955" : v < 75 ? "#7bd66a" : "#10c477";

  const R = 80;
  const cx = 100;
  const cy = 100;
  const startAngle = 180;
  const angle = startAngle - (v / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const needleX = cx + Math.cos(rad) * (R - 14);
  const needleY = cy - Math.sin(rad) * (R - 14);

  const arc = (from, to, stroke) => {
    const a0 = (from * Math.PI) / 180;
    const a1 = (to * Math.PI) / 180;
    const x0 = cx + Math.cos(a0) * R;
    const y0 = cy - Math.sin(a0) * R;
    const x1 = cx + Math.cos(a1) * R;
    const y1 = cy - Math.sin(a1) * R;
    return <path d={`M${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1}`} stroke={stroke} strokeWidth="12" fill="none" strokeLinecap="round" />;
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.62} viewBox="0 0 200 118">
        {arc(180, 144, "#f5426c")}
        {arc(143, 109, "#f7885a")}
        {arc(108, 73, "#f7b955")}
        {arc(72, 37, "#7bd66a")}
        {arc(36, 0, "#10c477")}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke={color} strokeWidth="3.4" strokeLinecap="round" style={{ transition: "all 0.6s cubic-bezier(0.2,0.8,0.2,1)" }} />
        <circle cx={cx} cy={cy} r="7" fill="var(--tdn-surface-solid)" stroke={color} strokeWidth="2.5" />
      </svg>
      <div className="-mt-3 text-center">
        <div className="tdn-mono text-3xl font-bold" style={{ color }}>
          {Math.round(v)}
        </div>
        <div className="text-xs font-semibold" style={{ color }}>
          {label}
        </div>
      </div>
    </div>
  );
}
