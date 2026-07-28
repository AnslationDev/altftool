/**
 * Outdoor-exercise decision support from an air quality index reading.
 *
 * Rule and data sources:
 *  - US EPA AQI breakpoints for 24-hour PM2.5, as revised in the 2024
 *    particulate matter NAAQS rule (Good 0.0-9.0 ug/m3 = AQI 0-50, through
 *    Hazardous 225.5-325.4 ug/m3 = AQI 301-500).
 *  - India CPCB National Air Quality Index PM2.5 sub-index breakpoints
 *    (Good 0-30, Satisfactory 31-60, Moderate 61-90, Poor 91-120,
 *    Very Poor 121-250, Severe 251+ ug/m3) with the official health statements.
 *  - EPA "Air Quality Guide for Particle Pollution" activity advice, which is
 *    written in terms of prolonged or heavy exertion.
 *  - US EPA Exposure Factors Handbook short-term inhalation rates for adults,
 *    used to turn a concentration into an inhaled dose.
 *  - WHO 2021 global air quality guideline: 24-hour mean PM2.5 of 15 ug/m3,
 *    used here as the clean-air reference for the safer-duration figure.
 *
 * Nothing here is medical advice; it is a way of making an air quality number
 * concrete before you decide to train outside.
 */

export const SCALES = {
  us: {
    id: "us",
    label: "US EPA AQI",
    note: "Used by AirNow, most weather apps outside India, and PurpleAir.",
    breakpoints: [
      { aqiLow: 0, aqiHigh: 50, cLow: 0, cHigh: 9, level: 0, label: "Good", statement: "Air quality is satisfactory and air pollution poses little or no risk." },
      { aqiLow: 51, aqiHigh: 100, cLow: 9.1, cHigh: 35.4, level: 1, label: "Moderate", statement: "Unusually sensitive people may notice symptoms; air quality is acceptable for most." },
      { aqiLow: 101, aqiHigh: 150, cLow: 35.5, cHigh: 55.4, level: 2, label: "Unhealthy for Sensitive Groups", statement: "Members of sensitive groups may experience health effects; the general public is less likely to be affected." },
      { aqiLow: 151, aqiHigh: 200, cLow: 55.5, cHigh: 125.4, level: 3, label: "Unhealthy", statement: "Some members of the general public may experience health effects; sensitive groups may have more serious effects." },
      { aqiLow: 201, aqiHigh: 300, cLow: 125.5, cHigh: 225.4, level: 4, label: "Very Unhealthy", statement: "Health alert: the risk of health effects is increased for everyone." },
      { aqiLow: 301, aqiHigh: 500, cLow: 225.5, cHigh: 325.4, level: 5, label: "Hazardous", statement: "Health warning of emergency conditions: everyone is more likely to be affected." },
    ],
  },
  india: {
    id: "india",
    label: "India CPCB National AQI",
    note: "The number shown on SAFAR, CPCB boards and Indian weather apps.",
    breakpoints: [
      { aqiLow: 0, aqiHigh: 50, cLow: 0, cHigh: 30, level: 0, label: "Good", statement: "Minimal impact." },
      { aqiLow: 51, aqiHigh: 100, cLow: 31, cHigh: 60, level: 1, label: "Satisfactory", statement: "Minor breathing discomfort to sensitive people." },
      { aqiLow: 101, aqiHigh: 200, cLow: 61, cHigh: 90, level: 2, label: "Moderate", statement: "Breathing discomfort to people with asthma or lung disease, and to children and older adults." },
      { aqiLow: 201, aqiHigh: 300, cLow: 91, cHigh: 120, level: 3, label: "Poor", statement: "Breathing discomfort to most people on prolonged exposure." },
      { aqiLow: 301, aqiHigh: 400, cLow: 121, cHigh: 250, level: 4, label: "Very Poor", statement: "Respiratory illness on prolonged exposure." },
      { aqiLow: 401, aqiHigh: 500, cLow: 251, cHigh: 380, level: 5, label: "Severe", statement: "Affects healthy people and seriously impacts those with existing disease." },
    ],
  },
};

/**
 * Short-term inhalation rates for adults, cubic metres per minute,
 * from the US EPA Exposure Factors Handbook (Chapter 6, adult means).
 */
export const INTENSITIES = [
  { id: "rest", label: "Standing or gentle stretching", m3PerMin: 0.0042, prolongedProne: false },
  { id: "easy", label: "Easy walk or light mobility work", m3PerMin: 0.012, prolongedProne: false },
  { id: "moderate", label: "Steady jog, cycling or a gym circuit", m3PerMin: 0.024, prolongedProne: true },
  { id: "hard", label: "Intervals, tempo running or racing", m3PerMin: 0.049, prolongedProne: true },
];

export const SENSITIVITY_GROUPS = [
  { id: "general", label: "No respiratory or heart condition", sensitive: false },
  { id: "asthma", label: "Asthma or COPD", sensitive: true },
  { id: "heart", label: "Heart disease", sensitive: true },
  { id: "child", label: "Child or teenager", sensitive: true },
  { id: "older", label: "Aged 65 or over", sensitive: true },
  { id: "pregnant", label: "Pregnant", sensitive: true },
];

/** WHO 2021 AQG, 24-hour mean PM2.5. */
export const WHO_24H_PM25 = 15;

/** A session over this many minutes counts as "prolonged" in the EPA wording. */
export const PROLONGED_MINUTES = 60;

/** N95/FFP2 respirators filter at least this fraction of fine particles when well fitted. */
export const N95_FILTRATION = 0.95;

export const VERDICTS = {
  go: { key: "go", label: "Train outdoors as planned", tone: "success" },
  caution: { key: "caution", label: "Fine, but watch for symptoms", tone: "success" },
  shorten: { key: "shorten", label: "Shorten it or drop the intensity", tone: "warning" },
  indoors: { key: "indoors", label: "Move the session indoors", tone: "warning" },
  avoid: { key: "avoid", label: "Do not train outdoors today", tone: "danger" },
};

/** EPA activity guidance by severity level, split by whether you are in a sensitive group. */
const ADVICE_BY_LEVEL = [
  { general: "go", sensitive: "go" },
  { general: "go", sensitive: "caution" },
  { general: "caution", sensitive: "shorten" },
  { general: "shorten", sensitive: "indoors" },
  { general: "indoors", sensitive: "avoid" },
  { general: "avoid", sensitive: "avoid" },
];

const VERDICT_ORDER = ["go", "caution", "shorten", "indoors", "avoid"];

const round = (value, dp = 1) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/** Find the breakpoint band an AQI value falls in. */
export function bandForAqi(aqi, scaleId = "us") {
  const scale = SCALES[scaleId] || SCALES.us;
  return (
    scale.breakpoints.find((band) => aqi >= band.aqiLow && aqi <= band.aqiHigh) ||
    scale.breakpoints[scale.breakpoints.length - 1]
  );
}

/**
 * Invert the AQI formula to recover the PM2.5 concentration in ug/m3.
 * AQI = (aqiHigh - aqiLow)/(cHigh - cLow) x (C - cLow) + aqiLow
 */
export function aqiToPm25(aqi, scaleId = "us") {
  const value = Number(aqi);
  if (!Number.isFinite(value)) return null;
  const band = bandForAqi(value, scaleId);
  const aqiSpan = band.aqiHigh - band.aqiLow;
  if (aqiSpan <= 0) return band.cLow;
  const ratio = (value - band.aqiLow) / aqiSpan;
  return band.cLow + ratio * (band.cHigh - band.cLow);
}

/**
 * Decide whether to train outdoors and how much particulate the session costs.
 *
 * @param {object} input
 * @param {number} input.aqi           0 to 500
 * @param {"us"|"india"} input.scale
 * @param {string} input.intensity     an INTENSITIES id
 * @param {number} input.minutes       planned session length
 * @param {string[]} input.groups      SENSITIVITY_GROUPS ids that apply
 * @returns {object} verdict and dose figures, or { error }
 */
export function assessOutdoorTraining({
  aqi,
  scale = "us",
  intensity = "moderate",
  minutes,
  groups = ["general"],
} = {}) {
  const scaleDef = SCALES[scale] || SCALES.us;
  const value = Number(aqi);
  const mins = Number(minutes);

  if (!Number.isFinite(value)) return { error: "Enter the AQI as a number." };
  if (value < 0 || value > 500) {
    return { error: "The AQI scale runs from 0 to 500 — check the reading you entered." };
  }
  if (!Number.isFinite(mins)) return { error: "Enter the planned session length in minutes." };
  if (mins <= 0) return { error: "Session length must be more than zero minutes." };
  if (mins > 600) return { error: "Enter a session length of 600 minutes (10 hours) or less." };

  const intensityDef = INTENSITIES.find((item) => item.id === intensity) || INTENSITIES[2];
  const band = bandForAqi(value, scaleDef.id);
  const pm25 = aqiToPm25(value, scaleDef.id);
  if (pm25 === null || !Number.isFinite(pm25)) {
    return { error: "Could not convert that AQI into a PM2.5 concentration." };
  }

  const activeGroups = SENSITIVITY_GROUPS.filter(
    (group) => groups.includes(group.id) && group.sensitive,
  );
  const isSensitive = activeGroups.length > 0;

  const advice = ADVICE_BY_LEVEL[band.level] || ADVICE_BY_LEVEL[ADVICE_BY_LEVEL.length - 1];
  let verdictKey = isSensitive ? advice.sensitive : advice.general;

  // EPA writes its advice around "prolonged or heavy exertion". This tool makes
  // that concrete: a hard session, or one over an hour, is escalated one step
  // once the air is at Unhealthy-for-Sensitive-Groups level or worse.
  const isExertion = intensityDef.id === "hard" || (intensityDef.prolongedProne && mins > PROLONGED_MINUTES);
  if (isExertion && band.level >= 2) {
    const index = VERDICT_ORDER.indexOf(verdictKey);
    verdictKey = VERDICT_ORDER[Math.min(index + 1, VERDICT_ORDER.length - 1)];
  }

  // Inhaled dose: concentration x inhalation rate x time.
  const inhaledUg = pm25 * intensityDef.m3PerMin * mins;
  const cleanAirUg = WHO_24H_PM25 * intensityDef.m3PerMin * mins;
  const doseMultiple = cleanAirUg > 0 ? inhaledUg / cleanAirUg : 0;

  // Session length that keeps the dose at or below the same session in air at
  // the WHO 24-hour guideline of 15 ug/m3.
  const equivalentMinutes = pm25 > 0 ? (mins * WHO_24H_PM25) / pm25 : mins;
  const saferMinutes = Math.min(mins, Math.floor(equivalentMinutes));

  const restRate = INTENSITIES[0].m3PerMin;
  const breathingMultiple = intensityDef.m3PerMin / restRate;

  const notes = [];
  if (band.level >= 2) {
    notes.push(
      `Breathing at ${round(breathingMultiple)} times your resting rate means this session takes in ${round(breathingMultiple)} times the particulate of standing still for the same time.`,
    );
  }
  if (isExertion && band.level >= 2) {
    notes.push(
      "The EPA guidance singles out prolonged or heavy exertion, so a hard session or one over an hour is treated one step more cautiously here.",
    );
  }
  if (band.level >= 3) {
    notes.push(
      `A well-fitted N95 or FFP2 respirator removes at least ${Math.round(N95_FILTRATION * 100)}% of fine particles, but it also makes hard breathing harder — it is not a licence to do intervals in smoke.`,
    );
  }
  if (band.level <= 1 && verdictKey === "go") {
    notes.push("Nothing about the air quality needs to change your plan today.");
  }
  notes.push(
    "Traffic-side air is usually far worse than the city average — moving a run to a park or an early hour often does more than any mask.",
  );

  return {
    aqi: Math.round(value),
    scaleId: scaleDef.id,
    scaleLabel: scaleDef.label,
    bandLabel: band.label,
    bandLevel: band.level,
    bandStatement: band.statement,
    pm25: round(pm25),
    whoGuideline: WHO_24H_PM25,
    pm25VsWho: round(pm25 / WHO_24H_PM25),
    intensityLabel: intensityDef.label,
    breathingMultiple: round(breathingMultiple),
    minutes: Math.round(mins),
    inhaledUg: round(inhaledUg, 2),
    cleanAirUg: round(cleanAirUg, 2),
    doseMultiple: round(doseMultiple),
    saferMinutes,
    isSensitive,
    sensitiveGroups: activeGroups.map((group) => group.label),
    verdictKey,
    verdictLabel: VERDICTS[verdictKey].label,
    verdictTone: VERDICTS[verdictKey].tone,
    notes,
  };
}
