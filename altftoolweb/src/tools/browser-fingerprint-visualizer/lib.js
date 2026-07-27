/**
 * Browser Fingerprint Visualizer — canonical pure-logic surface.
 *
 * The collectors under ./lib/fingerprint-data/* must touch the DOM (canvas,
 * WebGL, AudioContext, navigator), so they stay where they are. Everything
 * that turns those raw readings into a number — the tracking risk score, the
 * "1 in N browsers" uniqueness estimate and the tip selection — is pure and
 * is re-exported here so it can be reasoned about and tested on its own.
 *
 * Scoring model (implemented in ./lib/riskScore.js): the twelve signals are
 * weighted by how much entropy each contributed in the EFF Panopticlick study
 * (Eckersley, 2010) and its 2018 re-run — canvas 20, WebGL/GPU 15, audio 10,
 * installed fonts 10, timezone 8, screen resolution 8, CPU+memory 7,
 * languages 5, storage profile 4, media devices 4, touch points 3, and a 3
 * point penalty for sending Do-Not-Track (a rare header is itself a
 * distinguishing signal). The weights sum to 97 and the total is clamped to
 * 100; < 30 reads Low, < 70 Medium, otherwise High.
 *
 * Uniqueness (./lib/uniquenessScore.js) multiplies the independent per-signal
 * population frequencies — canvas 1/10 000, audio 1/1 000, WebGL 1/500,
 * fonts 1/100, timezone 1/30, screen 1/20, languages 1/15, CPU cores 1/5 —
 * and reports the reciprocal as "1 in N".
 */

export { calculateRiskScore } from "./lib/riskScore";
export { estimateUniqueness } from "./lib/uniquenessScore";
export {
  PRIVACY_TIPS,
  CATEGORY_META,
  getTipsForScore,
  getTipsByCategory,
} from "./lib/privacyTips";
export { hashString, generateFingerprintHash } from "./lib/hashFingerprint";
export { FONT_LIST } from "./constants/font";

/** Score below which the tracking risk reads "Low". */
export const RISK_LOW_MAX = 30;
/** Score below which the tracking risk reads "Medium"; at or above it is High. */
export const RISK_MEDIUM_MAX = 70;
/** A fingerprint rarer than 1 in this many browsers is treated as identifying. */
export const UNIQUE_THRESHOLD = 100_000;
