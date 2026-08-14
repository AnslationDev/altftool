import Papa from "papaparse";

export const PROFILE_STORAGE_KEY = "altftool_diabetes_profile";
export const LOGS_STORAGE_KEY = "altftool_diabetes_logs";

export const GLUCOSE_BOUNDS = Object.freeze({
  "mg/dL": Object.freeze({ min: 20, max: 600 }),
  "mmol/L": Object.freeze({ min: 1.1, max: 33.3 }),
});

export const TARGET_BOUNDS_MG_DL = GLUCOSE_BOUNDS["mg/dL"];

const isBlank = (value) => value === "" || value === null || value === undefined;

export function validateGlucoseReading(value, unit) {
  if (isBlank(value)) return "Blood glucose reading is required.";

  const reading = Number(value);
  if (!Number.isFinite(reading)) return "Enter a valid blood glucose reading.";

  const bounds = GLUCOSE_BOUNDS[unit];
  if (!bounds) return "Choose a supported blood glucose unit.";

  if (reading < bounds.min || reading > bounds.max) {
    return `Enter a plausible reading between ${bounds.min} and ${bounds.max} ${unit}.`;
  }

  return null;
}

export function validateTargetRange(targetMin, targetMax) {
  if (isBlank(targetMin) || isBlank(targetMax)) {
    return "Enter both minimum and maximum target values.";
  }

  const min = Number(targetMin);
  const max = Number(targetMax);
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return "Enter valid numbers for both target values.";
  }

  const bounds = TARGET_BOUNDS_MG_DL;
  if (min < bounds.min || min > bounds.max || max < bounds.min || max > bounds.max) {
    return `Targets must be between ${bounds.min} and ${bounds.max} mg/dL.`;
  }

  if (min >= max) {
    return "Minimum target must be less than maximum target.";
  }

  return null;
}

export function clearDiabetesStorage(storage) {
  const failedKeys = [];

  for (const key of [PROFILE_STORAGE_KEY, LOGS_STORAGE_KEY]) {
    try {
      storage.removeItem(key);
    } catch {
      failedKeys.push(key);
    }
  }

  return { ok: failedKeys.length === 0, failedKeys };
}

export function buildDiabetesLogsCsv(logs = []) {
  const rows = logs.map((log) => ({
    Date: log.date || "",
    Time: log.time || "",
    "Reading Type": (log.readingType || "").replace("_", " "),
    Reading: log.reading,
    Unit: log.unit,
    "Carbs (g)": log.carbs === "" || log.carbs == null ? "" : log.carbs,
    "Water (glasses)": log.water === "" || log.water == null ? "" : log.water,
    "Exercise (mins)": log.exercise === "" || log.exercise == null ? "" : log.exercise,
    Notes: log.notes || "",
  }));

  // Spreadsheet applications can execute cells beginning with these formula
  // prefixes. Papa Parse's built-in escaping covers =, +, -, @, tab and CR.
  return Papa.unparse(rows, { escapeFormulae: true });
}
