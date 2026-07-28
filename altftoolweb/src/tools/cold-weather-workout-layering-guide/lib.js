/**
 * Cold-weather training: wind chill, frostbite exposure and what to wear.
 *
 * Rule and data sources:
 *  - The 2001 North American wind chill index adopted jointly by the US
 *    National Weather Service and Environment Canada. Metric form:
 *      WCI = 13.12 + 0.6215 T - 11.37 V^0.16 + 0.3965 T V^0.16
 *    with T in degrees Celsius and V the wind speed in km/h at 10 m. It is
 *    defined only for T at or below 10 degC and V above 4.8 km/h; outside
 *    that range the air temperature itself is used.
 *  - Environment Canada's wind chill hazard table for frostbite risk and the
 *    exposure times attached to each band.
 *  - The long-standing endurance-coaching rule of thumb to dress as if it
 *    were 10 to 20 degF (about 5 to 11 degC) warmer than it is, because
 *    exercise metabolism raises your effective temperature. That rule is a
 *    heuristic, not a measurement, and is labelled as such in the output.
 *
 * Informational only; it is not a substitute for judgement on the day.
 */

/** The wind chill index is only defined below this air temperature. */
export const WIND_CHILL_MAX_TEMP_C = 10;
/** ...and above this wind speed. */
export const WIND_CHILL_MIN_WIND_KMH = 4.8;

/** Environment Canada wind chill hazard bands. */
export const FROSTBITE_BANDS = [
  {
    max: Infinity,
    min: 0,
    label: "No frostbite risk",
    exposure: "No limit from cold alone",
    detail: "Comfortable with normal training clothing.",
  },
  {
    max: 0,
    min: -10,
    label: "Slight discomfort",
    exposure: "No practical limit",
    detail: "Cover the hands and head; skin is not at risk.",
  },
  {
    max: -10,
    min: -28,
    label: "Uncomfortable — low frostbite risk",
    exposure: "Low risk for most people",
    detail: "Exposed skin feels cold quickly. Cover the ears, nose and fingers.",
  },
  {
    max: -28,
    min: -40,
    label: "Frostbite risk in 10 to 30 minutes",
    exposure: "10 to 30 minutes of exposed skin",
    detail: "No skin should be uncovered. Check face and fingers regularly.",
  },
  {
    max: -40,
    min: -48,
    label: "Frostbite risk in 5 to 10 minutes",
    exposure: "5 to 10 minutes of exposed skin",
    detail: "Serious risk. Keep sessions short and stay close to shelter.",
  },
  {
    max: -48,
    min: -55,
    label: "Frostbite risk in 2 to 5 minutes",
    exposure: "2 to 5 minutes of exposed skin",
    detail: "Outdoor training is not advisable. Move it indoors.",
  },
  {
    max: -55,
    min: -Infinity,
    label: "Frostbite in under 2 minutes",
    exposure: "Under 2 minutes of exposed skin",
    detail: "Dangerous. Do not train outdoors.",
  },
];

/**
 * How much warmer the session makes you feel, in degrees Celsius.
 * Derived from the 10-20 degF coaching rule (5.6 to 11.1 degC).
 */
export const INTENSITIES = [
  { id: "walk", label: "Walking or easy hike", warmthC: 3 },
  { id: "easy", label: "Easy run or steady cycling", warmthC: 6 },
  { id: "moderate", label: "Steady-state or long run", warmthC: 8 },
  { id: "hard", label: "Intervals, tempo or racing", warmthC: 11 },
];

/**
 * Layer bands keyed on the "dressing temperature" — the wind chill plus the
 * warmth your own effort adds. Each band is chosen when the dressing
 * temperature is at or above its `min`.
 */
export const LAYER_BANDS = [
  {
    min: 15,
    label: "Mild",
    head: "Nothing, or a cap",
    torso: "Short-sleeve technical tee",
    hands: "Bare",
    legs: "Shorts",
    feet: "Normal running socks",
    extras: ["Carry nothing extra; you will overheat in a jacket."],
  },
  {
    min: 10,
    label: "Cool",
    head: "Nothing, or a thin headband",
    torso: "Long-sleeve technical top",
    hands: "Bare, or thin liner gloves for the first kilometre",
    legs: "Shorts or three-quarter tights",
    feet: "Normal running socks",
    extras: ["A gilet is easier to manage than a jacket at this temperature."],
  },
  {
    min: 5,
    label: "Chilly",
    head: "Thin headband over the ears",
    torso: "Long-sleeve base layer",
    hands: "Light gloves",
    legs: "Full-length tights",
    feet: "Normal socks",
    extras: ["Take the gloves off after 10 minutes rather than starting without them."],
  },
  {
    min: 0,
    label: "Cold",
    head: "Thin beanie or ear-covering band",
    torso: "Base layer plus a light wind shell",
    hands: "Gloves",
    legs: "Full-length tights",
    feet: "Normal socks; a thin ankle gaiter if it is wet",
    extras: [
      "The shell is for wind, not warmth — vent it as soon as you are warm.",
      "Take a dry top for the moment you stop.",
    ],
  },
  {
    min: -7,
    label: "Freezing",
    head: "Beanie covering the ears",
    torso: "Base layer, thin mid layer, windproof shell",
    hands: "Insulated gloves",
    legs: "Thermal tights",
    feet: "Merino socks",
    extras: [
      "Buff around the neck, pulled over the mouth into the wind.",
      "Windproof briefs or a wind-front tight if the wind is on your face.",
    ],
  },
  {
    min: -15,
    label: "Hard freeze",
    head: "Thermal beanie, ears fully covered",
    torso: "Merino base, insulated mid, windproof shell",
    hands: "Mittens over liner gloves",
    legs: "Thermal tights, wind-front panel",
    feet: "Merino socks, winter shoes",
    extras: [
      "Cover the face — cheeks and nose are the first to go.",
      "Loop the route past home or the car so you can bail out.",
      "Keep the phone against your body; batteries die fast in this cold.",
    ],
  },
  {
    min: -Infinity,
    label: "Severe cold",
    head: "Thermal balaclava under a hat",
    torso: "Merino base, insulated mid, full windproof shell",
    hands: "Insulated mittens over liners, spare pair carried",
    legs: "Thermal tights under windproof trousers",
    feet: "Two-layer socks and insulated winter shoes",
    extras: [
      "No skin uncovered at all, and goggles or wraparound glasses if the wind is up.",
      "Treadmill or indoor session is the sensible call at this wind chill.",
      "Never train alone and tell someone your route and timing.",
    ],
  },
];

const round = (value, dp = 1) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/**
 * 2001 North American wind chill index, metric.
 * Returns the air temperature unchanged outside the formula's valid range.
 */
export function windChillC(tempC, windKmh) {
  const t = Number(tempC);
  const v = Number(windKmh);
  if (!Number.isFinite(t) || !Number.isFinite(v) || v < 0) return null;
  if (t > WIND_CHILL_MAX_TEMP_C || v <= WIND_CHILL_MIN_WIND_KMH) return t;
  const factor = Math.pow(v, 0.16);
  return 13.12 + 0.6215 * t - 11.37 * factor + 0.3965 * t * factor;
}

/** Environment Canada frostbite band for a wind chill value. */
export function frostbiteBand(windChill) {
  const value = Number(windChill);
  if (!Number.isFinite(value)) return null;
  return (
    FROSTBITE_BANDS.find((band) => value <= band.max && value > band.min) ||
    FROSTBITE_BANDS[FROSTBITE_BANDS.length - 1]
  );
}

/** Layer band for a dressing temperature. */
export function layerBandFor(dressingTempC) {
  const value = Number(dressingTempC);
  if (!Number.isFinite(value)) return null;
  return LAYER_BANDS.find((band) => value >= band.min) || LAYER_BANDS[LAYER_BANDS.length - 1];
}

/**
 * Build the full cold-weather plan.
 *
 * @param {object} input
 * @param {number} input.tempC
 * @param {number} input.windKmh
 * @param {string} input.intensity  an INTENSITIES id
 * @param {number} input.minutes    planned session length
 * @param {boolean} input.wet       rain, sleet or wet snow
 * @param {boolean} input.asthma    exercise-induced bronchoconstriction
 * @returns {object} plan, or { error }
 */
export function planColdWeatherKit({
  tempC,
  windKmh,
  intensity = "easy",
  minutes,
  wet = false,
  asthma = false,
} = {}) {
  const t = Number(tempC);
  const wind = Number(windKmh);
  const mins = Number(minutes);

  if (![t, wind, mins].every((value) => Number.isFinite(value))) {
    return { error: "Enter numbers for temperature, wind speed and session length." };
  }
  if (t < -60 || t > 40) return { error: "Enter an air temperature between -60 °C and 40 °C." };
  if (wind < 0 || wind > 200) return { error: "Enter a wind speed between 0 and 200 km/h." };
  if (mins <= 0) return { error: "Session length must be more than zero minutes." };
  if (mins > 600) return { error: "Enter a session length of 600 minutes (10 hours) or less." };

  const intensityDef = INTENSITIES.find((item) => item.id === intensity) || INTENSITIES[1];
  const chill = windChillC(t, wind);
  if (chill === null) return { error: "Could not calculate wind chill from those values." };

  const windChillApplies = t <= WIND_CHILL_MAX_TEMP_C && wind > WIND_CHILL_MIN_WIND_KMH;
  // Wet clothing strips insulation; treat it as a further 3 degC of cold.
  const wetPenaltyC = wet ? 3 : 0;
  const dressingTemp = chill + intensityDef.warmthC - wetPenaltyC;

  const band = layerBandFor(dressingTemp);
  const frostbite = frostbiteBand(chill);

  const warnings = [];
  if (chill <= -28) {
    warnings.push(
      `At a wind chill of ${round(chill)} °C, exposed skin is at risk within ${frostbite.exposure.toLowerCase()}. Nothing should be uncovered.`,
    );
  }
  if (asthma && t <= 0) {
    warnings.push(
      "Cold dry air is a classic trigger for exercise-induced bronchoconstriction. Breathe through a buff to pre-warm and humidify the air, extend the warm-up, and use a prescribed reliever beforehand if your clinician has advised it.",
    );
  }
  if (wet && chill <= 5) {
    warnings.push(
      "Wet clothing loses most of its insulation. Being wet at these temperatures is the fastest route to hypothermia, so cut the session short if you cannot stay dry.",
    );
  }
  if (mins > 60 && chill <= -10) {
    warnings.push(
      "Over an hour in this cold means refuelling and drinking become harder — gels stiffen, bottles freeze at the valve. Carry fluid inside a layer.",
    );
  }
  if (t <= 2) {
    warnings.push(
      "Black ice forms first on bridges, shaded corners and painted lines. Shorten the stride and treat any pace target as optional.",
    );
  }
  if (dressingTemp > chill + 8) {
    warnings.push(
      "Hard efforts generate a lot of heat — the biggest mistake is starting warm. You should feel slightly cold for the first five minutes.",
    );
  }

  return {
    tempC: round(t),
    windKmh: round(wind),
    windChill: round(chill),
    windChillApplies,
    intensityLabel: intensityDef.label,
    warmthBonusC: intensityDef.warmthC,
    wetPenaltyC,
    dressingTemp: round(dressingTemp),
    minutes: Math.round(mins),
    bandLabel: band.label,
    layers: [
      { zone: "Head and ears", item: band.head },
      { zone: "Torso", item: band.torso },
      { zone: "Hands", item: band.hands },
      { zone: "Legs", item: band.legs },
      { zone: "Feet", item: band.feet },
    ],
    extras: band.extras,
    frostbiteLabel: frostbite.label,
    frostbiteExposure: frostbite.exposure,
    frostbiteDetail: frostbite.detail,
    warnings,
  };
}
