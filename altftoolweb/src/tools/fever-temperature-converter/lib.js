/**
 * Body temperature conversion with measurement-site correction.
 *
 * Scale conversion is exact. Site correction is not measured physiology: it
 * uses the site-specific fever thresholds published in general clinical
 * guidance (Mayo Clinic, MedlinePlus and Seattle Children's all list rectal and
 * ear fever at 38.0 C / 100.4 F, oral at 37.8 C / 100.0 F and armpit at
 * 37.2 C / 99.0 F). Every reading is shifted onto that common core scale so
 * that different sites can be compared, and the shift is reported openly.
 */

/** 0 C = 273.15 K, by definition of the kelvin. */
export const KELVIN_OFFSET = 273.15;

export const SCALES = ["C", "F", "K"];

export const SCALE_LABELS = {
  C: "Celsius (°C)",
  F: "Fahrenheit (°F)",
  K: "Kelvin (K)",
};

/** The standard clinical definition of fever on a core/rectal reading, in Celsius. */
export const CORE_FEVER_C = 38;
/** Core temperature below this is hypothermia (35.0 C = 95.0 F). */
export const CORE_HYPOTHERMIA_C = 35;

/**
 * Measurement sites with their published fever thresholds in Celsius.
 * `note` explains what usually goes wrong with that site.
 */
export const SITES = [
  {
    id: "oral",
    label: "Oral (under the tongue)",
    feverC: 37.8,
    note: "Wait 15 minutes after a hot or cold drink; the mouth must stay closed around the probe.",
  },
  {
    id: "rectal",
    label: "Rectal",
    feverC: 38,
    note: "The reference standard, especially under three months of age, and the site the 38.0 C fever definition is written for.",
  },
  {
    id: "tympanic",
    label: "Ear (tympanic)",
    feverC: 38,
    note: "Close to core when aimed correctly, but earwax, a small ear canal or a poor seal all read low.",
  },
  {
    id: "temporal",
    label: "Forehead (temporal artery)",
    feverC: 38,
    note: "Most temporal scanners already display a core-equivalent figure; sweat, draughts and a cold room read low.",
  },
  {
    id: "axillary",
    label: "Armpit (axillary)",
    feverC: 37.2,
    note: "The least reliable common site. Hold the arm firmly down and treat a raised armpit reading as a prompt to recheck elsewhere.",
  },
];

/**
 * Fever bands on the core-equivalent Celsius scale. 38.0 C (100.4 F) is the
 * standard fever threshold; 41.0 C (105.8 F) and above is hyperpyrexia, treated
 * as an emergency. `max` is the exclusive upper edge in Celsius.
 */
export const FEVER_BANDS = [
  {
    key: "hypothermia",
    label: "Hypothermia range",
    tone: "danger",
    max: 35,
    note: "A core temperature below 35 C (95 F) is hypothermia and needs urgent medical attention.",
  },
  {
    key: "normal",
    label: "Normal range",
    tone: "success",
    max: 37.5,
    note: "Core temperature normally sits around 36.5-37.5 C and drifts by up to 0.5 C between early morning and late afternoon.",
  },
  {
    key: "borderline",
    label: "Slightly raised",
    tone: "warning",
    max: 38,
    note: "Above the usual range but below the 38 C fever line. Rest, take fluids and recheck in an hour.",
  },
  {
    key: "fever",
    label: "Fever",
    tone: "warning",
    max: 39,
    note: "38.0 C (100.4 F) or above on a core-equivalent reading meets the standard definition of fever.",
  },
  {
    key: "high",
    label: "High fever",
    tone: "danger",
    max: 41,
    note: "39 C (102.2 F) and above. Seek medical advice, and do so straight away for infants, older adults, pregnancy or a weakened immune system.",
  },
  {
    key: "hyperpyrexia",
    label: "Hyperpyrexia",
    tone: "danger",
    max: Infinity,
    note: "41 C (105.8 F) and above is hyperpyrexia and is treated as a medical emergency.",
  },
];

/** Rejection window in Celsius; anything outside is a typo or the wrong scale. */
export const MIN_PLAUSIBLE_C = 20;
export const MAX_PLAUSIBLE_C = 45;

export function toCelsius(value, scale) {
  if (scale === "C") return value;
  if (scale === "F") return ((value - 32) * 5) / 9;
  return value - KELVIN_OFFSET;
}

export function celsiusToF(celsius) {
  return (celsius * 9) / 5 + 32;
}

export function celsiusToK(celsius) {
  return celsius + KELVIN_OFFSET;
}

export function getSite(siteId) {
  return SITES.find((entry) => entry.id === siteId) || null;
}

/** Shift, in Celsius, that puts a site reading on the common core scale. */
export function coreOffsetForSite(site) {
  return CORE_FEVER_C - site.feverC;
}

export function bandForCoreC(coreC) {
  return FEVER_BANDS.find((band) => coreC < band.max) || FEVER_BANDS[FEVER_BANDS.length - 1];
}

/**
 * Convert a body temperature reading and interpret it.
 *
 * @param {{ value: number|string, scale: "C"|"F"|"K", siteId: string }} input
 * @returns {object} all three scales plus the core-equivalent band, or { error }
 */
export function convertBodyTemperature({ value, scale, siteId }) {
  if (!SCALES.includes(scale)) return { error: "Choose Celsius, Fahrenheit or Kelvin." };
  const site = getSite(siteId);
  if (!site) return { error: "Choose where the temperature was measured." };

  const raw = typeof value === "string" ? value.replace(/,/g, "").trim() : value;
  if (raw === "" || raw === null || raw === undefined) {
    return { error: "Enter the temperature shown on the thermometer." };
  }

  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) {
    return { error: "Enter the temperature as a number, for example 38.4 or 101.2." };
  }

  const celsius = toCelsius(numeric, scale);
  if (celsius < MIN_PLAUSIBLE_C || celsius > MAX_PLAUSIBLE_C) {
    return {
      error: `That works out to ${celsius.toFixed(1)} C, outside the ${MIN_PLAUSIBLE_C}-${MAX_PLAUSIBLE_C} C window a body thermometer can report. Check which scale you selected.`,
    };
  }

  const offset = coreOffsetForSite(site);
  const coreC = celsius + offset;
  const band = bandForCoreC(coreC);

  return {
    site,
    scale,
    inputValue: numeric,
    celsius,
    fahrenheit: celsiusToF(celsius),
    kelvin: celsiusToK(celsius),
    siteFeverC: site.feverC,
    siteFeverF: celsiusToF(site.feverC),
    coreOffsetC: offset,
    coreC,
    coreF: celsiusToF(coreC),
    isFever: celsius >= site.feverC,
    isHypothermia: coreC < CORE_HYPOTHERMIA_C,
    /** Signed gap to this site's own fever threshold, in Celsius. */
    gapToFeverC: celsius - site.feverC,
    gapToFeverF: (celsius - site.feverC) * 1.8,
    band: { key: band.key, label: band.label, tone: band.tone, note: band.note },
  };
}

/** Site-by-site fever thresholds for the on-page reference table. */
export const SITE_THRESHOLD_ROWS = SITES.map((site) => ({
  id: site.id,
  label: site.label,
  celsius: site.feverC,
  fahrenheit: celsiusToF(site.feverC),
}));
