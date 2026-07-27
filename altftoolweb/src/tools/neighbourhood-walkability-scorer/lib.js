/**
 * Neighbourhood walkability scorer.
 *
 * This follows the structure of the published Walk Score methodology, which is
 * the reference model for amenity-based walkability:
 *
 *  1. Amenities in nine categories are scored by walking distance.
 *  2. Anything within a five-minute walk (0.25 miles / about 400 m) earns full
 *     points. Points decay with distance and reach zero at roughly a
 *     thirty-minute walk (1.5 miles / about 2,400 m).
 *  3. The weighted total is out of 15 points, which is normalised to 0-100.
 *  4. The result is then reduced by pedestrian-friendliness penalties for
 *     intersection density and average block length.
 *
 * The exact analytic form of the Walk Score decay curve is not published, so
 * the decay here is a piecewise-linear reconstruction through the anchor points
 * the methodology does state: full value to 0.25 miles, roughly a tenth of the
 * value remaining at 1 mile, and nothing at 1.5 miles. Treat the output as a
 * comparable estimate between addresses, not as an official Walk Score.
 *
 * Everything is pure arithmetic. No clock, no network, no DOM.
 */

/** Walk Score's own pace assumption: 0.25 miles (about 400 m) in five minutes. */
export const WALK_SPEED_M_PER_MIN = 80;

/** Full points inside this distance — the five-minute walk. */
export const FULL_POINTS_DISTANCE_M = 400;

/** Nothing scores beyond this — the thirty-minute walk. */
export const ZERO_POINTS_DISTANCE_M = 2400;

/** A ten-minute walk. Used as the assumed distance for the second, third, ... amenity in a category. */
export const TEN_MINUTE_DISTANCE_M = 800;

/** The weighted amenity total in the Walk Score model before normalisation. */
export const TOTAL_WEIGHT = 15;

/**
 * Distance decay anchors (metres -> share of the points retained). Interpolated
 * linearly between anchors. Anchored on the published statements that a
 * five-minute walk keeps everything and a thirty-minute walk keeps nothing.
 */
export const DECAY_ANCHORS = [
  [0, 1],
  [FULL_POINTS_DISTANCE_M, 1],
  [TEN_MINUTE_DISTANCE_M, 0.65],
  [1207, 0.35], // 0.75 miles
  [1609, 0.12], // 1 mile
  [2011, 0.04], // 1.25 miles
  [ZERO_POINTS_DISTANCE_M, 0],
];

/**
 * Category weights from the Walk Score methodology. Categories with several
 * counted amenities keep their published sub-weights, which is why restaurants
 * and shopping reward a cluster rather than a single outlet.
 */
export const CATEGORIES = [
  { id: "grocery", label: "Grocery store or daily market", subWeights: [3], counted: false },
  { id: "restaurants", label: "Restaurants and takeaways", subWeights: [0.75, 0.45, 0.25, 0.25, 0.225, 0.225, 0.225, 0.225, 0.2, 0.2], counted: true },
  { id: "shopping", label: "Shops (chemist, hardware, clothing)", subWeights: [0.5, 0.45, 0.4, 0.35, 0.3], counted: true },
  { id: "coffee", label: "Cafés and tea shops", subWeights: [1.25, 0.75], counted: true },
  { id: "banks", label: "Bank or ATM", subWeights: [1], counted: false },
  { id: "parks", label: "Park or open green space", subWeights: [1], counted: false },
  { id: "schools", label: "School", subWeights: [1], counted: false },
  { id: "books", label: "Library or bookshop", subWeights: [1], counted: false },
  { id: "entertainment", label: "Cinema, gym or community venue", subWeights: [1], counted: false },
];

/**
 * Pedestrian-friendliness penalties published with the Walk Score methodology.
 * Intersection density is intersections per square kilometre; a dense grid of
 * junctions means short, direct walking routes.
 */
export const INTERSECTION_PENALTIES = [
  { min: 200, penaltyPct: 0, label: "Dense grid, direct routes" },
  { min: 150, penaltyPct: 1, label: "Well connected" },
  { min: 120, penaltyPct: 2, label: "Moderately connected" },
  { min: 90, penaltyPct: 3, label: "Sparse junctions" },
  { min: 60, penaltyPct: 4, label: "Few junctions, detours likely" },
  { min: 0, penaltyPct: 5, label: "Cul-de-sac pattern, long detours" },
];

/** Average block length in metres — long blocks mean fewer places to cross. */
export const BLOCK_LENGTH_PENALTIES = [
  { max: 120, penaltyPct: 0, label: "Short blocks" },
  { max: 150, penaltyPct: 1, label: "Comfortable blocks" },
  { max: 165, penaltyPct: 2, label: "Longish blocks" },
  { max: 180, penaltyPct: 3, label: "Long blocks" },
  { max: 195, penaltyPct: 4, label: "Very long blocks" },
  { max: Infinity, penaltyPct: 5, label: "Superblocks, poor for walking" },
];

/** Walk Score's published description bands. */
export const SCORE_BANDS = [
  { min: 90, label: "Walker's Paradise", note: "Daily errands do not require a car." },
  { min: 70, label: "Very Walkable", note: "Most errands can be done on foot." },
  { min: 50, label: "Somewhat Walkable", note: "Some errands can be done on foot." },
  { min: 25, label: "Car-Dependent", note: "Most errands require a car." },
  { min: 0, label: "Car-Dependent", note: "Almost all errands require a car." },
];

/**
 * Transit access is scored separately here, and deliberately not called a
 * Transit Score. The rule is simple and stated: a stop within a five-minute
 * walk with a service every ten minutes or better is full marks; access decays
 * with the walk to the stop and with the headway between services, because a
 * stop you cannot rely on is not usable access.
 */
export const TRANSIT_FULL_WALK_MIN = 5;
export const TRANSIT_MAX_WALK_MIN = 20;
export const TRANSIT_FULL_HEADWAY_MIN = 10;
export const TRANSIT_MAX_HEADWAY_MIN = 60;

export const MAX_WALK_MINUTES = 45;
export const MAX_COUNT = 30;

/** Convert walking minutes to metres at the model's assumed pace. */
export function minutesToMetres(minutes) {
  return minutes * WALK_SPEED_M_PER_MIN;
}

/** Share of a category's points retained at a given walking distance in metres. */
export function distanceDecay(metres) {
  if (!Number.isFinite(metres) || metres < 0) return 0;
  if (metres <= FULL_POINTS_DISTANCE_M) return 1;
  if (metres >= ZERO_POINTS_DISTANCE_M) return 0;
  for (let i = 1; i < DECAY_ANCHORS.length; i += 1) {
    const [d0, v0] = DECAY_ANCHORS[i - 1];
    const [d1, v1] = DECAY_ANCHORS[i];
    if (metres <= d1) {
      const t = (metres - d0) / (d1 - d0);
      return v0 + (v1 - v0) * t;
    }
  }
  return 0;
}

function lookupIntersectionPenalty(density) {
  return INTERSECTION_PENALTIES.find((band) => density >= band.min) || INTERSECTION_PENALTIES[INTERSECTION_PENALTIES.length - 1];
}

function lookupBlockPenalty(length) {
  return BLOCK_LENGTH_PENALTIES.find((band) => length <= band.max) || BLOCK_LENGTH_PENALTIES[BLOCK_LENGTH_PENALTIES.length - 1];
}

export function bandForScore(score) {
  return SCORE_BANDS.find((band) => score >= band.min) || SCORE_BANDS[SCORE_BANDS.length - 1];
}

/** Points earned by one category. */
function scoreCategory(category, walkMinutes, count) {
  const nearestMetres = minutesToMetres(walkMinutes);
  const available = category.counted ? Math.max(0, Math.min(count, category.subWeights.length)) : 1;
  let earned = 0;
  let possible = 0;
  category.subWeights.forEach((weight, index) => {
    possible += weight;
    if (index >= available) return;
    // The nearest amenity sits at the measured distance; further ones in the
    // same category are assumed to be no closer than a ten-minute walk.
    const metres = index === 0 ? nearestMetres : Math.max(nearestMetres, TEN_MINUTE_DISTANCE_M);
    earned += weight * distanceDecay(metres);
  });
  return { earned, possible, nearestMetres, counted: available };
}

/** Transit access, 0-100, on the documented headway-and-walk rule. */
export function transitAccessScore(walkMinutes, headwayMinutes) {
  if (!Number.isFinite(walkMinutes) || !Number.isFinite(headwayMinutes)) return 0;
  if (walkMinutes >= TRANSIT_MAX_WALK_MIN || headwayMinutes >= TRANSIT_MAX_HEADWAY_MIN) return 0;
  const walkFactor =
    walkMinutes <= TRANSIT_FULL_WALK_MIN
      ? 1
      : 1 - (walkMinutes - TRANSIT_FULL_WALK_MIN) / (TRANSIT_MAX_WALK_MIN - TRANSIT_FULL_WALK_MIN);
  const headwayFactor =
    headwayMinutes <= TRANSIT_FULL_HEADWAY_MIN
      ? 1
      : 1 - (headwayMinutes - TRANSIT_FULL_HEADWAY_MIN) / (TRANSIT_MAX_HEADWAY_MIN - TRANSIT_FULL_HEADWAY_MIN);
  return Math.round(Math.max(0, walkFactor) * Math.max(0, headwayFactor) * 100);
}

/**
 * @param {object} input
 * @param {Record<string, {minutes:number, count:number}>} input.amenities keyed by category id
 * @param {number} input.intersectionDensity intersections per square kilometre
 * @param {number} input.blockLength average block length in metres
 * @param {number} input.transitWalkMinutes walk to the nearest usable stop
 * @param {number} input.transitHeadwayMinutes typical gap between services
 */
export function scoreWalkability(input) {
  const {
    amenities = {},
    intersectionDensity,
    blockLength,
    transitWalkMinutes,
    transitHeadwayMinutes,
  } = input || {};

  const density = Number(intersectionDensity);
  const block = Number(blockLength);
  const transitWalk = Number(transitWalkMinutes);
  const headway = Number(transitHeadwayMinutes);

  if (![density, block, transitWalk, headway].every((value) => Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (density < 0 || density > 1000) {
    return { error: "Intersection density should be between 0 and 1000 junctions per square kilometre." };
  }
  if (block <= 0 || block > 2000) {
    return { error: "Average block length should be between 1 m and 2000 m." };
  }
  if (transitWalk < 0 || transitWalk > 120) {
    return { error: "Walk to the nearest transit stop should be between 0 and 120 minutes." };
  }
  if (headway <= 0 || headway > 240) {
    return { error: "Service gap should be between 1 and 240 minutes." };
  }

  const rows = [];
  let earned = 0;

  for (const category of CATEGORIES) {
    const entry = amenities[category.id] || {};
    const minutes = Number(entry.minutes);
    const count = category.counted ? Number(entry.count) : 1;
    if (!Number.isFinite(minutes) || minutes < 0 || minutes > MAX_WALK_MINUTES) {
      return { error: `Walking time to ${category.label.toLowerCase()} must be between 0 and ${MAX_WALK_MINUTES} minutes.` };
    }
    if (!Number.isFinite(count) || count < 0 || count > MAX_COUNT) {
      return { error: `Count for ${category.label.toLowerCase()} must be between 0 and ${MAX_COUNT}.` };
    }
    const result = scoreCategory(category, minutes, count);
    earned += result.earned;
    rows.push({
      id: category.id,
      label: category.label,
      minutes,
      metres: Math.round(result.nearestMetres),
      counted: result.counted,
      countable: category.counted,
      maxCount: category.subWeights.length,
      earned: result.earned,
      possible: result.possible,
      share: result.possible > 0 ? result.earned / result.possible : 0,
    });
  }

  const baseScore = (earned / TOTAL_WEIGHT) * 100;
  const intersectionBand = lookupIntersectionPenalty(density);
  const blockBand = lookupBlockPenalty(block);
  const penaltyPct = intersectionBand.penaltyPct + blockBand.penaltyPct;
  const finalScore = Math.max(0, Math.min(100, Math.round(baseScore * (1 - penaltyPct / 100))));
  const band = bandForScore(finalScore);
  const transit = transitAccessScore(transitWalk, headway);

  const weakest = [...rows].sort((a, b) => a.share - b.share).slice(0, 3).filter((row) => row.share < 0.9);

  return {
    baseScore: Math.round(baseScore * 10) / 10,
    penaltyPct,
    intersectionBand,
    blockBand,
    score: finalScore,
    band,
    earnedPoints: Math.round(earned * 100) / 100,
    rows,
    transit,
    transitLabel:
      transit >= 70 ? "Car-free viable" : transit >= 40 ? "Usable with planning" : transit >= 15 ? "Occasional use only" : "Effectively no transit",
    weakest,
  };
}

/** Clipboard summary. */
export function formatWalkabilityText(result) {
  if (!result || result.error) return "";
  const lines = [
    "Neighbourhood walkability",
    `Score: ${result.score}/100 — ${result.band.label}`,
    result.band.note,
    `Amenity points: ${result.earnedPoints} of ${TOTAL_WEIGHT}`,
    `Pedestrian penalty: ${result.penaltyPct}% (${result.intersectionBand.label}; ${result.blockBand.label})`,
    `Transit access: ${result.transit}/100 — ${result.transitLabel}`,
    "",
    "By category:",
  ];
  result.rows.forEach((row) => {
    lines.push(`  ${row.label}: ${row.minutes} min walk, ${Math.round(row.share * 100)}% of its points`);
  });
  return lines.join("\n");
}
