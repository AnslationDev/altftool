/**
 * Blood pressure unit conversion (mmHg <-> kPa) with derived haemodynamic figures.
 *
 * Clinical practice in most of the world reports blood pressure in millimetres
 * of mercury. Physiology papers, ventilator and haemodynamic equipment and some
 * European datasets use kilopascals, so the two have to be converted exactly.
 */

/**
 * One conventional millimetre of mercury is defined as exactly
 * 133.322387415 Pa (ISO 80000-4 / the conventional mmHg based on a mercury
 * density of 13595.1 kg/m3 and g = 9.80665 m/s2).
 */
export const PA_PER_MMHG = 133.322387415;
export const KPA_PER_MMHG = PA_PER_MMHG / 1000;
export const MMHG_PER_KPA = 1 / KPA_PER_MMHG; // 7.50062

export const UNITS = ["mmHg", "kPa"];

/**
 * Plausible measurement window, in mmHg. Readings outside this range come from
 * a typo or the wrong unit rather than a real cuff measurement.
 */
export const LIMITS = {
  systolicMin: 40,
  systolicMax: 300,
  diastolicMin: 20,
  diastolicMax: 200,
};

/**
 * Categories from the 2017 ACC/AHA Guideline for the Prevention, Detection,
 * Evaluation and Management of High Blood Pressure in Adults, expressed in
 * mmHg. Low blood pressure is added as an informational band using the widely
 * used 90/60 mmHg threshold; it is not part of the ACC/AHA table.
 */
export const BP_CATEGORIES = [
  {
    key: "low",
    label: "Low blood pressure",
    tone: "warning",
    note: "Below 90 systolic or 60 diastolic is commonly called hypotension. It only matters if it comes with dizziness, fainting or confusion.",
  },
  {
    key: "normal",
    label: "Normal",
    tone: "success",
    note: "Below 120 systolic and below 80 diastolic is the ACC/AHA normal range.",
  },
  {
    key: "elevated",
    label: "Elevated",
    tone: "warning",
    note: "120-129 systolic with diastolic under 80. Lifestyle measures are advised before it progresses.",
  },
  {
    key: "stage1",
    label: "Stage 1 hypertension",
    tone: "warning",
    note: "130-139 systolic or 80-89 diastolic under the 2017 ACC/AHA thresholds.",
  },
  {
    key: "stage2",
    label: "Stage 2 hypertension",
    tone: "danger",
    note: "140 or higher systolic, or 90 or higher diastolic.",
  },
  {
    key: "crisis",
    label: "Hypertensive crisis range",
    tone: "danger",
    note: "Above 180 systolic or above 120 diastolic. Repeat the reading and seek urgent medical care, especially with chest pain, breathlessness or visual change.",
  },
];

/** Reference figures in mmHg. Normal pulse pressure sits near 40 mmHg. */
export const TYPICAL_PULSE_PRESSURE_MMHG = 40;
/** Perfusion of vital organs is generally considered adequate above this MAP. */
export const MAP_PERFUSION_FLOOR_MMHG = 65;

export function mmHgToKpa(mmHg) {
  return mmHg * KPA_PER_MMHG;
}

export function kpaToMmHg(kPa) {
  return kPa * MMHG_PER_KPA;
}

/** Category lookup for values already in mmHg. */
export function categoriseBp(systolicMmHg, diastolicMmHg) {
  const find = (key) => BP_CATEGORIES.find((entry) => entry.key === key);
  if (systolicMmHg > 180 || diastolicMmHg > 120) return find("crisis");
  if (systolicMmHg >= 140 || diastolicMmHg >= 90) return find("stage2");
  if (systolicMmHg >= 130 || diastolicMmHg >= 80) return find("stage1");
  if (systolicMmHg < 90 || diastolicMmHg < 60) return find("low");
  if (systolicMmHg >= 120) return find("elevated");
  return find("normal");
}

/**
 * Mean arterial pressure, the standard bedside estimate
 * MAP = diastolic + (systolic - diastolic) / 3.
 */
export function meanArterialPressure(systolic, diastolic) {
  return diastolic + (systolic - diastolic) / 3;
}

/**
 * Convert a blood pressure reading and describe it.
 *
 * @param {{ systolic: number|string, diastolic: number|string, unit: "mmHg"|"kPa" }} input
 * @returns {object} both unit systems plus MAP, pulse pressure and category, or { error }
 */
export function convertBloodPressure({ systolic, diastolic, unit }) {
  if (!UNITS.includes(unit)) return { error: "Choose either mmHg or kPa." };

  const clean = (raw) => (typeof raw === "string" ? raw.replace(/,/g, "").trim() : raw);
  const s = Number(clean(systolic));
  const d = Number(clean(diastolic));

  if (clean(systolic) === "" || clean(diastolic) === "") {
    return { error: "Enter both the systolic (top) and diastolic (bottom) numbers." };
  }
  if (!Number.isFinite(s) || !Number.isFinite(d)) {
    return { error: "Enter both readings as numbers, for example 128 and 82." };
  }

  const systolicMmHg = unit === "mmHg" ? s : kpaToMmHg(s);
  const diastolicMmHg = unit === "mmHg" ? d : kpaToMmHg(d);

  if (systolicMmHg < LIMITS.systolicMin || systolicMmHg > LIMITS.systolicMax) {
    return {
      error: `The systolic value should be between ${LIMITS.systolicMin} and ${LIMITS.systolicMax} mmHg (${mmHgToKpa(
        LIMITS.systolicMin,
      ).toFixed(1)}-${mmHgToKpa(LIMITS.systolicMax).toFixed(1)} kPa). Check the unit you selected.`,
    };
  }
  if (diastolicMmHg < LIMITS.diastolicMin || diastolicMmHg > LIMITS.diastolicMax) {
    return {
      error: `The diastolic value should be between ${LIMITS.diastolicMin} and ${LIMITS.diastolicMax} mmHg (${mmHgToKpa(
        LIMITS.diastolicMin,
      ).toFixed(1)}-${mmHgToKpa(LIMITS.diastolicMax).toFixed(1)} kPa). Check the unit you selected.`,
    };
  }
  if (diastolicMmHg >= systolicMmHg) {
    return { error: "The systolic (top) number must be higher than the diastolic (bottom) number." };
  }

  const mapMmHg = meanArterialPressure(systolicMmHg, diastolicMmHg);
  const pulsePressureMmHg = systolicMmHg - diastolicMmHg;
  const category = categoriseBp(systolicMmHg, diastolicMmHg);

  return {
    unit,
    systolicMmHg,
    diastolicMmHg,
    systolicKpa: mmHgToKpa(systolicMmHg),
    diastolicKpa: mmHgToKpa(diastolicMmHg),
    mapMmHg,
    mapKpa: mmHgToKpa(mapMmHg),
    pulsePressureMmHg,
    pulsePressureKpa: mmHgToKpa(pulsePressureMmHg),
    widePulsePressure: pulsePressureMmHg > 60,
    narrowPulsePressure: pulsePressureMmHg < 25,
    lowPerfusionMap: mapMmHg < MAP_PERFUSION_FLOOR_MMHG,
    category: { key: category.key, label: category.label, tone: category.tone, note: category.note },
  };
}

/** Reference rows for the on-page table, in mmHg. */
export const REFERENCE_ROWS = [
  { systolic: 90, diastolic: 60 },
  { systolic: 110, diastolic: 70 },
  { systolic: 120, diastolic: 80 },
  { systolic: 130, diastolic: 85 },
  { systolic: 140, diastolic: 90 },
  { systolic: 160, diastolic: 100 },
  { systolic: 180, diastolic: 120 },
];
