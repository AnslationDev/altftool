// Pure game logic: scoring, combo, level math, and spawn/movement helpers.
// Kept free of React + DOM so it can be unit reasoned and reused.

import { INSECT_TYPES } from "./insects";

// How long (ms) between catches before the combo resets.
export const COMBO_WINDOW = 2500;
export const MAX_LEVEL = 5;

// Cumulative score needed to reach each level (index 0 = level 1).
export const LEVEL_THRESHOLDS = [0, 200, 500, 900, 1400];

// Map a score to the level it currently sits in (1..MAX_LEVEL).
export function levelFromScore(score) {
  let lvl = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (score >= LEVEL_THRESHOLDS[i]) lvl = i + 1;
  }
  return Math.min(MAX_LEVEL, lvl);
}

// Score needed to advance past the given level.
export function nextThreshold(level) {
  return LEVEL_THRESHOLDS[Math.min(level, MAX_LEVEL - 1)];
}

// Combo multiplier is capped so late chains stay fair.
export function comboMultiplier(combo) {
  return Math.min(Math.max(1, combo), 8);
}

// Points awarded for a catch = base * combo multiplier.
export function scoreForCatch(points, combo) {
  return Math.round(points * comboMultiplier(combo));
}

// Weighted random insect pick using each type's `rarity`.
export function weightedPick(types = INSECT_TYPES, rand = Math.random) {
  const entries = Object.values(types);
  const total = entries.reduce((s, t) => s + (t.rarity || 1), 0);
  let r = rand() * total;
  for (const t of entries) {
    r -= t.rarity || 1;
    if (r <= 0) return t;
  }
  return entries[entries.length - 1];
}

// Recompute difficulty parameters as the player climbs levels: insects get
// faster, spawn more often, live shorter, and more appear at once.
export function levelParams(base, level) {
  const lv = Math.max(0, level - 1);
  return {
    ...base,
    spawnInterval: Math.max(360, base.spawnInterval * Math.pow(0.88, lv)),
    lifetime: Math.max(1500, base.lifetime * Math.pow(0.9, lv)),
    maxInsects: Math.min(14, base.maxInsects + lv),
    speedMul: base.speedMul * (1 + 0.12 * lv),
  };
}

// A random point comfortably inside the play area (for wandering targets).
export function randomInterior(bounds, size, rand = Math.random) {
  const m = size / 2 + 6;
  const w = Math.max(1, bounds.w - 2 * m);
  const h = Math.max(1, bounds.h - 2 * m);
  return { x: m + rand() * w, y: m + rand() * h };
}

// Spawn just inside a random edge so insects fly inward.
export function randomEdgeSpawn(bounds, size, rand = Math.random) {
  const m = size / 2 + 4;
  const side = Math.floor(rand() * 4);
  if (side === 0) return { x: m + rand() * Math.max(1, bounds.w - 2 * m), y: m };
  if (side === 1) return { x: Math.max(m, bounds.w - m), y: m + rand() * Math.max(1, bounds.h - 2 * m) };
  if (side === 2) return { x: m + rand() * Math.max(1, bounds.w - 2 * m), y: Math.max(m, bounds.h - m) };
  return { x: m, y: m + rand() * Math.max(1, bounds.h - 2 * m) };
}

// Nearest off-screen point for an insect that has decided to escape.
export function nearestExit(inst, bounds) {
  const pad = (inst.size || 40) / 2 + 40;
  const dl = inst.x;
  const dr = bounds.w - inst.x;
  const dt = inst.y;
  const db = bounds.h - inst.y;
  const min = Math.min(dl, dr, dt, db);
  if (min === dl) return { x: -pad, y: inst.y };
  if (min === dr) return { x: bounds.w + pad, y: inst.y };
  if (min === dt) return { x: inst.x, y: -pad };
  return { x: inst.x, y: bounds.h + pad };
}
