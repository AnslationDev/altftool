/**
 * Cold vs flu symptom comparator — pure comparison module.
 * No React, no DOM, no Date.now().
 *
 * This is a pattern comparison against published symptom profiles, NOT a
 * diagnosis. Cold and influenza overlap heavily, and only a laboratory test can
 * tell them apart with certainty.
 */

/**
 * How characteristic a symptom is of an illness, on the descriptive scale used
 * in public-health cold-versus-flu comparison charts.
 */
export const LIKELIHOOD = { rare: 0, sometimes: 1, common: 2, usual: 3 };
export const LIKELIHOOD_LABEL = {
  0: "Rare",
  1: "Sometimes",
  2: "Common",
  3: "Usual",
};

/**
 * Symptom profiles. Cold symptoms concentrate in the nose and throat; influenza
 * adds systemic features — fever, aches, chills, headache, prostration.
 */
export const SYMPTOMS = [
  { id: "sneezing", label: "Sneezing", cold: LIKELIHOOD.common, flu: LIKELIHOOD.sometimes },
  { id: "stuffyNose", label: "Blocked or runny nose", cold: LIKELIHOOD.common, flu: LIKELIHOOD.sometimes },
  { id: "soreThroat", label: "Sore throat", cold: LIKELIHOOD.common, flu: LIKELIHOOD.sometimes },
  { id: "wateryEyes", label: "Watery eyes", cold: LIKELIHOOD.common, flu: LIKELIHOOD.sometimes },
  { id: "cough", label: "Cough", cold: LIKELIHOOD.common, flu: LIKELIHOOD.usual },
  { id: "chestDiscomfort", label: "Chest discomfort", cold: LIKELIHOOD.sometimes, flu: LIKELIHOOD.common },
  { id: "aches", label: "Aching muscles or joints", cold: LIKELIHOOD.sometimes, flu: LIKELIHOOD.usual },
  { id: "fatigue", label: "Marked tiredness or weakness", cold: LIKELIHOOD.sometimes, flu: LIKELIHOOD.usual },
  { id: "chills", label: "Chills or shivering", cold: LIKELIHOOD.rare, flu: LIKELIHOOD.common },
  { id: "headache", label: "Headache", cold: LIKELIHOOD.rare, flu: LIKELIHOOD.common },
  { id: "appetiteLoss", label: "Loss of appetite", cold: LIKELIHOOD.sometimes, flu: LIKELIHOOD.common },
];

/** Onset speed is one of the strongest discriminators between the two. */
export const ONSET_OPTIONS = [
  { key: "abrupt", label: "Abruptly, over a few hours", cold: 0, flu: 3 },
  { key: "gradual", label: "Gradually, over a day or two", cold: 3, flu: 0 },
  { key: "unsure", label: "Not sure", cold: 0, flu: 0 },
];

/** Fever is clinically defined as a body temperature of 38.0 °C (100.4 °F) or above. */
export const FEVER_THRESHOLD_C = 38.0;
/** Influenza fever is often 39-40 °C in adults and higher in children. */
export const HIGH_FEVER_C = 39.0;
/** Below this the reading is treated as no fever at all. */
export const NO_FEVER_C = 37.5;

export const FEVER_WEIGHT_HIGH = 3;
export const FEVER_WEIGHT_ANY = 2;
export const NO_FEVER_WEIGHT_COLD = 2;

/**
 * Influenza antivirals such as oseltamivir work best when started within
 * 48 hours of symptom onset.
 */
export const ANTIVIRAL_WINDOW_HOURS = 48;

/** Typical illness courses, for expectation-setting only. */
export const TYPICAL_COURSE = {
  cold: "Symptoms usually peak on days 2-3 and settle within 7-10 days; a cough can linger longer.",
  flu: "Fever and aches usually last 3-4 days; cough and tiredness commonly persist for two weeks or more.",
};

/** A lean under this gap in percentage points is reported as unclear. */
export const UNCLEAR_GAP_PERCENT = 15;

/**
 * Emergency warning signs. These are the standard influenza warning signs used
 * in public-health guidance and always override any pattern score.
 */
export const RED_FLAGS = {
  adult: [
    { id: "breathing", label: "Difficulty breathing or shortness of breath" },
    { id: "chestPain", label: "Persistent pain or pressure in the chest or abdomen" },
    { id: "confusion", label: "Persistent dizziness, confusion or difficulty waking" },
    { id: "seizures", label: "Seizures" },
    { id: "noUrine", label: "Not urinating, or signs of dehydration" },
    { id: "severePain", label: "Severe muscle pain or severe weakness/unsteadiness" },
    { id: "rebound", label: "Fever or cough that improved and then returned or worsened" },
    { id: "chronic", label: "Worsening of an existing heart, lung or other chronic condition" },
  ],
  child: [
    { id: "fastBreathing", label: "Fast or laboured breathing, or ribs pulling in with each breath" },
    { id: "blueLips", label: "Bluish lips or face" },
    { id: "chestPainChild", label: "Chest pain" },
    { id: "dehydrationChild", label: "No wet nappies for 8 hours, no tears when crying, dry mouth" },
    { id: "notAlert", label: "Not alert or not interacting when awake" },
    { id: "seizuresChild", label: "Seizures" },
    { id: "veryHighFever", label: "Fever above 40 °C (104 °F), or any fever in a baby under 12 weeks" },
    { id: "reboundChild", label: "Fever or cough that improved and then returned or worsened" },
  ],
};

const round = (value, places = 0) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

export function fahrenheitToCelsius(f) {
  const value = Number(f);
  if (!Number.isFinite(value)) return null;
  return ((value - 32) * 5) / 9;
}

export function celsiusToFahrenheit(c) {
  const value = Number(c);
  if (!Number.isFinite(value)) return null;
  return (value * 9) / 5 + 32;
}

export function onsetOption(key) {
  return ONSET_OPTIONS.find((option) => option.key === key) || ONSET_OPTIONS[2];
}

/**
 * Compare a reported symptom pattern against the cold and influenza profiles.
 *
 * @param {object} input
 *   symptoms: array of symptom ids
 *   onsetKey: "abrupt" | "gradual" | "unsure"
 *   temperatureC: number or null
 *   hoursSinceOnset: number
 *   ageGroup: "adult" | "child"
 *   redFlagIds: array of red flag ids
 * @returns {object} comparison, or { error }
 */
export function comparePattern(input) {
  const {
    symptoms = [],
    onsetKey = "unsure",
    temperatureC = null,
    hoursSinceOnset = 0,
    ageGroup = "adult",
    redFlagIds = [],
  } = input || {};

  if (!Array.isArray(symptoms)) return { error: "Symptoms must be provided as a list." };
  const valid = new Set(SYMPTOMS.map((s) => s.id));
  const selected = SYMPTOMS.filter((s) => symptoms.includes(s.id) && valid.has(s.id));

  const hours = Number(hoursSinceOnset);
  if (!Number.isFinite(hours) || hours < 0 || hours > 720) {
    return { error: "Hours since symptoms started must be between 0 and 720 (30 days)." };
  }

  let temp = null;
  if (temperatureC !== null && temperatureC !== "" && temperatureC !== undefined) {
    const parsed = Number(temperatureC);
    if (!Number.isFinite(parsed)) return { error: "Enter the temperature as a number in °C." };
    if (parsed < 30 || parsed > 45) return { error: "Temperature must be between 30 °C and 45 °C." };
    temp = parsed;
  }

  const group = ageGroup === "child" ? "child" : "adult";
  const flagList = RED_FLAGS[group];
  const flagged = flagList.filter((flag) => redFlagIds.includes(flag.id));

  if (selected.length === 0 && temp === null && onsetKey === "unsure") {
    return { error: "Tick at least one symptom, or enter a temperature, to compare the patterns." };
  }

  const contributions = [];
  let coldScore = 0;
  let fluScore = 0;

  for (const symptom of selected) {
    coldScore += symptom.cold;
    fluScore += symptom.flu;
    contributions.push({
      label: symptom.label,
      cold: symptom.cold,
      flu: symptom.flu,
      coldLabel: LIKELIHOOD_LABEL[symptom.cold],
      fluLabel: LIKELIHOOD_LABEL[symptom.flu],
    });
  }

  const onset = onsetOption(onsetKey);
  if (onset.cold > 0 || onset.flu > 0) {
    coldScore += onset.cold;
    fluScore += onset.flu;
    contributions.push({
      label: `Onset: ${onset.label.toLowerCase()}`,
      cold: onset.cold,
      flu: onset.flu,
      coldLabel: LIKELIHOOD_LABEL[onset.cold] || "—",
      fluLabel: LIKELIHOOD_LABEL[onset.flu] || "—",
    });
  }

  if (temp !== null) {
    if (temp >= HIGH_FEVER_C) {
      fluScore += FEVER_WEIGHT_HIGH;
      contributions.push({
        label: `Temperature ${round(temp, 1)} °C — high fever`,
        cold: 0,
        flu: FEVER_WEIGHT_HIGH,
        coldLabel: "Rare",
        fluLabel: "Usual",
      });
    } else if (temp >= FEVER_THRESHOLD_C) {
      fluScore += FEVER_WEIGHT_ANY;
      contributions.push({
        label: `Temperature ${round(temp, 1)} °C — fever`,
        cold: 0,
        flu: FEVER_WEIGHT_ANY,
        coldLabel: "Rare",
        fluLabel: "Common",
      });
    } else if (temp < NO_FEVER_C) {
      coldScore += NO_FEVER_WEIGHT_COLD;
      contributions.push({
        label: `Temperature ${round(temp, 1)} °C — no fever`,
        cold: NO_FEVER_WEIGHT_COLD,
        flu: 0,
        coldLabel: "Common",
        fluLabel: "Rare",
      });
    }
  }

  const total = coldScore + fluScore;
  if (total === 0) {
    return { error: "The symptoms ticked do not distinguish between the two patterns. Add more detail." };
  }

  const coldPercent = round((coldScore / total) * 100);
  const fluPercent = 100 - coldPercent;
  const gap = Math.abs(coldPercent - fluPercent);

  let lean;
  if (gap < UNCLEAR_GAP_PERCENT) {
    lean = { key: "unclear", label: "No clear lean", detail: "The pattern sits between the two profiles. Early illness often looks like this." };
  } else if (fluPercent > coldPercent) {
    lean = {
      key: "flu",
      label: "Closer to the influenza pattern",
      detail: "Systemic features — sudden onset, fever, aches, exhaustion — are the ones that point towards flu.",
    };
  } else {
    lean = {
      key: "cold",
      label: "Closer to the common cold pattern",
      detail: "Nose-and-throat symptoms without much fever or body ache are the classic cold picture.",
    };
  }

  const antiviral = {
    hoursSinceOnset: round(hours, 1),
    withinWindow: hours <= ANTIVIRAL_WINDOW_HOURS,
    hoursRemaining: round(Math.max(0, ANTIVIRAL_WINDOW_HOURS - hours), 1),
  };

  const guidance = [];
  if (flagged.length > 0) {
    guidance.push(
      `${flagged.length} emergency warning sign(s) ticked. Seek urgent medical care now — this overrides any pattern comparison.`,
    );
  }
  if (lean.key === "flu" && antiviral.withinWindow) {
    guidance.push(
      `Antiviral treatment for influenza works best when started within ${ANTIVIRAL_WINDOW_HOURS} hours of onset. You have about ${antiviral.hoursRemaining} hour(s) of that window left — a same-day call to a doctor is worthwhile, especially if you are in a higher-risk group.`,
    );
  } else if (lean.key === "flu") {
    guidance.push(
      `You are past the ${ANTIVIRAL_WINDOW_HOURS}-hour window in which antivirals work best, though a doctor may still treat if you are in a higher-risk group or unwell.`,
    );
  }
  if (temp !== null && temp >= HIGH_FEVER_C) {
    guidance.push(`A temperature of ${round(temp, 1)} °C is a high fever. Persistent high fever should be assessed by a clinician.`);
  }
  guidance.push(lean.key === "cold" ? TYPICAL_COURSE.cold : TYPICAL_COURSE.flu);
  guidance.push("Only a laboratory test can confirm influenza. Treat this as a comparison of symptom patterns, not a diagnosis.");

  return {
    coldScore,
    fluScore,
    coldPercent,
    fluPercent,
    gap,
    lean,
    contributions,
    antiviral,
    ageGroup: group,
    redFlagList: flagList,
    redFlagsTriggered: flagged,
    guidance,
    typicalCourse: TYPICAL_COURSE,
  };
}
