/**
 * Monsoon driving readiness.
 *
 * The physics, not opinion:
 *
 *  1. STOPPING DISTANCE = reaction distance + braking distance
 *         reaction distance = v x t_reaction
 *         braking distance  = v^2 / (2 x mu x g)
 *     where v is in metres per second, mu is the peak tyre-road friction
 *     coefficient and g is 9.80665 m/s^2. Only mu and t_reaction change between
 *     a dry road and a wet one, and mu on a wet road is governed by how much
 *     water the tread grooves can pump away — i.e. by tread depth.
 *
 *  2. AQUAPLANING ONSET (Horne & Dreher, NASA TN D-2056, 1963):
 *         V_p (knots) = 9 x sqrt(p)      for a rotating tyre
 *     with p the tyre inflation pressure in psi. Converted to km/h here. Below
 *     this speed the tread can still clear the water film; above it the tyre
 *     rides on water and steering and braking do nothing. Under-inflation drops
 *     the onset speed, which is why a monsoon pressure check matters more than
 *     a summer one.
 *
 *  3. FOLLOWING GAP — the two-second rule doubles to four seconds in rain,
 *     because both the reaction time and the braking distance grow.
 *
 * Tread depth reference: CMVR Rule 94 sets 1.6 mm as the legal minimum tread
 * depth for cars in India, measured in the principal grooves. A new car tyre
 * starts at roughly 8 mm.
 */

/** CMVR Rule 94 minimum tread depth for passenger car tyres, in mm. */
export const LEGAL_MIN_TREAD_MM = 1.6;
/** Depth below which wet grip falls away quickly; tyre makers advise replacing here. */
export const WET_SAFE_TREAD_MM = 3;
/** Typical moulded tread depth of a new passenger car tyre, in mm. */
export const NEW_TREAD_MM = 8;

/** Standard gravity, m/s^2. */
export const G = 9.80665;
/** 1 knot = 1.852 km/h, by definition. */
export const KNOTS_TO_KMH = 1.852;
/** Horne & Dreher rotating-tyre aquaplaning coefficient (NASA TN D-2056). */
export const AQUAPLANE_COEFF_KNOTS = 9;

/** Driver reaction times used here, in seconds: alert dry vs rain and spray. */
export const REACTION_TIME_S = { dry: 1, wet: 1.5 };

/** Representative peak friction on coarse asphalt. Real values vary with compound, water film and surface. */
export const FRICTION_DRY = 0.8;
export const WET_FRICTION_BY_TREAD = [
  { minTread: 6, mu: 0.6, label: "near-new tread" },
  { minTread: WET_SAFE_TREAD_MM, mu: 0.5, label: "healthy tread" },
  { minTread: LEGAL_MIN_TREAD_MM, mu: 0.4, label: "legal but marginal" },
  { minTread: 0, mu: 0.3, label: "below the legal minimum" },
];

/** Rain following gap, in seconds — the two-second rule, doubled. */
export const WET_FOLLOWING_GAP_S = 4;
export const DRY_FOLLOWING_GAP_S = 2;

/** Weighted pre-monsoon checklist. Critical items are reported as blockers. */
export const CHECKLIST = [
  { id: "tread", group: "Tyres & brakes", label: "Tread depth measured with a gauge, not guessed", weight: 5, critical: true },
  { id: "pressure", group: "Tyres & brakes", label: "Pressures set cold to the door-placard figure", weight: 5, critical: true },
  { id: "sidewall", group: "Tyres & brakes", label: "No cuts, bulges or sidewall cracks on any tyre", weight: 4, critical: true },
  { id: "brakes", group: "Tyres & brakes", label: "Brakes checked — no pull to one side, no squeal when wet", weight: 5, critical: true },
  { id: "spare", group: "Tyres & brakes", label: "Spare inflated, jack and wheel spanner present", weight: 3, critical: false },

  { id: "wipers", group: "Visibility", label: "Wiper blades under a year old and not smearing", weight: 5, critical: true },
  { id: "washer", group: "Visibility", label: "Washer bottle full with screen-wash, jets aimed", weight: 3, critical: false },
  { id: "demist", group: "Visibility", label: "AC and blower demist the inside of the glass quickly", weight: 4, critical: true },
  { id: "rear-wiper", group: "Visibility", label: "Rear wiper and rear demister work", weight: 2, critical: false, optional: true },
  { id: "lights", group: "Visibility", label: "Headlights, tail lights and indicators all working", weight: 4, critical: true },
  { id: "no-hazards", group: "Visibility", label: "Know not to drive on hazard lights in rain — they hide your indicators", weight: 2, critical: false },

  { id: "seals", group: "Sealing & electricals", label: "Door and boot rubber seals intact, sunroof drains clear", weight: 3, critical: false },
  { id: "battery", group: "Sealing & electricals", label: "Battery terminals clean and tight, battery load-tested", weight: 3, critical: false },
  { id: "wiring", group: "Sealing & electricals", label: "No taped or exposed wiring in the engine bay", weight: 3, critical: false },
  { id: "underbody", group: "Sealing & electricals", label: "Wheel-arch liners and underbody covers all present", weight: 2, critical: false },

  { id: "insurance", group: "Documents & kit", label: "Own-damage cover in force; engine protection add-on if you park or drive in flood-prone areas", weight: 4, critical: false },
  { id: "wading", group: "Sealing & electricals", label: "You know your car's wading depth and will not restart a stalled engine in water", weight: 4, critical: true },
  { id: "kit", group: "Documents & kit", label: "Tow rope, torch, power bank and raincoat in the car", weight: 2, critical: false },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Peak wet friction coefficient for a given tread depth, from the band table. */
export function wetFrictionForTread(treadMm) {
  const band = WET_FRICTION_BY_TREAD.find((entry) => treadMm >= entry.minTread);
  return band ?? WET_FRICTION_BY_TREAD[WET_FRICTION_BY_TREAD.length - 1];
}

/** Reaction + braking distance in metres. */
export function stoppingDistance(speedKmh, mu, reactionS) {
  const v = speedKmh / 3.6;
  const reaction = v * reactionS;
  const braking = (v * v) / (2 * mu * G);
  return { reaction, braking, total: reaction + braking };
}

/** Aquaplaning onset speed in km/h for a rotating tyre at a given psi. */
export function aquaplaneSpeedKmh(pressurePsi) {
  if (!isNum(pressurePsi) || pressurePsi <= 0) return 0;
  return AQUAPLANE_COEFF_KNOTS * Math.sqrt(pressurePsi) * KNOTS_TO_KMH;
}

/**
 * @param {object} input
 * @param {number} input.treadMm       measured tread depth in the main grooves
 * @param {number} input.pressurePsi   cold inflation pressure
 * @param {number} input.speedKmh      the speed you actually cruise at in rain
 * @param {Record<string, boolean>} input.checked        ticked checklist ids
 * @param {Record<string, boolean>} input.notApplicable  optional ids marked N/A
 */
export function assessMonsoonReadiness({
  treadMm,
  pressurePsi,
  speedKmh,
  checked = {},
  notApplicable = {},
}) {
  if (![treadMm, pressurePsi, speedKmh].every(isNum))
    return { error: "Enter a valid number for tread depth, tyre pressure and cruising speed." };
  if (treadMm <= 0) return { error: "Tread depth must be greater than zero." };
  if (treadMm > 20) return { error: "Enter a car tyre tread depth of 20 mm or less." };
  if (pressurePsi < 10 || pressurePsi > 80)
    return { error: "Enter a cold tyre pressure between 10 and 80 psi." };
  if (speedKmh <= 0) return { error: "Cruising speed must be greater than zero." };
  if (speedKmh > 200) return { error: "Enter a cruising speed of 200 km/h or less." };

  // --- grip and distances ---
  const band = wetFrictionForTread(treadMm);
  const dry = stoppingDistance(speedKmh, FRICTION_DRY, REACTION_TIME_S.dry);
  const wet = stoppingDistance(speedKmh, band.mu, REACTION_TIME_S.wet);
  const extraMetres = wet.total - dry.total;
  const extraPercent = (extraMetres / dry.total) * 100;

  const treadRemainingPct =
    ((treadMm - LEGAL_MIN_TREAD_MM) / (NEW_TREAD_MM - LEGAL_MIN_TREAD_MM)) * 100;
  const legalTread = treadMm >= LEGAL_MIN_TREAD_MM;

  // --- aquaplaning ---
  const aquaplaneKmh = aquaplaneSpeedKmh(pressurePsi);
  const aquaplaneMargin = aquaplaneKmh - speedKmh;
  const aquaplaneRisk = aquaplaneMargin <= 0 ? "over" : aquaplaneMargin <= 15 ? "close" : "clear";

  // --- following gap ---
  const v = speedKmh / 3.6;
  const wetGapMetres = v * WET_FOLLOWING_GAP_S;
  const dryGapMetres = v * DRY_FOLLOWING_GAP_S;

  // The speed at which a wet stop equals the dry stopping distance you are used
  // to: solve reaction + v^2/(2 mu_wet g) = dryTotal for v.
  const a = 1 / (2 * band.mu * G);
  const b = REACTION_TIME_S.wet;
  const c = -dry.total;
  const vEquivalent = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
  const equivalentWetSpeedKmh = vEquivalent * 3.6;

  // --- checklist ---
  let earned = 0;
  let available = 0;
  const blockers = [];
  const missing = [];
  const groups = new Map();

  for (const item of CHECKLIST) {
    if (item.optional && notApplicable[item.id]) continue;
    available += item.weight;
    const ticked = Boolean(checked[item.id]);
    if (ticked) earned += item.weight;
    else if (item.critical) blockers.push(item.label);
    else missing.push(item.label);

    const bucket = groups.get(item.group) ?? { group: item.group, earned: 0, available: 0 };
    bucket.available += item.weight;
    if (ticked) bucket.earned += item.weight;
    groups.set(item.group, bucket);
  }
  if (available === 0)
    return { error: "Every checklist item has been marked not applicable — nothing left to score." };

  const score = (earned / available) * 100;
  const groupScores = [...groups.values()].map((bucket) => ({
    ...bucket,
    percent: (bucket.earned / bucket.available) * 100,
  }));

  // --- verdict ---
  let verdict;
  let tone;
  if (!legalTread) {
    verdict = `Tyres are below the ${LEGAL_MIN_TREAD_MM} mm legal minimum — replace them before the rains, not after`;
    tone = "danger";
  } else if (blockers.length > 0) {
    verdict = `${blockers.length} essential check${blockers.length === 1 ? "" : "s"} outstanding`;
    tone = "danger";
  } else if (aquaplaneRisk === "over") {
    verdict = "Your cruising speed is above the aquaplaning onset for this pressure — slow down in standing water";
    tone = "danger";
  } else if (score < 80 || treadMm < WET_SAFE_TREAD_MM || aquaplaneRisk === "close") {
    verdict = "Usable, but tighten the open items and cut your rain speed";
    tone = "warn";
  } else {
    verdict = "Monsoon ready";
    tone = "success";
  }

  const notes = [];
  if (treadMm < WET_SAFE_TREAD_MM && legalTread) {
    notes.push(
      `At ${treadMm} mm you are legal but below the ${WET_SAFE_TREAD_MM} mm depth where wet grip starts falling away — budget for tyres this season.`,
    );
  }
  notes.push(
    `Drop to about ${Math.round(equivalentWetSpeedKmh)} km/h in rain to stop in the same distance you would from ${Math.round(speedKmh)} km/h on a dry road.`,
  );
  if (aquaplaneRisk !== "clear") {
    notes.push(
      `Aquaplaning starts near ${Math.round(aquaplaneKmh)} km/h at ${pressurePsi} psi. Every psi you lose lowers that speed, so check pressures cold each week in the monsoon.`,
    );
  }
  notes.push(
    `Leave ${Math.round(wetGapMetres)} m — four seconds — to the vehicle ahead instead of the ${Math.round(dryGapMetres)} m two-second gap you use in the dry.`,
  );

  return {
    band,
    dry,
    wet,
    extraMetres,
    extraPercent,
    treadRemainingPct: Math.max(0, treadRemainingPct),
    legalTread,
    aquaplaneKmh,
    aquaplaneMargin,
    aquaplaneRisk,
    wetGapMetres,
    dryGapMetres,
    equivalentWetSpeedKmh,
    score,
    earned,
    available,
    groupScores,
    blockers,
    missing,
    verdict,
    tone,
    notes,
  };
}
