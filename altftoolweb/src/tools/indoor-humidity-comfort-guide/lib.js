/**
 * Indoor humidity targets and psychrometrics.
 *
 * Physics:
 *  - Saturation vapour pressure uses the Magnus form
 *    es(T) = 6.112 x exp(17.67 T / (T + 243.5)) hPa.
 *  - Dew point uses the Alduchov-Eskridge Magnus coefficients
 *    a = 17.62, b = 243.12 degC, which are accurate to about 0.1 degC
 *    between -40 and +50 degC.
 *  - Absolute humidity in g/m3 is derived from the ideal gas law for water
 *    vapour: AH = es(T) x RH x 2.1674 / (273.15 + T).
 *  - Surface relative humidity is the room's vapour pressure divided by the
 *    saturation pressure at the colder surface. EN ISO 13788 treats a surface
 *    relative humidity sustained above 80% as the mould growth criterion, and
 *    condensation occurs once the surface falls to the room dew point.
 *
 * Target ranges:
 *  - The US EPA and ASHRAE baseline for indoor relative humidity is 30-50%,
 *    with 60% treated as an upper bound for mould and dust mite control.
 *  - House dust mites cannot maintain their water balance below roughly 50%
 *    relative humidity, so allergy guidance uses a cap below that.
 *  - Timber and instrument makers specify 40-60% to avoid shrinkage and swelling.
 *
 * Informational only — not medical or building-survey advice.
 */

export const MOULD_SURFACE_RH = 80;
export const ASHRAE_UPPER_RH = 60;

/** Baseline band applied to every assessment. */
export const BASELINE_RANGE = {
  min: 30,
  max: 50,
  why: "The US EPA and ASHRAE baseline for indoor relative humidity is 30% to 50%.",
};

/** Optional constraints; the recommended band is the intersection of those selected. */
export const CONCERNS = [
  {
    id: "dustmite",
    label: "Dust mite allergy or asthma",
    min: null,
    max: 45,
    why: "House dust mites cannot hold their water balance below about 50% relative humidity, so keeping a bedroom under 45% suppresses the population.",
  },
  {
    id: "mould",
    label: "History of mould or damp patches",
    min: null,
    max: 45,
    why: "Mould germinates once the relative humidity at a surface stays above 80%, which happens on a cold wall long before the room itself reaches 60%.",
  },
  {
    id: "dryskin",
    label: "Dry skin, eczema or nosebleeds",
    min: 40,
    max: null,
    why: "Below roughly 30% the skin barrier and nasal mucosa dry out; holding 40% leaves headroom on cold nights when heating drives humidity down.",
  },
  {
    id: "throat",
    label: "Sore throat or blocked nose overnight",
    min: 40,
    max: null,
    why: "Very dry air slows mucociliary clearance and leaves the airway irritated by morning.",
  },
  {
    id: "infant",
    label: "Baby or young child sleeps here",
    min: 40,
    max: 55,
    why: "A narrower band keeps the air from drying small airways while staying well clear of the mould and mite thresholds.",
  },
  {
    id: "wood",
    label: "Wooden floors, furniture or instruments",
    min: 40,
    max: 60,
    why: "Timber and instrument makers specify 40% to 60% relative humidity; outside it wood shrinks and cracks or swells and sticks.",
  },
  {
    id: "electronics",
    label: "Static shocks from carpets or electronics",
    min: 40,
    max: null,
    why: "Static build-up becomes noticeable below about 35-40% relative humidity because dry air stops charge bleeding away.",
  },
];

/** Grams of water vapour per gram-mole conversion constant for the AH formula. */
const AH_CONSTANT = 2.1674;

const round = (value, dp = 1) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/** Saturation vapour pressure in hPa at a temperature in degrees Celsius. */
export function saturationVapourPressure(tempC) {
  const t = Number(tempC);
  if (!Number.isFinite(t)) return null;
  return 6.112 * Math.exp((17.67 * t) / (t + 243.5));
}

/** Dew point in degrees Celsius from temperature and relative humidity. */
export function dewPointC(tempC, rh) {
  const t = Number(tempC);
  const humidity = Number(rh);
  if (!Number.isFinite(t) || !Number.isFinite(humidity) || humidity <= 0) return null;
  const a = 17.62;
  const b = 243.12;
  const gamma = Math.log(humidity / 100) + (a * t) / (b + t);
  const denominator = a - gamma;
  if (denominator === 0) return null;
  return (b * gamma) / denominator;
}

/** Absolute humidity in grams of water vapour per cubic metre. */
export function absoluteHumidity(tempC, rh) {
  const t = Number(tempC);
  const humidity = Number(rh);
  const es = saturationVapourPressure(t);
  if (es === null || !Number.isFinite(humidity)) return null;
  return (es * humidity * AH_CONSTANT) / (273.15 + t);
}

/**
 * Relative humidity right at a colder surface, given the room's air.
 * Capped at 100 because the surface cannot hold more than saturation.
 */
export function surfaceRelativeHumidity({ roomTempC, roomRh, surfaceTempC }) {
  const esRoom = saturationVapourPressure(roomTempC);
  const esSurface = saturationVapourPressure(surfaceTempC);
  if (esRoom === null || esSurface === null || esSurface <= 0) return null;
  const vapourPressure = (esRoom * Number(roomRh)) / 100;
  return Math.min(100, (vapourPressure / esSurface) * 100);
}

/**
 * Work out the target humidity band and where the room currently sits.
 *
 * @param {object} input
 * @param {number} input.tempC        room air temperature
 * @param {number} input.rh           current relative humidity, percent
 * @param {number} input.surfaceTempC coldest indoor surface, usually a window
 * @param {string[]} input.concerns   CONCERNS ids that apply
 * @param {number} input.roomVolumeM3
 * @returns {object} assessment, or { error }
 */
export function assessIndoorHumidity({
  tempC,
  rh,
  surfaceTempC,
  concerns = [],
  roomVolumeM3,
} = {}) {
  const t = Number(tempC);
  const humidity = Number(rh);
  const surface = Number(surfaceTempC);
  const volume = Number(roomVolumeM3);

  if (![t, humidity, surface, volume].every((value) => Number.isFinite(value))) {
    return { error: "Enter numbers for temperature, humidity, surface temperature and room volume." };
  }
  if (t < -20 || t > 60) return { error: "Enter a room temperature between -20 °C and 60 °C." };
  if (humidity < 1 || humidity > 100) {
    return { error: "Relative humidity is a percentage between 1 and 100." };
  }
  if (surface < -30 || surface > 60) {
    return { error: "Enter a surface temperature between -30 °C and 60 °C." };
  }
  if (surface > t) {
    return { error: "The coldest surface cannot be warmer than the room air — check the two temperatures." };
  }
  if (volume <= 0 || volume > 5000) {
    return { error: "Enter a room volume between 1 and 5000 cubic metres." };
  }

  const selected = CONCERNS.filter((item) => concerns.includes(item.id));

  let targetMin = BASELINE_RANGE.min;
  let targetMax = BASELINE_RANGE.max;
  const reasons = [BASELINE_RANGE.why];
  for (const concern of selected) {
    if (concern.min !== null && concern.min > targetMin) targetMin = concern.min;
    if (concern.max !== null && concern.max < targetMax) targetMax = concern.max;
    reasons.push(concern.why);
  }

  const conflict = targetMin > targetMax;
  const bandMin = conflict ? targetMax : targetMin;
  const bandMax = conflict ? targetMin : targetMax;

  const dewPoint = dewPointC(t, humidity);
  const ah = absoluteHumidity(t, humidity);
  const surfaceRh = surfaceRelativeHumidity({ roomTempC: t, roomRh: humidity, surfaceTempC: surface });

  let verdict;
  let verdictTone;
  let targetRh;
  if (humidity < bandMin) {
    verdict = "Too dry";
    verdictTone = "warning";
    targetRh = bandMin;
  } else if (humidity > bandMax) {
    verdict = "Too humid";
    verdictTone = "warning";
    targetRh = bandMax;
  } else {
    verdict = "In the target band";
    verdictTone = "success";
    targetRh = humidity;
  }

  const targetAh = absoluteHumidity(t, targetRh);
  const waterDeltaG = targetAh === null || ah === null ? 0 : (targetAh - ah) * volume;

  const condensationRisk = dewPoint !== null && surface <= dewPoint;
  const mouldRisk = surfaceRh !== null && surfaceRh >= MOULD_SURFACE_RH;

  const actions = [];
  if (verdict === "Too dry") {
    actions.push({
      title: `Add about ${round(Math.abs(waterDeltaG))} g of water to the air`,
      detail: `Raising ${round(volume)} m³ from ${round(humidity)}% to ${round(targetRh)}% at ${round(t)} °C means evaporating roughly ${round(Math.abs(waterDeltaG))} g — a small humidifier run, or drying laundry indoors, does this easily.`,
    });
    actions.push({
      title: "Turn the heating down a degree before humidifying",
      detail: "Warming air without adding water is what drops relative humidity in winter; one degree less often lifts RH by two to three points on its own.",
    });
  } else if (verdict === "Too humid") {
    actions.push({
      title: `Remove about ${round(Math.abs(waterDeltaG))} g of water from the air`,
      detail: `Bringing ${round(volume)} m³ from ${round(humidity)}% down to ${round(targetRh)}% at ${round(t)} °C means condensing out roughly ${round(Math.abs(waterDeltaG))} g — minutes of extract ventilation, or a short dehumidifier cycle.`,
    });
    actions.push({
      title: "Ventilate at the source",
      detail: "Extract fans during showers and cooking, lids on pans, and vented tumble driers remove moisture before it spreads through the home.",
    });
  } else {
    actions.push({
      title: "Hold it here",
      detail: `${round(humidity)}% sits inside the ${bandMin}% to ${bandMax}% band, which keeps mucosa comfortable while staying below the mite and mould thresholds.`,
    });
  }
  if (mouldRisk) {
    actions.push({
      title: "Warm or insulate the cold surface",
      detail: `The surface at ${round(surface)} °C is sitting at ${round(surfaceRh)}% relative humidity, above the 80% mould criterion. Insulation, moving furniture off the wall, or a little background heat matters more here than the room humidity number.`,
    });
  }
  if (condensationRisk) {
    actions.push({
      title: "Condensation is forming right now",
      detail: `The dew point is ${round(dewPoint)} °C and the surface is ${round(surface)} °C, so water will bead on it. Wipe it, ventilate, and treat repeated condensation as a damp problem rather than a cleaning one.`,
    });
  }

  return {
    tempC: round(t),
    rh: round(humidity),
    surfaceTempC: round(surface),
    volume: round(volume),
    targetMin: bandMin,
    targetMax: bandMax,
    conflict,
    reasons,
    dewPoint: dewPoint === null ? null : round(dewPoint),
    absoluteHumidity: ah === null ? null : round(ah, 2),
    surfaceRh: surfaceRh === null ? null : round(surfaceRh),
    mouldRisk,
    condensationRisk,
    verdict,
    verdictTone,
    targetRh: round(targetRh),
    waterDeltaG: round(waterDeltaG),
    actions,
  };
}
