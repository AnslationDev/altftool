"use client";

/**
 * Demo mode (?demo=1) — lets anyone preview the full result UI without
 * uploading a photo or downloading the AI model. The sample "photo" is a
 * generated SVG portrait, so no real person's image is ever shipped.
 */

export function isDemoMode() {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("demo") === "1";
  } catch {
    return false;
  }
}

const DEMO_W = 480;
const DEMO_H = 560;

function demoPortraitSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${DEMO_W}" height="${DEMO_H}" viewBox="0 0 ${DEMO_W} ${DEMO_H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f766e"/><stop offset="1" stop-color="#155e75"/>
    </linearGradient>
  </defs>
  <rect width="${DEMO_W}" height="${DEMO_H}" fill="url(#bg)"/>
  <circle cx="240" cy="640" r="260" fill="#134e4a"/>
  <path d="M240 400c-96 0-170 62-186 160h372c-16-98-90-160-186-160z" fill="#0d9488"/>
  <rect x="212" y="330" width="56" height="90" rx="26" fill="#c9976b"/>
  <circle cx="240" cy="252" r="104" fill="#d9a877"/>
  <path d="M136 232c0-72 46-118 104-118s104 46 104 118c0 18-4 34-10 46-4-58-42-88-94-88s-90 30-94 88c-6-12-10-28-10-46z" fill="#232323"/>
  <circle cx="204" cy="252" r="10" fill="#232323"/>
  <circle cx="276" cy="252" r="10" fill="#232323"/>
  <path d="M222 300q18 14 36 0" stroke="#232323" stroke-width="6" stroke-linecap="round" fill="none"/>
  <path d="M188 224q16-12 32 0M260 224q16-12 32 0" stroke="#232323" stroke-width="7" stroke-linecap="round" fill="none"/>
</svg>`;
}

export function getDemoSample() {
  const svg = demoPortraitSvg();
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return {
    src,
    naturalWidth: DEMO_W,
    naturalHeight: DEMO_H,
    processingMs: 1200,
    faces: [
      {
        age: 24,
        gender: "male",
        genderConfidence: 0.92,
        score: 0.94,
        box: { x: 128, y: 138, width: 224, height: 246 },
      },
    ],
  };
}
