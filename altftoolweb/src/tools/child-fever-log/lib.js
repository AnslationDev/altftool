/**
 * Child fever log — temperature classification, fluid targets and safety prompts.
 *
 * Thresholds follow widely used paediatric references:
 *  - Fever is a core (rectal-equivalent) temperature of 38.0 C / 100.4 F or more
 *    (American Academy of Pediatrics; NICE guideline NG143 "Fever in under 5s").
 *  - Any fever of 38.0 C or more in an infant under 3 months is treated as
 *    urgent until proven otherwise (NICE NG143 red traffic-light criterion).
 *  - Maintenance fluid volume uses the Holliday-Segar 100/50/20 rule
 *    (Holliday & Segar, Pediatrics 1957).
 * This is informational only and never replaces clinical assessment.
 */

export const FEVER_C = 38.0; // core temperature at or above this is fever
export const LOW_GRADE_C = 37.5; // borderline / low-grade band starts here
export const HIGH_FEVER_C = 39.0; // "high fever" band
export const HYPERPYREXIA_C = 41.0; // hyperpyrexia — emergency
export const HYPOTHERMIA_C = 35.0; // below this is abnormally low

/**
 * Degrees Celsius to ADD to a reading to approximate core (rectal) temperature.
 * Axillary readings run about 0.5 C low and oral about 0.4 C low; tympanic and
 * temporal-artery thermometers are calibrated to read core directly.
 */
export const SITE_OFFSET_C = {
  rectal: 0,
  tympanic: 0,
  temporal: 0,
  oral: 0.4,
  axillary: 0.5,
};

export const SITE_LABEL = {
  rectal: "Rectal",
  tympanic: "Ear (tympanic)",
  temporal: "Forehead (temporal)",
  oral: "Oral",
  axillary: "Armpit (axillary)",
};

/** Minimum hours between doses and the usual 24-hour dose ceiling for children. */
export const MEDICINE_RULES = {
  paracetamol: { label: "Paracetamol", minIntervalHours: 4, maxDoses24h: 4 },
  ibuprofen: { label: "Ibuprofen", minIntervalHours: 6, maxDoses24h: 4 },
};

/** Extra fluid required per 1 C of fever above 37 C, as a fraction of maintenance. */
export const FLUID_UPLIFT_PER_DEGREE = 0.12; // ~12% per degree, standard paediatric allowance

/** Days of continuous fever after which review is routinely advised. */
export const PROLONGED_FEVER_DAYS = 5;

const MS_PER_HOUR = 3600000;

export function toCelsius(value, unit) {
  const n = Number(value);
  if (!Number.isFinite(n)) return NaN;
  return unit === "F" ? ((n - 32) * 5) / 9 : n;
}

export function toFahrenheit(celsius) {
  const n = Number(celsius);
  if (!Number.isFinite(n)) return NaN;
  return (n * 9) / 5 + 32;
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

/**
 * Classify one reading.
 * @returns {{celsius:number, coreC:number, coreF:number, band:string, label:string}|{error:string}}
 */
export function classifyTemperature({ value, unit = "C", site = "axillary" } = {}) {
  const celsius = toCelsius(value, unit);
  if (!Number.isFinite(celsius)) return { error: "Enter a temperature as a number." };
  if (!(site in SITE_OFFSET_C)) return { error: "Choose where the temperature was measured." };
  // Plausible physiological range for a measured body temperature.
  if (celsius < 25 || celsius > 45) {
    return { error: "That reading is outside the plausible body temperature range of 25 C to 45 C." };
  }

  const coreC = celsius + SITE_OFFSET_C[site];

  let band = "normal";
  let label = "Normal";
  if (coreC < HYPOTHERMIA_C) {
    band = "low";
    label = "Below normal";
  } else if (coreC >= HYPERPYREXIA_C) {
    band = "hyperpyrexia";
    label = "Hyperpyrexia";
  } else if (coreC >= HIGH_FEVER_C) {
    band = "high";
    label = "High fever";
  } else if (coreC >= FEVER_C) {
    band = "fever";
    label = "Fever";
  } else if (coreC >= LOW_GRADE_C) {
    band = "low-grade";
    label = "Low grade / borderline";
  }

  return {
    celsius: round1(celsius),
    coreC: round1(coreC),
    coreF: round1(toFahrenheit(coreC)),
    band,
    label,
  };
}

/** Holliday-Segar daily maintenance fluid in millilitres. */
export function maintenanceFluidsMl(weightKg) {
  const w = Number(weightKg);
  if (!Number.isFinite(w) || w <= 0) return NaN;
  if (w <= 10) return w * 100;
  if (w <= 20) return 1000 + (w - 10) * 50;
  return 1500 + (w - 20) * 20;
}

/** Maintenance fluids plus the fever uplift for the highest temperature recorded. */
export function feverFluidTargetMl({ weightKg, peakCoreC } = {}) {
  const base = maintenanceFluidsMl(weightKg);
  if (!Number.isFinite(base)) return NaN;
  const peak = Number(peakCoreC);
  const degreesOver = Number.isFinite(peak) ? Math.max(0, peak - 37) : 0;
  return base * (1 + FLUID_UPLIFT_PER_DEGREE * degreesOver);
}

function parseTime(raw) {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw !== "string" || raw.trim() === "") return NaN;
  const ms = Date.parse(raw);
  return Number.isFinite(ms) ? ms : NaN;
}

/**
 * Summarise a whole fever log.
 *
 * @param {object} input
 * @param {Array} input.entries  [{ at, value, unit, site, fluidsMl, medicine }]
 * @param {number} input.ageMonths child's age in months
 * @param {number} input.weightKg  child's weight in kilograms
 * @param {string|number} [input.feverStartedAt] when the fever first began
 * @returns {object} summary, or { error }
 */
export function summariseFeverLog({ entries, ageMonths, weightKg, feverStartedAt = null } = {}) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { error: "Add at least one temperature reading to build the log." };
  }
  if (entries.length > 200) {
    return { error: "This log holds up to 200 readings." };
  }

  const age = Number(ageMonths);
  if (!Number.isFinite(age) || age < 0) return { error: "Enter the child's age in months (0 or more)." };
  if (age > 216) return { error: "This log is designed for children up to 18 years (216 months)." };

  const weight = Number(weightKg);
  if (!Number.isFinite(weight) || weight <= 0) return { error: "Enter the child's weight in kilograms." };
  if (weight > 150) return { error: "Enter a weight below 150 kg." };

  const rows = [];
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i] || {};
    const at = parseTime(entry.at);
    if (!Number.isFinite(at)) {
      return { error: `Reading ${i + 1} has no valid date and time.` };
    }
    const reading = classifyTemperature({ value: entry.value, unit: entry.unit, site: entry.site });
    if (reading.error) return { error: `Reading ${i + 1}: ${reading.error}` };

    const fluids = entry.fluidsMl === "" || entry.fluidsMl === null || entry.fluidsMl === undefined ? 0 : Number(entry.fluidsMl);
    if (!Number.isFinite(fluids) || fluids < 0) {
      return { error: `Reading ${i + 1} has an invalid fluid amount.` };
    }
    const medicine = entry.medicine && entry.medicine !== "none" ? entry.medicine : null;
    if (medicine && !(medicine in MEDICINE_RULES)) {
      return { error: `Reading ${i + 1} lists a medicine this log does not track.` };
    }

    rows.push({
      ...reading,
      at,
      site: entry.site || "axillary",
      unit: entry.unit === "F" ? "F" : "C",
      fluidsMl: fluids,
      medicine,
    });
  }

  rows.sort((a, b) => a.at - b.at);

  const latest = rows[rows.length - 1];
  const peak = rows.reduce((best, row) => (row.coreC > best.coreC ? row : best), rows[0]);
  const totalFluidsMl = rows.reduce((sum, row) => sum + row.fluidsMl, 0);

  const targetMl = feverFluidTargetMl({ weightKg: weight, peakCoreC: peak.coreC });
  const fluidPercent = targetMl > 0 ? (totalFluidsMl / targetMl) * 100 : 0;

  // Medicine timing, measured from the most recent reading in the log.
  const medicines = Object.keys(MEDICINE_RULES).map((key) => {
    const rule = MEDICINE_RULES[key];
    const doses = rows.filter((row) => row.medicine === key);
    const last = doses.length > 0 ? doses[doses.length - 1] : null;
    const doses24h = doses.filter((row) => latest.at - row.at < 24 * MS_PER_HOUR).length;
    return {
      key,
      label: rule.label,
      minIntervalHours: rule.minIntervalHours,
      maxDoses24h: rule.maxDoses24h,
      doses24h,
      lastDoseAt: last ? last.at : null,
      nextDoseAt: last ? last.at + rule.minIntervalHours * MS_PER_HOUR : null,
      atDailyLimit: doses24h >= rule.maxDoses24h,
    };
  });

  const feverRows = rows.filter((row) => row.coreC >= FEVER_C);
  const feverStartMs = parseTime(feverStartedAt);
  const firstFeverAt = Number.isFinite(feverStartMs)
    ? feverStartMs
    : feverRows.length > 0
      ? feverRows[0].at
      : null;
  const durationHours = firstFeverAt === null ? 0 : Math.max(0, (latest.at - firstFeverAt) / MS_PER_HOUR);

  const flags = [];
  if (age < 3 && peak.coreC >= FEVER_C) {
    flags.push(
      `Under 3 months old with a temperature of ${FEVER_C} C or more — this is treated as urgent. Seek medical assessment now.`,
    );
  } else if (age < 6 && peak.coreC >= HIGH_FEVER_C) {
    flags.push(
      `Under 6 months old with a temperature of ${HIGH_FEVER_C} C or more — contact a doctor today.`,
    );
  }
  if (peak.coreC >= HYPERPYREXIA_C) {
    flags.push(`Peak of ${round1(peak.coreC)} C is at or above the ${HYPERPYREXIA_C} C hyperpyrexia level — emergency care.`);
  }
  if (peak.coreC < HYPOTHERMIA_C) {
    flags.push(`A temperature below ${HYPOTHERMIA_C} C in an unwell child is as concerning as a high fever — seek advice.`);
  }
  if (durationHours >= PROLONGED_FEVER_DAYS * 24) {
    flags.push(
      `Fever has lasted ${Math.floor(durationHours / 24)} days. Fever running ${PROLONGED_FEVER_DAYS} days or more should be reviewed by a doctor.`,
    );
  }
  if (fluidPercent < 50) {
    flags.push(
      `Recorded fluids are only ${Math.round(fluidPercent)}% of the estimated daily need. Watch for dry mouth, sunken eyes and fewer wet nappies.`,
    );
  }
  medicines.forEach((med) => {
    if (med.atDailyLimit) {
      flags.push(`${med.label} has reached ${med.doses24h} doses in 24 hours, the usual daily ceiling. Do not give more without advice.`);
    }
  });

  return {
    rows,
    latest,
    peak,
    readingCount: rows.length,
    totalFluidsMl,
    targetFluidMl: Math.round(targetMl),
    maintenanceMl: Math.round(maintenanceFluidsMl(weight)),
    fluidPercent: Math.round(fluidPercent),
    durationHours: round1(durationHours),
    medicines,
    flags,
    ageMonths: age,
    weightKg: weight,
  };
}
