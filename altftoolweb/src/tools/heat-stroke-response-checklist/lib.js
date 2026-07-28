/**
 * Heat stroke recognition and cooling logic.
 *
 * Pure module — no React, no DOM, no clock reads.
 * Informational only: it structures widely published first-aid guidance, it does
 * not diagnose. Emergency services decide treatment.
 */

/* Classic definition of heat stroke: core (rectal) temperature above 40.0 °C
   / 104 °F together with central nervous system dysfunction. */
export const HEAT_STROKE_CORE_C = 40.0;

/* Core temperature above which heat exhaustion is usually considered. */
export const HEAT_EXHAUSTION_CORE_C = 38.5;

/* Cooling is stopped at about 38.9 °C / 102 °F to avoid overshooting into
   hypothermia — the standard stop-cooling target in heat-stroke protocols. */
export const COOLING_TARGET_C = 38.9;

/* "Cool first, transport second": survival in exertional heat stroke is close to
   100% when core temperature is brought below 40 °C within 30 minutes of collapse. */
export const GOLDEN_WINDOW_MINUTES = 30;

/* Only a rectal or other core probe is valid here. Oral, ear and forehead
   readings under-read a hot casualty and must not be used to rule heat stroke out. */
export const VALID_CORE_TEMP_RANGE_C = { min: 30, max: 46 };

/**
 * Cooling rates in °C per minute, from published exertional heat-stroke cooling
 * studies. Cold-water immersion is the reference method; every other method is
 * materially slower, which is why immersion is preferred whenever it is possible.
 */
export const COOLING_METHODS = [
  {
    id: "immersion",
    label: "Cold water immersion (tub, 2–15 °C water, to the neck)",
    ratePerMinuteC: 0.2,
    rateRange: "0.15–0.35 °C/min",
    note: "Fastest method. Hold the casualty under the arms so the head stays clear of the water.",
  },
  {
    id: "tarp",
    label: "Tarp-assisted cooling (casualty in a tarp with ice water)",
    ratePerMinuteC: 0.14,
    rateRange: "0.10–0.17 °C/min",
    note: "Use when no tub is available. Two people rock the tarp to keep water moving.",
  },
  {
    id: "shower",
    label: "Cold shower or continuous dousing plus fanning",
    ratePerMinuteC: 0.06,
    rateRange: "0.04–0.09 °C/min",
    note: "Keep water running continuously — a single dousing rewarms within minutes.",
  },
  {
    id: "packs",
    label: "Ice packs to neck, armpits and groin plus fanning",
    ratePerMinuteC: 0.05,
    rateRange: "0.03–0.06 °C/min",
    note: "Better than nothing but roughly four times slower than immersion.",
  },
  {
    id: "passive",
    label: "Shade and rest only (no active cooling)",
    ratePerMinuteC: 0.02,
    rateRange: "0.01–0.03 °C/min",
    note: "Far too slow for heat stroke. Use only while you set up active cooling.",
  },
];

/** Signs that make this a medical emergency on their own. */
export const CNS_SIGNS = [
  { id: "confusion", label: "Confused, disoriented, or behaving irrationally" },
  { id: "slurred", label: "Slurred or nonsensical speech" },
  { id: "staggering", label: "Staggering, loss of coordination, or collapse" },
  { id: "seizure", label: "Seizure or convulsion" },
  { id: "unresponsive", label: "Unresponsive, or only responds to pain" },
];

/** Supporting signs seen in both heat exhaustion and heat stroke. */
export const HEAT_SIGNS = [
  { id: "hot-skin", label: "Skin hot to touch" },
  { id: "stopped-sweating", label: "Sweating has stopped despite the heat" },
  { id: "nausea", label: "Nausea or vomiting" },
  { id: "headache", label: "Throbbing headache" },
  { id: "dizzy", label: "Dizzy or feeling faint" },
  { id: "weakness", label: "Heavy weakness or exhaustion" },
  { id: "fast-pulse", label: "Rapid, weak pulse or fast breathing" },
  { id: "cool-clammy", label: "Cool, clammy, pale skin" },
  { id: "cramps", label: "Painful muscle cramps in legs or abdomen" },
  { id: "dark-urine", label: "Very dark urine or has not passed urine for hours" },
];

/* Two or more supporting signs is the threshold this tool uses to call heat
   exhaustion rather than mild heat strain. */
export const EXHAUSTION_SIGN_THRESHOLD = 2;

/** Things that make heat illness more likely or more dangerous. */
export const RISK_FACTORS = [
  { id: "exertion", label: "Was exercising or doing heavy physical work" },
  { id: "no-acclimatisation", label: "Not used to this heat (first hot days, new arrival)" },
  { id: "age", label: "Under 5 or over 65 years old" },
  { id: "meds", label: "On diuretics, antihistamines, antipsychotics or beta blockers" },
  { id: "alcohol", label: "Alcohol in the last 24 hours" },
  { id: "illness", label: "Fever, diarrhoea or vomiting in the last 48 hours" },
  { id: "heavy-kit", label: "Wearing heavy clothing, PPE or sports padding" },
  { id: "no-shade", label: "No shade, no breeze, or working in a vehicle or closed room" },
];

/* NWS heat index bands, in °F, as published by the US National Weather Service. */
export const HEAT_INDEX_BANDS = [
  { min: 125, label: "Extreme danger", note: "Heat stroke highly likely. Stop outdoor activity." },
  { min: 103, label: "Danger", note: "Heat cramps and heat exhaustion likely; heat stroke possible with continued exertion." },
  { min: 90, label: "Extreme caution", note: "Heat cramps and heat exhaustion possible with prolonged exposure." },
  { min: 80, label: "Caution", note: "Fatigue possible with prolonged exposure and activity." },
  { min: -Infinity, label: "No heat-index risk", note: "Below the range where the heat index applies." },
];

/** Actions that make heat stroke worse. Fixed list, always shown. */
export const NEVER_DO = [
  "Do not give paracetamol, ibuprofen or aspirin — they do not lower a heat-stroke temperature and can worsen liver and clotting problems.",
  "Do not give anything to drink to someone who is confused, drowsy or vomiting; they can choke.",
  "Do not delay cooling in order to move the casualty. Cool first, transport second.",
  "Do not use an alcohol rub, and do not wrap the casualty in wet towels and leave them — towels warm up and then insulate.",
  "Do not leave the casualty alone, and keep cooling until help arrives or the target temperature is reached.",
];

export const cToF = (celsius) => (celsius * 9) / 5 + 32;
export const fToC = (fahrenheit) => ((fahrenheit - 32) * 5) / 9;

/**
 * NWS heat index (Rothfusz regression plus the two published adjustments).
 * @param {number} tempC dry-bulb air temperature in °C
 * @param {number} humidityPct relative humidity, 0–100
 */
export function heatIndex(tempC, humidityPct) {
  if (!Number.isFinite(tempC) || !Number.isFinite(humidityPct)) return null;
  if (humidityPct < 0 || humidityPct > 100) return null;

  const T = cToF(tempC);
  const R = humidityPct;

  // Steadman's simple form; the NWS uses it whenever its average with T is < 80 °F.
  const simple = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + R * 0.094);
  let hiF = (simple + T) / 2;

  if (hiF >= 80) {
    hiF =
      -42.379 +
      2.04901523 * T +
      10.14333127 * R -
      0.22475541 * T * R -
      0.00683783 * T * T -
      0.05481717 * R * R +
      0.00122874 * T * T * R +
      0.00085282 * T * R * R -
      0.00000199 * T * T * R * R;

    // Low-humidity adjustment
    if (R < 13 && T >= 80 && T <= 112) {
      hiF -= ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    }
    // High-humidity adjustment
    if (R > 85 && T >= 80 && T <= 87) {
      hiF += ((R - 85) / 10) * ((87 - T) / 5);
    }
  }

  const band = HEAT_INDEX_BANDS.find((entry) => hiF >= entry.min);
  return {
    fahrenheit: hiF,
    celsius: fToC(hiF),
    band: band.label,
    bandNote: band.note,
  };
}

/**
 * Minutes of active cooling needed to bring a core temperature down to the
 * 38.9 °C stop-cooling target at a given method's rate.
 */
export function coolingMinutes(coreTempC, methodId) {
  const method = COOLING_METHODS.find((entry) => entry.id === methodId);
  if (!method) return null;
  if (!Number.isFinite(coreTempC)) return null;
  if (coreTempC <= COOLING_TARGET_C) return 0;
  const minutes = (coreTempC - COOLING_TARGET_C) / method.ratePerMinuteC;
  return Number.isFinite(minutes) ? minutes : null;
}

const asArray = (value) => (Array.isArray(value) ? value.filter((v) => typeof v === "string") : []);

/**
 * Assess the situation and produce an ordered response.
 * @returns {{error: string}|object}
 */
export function assessHeatIllness(input = {}) {
  const signs = asArray(input.signs);
  const risks = asArray(input.riskFactors);
  const methodId = typeof input.coolingMethod === "string" ? input.coolingMethod : "immersion";
  const method = COOLING_METHODS.find((entry) => entry.id === methodId);
  if (!method) {
    return { error: `Choose a cooling method: ${COOLING_METHODS.map((m) => m.id).join(", ")}.` };
  }

  const hasCoreTemp = input.coreTempC !== "" && input.coreTempC !== null && input.coreTempC !== undefined;
  const coreTempC = hasCoreTemp ? Number(input.coreTempC) : null;
  if (hasCoreTemp && !Number.isFinite(coreTempC)) {
    return { error: "Core temperature must be a number in °C, or left blank if you have not measured it." };
  }
  if (
    coreTempC !== null &&
    (coreTempC < VALID_CORE_TEMP_RANGE_C.min || coreTempC > VALID_CORE_TEMP_RANGE_C.max)
  ) {
    return {
      error: `A core temperature of ${coreTempC} °C is outside the measurable range (${VALID_CORE_TEMP_RANGE_C.min}–${VALID_CORE_TEMP_RANGE_C.max} °C). Re-check the reading.`,
    };
  }

  const airTempC = Number(input.airTempC);
  const humidityPct = Number(input.humidityPct);
  if (!Number.isFinite(airTempC) || airTempC < -50 || airTempC > 60) {
    return { error: "Air temperature must be a number between -50 °C and 60 °C." };
  }
  if (!Number.isFinite(humidityPct) || humidityPct < 0 || humidityPct > 100) {
    return { error: "Relative humidity must be between 0% and 100%." };
  }

  const hasElapsed = input.minutesSinceOnset !== "" && input.minutesSinceOnset !== null && input.minutesSinceOnset !== undefined;
  const minutesSinceOnset = hasElapsed ? Number(input.minutesSinceOnset) : null;
  if (hasElapsed && (!Number.isFinite(minutesSinceOnset) || minutesSinceOnset < 0 || minutesSinceOnset > 1440)) {
    return { error: "Minutes since collapse must be between 0 and 1440, or left blank." };
  }

  const cnsSigns = CNS_SIGNS.filter((sign) => signs.includes(sign.id));
  const supportingSigns = HEAT_SIGNS.filter((sign) => signs.includes(sign.id));
  const tempIndicatesStroke = coreTempC !== null && coreTempC >= HEAT_STROKE_CORE_C;
  const tempIndicatesExhaustion = coreTempC !== null && coreTempC >= HEAT_EXHAUSTION_CORE_C;

  let level;
  let levelReason;
  if (cnsSigns.length > 0 && tempIndicatesStroke) {
    level = "heat-stroke";
    levelReason = `Core temperature ${coreTempC.toFixed(1)} °C is at or above ${HEAT_STROKE_CORE_C} °C and there is nervous-system involvement — the classic definition of heat stroke.`;
  } else if (cnsSigns.length > 0) {
    level = "heat-stroke";
    levelReason =
      "Altered mental state in a hot, collapsed casualty is treated as heat stroke until proven otherwise, whether or not a thermometer is available.";
  } else if (tempIndicatesStroke) {
    level = "heat-stroke";
    levelReason = `Core temperature ${coreTempC.toFixed(1)} °C is at or above the ${HEAT_STROKE_CORE_C} °C heat-stroke threshold.`;
  } else if (tempIndicatesExhaustion || supportingSigns.length >= EXHAUSTION_SIGN_THRESHOLD) {
    level = "heat-exhaustion";
    levelReason =
      coreTempC !== null
        ? `Core temperature ${coreTempC.toFixed(1)} °C with ${supportingSigns.length} supporting sign(s) and no nervous-system involvement.`
        : `${supportingSigns.length} supporting signs and no nervous-system involvement.`;
  } else if (supportingSigns.length === 1) {
    level = "heat-strain";
    levelReason = "One early sign only. Treat it as a warning to stop, cool down and drink.";
  } else {
    level = "no-flags";
    levelReason = "No signs ticked. Use the heat index below to judge whether it is safe to carry on.";
  }

  const emergency = level === "heat-stroke";

  const steps = [];
  if (emergency) {
    steps.push({
      order: 1,
      title: "Call emergency services now",
      detail: "Say the words “suspected heat stroke” and give your exact location. Do not wait for a thermometer.",
    });
    steps.push({
      order: 2,
      title: "Start cooling immediately, where you are",
      detail: `${method.label}. Cooling beats transport: every minute above ${HEAT_STROKE_CORE_C} °C adds risk.`,
    });
    steps.push({
      order: 3,
      title: "Strip heat-trapping clothing and kit",
      detail: "Remove helmets, pads, PPE, shoes and heavy layers. Keep underwear on for dignity.",
    });
    steps.push({
      order: 4,
      title: "Keep the airway safe",
      detail:
        "If they are not fully alert, put them on their side. Give nothing by mouth. If they stop breathing normally, start CPR.",
    });
    steps.push({
      order: 5,
      title: `Stop cooling at ${COOLING_TARGET_C} °C core`,
      detail:
        "Overcooling causes shivering and hypothermia. If you have no core thermometer, stop when they are alert and orientated, and keep watching.",
    });
    steps.push({
      order: 6,
      title: "Hand over the numbers",
      detail: "Tell the crew the time of collapse, the temperatures you measured and the cooling method used.",
    });
  } else if (level === "heat-exhaustion") {
    steps.push({ order: 1, title: "Move into shade or air conditioning", detail: "Get out of direct sun and stop all activity." });
    steps.push({ order: 2, title: "Lie down, feet raised", detail: "Loosen tight clothing and remove excess layers." });
    steps.push({
      order: 3,
      title: "Cool the skin actively",
      detail: "Cool water on the skin, fanning, and cold packs to neck, armpits and groin.",
    });
    steps.push({
      order: 4,
      title: "Sip fluids only if fully alert",
      detail: "Water or an oral rehydration solution, small sips. Nothing by mouth if they are drowsy or vomiting.",
    });
    steps.push({
      order: 5,
      title: "Re-check after 30 minutes",
      detail:
        "If they are not clearly better in 30 minutes, or any confusion appears, treat it as heat stroke and call emergency services.",
    });
  } else if (level === "heat-strain") {
    steps.push({ order: 1, title: "Stop and get out of the heat", detail: "Shade, a breeze or air conditioning, and no more exertion today." });
    steps.push({ order: 2, title: "Drink and re-salt", detail: "Water plus an oral rehydration solution or a salty snack if you have been sweating for hours." });
    steps.push({ order: 3, title: "Watch for 30 minutes", detail: "Escalate at once if confusion, vomiting or collapse appears." });
  } else {
    steps.push({ order: 1, title: "Plan around the heat index", detail: "Shift hard work to the cooler hours and schedule shade breaks." });
    steps.push({ order: 2, title: "Drink before you are thirsty", detail: "Thirst lags behind fluid loss during heavy sweating." });
    steps.push({ order: 3, title: "Set a buddy check", detail: "Heat stroke shows up as behaviour change first — someone should be watching for it." });
  }

  const estimatedCoolingMinutes = coreTempC !== null ? coolingMinutes(coreTempC, methodId) : null;
  const immersionMinutes = coreTempC !== null ? coolingMinutes(coreTempC, "immersion") : null;
  const withinGoldenWindow =
    estimatedCoolingMinutes === null || minutesSinceOnset === null
      ? null
      : minutesSinceOnset + estimatedCoolingMinutes <= GOLDEN_WINDOW_MINUTES;

  const conditions = heatIndex(airTempC, humidityPct);

  const warnings = [];
  if (emergency && methodId === "passive") {
    warnings.push("Shade alone cannot cool a heat-stroke casualty in time. Get water, ice or a hose on them now.");
  }
  if (emergency && estimatedCoolingMinutes !== null && estimatedCoolingMinutes > GOLDEN_WINDOW_MINUTES) {
    warnings.push(
      `At ${method.ratePerMinuteC} °C per minute this method needs about ${Math.round(estimatedCoolingMinutes)} minutes — longer than the ${GOLDEN_WINDOW_MINUTES}-minute window. Switch to cold water immersion if you possibly can.`,
    );
  }
  if (withinGoldenWindow === false) {
    warnings.push(
      `Cooling will finish past the ${GOLDEN_WINDOW_MINUTES}-minute mark from collapse. Keep cooling anyway and tell the ambulance crew the timings.`,
    );
  }
  if (signs.includes("cool-clammy") && signs.includes("hot-skin")) {
    warnings.push("You have ticked both hot skin and cool clammy skin — re-check, and rely on behaviour and core temperature rather than skin feel.");
  }
  if (coreTempC === null && emergency) {
    warnings.push("No core temperature measured. Do not let that delay cooling — only a rectal probe is reliable here, and treatment does not wait for it.");
  }
  if (signs.includes("stopped-sweating")) {
    warnings.push("Dry skin is not required for heat stroke. People with exertional heat stroke are usually still sweating heavily.");
  }

  return {
    level,
    levelLabel:
      level === "heat-stroke"
        ? "Suspected heat stroke — medical emergency"
        : level === "heat-exhaustion"
          ? "Heat exhaustion"
          : level === "heat-strain"
            ? "Early heat strain"
            : "No red-flag signs ticked",
    levelReason,
    emergency,
    cnsSignCount: cnsSigns.length,
    cnsSignLabels: cnsSigns.map((sign) => sign.label),
    supportingSignCount: supportingSigns.length,
    riskFactorCount: risks.length,
    coreTempC,
    coreTempF: coreTempC === null ? null : cToF(coreTempC),
    method,
    estimatedCoolingMinutes,
    immersionMinutes,
    minutesSinceOnset,
    withinGoldenWindow,
    conditions,
    steps,
    neverDo: NEVER_DO,
    warnings,
  };
}
