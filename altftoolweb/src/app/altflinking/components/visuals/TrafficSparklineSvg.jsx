/**
 * Traffic sparkline for a marketplace listing.
 *
 * This component previously took no `trafficHistory` at all — both call sites
 * passed it, and it drew the same hardcoded rising curve for every listing,
 * under headings reading "6-Month Organic Trend" and "Verified Ahrefs Data".
 * The listings API stores `trafficHistory: body.trafficHistory || []` and the
 * submit form never collects it, so every real publisher listing has an empty
 * array and still showed a climbing line.
 *
 * It now plots the points it is given and renders nothing when there are none.
 * The gradient id is per-instance too: it was a fixed "sparkGradient", so every
 * sparkline after the first on a page referenced the first one's definition.
 */

"use client";

import React, { useId } from "react";

/** Numeric series from whatever shape the caller has, or null if there isn't one. */
function toSeries(trafficHistory) {
  if (!Array.isArray(trafficHistory) || trafficHistory.length < 2) return null;
  const points = trafficHistory
    .map((entry) => (typeof entry === "number" ? entry : Number(entry?.value ?? entry?.traffic)))
    .filter((n) => Number.isFinite(n));
  return points.length >= 2 ? points : null;
}

/** Percentage change across the series, or null when it cannot be computed. */
export function trafficTrendPercent(trafficHistory) {
  const points = toSeries(trafficHistory);
  if (!points) return null;
  const first = points[0];
  if (!first) return null;
  return Math.round(((points[points.length - 1] - first) / first) * 100);
}

export default function TrafficSparklineSvg({
  trafficHistory,
  color = "var(--primary)",
  height = 24,
  width = 80,
}) {
  const gradientId = useId();
  const points = toSeries(trafficHistory);
  if (!points) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = 80 / (points.length - 1);
  const coords = points.map((value, i) => [i * step, 22 - ((value - min) / span) * 20]);
  const line = coords
    .map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
  const [lastX, lastY] = coords[coords.length - 1];

  return (
    <svg
      className="overflow-visible"
      width={width}
      height={height}
      viewBox="0 0 80 24"
      preserveAspectRatio="none"
      role="img"
      aria-label="Organic traffic over the recorded period"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={`${line} L 80 24 L 0 24 Z`} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
    </svg>
  );
}
