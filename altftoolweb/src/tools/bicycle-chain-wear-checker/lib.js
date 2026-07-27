/**
 * Bicycle chain wear ("chain stretch") maths.
 *
 * Sources for every constant below:
 *  - Chain pitch: every derailleur/BMX/single-speed bicycle chain uses a
 *    1/2 inch (12.7 mm) rivet-to-rivet pitch, fixed by ISO 606 / ANSI #41.
 *    A brand-new chain therefore measures exactly 12.000 in across 24 pitches.
 *  - Replacement thresholds: Park Tool CC-3.2 / CC-4 chain-checker gauges and
 *    Shimano dealer manuals — 0.5% elongation for 11- and 12-speed chains,
 *    0.75% for 10-speed and narrower-spaced 6- to 9-speed chains, and about
 *    1.0% before a single-speed / internal-gear-hub chain is scrapped.
 *  - Cassette / chainring risk points: past 0.75% the cassette teeth have
 *    usually worn to match the stretched chain; past 1.0% the chainrings are
 *    at risk too.
 */

/** Rivet-to-rivet pitch of a bicycle chain, in inches (ISO 606, 1/2 in). */
export const CHAIN_PITCH_IN = 0.5;

/** Exact inch->millimetre conversion (international inch, 1959). */
export const MM_PER_INCH = 25.4;

/** Elongation (%) at which the cassette is usually worn to match the chain. */
export const CASSETTE_RISK_PCT = 0.75;

/** Elongation (%) past which chainrings should also be inspected. */
export const CHAINRING_RISK_PCT = 1.0;

/**
 * Drivetrain families and the elongation at which the chain should come off.
 * Narrower chains (more sprockets) run less tooth engagement, so they are
 * retired earlier.
 */
export const DRIVETRAINS = [
  { id: "12-speed", label: "12-speed", threshold: 0.5 },
  { id: "11-speed", label: "11-speed", threshold: 0.5 },
  { id: "10-speed", label: "10-speed", threshold: 0.75 },
  { id: "6-9-speed", label: "6- to 9-speed", threshold: 0.75 },
  { id: "single-speed", label: "Single-speed / hub gear", threshold: 1.0 },
];

/** Default measurement span: 24 pitches = 12.000 in on a new chain. */
export const DEFAULT_PITCHES = 24;

/** Shortest span that still gives a usable reading (6 in). */
const MIN_PITCHES = 12;

/** Longest span a normal ruler can cover (24 in). */
const MAX_PITCHES = 48;

/** A chain more than 10% longer than new is a mis-measurement, not wear. */
const MAX_PLAUSIBLE_ELONGATION_PCT = 10;

/**
 * Binary floating point cannot represent 12.09 exactly, so a measurement that
 * sits precisely on a threshold can compute as 0.7499999...%. Treat anything
 * within this tolerance of a threshold as having reached it.
 */
const EPSILON_PCT = 1e-9;

const atLeast = (value, threshold) => value >= threshold - EPSILON_PCT;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function thresholdFor(drivetrainId) {
  const match = DRIVETRAINS.find((item) => item.id === drivetrainId);
  return match ? match.threshold : 0.75;
}

/**
 * Convert a measured span into chain elongation and a replacement verdict.
 *
 * @param {object} input
 * @param {number} input.measured   Measured span, in `unit`.
 * @param {"in"|"mm"} input.unit    Unit the measurement is in.
 * @param {number} input.pitches    Rivet pitches spanned (24 = the 12 in check).
 * @param {string} input.drivetrain One of DRIVETRAINS[].id
 * @param {number} [input.kmRidden] Kilometres already ridden on this chain (0 = unknown).
 */
export function checkChainWear({
  measured,
  unit = "in",
  pitches = DEFAULT_PITCHES,
  drivetrain = "11-speed",
  kmRidden = 0,
}) {
  if (!isNum(measured) || !isNum(pitches) || !isNum(kmRidden)) {
    return { error: "Enter valid numbers for the measurement, span and distance." };
  }
  if (unit !== "in" && unit !== "mm") {
    return { error: "Choose either inches or millimetres." };
  }
  if (measured <= 0) {
    return { error: "The measured length must be greater than zero." };
  }
  if (kmRidden < 0) {
    return { error: "Distance ridden cannot be negative." };
  }
  const wholePitches = Math.round(pitches);
  if (wholePitches < MIN_PITCHES || wholePitches > MAX_PITCHES) {
    return {
      error: `Measure between ${MIN_PITCHES} and ${MAX_PITCHES} rivet pitches (24 pitches is the standard 12-inch check).`,
    };
  }

  const measuredIn = unit === "mm" ? measured / MM_PER_INCH : measured;
  const nominalIn = wholePitches * CHAIN_PITCH_IN;
  const elongationIn = measuredIn - nominalIn;

  if (elongationIn < 0) {
    return {
      error:
        "That is shorter than a brand-new chain — line the ruler up with the centre of the first rivet and measure again.",
    };
  }

  const wearPct = (elongationIn / nominalIn) * 100;
  if (wearPct > MAX_PLAUSIBLE_ELONGATION_PCT) {
    return {
      error: `A ${wearPct.toFixed(1)}% reading means the ruler slipped — a worn-out chain is under 2% longer than new.`,
    };
  }

  const threshold = thresholdFor(drivetrain);
  const rawBudget = threshold - wearPct;
  const budgetLeftPct = rawBudget > EPSILON_PCT ? rawBudget : 0;

  let status = "ok";
  if (atLeast(wearPct, CHAINRING_RISK_PCT)) status = "replace-drivetrain";
  else if (atLeast(wearPct, CASSETTE_RISK_PCT)) status = "replace-chain-cassette";
  else if (atLeast(wearPct, threshold)) status = "replace-chain";

  const verdict = {
    ok: "Chain is still within spec — keep riding and re-check in a few hundred kilometres.",
    "replace-chain": "Replace the chain now. Caught this early, so the cassette should survive.",
    "replace-chain-cassette":
      "Replace the chain and expect the cassette to be worn to match — check for skipping under load.",
    "replace-drivetrain":
      "Past 1% elongation: replace the chain and cassette, and inspect the chainrings for hooked teeth.",
  }[status];

  // Wear is close to linear with distance, so project the remaining life from
  // the wear accumulated so far. Only meaningful once some wear is measurable.
  let wearPer1000Km = null;
  let chainLifeKm = null;
  let remainingKm = null;
  if (kmRidden > 0 && wearPct > 0) {
    wearPer1000Km = (wearPct / kmRidden) * 1000;
    chainLifeKm = (kmRidden * threshold) / wearPct;
    remainingKm = Math.max(0, chainLifeKm - kmRidden);
  }

  return {
    measuredIn,
    measuredMm: measuredIn * MM_PER_INCH,
    nominalIn,
    nominalMm: nominalIn * MM_PER_INCH,
    elongationIn,
    elongationMm: elongationIn * MM_PER_INCH,
    wearPct,
    pitches: wholePitches,
    threshold,
    budgetLeftPct,
    status,
    verdict,
    wearPer1000Km,
    chainLifeKm,
    remainingKm,
    percentOfThreshold: threshold > 0 ? (wearPct / threshold) * 100 : 0,
  };
}
