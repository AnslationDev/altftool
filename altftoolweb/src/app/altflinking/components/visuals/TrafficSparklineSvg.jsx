/**
 * Production-Ready SVG Traffic Sparkline Component
 * Location: src/app/altflinking/components/visuals/TrafficSparklineSvg.jsx
 */

"use client";

import React from "react";

export default function TrafficSparklineSvg({ color = "#10b981", height = 24, width = 80 }) {
  return (
    <svg className="overflow-visible" width={width} height={height} viewBox="0 0 80 24">
      <defs>
        <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d="M 0 20 Q 20 15, 40 18 T 60 8 T 80 4 L 80 24 L 0 24 Z"
        fill="url(#sparkGradient)"
      />
      <path
        d="M 0 20 Q 20 15, 40 18 T 60 8 T 80 4"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="80" cy="4" r="2.5" fill={color} />
    </svg>
  );
}
