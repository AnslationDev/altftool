"use client";

export function simpleImageHash(canvas) {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  let hash = 0;
  const step = Math.max(1, Math.floor((width * height) / 64));
  const imageData = ctx.getImageData(0, 0, width, height).data;
  for (let i = 0; i < imageData.length; i += step * 4) {
    hash = ((hash << 5) - hash + imageData[i]) | 0;
  }
  return Math.abs(hash);
}

export function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function computeSimilarity(canvasA, canvasB) {
  const ctxA = canvasA.getContext("2d");
  const ctxB = canvasB.getContext("2d");
  const w = Math.min(canvasA.width, canvasB.width);
  const h = Math.min(canvasA.height, canvasB.height);
  const dataA = ctxA.getImageData(0, 0, w, h).data;
  const dataB = ctxB.getImageData(0, 0, w, h).data;
  let diff = 0;
  const total = w * h;
  for (let i = 0; i < dataA.length; i += 4) {
    diff += Math.abs(dataA[i] - dataB[i]);
    diff += Math.abs(dataA[i + 1] - dataB[i + 1]);
    diff += Math.abs(dataA[i + 2] - dataB[i + 2]);
  }
  const maxDiff = total * 3 * 255;
  const raw = 1 - diff / maxDiff;
  const hash = simpleImageHash(canvasA) + simpleImageHash(canvasB);
  const rng = seededRandom(hash || 1);
  const fuzz = rng() * 0.2 - 0.1;
  return Math.min(100, Math.max(0, Math.round((raw + fuzz) * 100)));
}

export function generateInsights(percentage) {
  const insights = [
    { min: 0, max: 20, text: "You two are cosmic strangers! The universe keeps you apart — for now." },
    { min: 21, max: 40, text: "A flicker of resemblance! You might share a favorite color or two." },
    { min: 41, max: 60, text: "Getting warmer! You probably laugh at the same jokes." },
    { min: 61, max: 80, text: "Strong mirror energy! You could be siblings from another mother." },
    { min: 81, max: 95, text: "Nearly identical vibes! You definitely finish each other's sentences." },
    { min: 96, max: 100, text: "Off the charts! Are you sure you're not the same person?" },
  ];
  return insights.find((i) => percentage >= i.min && percentage <= i.max)?.text || "Unique in your own way!";
}

export function generateFunFacts(percentage, seed) {
  const rng = seededRandom(seed || percentage * 31 + 7);
  const facts = [
    `You both have a unexplained love for pineapple on pizza (${Math.round(rng() * 100)}% match).`,
    `Your energetic auras align at ${Math.round(rng() * 40 + 60)}% — pure synergy!`,
    `Twin instinct: you'd pick the same movie ${Math.round(rng() * 80 + 20)}% of the time.`,
    `Your smile symmetry score is ${Math.round(rng() * 30 + 70)}% — practically mirror images!`,
    `You share a secret handshake from a past life (compatibility: ${Math.round(rng() * 50 + 50)}%).`,
  ];
  return facts[Math.floor(rng() * facts.length)];
}

export function getSimilarityColor(pct) {
  if (pct < 30) return { text: "text-red-500", bg: "bg-red-500", label: "Low Similarity" };
  if (pct < 55) return { text: "text-orange-500", bg: "bg-orange-500", label: "Moderate" };
  if (pct < 80) return { text: "text-yellow-500", bg: "bg-yellow-500", label: "High" };
  return { text: "text-green-500", bg: "bg-green-500", label: "Almost Twins!" };
}

export function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded — silently ignore */
  }
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
