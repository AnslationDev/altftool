// src/app/tradeon/components/shared/Sparkline.jsx
"use client";

import { useId } from "react";

/**
 * Lightweight SVG sparkline. Colours itself green/red by net direction unless a
 * `color` is passed. `area` fills a soft gradient beneath the line.
 */
export default function Sparkline({
  data = [],
  width = 120,
  height = 36,
  strokeWidth = 1.6,
  color,
  area = true,
  className = "",
}) {
  const id = useId();
  if (!data || data.length < 2) return <svg width={width} height={height} className={className} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pad = 2;
  const usableH = height - pad * 2;

  const pts = data.map((v, i) => {
    const x = i * stepX;
    const y = pad + usableH - ((v - min) / range) * usableH;
    return [x, y];
  });

  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const areaPath = `${line} L${width},${height} L0,${height} Z`;
  const up = data[data.length - 1] >= data[0];
  const stroke = color || (up ? "var(--tdn-up)" : "var(--tdn-down)");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spk-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && <path d={areaPath} fill={`url(#spk-${id})`} />}
      <path d={line} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
