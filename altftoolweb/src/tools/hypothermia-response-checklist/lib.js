/**
 * Hypothermia staging and rewarming logic.
 *
 * Pure module — no React, no DOM, no clock reads.
 * Informational only. It structures published cold-injury first-aid guidance;
 * it does not diagnose and it does not replace emergency medical services.
 */

/* Hypothermia is defined as a core body temperature below 35.0 °C (95 °F). */
export const HYPOTHERMIA_THRESHOLD_C = 35.0;

/* Rewarming is considered complete once the casualty is back above 35 °C. */
export const REWARMING_TARGET_C = HYPOTHERMIA_THRESHOLD_C;

/* Plausible input range. The lowest core temperature an adult has survived after
   accidental hypothermia is 13.7 °C, so anything below that is a typing error. */
export const VALID_CORE_TEMP_RANGE_C = { min: 13, max: 37.5 };

/**
 * Swiss staging system for accidental hypothermia (HT I to HT IV). It was designed
 * to be used in the field from clinical signs alone, because a core thermometer is
 * rarely available on a mountainside. The temperature bands are the ones the
 * system associates with each stage.
 */
export const SWISS_STAGES = [
  {
    id: "HT1",
    label: "HT I — mild hypothermia",
    signs: "Conscious and shivering",
    minTempC: 32,
    maxTempC: 35,
    severity: 1,
    tempText: "35 to 32 °C",
  },
  {
    id: "HT2",
    label: "HT II — moderate hypothermia",
    signs: "Drowsy or confused, shivering has stopped",
    minTempC: 28,
    maxTempC: 32,
    severity: 2,
    tempText: "32 to 28 °C",
  },
  {
    id: "HT3",
    label: "HT III — severe hypothermia",
    signs: "Unconscious, but breathing and a pulse are present",
    minTempC: 24,
    maxTempC: 28,
    severity: 3,
    tempText: "28 to 24 °C",
  },
  {
    id: "HT4",
    label: "HT IV — apparent death from cold",
    signs: "No breathing and no detectable pulse",
    minTempC: -Infinity,
    maxTempC: 24,
    severity: 4,
    tempText: "below 24 °C",
  },
];

/** Field states, in the order a rescuer would check them. */
export const FIELD_STATES = [
  { id: "alert-shivering", label: "Alert, talking, shivering", stage: "HT1" },
  { id: "drowsy", label: "Drowsy or confused, shivering has stopped", stage: "HT2" },
  { id: "unconscious", label: "Unconscious but breathing, pulse present", stage: "HT3" },
  { id: "no-vitals", label: "No normal breathing, no pulse found", stage: "HT4" },
  { id: "cold-not-hypothermic", label: "Cold and uncomfortable but fully normal", stage: null },
];

/**
 * Rewarming rates in °C per hour, from published accidental-hypothermia
 * management data. Field methods are slow; only a hospital can rewarm quickly.
 */
export const REWARMING_METHODS = [
  {
    id: "shelter",
    label: "Shelter, dry clothing and insulation (passive rewarming)",
    ratePerHourC: 1.0,
    rateRange: "0.5–2.0 °C/h",
    maxStageSeverity: 2,
    note: "Works only while the casualty can still shiver — shivering is the heat source.",
  },
  {
    id: "shiver-fuel",
    label: "Passive rewarming plus warm sweet drinks and food",
    ratePerHourC: 1.6,
    rateRange: "1.0–2.5 °C/h",
    maxStageSeverity: 1,
    note: "Only for a fully alert, shivering casualty who can hold a cup and swallow safely.",
  },
  {
    id: "active-external",
    label: "Heat pads or forced-air blanket to the trunk (active external)",
    ratePerHourC: 1.5,
    rateRange: "1.0–2.5 °C/h",
    maxStageSeverity: 4,
    note: "Apply to the chest, armpits and back — never directly to bare skin, and not to the limbs first.",
  },
  {
    id: "body-to-body",
    label: "Body-to-body rewarming inside an insulated bag",
    ratePerHourC: 0.8,
    rateRange: "0.5–1.5 °C/h",
    maxStageSeverity: 3,
    note: "Useful when nothing else is available, but it also stops the rescuer working.",
  },
  {
    id: "hospital",
    label: "Hospital active internal rewarming (ECMO or bypass)",
    ratePerHourC: 6.0,
    rateRange: "4–10 °C/h",
    maxStageSeverity: 4,
    note: "The only fast option, and the definitive treatment for HT III and HT IV.",
  },
];

/* Wet clothing conducts heat away many times faster than dry clothing. This tool
   halves the effective rewarming rate while the casualty is still wet, to make the
   point that cutting the wet layers off comes before anything else. */
export const WET_CLOTHING_RATE_PENALTY = 0.5;

/* Wind chill index (2001 North American / UK standard), metric form. Only defined
   for air temperature at or below 10 °C and wind above 4.8 km/h. */
export const WIND_CHILL_MAX_TEMP_C = 10;
export const WIND_CHILL_MIN_WIND_KPH = 4.8;

/* Frostbite risk bands published with the wind chill index (Environment Canada). */
export const FROSTBITE_BANDS = [
  { max: Infinity, min: -9, label: "Low risk", detail: "Frostbite unlikely. Dress warmly and stay dry." },
  { max: -9, min: -27, label: "Increasing risk", detail: "Frostbite possible on exposed skin with prolonged exposure." },
  { max: -27, min: -39, label: "High risk", detail: "Exposed skin can freeze in 10 to 30 minutes. Cover all skin." },
  { max: -39, min: -47, label: "Very high risk", detail: "Exposed skin can freeze in 5 to 10 minutes." },
  { max: -47, min: -54, label: "Severe risk", detail: "Exposed skin can freeze in 2 to 5 minutes." },
  { max: -54, min: -Infinity, label: "Extreme risk", detail: "Exposed skin can freeze in under 2 minutes. Stay indoors." },
];

/** Actions that make cold injury worse. Fixed list, always shown. */
export const NEVER_DO = [
  "Never rub or massage cold limbs, and never rub with snow — it tears frozen tissue and pushes cold blood back to the heart.",
  "Never give alcohol. It widens skin blood vessels, dumps core heat and blunts shivering.",
  "Never put a drowsy or unconscious casualty in a hot bath or shower — the sudden dilation can drop blood pressure and trigger cardiac arrest.",
  "Never let a moderate or severe casualty stand, walk or be handled roughly. Keep them horizontal and move them gently.",
  "Never give food or drink to anyone who is not fully alert and able to swallow.",
  "Never assume someone cold with no pulse is dead. Rewarming with CPR has revived people from very low core temperatures — hand over to professionals.",
];

const clean = (value) => (typeof value === "string" ? value.trim() : "");

/**
 * Wind chill index in °C (2001 standard, metric form).
 * @param {number} tempC air temperature in °C
 * @param {number} windKph wind speed in km/h at 10 m
 */
export function windChill(tempC, windKph) {
  if (!Number.isFinite(tempC) || !Number.isFinite(windKph) || windKph < 0) return null;
  if (tempC > WIND_CHILL_MAX_TEMP_C || windKph < WIND_CHILL_MIN_WIND_KPH) {
    return {
      applicable: false,
      celsius: tempC,
      reason:
        tempC > WIND_CHILL_MAX_TEMP_C
          ? `Wind chill is only defined at or below ${WIND_CHILL_MAX_TEMP_C} °C.`
          : `Wind chill is only defined above ${WIND_CHILL_MIN_WIND_KPH} km/h of wind.`,
    };
  }
  const v = Math.pow(windKph, 0.16);
  const wci = 13.12 + 0.6215 * tempC - 11.37 * v + 0.3965 * tempC * v;
  return { applicable: true, celsius: wci, reason: null };
}

/** Frostbite risk band for a wind chill (or plain air temperature) in °C. */
export function frostbiteBand(effectiveTempC) {
  if (!Number.isFinite(effectiveTempC)) return null;
  return (
    FROSTBITE_BANDS.find((band) => effectiveTempC <= band.max && effectiveTempC > band.min) ||
    FROSTBITE_BANDS[FROSTBITE_BANDS.length - 1]
  );
}

/** Swiss stage implied by a measured core temperature. */
export function stageFromTemp(coreTempC) {
  if (!Number.isFinite(coreTempC)) return null;
  if (coreTempC >= HYPOTHERMIA_THRESHOLD_C) return null;
  return SWISS_STAGES.find((stage) => coreTempC >= stage.minTempC && coreTempC < stage.maxTempC) || SWISS_STAGES[3];
}

/** Hours of rewarming needed to get back above 35 °C at a given rate. */
export function rewarmingHours(coreTempC, ratePerHourC) {
  if (!Number.isFinite(coreTempC) || !Number.isFinite(ratePerHourC) || ratePerHourC <= 0) return null;
  if (coreTempC >= REWARMING_TARGET_C) return 0;
  const hours = (REWARMING_TARGET_C - coreTempC) / ratePerHourC;
  return Number.isFinite(hours) ? hours : null;
}

/**
 * Assess the casualty and build the response.
 * @returns {{error: string}|object}
 */
export function assessHypothermia(input = {}) {
  const stateId = clean(input.fieldState) || "alert-shivering";
  const state = FIELD_STATES.find((entry) => entry.id === stateId);
  if (!state) {
    return { error: `Choose what you can see: ${FIELD_STATES.map((s) => s.id).join(", ")}.` };
  }

  const methodId = clean(input.rewarmingMethod) || "shelter";
  const method = REWARMING_METHODS.find((entry) => entry.id === methodId);
  if (!method) {
    return { error: `Choose a rewarming method: ${REWARMING_METHODS.map((m) => m.id).join(", ")}.` };
  }

  const hasTemp = input.coreTempC !== "" && input.coreTempC !== null && input.coreTempC !== undefined;
  const coreTempC = hasTemp ? Number(input.coreTempC) : null;
  if (hasTemp && !Number.isFinite(coreTempC)) {
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
  const windKph = Number(input.windKph);
  if (!Number.isFinite(airTempC) || airTempC < -80 || airTempC > 50) {
    return { error: "Air temperature must be a number between -80 °C and 50 °C." };
  }
  if (!Number.isFinite(windKph) || windKph < 0 || windKph > 300) {
    return { error: "Wind speed must be between 0 and 300 km/h." };
  }

  const isWet = Boolean(input.isWet);

  const tempStage = coreTempC !== null ? stageFromTemp(coreTempC) : null;
  const signStage = state.stage ? SWISS_STAGES.find((stage) => stage.id === state.stage) : null;

  let stage = null;
  if (tempStage && signStage) {
    stage = tempStage.severity >= signStage.severity ? tempStage : signStage;
  } else {
    stage = tempStage || signStage;
  }

  const isHypothermic = Boolean(stage);
  const effectiveRate = isWet ? method.ratePerHourC * WET_CLOTHING_RATE_PENALTY : method.ratePerHourC;
  const hours = coreTempC !== null ? rewarmingHours(coreTempC, effectiveRate) : null;
  const hospitalHours = coreTempC !== null ? rewarmingHours(coreTempC, 6.0) : null;

  const chill = windChill(airTempC, windKph);
  const effectiveOutdoorTempC = chill && chill.applicable ? chill.celsius : airTempC;
  const frostbite = frostbiteBand(effectiveOutdoorTempC);

  const steps = [];
  const severity = stage ? stage.severity : 0;

  if (severity >= 2) {
    steps.push({
      order: steps.length + 1,
      title: "Call emergency services now",
      detail:
        "Moderate and severe hypothermia needs hospital rewarming. Say the casualty is cold and not fully alert, and give your exact location.",
    });
  }
  steps.push({
    order: steps.length + 1,
    title: "Stop the heat loss first",
    detail:
      "Get them out of wind and off cold ground — insulate underneath as well as on top. Shelter beats every rewarming trick.",
  });
  steps.push({
    order: steps.length + 1,
    title: isWet ? "Cut the wet clothing off, do not pull it off" : "Keep them dry",
    detail: isWet
      ? "Wet layers keep stripping heat away. Cut them off with shears so the casualty is not sat up or wrestled about, then wrap in dry insulation and a vapour barrier."
      : "Add dry layers and a windproof outer. Cover the head and neck; a vapour barrier stops evaporative loss.",
  });
  if (severity >= 2) {
    steps.push({
      order: steps.length + 1,
      title: "Handle gently and keep them horizontal",
      detail:
        "A cold heart is irritable — rough handling, sitting up or walking can trigger a fatal rhythm. No standing, no walking, no massage.",
    });
  }
  steps.push({
    order: steps.length + 1,
    title: `Start rewarming: ${method.label}`,
    detail: `${method.note} Expect roughly ${method.ratePerHourC} °C per hour (${method.rateRange})${isWet ? ", and only about half that until they are dry" : ""}.`,
  });
  if (severity === 1) {
    steps.push({
      order: steps.length + 1,
      title: "Fuel the shivering",
      detail:
        "If they are fully alert, warm sweet drinks and carbohydrate keep shivering going, and shivering is what actually rewarms them. No alcohol.",
    });
  }
  if (severity >= 3) {
    steps.push({
      order: steps.length + 1,
      title: "Check breathing for a full 60 seconds",
      detail:
        "Pulse and breathing can be very slow and hard to find in severe hypothermia. If there is no normal breathing, start CPR and keep going while you rewarm.",
    });
  }
  steps.push({
    order: steps.length + 1,
    title: "Watch for afterdrop and rescue collapse",
    detail:
      "Core temperature can keep falling for a while after rescue as cold blood returns from the limbs. Rewarm the trunk first, keep them lying down, and keep monitoring.",
  });
  steps.push({
    order: steps.length + 1,
    title: `Keep going until they are above ${REWARMING_TARGET_C} °C`,
    detail: "Re-check consciousness, shivering and, if you have a probe, core temperature every 15 minutes.",
  });

  const warnings = [];
  if (stage && method.maxStageSeverity < stage.severity) {
    warnings.push(
      `${method.label} is not enough for ${stage.label}. This casualty needs active external rewarming and evacuation to hospital.`,
    );
  }
  if (isWet) {
    warnings.push("Wet clothing is still on. Nothing else you do will work properly until it is off and replaced with dry insulation.");
  }
  if (severity >= 2 && methodId === "shiver-fuel") {
    warnings.push("Do not give drinks to a drowsy or unconscious casualty — they can choke. Use active external rewarming instead.");
  }
  if (state.id === "no-vitals") {
    warnings.push(
      "No pulse in a cold casualty does not mean death. Start CPR, keep rewarming and let the receiving hospital make that decision.",
    );
  }
  if (coreTempC === null && severity >= 2) {
    warnings.push("No core temperature measured. Field staging from signs is the accepted approach — do not delay rewarming to look for a thermometer.");
  }
  if (frostbite && frostbite.min <= -27) {
    warnings.push(`${frostbite.label} of frostbite outdoors: ${frostbite.detail}`);
  }

  return {
    stageId: stage ? stage.id : null,
    stageLabel: stage ? stage.label : "No hypothermia staged",
    stageSigns: stage ? stage.signs : "Alert, warm and behaving normally.",
    stageTempText: stage ? stage.tempText : `at or above ${HYPOTHERMIA_THRESHOLD_C} °C`,
    severity,
    isHypothermic,
    stagedFrom: tempStage && signStage ? "signs and temperature" : tempStage ? "temperature" : signStage ? "signs" : "neither",
    fieldState: state.label,
    coreTempC,
    method,
    isWet,
    effectiveRatePerHourC: effectiveRate,
    rewarmingHours: hours,
    hospitalHours,
    windChill: chill,
    effectiveOutdoorTempC,
    frostbite,
    steps,
    neverDo: NEVER_DO,
    warnings,
  };
}
