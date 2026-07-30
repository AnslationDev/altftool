"use client";

/**
 * Honest derived numbers for the Step Counter screen.
 *
 * WHY THIS FILE EXISTS
 * The store used to publish three numbers as if they were measurements:
 *   - estimateFloors(steps) = steps / 650. There is no barometer in this tool,
 *     so a flat walk "climbed" floors. That metric is gone; nothing here
 *     replaces it, because nothing here can measure it.
 *   - distanceKm(steps) = steps * 0.762 m, printed to TWO decimals. A guessed
 *     stride rendered to the centimetre is a precision claim we cannot make.
 *   - caloriesBurned(steps) = steps * 0.04, with no body weight at all.
 *
 * What we do instead: keep both as clearly-labelled estimates, give the visitor
 * the option to supply height and weight so the estimate is about *them*, and
 * never render more precision than the input deserves (one decimal for km, whole
 * kcal). The old exports still exist in utils/stepStore.js for compatibility;
 * the screen simply no longer reads them.
 *
 * Stored on this device only (localStorage), like the rest of the tool.
 */

export const PREFS_KEY = "ALTFT_STEP_PREFS_V1";

/** Median adult walking step length, used when we know nothing about the user. */
export const DEFAULT_STRIDE_M = 0.75;
/** Step length ≈ 0.415 × height — the standard anthropometric walking estimate. */
export const STRIDE_RATIO = 0.415;
/** Reference body mass behind the familiar "0.04 kcal per step" rule of thumb. */
export const DEFAULT_WEIGHT_KG = 70;
/**
 * ~3.5 METs at ~100 steps/min ⇒ kcal/step ≈ 0.0006 × kg.
 * At 70 kg that lands on 0.042 kcal/step, i.e. the same ballpark as the old
 * fixed constant — but it now moves with the person it describes.
 */
export const KCAL_PER_STEP_PER_KG = 0.0006;

export const MIN_HEIGHT_CM = 120;
export const MAX_HEIGHT_CM = 220;
export const MIN_WEIGHT_KG = 30;
export const MAX_WEIGHT_KG = 250;

export function createDefaultPrefs() {
  return { heightCm: null, weightKg: null, haptics: false };
}

function clampOrNull(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function sanitizePrefs(raw) {
  const base = createDefaultPrefs();
  if (!raw || typeof raw !== "object") return base;
  base.heightCm = clampOrNull(raw.heightCm, MIN_HEIGHT_CM, MAX_HEIGHT_CM);
  base.weightKg = clampOrNull(raw.weightKg, MIN_WEIGHT_KG, MAX_WEIGHT_KG);
  base.haptics = raw.haptics === true;
  return base;
}

export function loadPrefs() {
  if (typeof window === "undefined") return createDefaultPrefs();
  try {
    return sanitizePrefs(JSON.parse(window.localStorage.getItem(PREFS_KEY) || "null"));
  } catch {
    return createDefaultPrefs();
  }
}

export function savePrefs(prefs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* private mode / quota — the tool keeps working in memory */
  }
}

/* ------------------------------- estimates -------------------------------- */

export function strideMeters(heightCm) {
  const h = clampOrNull(heightCm, MIN_HEIGHT_CM, MAX_HEIGHT_CM);
  return h ? (h * STRIDE_RATIO) / 100 : DEFAULT_STRIDE_M;
}

export function distanceKmEstimate(steps, heightCm) {
  return (Math.max(0, steps || 0) * strideMeters(heightCm)) / 1000;
}

/** One decimal below 10 km, whole numbers above — never two decimals. */
export function formatDistanceKm(km) {
  const value = Number(km) || 0;
  if (value <= 0) return "0";
  if (value < 10) return value.toFixed(1);
  return String(Math.round(value));
}

export function caloriesEstimate(steps, weightKg) {
  const kg = clampOrNull(weightKg, MIN_WEIGHT_KG, MAX_WEIGHT_KG) || DEFAULT_WEIGHT_KG;
  return Math.round(Math.max(0, steps || 0) * KCAL_PER_STEP_PER_KG * kg);
}

/** True when both estimates are still running on population averages. */
export function isGenericEstimate(prefs) {
  return !prefs?.heightCm && !prefs?.weightKg;
}

/**
 * Which figures the visitor actually supplied. The screen used to credit "the
 * height and weight you entered" the moment EITHER was filled, while the other
 * quietly fell back to 0.75 m or 70 kg.
 */
export function estimateBasis(prefs) {
  const height = Boolean(prefs?.heightCm);
  const weight = Boolean(prefs?.weightKg);
  if (height && weight) return "both";
  if (height) return "height";
  if (weight) return "weight";
  return "none";
}

export function supportsVibration() {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

export function buzz(pattern = 30) {
  try {
    if (supportsVibration()) navigator.vibrate(pattern);
  } catch {
    /* haptics must never break the tool */
  }
}
