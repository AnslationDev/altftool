"use client";

import { useId } from "react";

/* Bespoke gradient-stroke SVG glyphs for feature/benefit blocks.
   Each renders its own gradient so multiple can coexist. */

function Frame({ children, size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}
function grad(id) {
  return (
    <defs>
      <linearGradient id={id} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#14B8A6" /><stop offset="0.5" stopColor="#38BDF8" /><stop offset="1" stopColor="#0D9488" />
      </linearGradient>
    </defs>
  );
}
const S = { stroke: "", strokeWidth: 2.1, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };

export function GlyphShield({ size }) {
  const id = `gs-${useId().replace(/:/g, "")}`;
  return (
    <Frame size={size}>
      {grad(id)}
      <path d="M16 3 L27 7 V15 C27 23 22 27 16 29 C10 27 5 23 5 15 V7 Z" {...S} stroke={`url(#${id})`} />
      <path d="M12 16 l3 3 5 -6" {...S} stroke={`url(#${id})`} />
    </Frame>
  );
}
export function GlyphBolt({ size }) {
  const id = `gb-${useId().replace(/:/g, "")}`;
  return (
    <Frame size={size}>
      {grad(id)}
      <path d="M17 3 L7 18 H15 L14 29 L25 13 H16 Z" {...S} stroke={`url(#${id})`} />
    </Frame>
  );
}
export function GlyphInfinity({ size }) {
  const id = `gi-${useId().replace(/:/g, "")}`;
  return (
    <Frame size={size}>
      {grad(id)}
      <path d="M11 16 C11 12 6 12 6 16 C6 20 11 20 16 16 C21 12 26 12 26 16 C26 20 21 20 16 16" {...S} stroke={`url(#${id})`} />
    </Frame>
  );
}
export function GlyphDevices({ size }) {
  const id = `gd-${useId().replace(/:/g, "")}`;
  return (
    <Frame size={size}>
      {grad(id)}
      <rect x="3" y="7" width="20" height="14" rx="2.5" {...S} stroke={`url(#${id})`} />
      <path d="M3 21 H23" {...S} stroke={`url(#${id})`} />
      <rect x="21" y="14" width="8" height="13" rx="2" {...S} stroke={`url(#${id})`} />
    </Frame>
  );
}
export function GlyphCloudOff({ size }) {
  const id = `gc-${useId().replace(/:/g, "")}`;
  return (
    <Frame size={size}>
      {grad(id)}
      <path d="M9 22 H22 a5 5 0 0 0 1 -9.9 A7 7 0 0 0 10 9.5" {...S} stroke={`url(#${id})`} />
      <path d="M9 22 a4 4 0 0 1 -1 -7.8" {...S} stroke={`url(#${id})`} />
      <path d="M5 5 L27 27" {...S} stroke={`url(#${id})`} />
    </Frame>
  );
}
export function GlyphGauge({ size }) {
  const id = `gg-${useId().replace(/:/g, "")}`;
  return (
    <Frame size={size}>
      {grad(id)}
      <path d="M5 23 a11 11 0 1 1 22 0" {...S} stroke={`url(#${id})`} />
      <path d="M16 23 L21 13" {...S} stroke={`url(#${id})`} />
      <circle cx="16" cy="23" r="2" fill={`url(#${id})`} />
    </Frame>
  );
}
export function GlyphLock({ size }) {
  const id = `gl-${useId().replace(/:/g, "")}`;
  return (
    <Frame size={size}>
      {grad(id)}
      <rect x="6" y="14" width="20" height="14" rx="3" {...S} stroke={`url(#${id})`} />
      <path d="M10 14 V10 a6 6 0 0 1 12 0 V14" {...S} stroke={`url(#${id})`} />
      <circle cx="16" cy="21" r="2" fill={`url(#${id})`} />
    </Frame>
  );
}
