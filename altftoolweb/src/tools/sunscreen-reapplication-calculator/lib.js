/**
 * Sunscreen dose and reapplication timing.
 *
 * Rule and data sources:
 *  - The "teaspoon rule" used by the Cancer Council Australia and the British
 *    Association of Dermatologists: about 5 ml (one level teaspoon) for each of
 *    the head/neck/ears, each arm, each leg, the front of the torso and the
 *    back — seven teaspoons, roughly 35 ml, for a whole adult body.
 *  - SPF is measured at an application density of 2 mg/cm2 (FDA sunscreen
 *    monograph and ISO 24444). Real-world use is typically a quarter to a half
 *    of that, which is why under-application matters more than SPF number.
 *  - FDA water-resistance labelling: a product may only claim water resistance
 *    for 40 or 80 minutes, and non-water-resistant products must be reapplied
 *    straight after swimming or sweating.
 *  - WHO Global Solar UV Index: erythemal irradiance of 0.025 W/m2 per index
 *    point, and the protection bands Low 0-2, Moderate 3-5, High 6-7,
 *    Very High 8-10, Extreme 11+.
 *  - Minimal erythemal dose by Fitzpatrick skin type in J/m2 erythemally
 *    weighted (1 standard erythemal dose = 100 J/m2).
 */

/** Cancer Council teaspoon rule — 5 ml per region. */
export const APPLICATION_ML_PER_REGION = 5;

export const BODY_AREAS = [
  { id: "head", label: "Face, neck and ears", ml: APPLICATION_ML_PER_REGION },
  { id: "left-arm", label: "Left arm and hand", ml: APPLICATION_ML_PER_REGION },
  { id: "right-arm", label: "Right arm and hand", ml: APPLICATION_ML_PER_REGION },
  { id: "front-torso", label: "Front of torso", ml: APPLICATION_ML_PER_REGION },
  { id: "back-torso", label: "Back and shoulders", ml: APPLICATION_ML_PER_REGION },
  { id: "left-leg", label: "Left leg and foot", ml: APPLICATION_ML_PER_REGION },
  { id: "right-leg", label: "Right leg and foot", ml: APPLICATION_ML_PER_REGION },
];

/** Minimal erythemal dose, erythemally weighted J/m2, by Fitzpatrick type. */
export const SKIN_TYPES = [
  { id: "i", label: "Type I — always burns, never tans", medJm2: 200 },
  { id: "ii", label: "Type II — burns easily, tans minimally", medJm2: 250 },
  { id: "iii", label: "Type III — burns moderately, tans gradually", medJm2: 350 },
  { id: "iv", label: "Type IV — burns minimally, tans easily", medJm2: 450 },
  { id: "v", label: "Type V — rarely burns, tans profusely", medJm2: 600 },
  { id: "vi", label: "Type VI — never burns, deeply pigmented", medJm2: 1000 },
];

/** WHO UV Index bands. */
export const UV_BANDS = [
  { min: 0, max: 3, key: "low", label: "Low", advice: "No protection needed for most people unless you are outdoors for many hours." },
  { min: 3, max: 6, key: "moderate", label: "Moderate", advice: "Seek shade near midday, wear a shirt and sunglasses, and use sunscreen." },
  { min: 6, max: 8, key: "high", label: "High", advice: "Protection required — shade, hat, shirt, sunglasses and sunscreen." },
  { min: 8, max: 11, key: "very-high", label: "Very High", advice: "Extra protection required. Avoid being outside during midday hours." },
  { min: 11, max: Infinity, key: "extreme", label: "Extreme", advice: "Take all precautions. Unprotected skin can burn in minutes." },
];

/** WHO: sun protection is advised from this UV index upward. */
export const UV_PROTECTION_THRESHOLD = 3;

/** Erythemal irradiance per UV Index point, W/m2. */
export const UV_W_PER_M2_PER_INDEX = 0.025;

/** SPF testing density, mg per square centimetre. */
export const SPF_TEST_DENSITY_MG_CM2 = 2;

/** Default reapplication interval in minutes when you stay dry. */
export const DRY_REAPPLY_MINUTES = 120;

/** Minutes before exposure that sunscreen should go on. */
export const PRE_APPLY_MINUTES = 20;

export const ACTIVITIES = [
  { id: "dry", label: "Staying dry — walking, sitting, driving", wet: false },
  { id: "sweating", label: "Sweating heavily — sport or hard work", wet: true },
  { id: "swimming", label: "Swimming or in and out of water", wet: true },
];

export const WATER_RESISTANCE_OPTIONS = [
  { id: "none", label: "No water-resistance claim", minutes: null },
  { id: "40", label: "Water resistant (40 minutes)", minutes: 40 },
  { id: "80", label: "Water resistant (80 minutes)", minutes: 80 },
];

/** Fallback interval when a wet activity is combined with a non-water-resistant product. */
export const NON_RESISTANT_WET_MINUTES = 40;

/** Sunscreen lotion density is close enough to 1 g per ml for dosing. */
export const ML_TO_GRAMS = 1;

const round = (value, dp = 1) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

export function uvBandFor(uvIndex) {
  const value = Number(uvIndex);
  if (!Number.isFinite(value)) return null;
  return UV_BANDS.find((band) => value >= band.min && value < band.max) || UV_BANDS[UV_BANDS.length - 1];
}

/**
 * Minutes of unprotected exposure to reach one minimal erythemal dose.
 * time (s) = MED (J/m2) / (UV index x 0.025 W/m2)
 * Returns null when the UV index is zero, where there is no burn time to give.
 */
export function unprotectedBurnMinutes({ uvIndex, skinTypeId }) {
  const uv = Number(uvIndex);
  const skin = SKIN_TYPES.find((type) => type.id === skinTypeId);
  if (!skin || !Number.isFinite(uv) || uv <= 0) return null;
  const irradiance = uv * UV_W_PER_M2_PER_INDEX;
  if (irradiance <= 0) return null;
  return skin.medJm2 / irradiance / 60;
}

/**
 * Build a full sunscreen plan for one outing.
 *
 * @param {object} input
 * @param {string[]} input.areas       BODY_AREAS ids that will be exposed
 * @param {number} input.spf
 * @param {number} input.uvIndex
 * @param {string} input.skinTypeId
 * @param {number} input.outdoorMinutes
 * @param {string} input.activity      an ACTIVITIES id
 * @param {string} input.waterResistance  a WATER_RESISTANCE_OPTIONS id
 * @param {number} input.bottleMl      optional, for "how long will a bottle last"
 * @returns {object} plan, or { error }
 */
export function computeSunscreenPlan({
  areas = [],
  spf,
  uvIndex,
  skinTypeId = "iii",
  outdoorMinutes,
  activity = "dry",
  waterResistance = "none",
  bottleMl,
} = {}) {
  const selected = BODY_AREAS.filter((area) => areas.includes(area.id));
  if (selected.length === 0) {
    return { error: "Select at least one body area that will be uncovered." };
  }

  const spfValue = Number(spf);
  const uv = Number(uvIndex);
  const minutes = Number(outdoorMinutes);

  if (![spfValue, uv, minutes].every((value) => Number.isFinite(value))) {
    return { error: "Enter numbers for SPF, UV index and time outdoors." };
  }
  if (spfValue < 2 || spfValue > 100) {
    return { error: "Enter an SPF between 2 and 100 — labels above 50 are usually written as 50+." };
  }
  if (uv < 0 || uv > 20) return { error: "The UV index runs from 0 to about 15 — check the figure you entered." };
  if (minutes <= 0) return { error: "Enter a time outdoors greater than zero minutes." };
  if (minutes > 720) return { error: "Enter a time outdoors of 720 minutes (12 hours) or less." };

  const skin = SKIN_TYPES.find((type) => type.id === skinTypeId) || SKIN_TYPES[2];
  const activityDef = ACTIVITIES.find((item) => item.id === activity) || ACTIVITIES[0];
  const resistance =
    WATER_RESISTANCE_OPTIONS.find((item) => item.id === waterResistance) ||
    WATER_RESISTANCE_OPTIONS[0];

  const mlPerApplication = selected.reduce((sum, area) => sum + area.ml, 0);

  let reapplyMinutes = DRY_REAPPLY_MINUTES;
  let reapplyReason = "Standard advice is to reapply every two hours of sun exposure.";
  if (activityDef.wet) {
    if (resistance.minutes === null) {
      reapplyMinutes = NON_RESISTANT_WET_MINUTES;
      reapplyReason =
        "This product makes no water-resistance claim, so it must go back on straight after swimming, towel drying or heavy sweating.";
    } else {
      reapplyMinutes = Math.min(resistance.minutes, DRY_REAPPLY_MINUTES);
      reapplyReason = `The label's water-resistance claim only holds for ${resistance.minutes} minutes in water or heavy sweat.`;
    }
  }

  const applications = Math.max(1, 1 + Math.floor((minutes - 1) / reapplyMinutes));
  const totalMl = mlPerApplication * applications;

  const schedule = [];
  schedule.push({
    minute: -PRE_APPLY_MINUTES,
    label: `${PRE_APPLY_MINUTES} minutes before you go out — first application`,
  });
  for (let i = 1; i < applications; i += 1) {
    schedule.push({
      minute: i * reapplyMinutes,
      label: `After ${i * reapplyMinutes} minutes outdoors — reapplication ${i}`,
    });
  }

  const burnMinutes = unprotectedBurnMinutes({ uvIndex: uv, skinTypeId: skin.id });
  const band = uvBandFor(uv);

  const notes = [];
  notes.push(
    `SPF is tested at ${SPF_TEST_DENSITY_MG_CM2} mg/cm². Most people apply a quarter to a half of that, so an SPF 50 used thinly behaves closer to SPF 10-20 — the amount matters more than the number.`,
  );
  if (uv < UV_PROTECTION_THRESHOLD) {
    notes.push(
      `At UV index ${round(uv)} the WHO says no protection is needed for most people, though prolonged exposure still adds up.`,
    );
  }
  if (activityDef.wet && resistance.minutes !== null) {
    notes.push(
      "Water resistance is not waterproof — towel drying removes sunscreen mechanically, so reapply after drying off even if you were in the water for less than the claim.",
    );
  }
  if (spfValue >= 30) {
    notes.push(
      "SPF 30 filters about 97% of UVB and SPF 50 about 98%; the extra 1% is far smaller than the difference between applying enough and applying too little.",
    );
  }
  notes.push(
    "Lips, ears, the hairline, the tops of feet and the back of the neck are the most commonly missed spots.",
  );

  const result = {
    areasSelected: selected.map((area) => area.label),
    mlPerApplication: round(mlPerApplication),
    teaspoonsPerApplication: round(mlPerApplication / APPLICATION_ML_PER_REGION),
    gramsPerApplication: round(mlPerApplication * ML_TO_GRAMS),
    reapplyMinutes,
    reapplyReason,
    applications,
    totalMl: round(totalMl),
    schedule,
    outdoorMinutes: Math.round(minutes),
    spf: Math.round(spfValue),
    uvIndex: round(uv),
    uvBandLabel: band ? band.label : "",
    uvAdvice: band ? band.advice : "",
    protectionNeeded: uv >= UV_PROTECTION_THRESHOLD,
    skinTypeLabel: skin.label,
    unprotectedBurnMinutes: burnMinutes === null ? null : Math.round(burnMinutes),
    theoreticalProtectedMinutes: burnMinutes === null ? null : Math.round(burnMinutes * spfValue),
    activityLabel: activityDef.label,
    waterResistanceLabel: resistance.label,
    notes,
    bottle: null,
  };

  const bottle = Number(bottleMl);
  if (Number.isFinite(bottle) && bottle > 0 && totalMl > 0) {
    result.bottle = {
      ml: round(bottle),
      outings: Math.floor(bottle / totalMl),
      applications: Math.floor(bottle / mlPerApplication),
    };
  }

  return result;
}
