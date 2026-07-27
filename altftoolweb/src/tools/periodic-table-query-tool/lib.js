/**
 * Periodic Table Query Tool — pure data normalisation, search and comparison.
 *
 * The raw dataset in ./data/elements.js carries the 118 confirmed elements with the
 * property set published by NIST and IUPAC (atomic mass, electronic configuration,
 * Pauling electronegativity, first ionisation energy in kJ/mol, radii in pm, melting and
 * boiling points in kelvin, density in g/cm3 for solids and liquids).
 *
 * Period, group and block are not stored in the file — they are derived here from the
 * atomic number using the standard IUPAC 18-column layout, which is a fixed rule, not data.
 */

import { RAW_ELEMENTS } from "./data/elements.js";

/** Atomic number at which each period begins, IUPAC 18-column layout. */
export const PERIOD_START_ATOMIC_NUMBERS = [1, 3, 11, 19, 37, 55, 87];

/** The lanthanide series, Z 57 to 71 — f-block, shown below the main table. */
export const LANTHANIDE_RANGE = [57, 71];

/** The actinide series, Z 89 to 103 — f-block. */
export const ACTINIDE_RANGE = [89, 103];

/** Highest atomic number confirmed and named by IUPAC (oganesson, 2016). */
export const MAX_ATOMIC_NUMBER = 118;

/** Absolute zero offset: 0 K = -273.15 degrees Celsius, by definition of the kelvin. */
export const KELVIN_OFFSET = 273.15;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Pulls a plain number out of the dataset's mixed number / string / array fields. */
export function toNumberOrNull(value) {
  if (isNum(value)) return value;
  if (Array.isArray(value)) return value.length > 0 ? toNumberOrNull(value[0]) : null;
  if (typeof value === "string") {
    const cleaned = value.replace(/\(.*?\)/g, "").replace(/[\[\]]/g, "").trim();
    if (cleaned === "") return null;
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** Period number (1-7) for an atomic number, or null when out of range. */
export function periodFor(atomicNumber) {
  if (!isNum(atomicNumber) || atomicNumber < 1 || atomicNumber > MAX_ATOMIC_NUMBER) return null;
  let period = 1;
  for (let i = 0; i < PERIOD_START_ATOMIC_NUMBERS.length; i += 1) {
    if (atomicNumber >= PERIOD_START_ATOMIC_NUMBERS[i]) period = i + 1;
  }
  return period;
}

/**
 * IUPAC group number (1-18) for an atomic number, or null for the f-block series,
 * which sit outside the 18 columns.
 */
export function groupFor(atomicNumber) {
  const z = atomicNumber;
  if (!isNum(z) || z < 1 || z > MAX_ATOMIC_NUMBER) return null;
  if (z === 1) return 1;
  if (z === 2) return 18;
  if (z <= 10) return z <= 4 ? z - 2 : z + 8;
  if (z <= 18) return z <= 12 ? z - 10 : z;
  if (z <= 36) return z - 18;
  if (z <= 54) return z - 36;
  if (z <= 56) return z - 54;
  if (z <= LANTHANIDE_RANGE[1]) return null; // 57-71 lanthanides
  if (z <= 86) return z - 68;
  if (z <= 88) return z - 86;
  if (z <= ACTINIDE_RANGE[1]) return null; // 89-103 actinides
  return z - 100;
}

/** Orbital block: s, p, d or f. */
export function blockFor(atomicNumber) {
  const z = atomicNumber;
  if (!isNum(z) || z < 1 || z > MAX_ATOMIC_NUMBER) return null;
  if ((z >= LANTHANIDE_RANGE[0] && z <= LANTHANIDE_RANGE[1]) ||
      (z >= ACTINIDE_RANGE[0] && z <= ACTINIDE_RANGE[1])) {
    return "f";
  }
  const group = groupFor(z);
  if (group === null) return null;
  if (z === 2) return "s"; // helium sits in group 18 but fills the 1s orbital
  if (group <= 2) return "s";
  if (group <= 12) return "d";
  return "p";
}

/** One normalised element record, built once at module load. */
function normalise(raw) {
  const atomicNumber = toNumberOrNull(raw.atomicNumber);
  return {
    atomicNumber,
    symbol: String(raw.symbol || ""),
    name: String(raw.name || ""),
    atomicMass: toNumberOrNull(raw.atomicMass),
    electronicConfiguration: String(raw.electronicConfiguration || ""),
    electronegativity: toNumberOrNull(raw.electronegativity),
    atomicRadius: toNumberOrNull(raw.atomicRadius),
    vanDerWaalsRadius: toNumberOrNull(raw.vanDelWaalsRadius),
    ionizationEnergy: toNumberOrNull(raw.ionizationEnergy),
    electronAffinity: toNumberOrNull(raw.electronAffinity),
    oxidationStates: String(raw.oxidationStates || ""),
    standardState: String(raw.standardState || ""),
    bondingType: String(raw.bondingType || ""),
    meltingPoint: toNumberOrNull(raw.meltingPoint),
    boilingPoint: toNumberOrNull(raw.boilingPoint),
    density: toNumberOrNull(raw.density),
    category: String(raw.groupBlock || "unknown"),
    yearDiscovered: toNumberOrNull(raw.yearDiscovered),
    period: periodFor(atomicNumber),
    group: groupFor(atomicNumber),
    block: blockFor(atomicNumber),
  };
}

/** All 118 elements, normalised and sorted by atomic number. */
export const ELEMENTS = (Array.isArray(RAW_ELEMENTS) ? RAW_ELEMENTS : [])
  .map(normalise)
  .filter((element) => isNum(element.atomicNumber))
  .sort((a, b) => a.atomicNumber - b.atomicNumber);

/** Distinct element categories present in the dataset. */
export const CATEGORIES = Array.from(new Set(ELEMENTS.map((element) => element.category))).sort();

/** Distinct standard states at 298 K. */
export const STANDARD_STATES = Array.from(
  new Set(ELEMENTS.map((element) => element.standardState).filter(Boolean)),
).sort();

/** Sortable numeric properties, with the unit each is quoted in. */
export const SORTABLE_PROPERTIES = [
  { key: "atomicNumber", label: "Atomic number", unit: "" },
  { key: "atomicMass", label: "Atomic mass", unit: "u" },
  { key: "electronegativity", label: "Electronegativity (Pauling)", unit: "" },
  { key: "ionizationEnergy", label: "First ionisation energy", unit: "kJ/mol" },
  { key: "electronAffinity", label: "Electron affinity", unit: "kJ/mol" },
  { key: "atomicRadius", label: "Atomic radius", unit: "pm" },
  { key: "density", label: "Density", unit: "g/cm³" },
  { key: "meltingPoint", label: "Melting point", unit: "K" },
  { key: "boilingPoint", label: "Boiling point", unit: "K" },
  { key: "yearDiscovered", label: "Year discovered", unit: "" },
];

/** Kelvin to degrees Celsius. Returns null for missing data rather than NaN. */
export function kelvinToCelsius(kelvin) {
  if (!isNum(kelvin)) return null;
  return kelvin - KELVIN_OFFSET;
}

/** Kelvin to degrees Fahrenheit: (K - 273.15) x 9/5 + 32. */
export function kelvinToFahrenheit(kelvin) {
  const celsius = kelvinToCelsius(kelvin);
  if (celsius === null) return null;
  return celsius * (9 / 5) + 32;
}

/** Finds one element by symbol, name or atomic number. Case-insensitive. */
export function findElement(query) {
  if (query === null || query === undefined) return null;
  const text = String(query).trim().toLowerCase();
  if (text === "") return null;
  const asNumber = Number(text);
  if (Number.isInteger(asNumber) && asNumber >= 1 && asNumber <= MAX_ATOMIC_NUMBER) {
    return ELEMENTS.find((element) => element.atomicNumber === asNumber) || null;
  }
  return (
    ELEMENTS.find((element) => element.symbol.toLowerCase() === text) ||
    ELEMENTS.find((element) => element.name.toLowerCase() === text) ||
    ELEMENTS.find((element) => element.name.toLowerCase().startsWith(text)) ||
    null
  );
}

/**
 * Filters and sorts the table.
 *
 * @param {object} options
 * @param {string} [options.query]     Free text matched against symbol, name and number.
 * @param {string} [options.category]  Exact category, or "all".
 * @param {string} [options.block]     "s", "p", "d", "f" or "all".
 * @param {string} [options.state]     Standard state, or "all".
 * @param {number|string} [options.period] 1-7, or "all".
 * @param {string} [options.sortBy]    Key from SORTABLE_PROPERTIES.
 * @param {string} [options.sortDir]   "asc" or "desc".
 * @returns {{elements:Array, count:number}|{error:string}}
 */
export function searchElements({
  query = "",
  category = "all",
  block = "all",
  state = "all",
  period = "all",
  sortBy = "atomicNumber",
  sortDir = "asc",
} = {}) {
  if (!SORTABLE_PROPERTIES.some((property) => property.key === sortBy)) {
    return { error: "That property cannot be sorted on." };
  }
  if (sortDir !== "asc" && sortDir !== "desc") {
    return { error: "Sort direction must be ascending or descending." };
  }

  const text = String(query || "").trim().toLowerCase();
  const wantedPeriod = period === "all" || period === "" ? null : Number(period);
  if (wantedPeriod !== null && (!Number.isInteger(wantedPeriod) || wantedPeriod < 1 || wantedPeriod > 7)) {
    return { error: "Period must be a whole number from 1 to 7." };
  }

  const filtered = ELEMENTS.filter((element) => {
    if (category !== "all" && element.category !== category) return false;
    if (block !== "all" && element.block !== block) return false;
    if (state !== "all" && element.standardState !== state) return false;
    if (wantedPeriod !== null && element.period !== wantedPeriod) return false;
    if (text === "") return true;
    return (
      element.symbol.toLowerCase() === text ||
      element.name.toLowerCase().includes(text) ||
      String(element.atomicNumber) === text
    );
  });

  const direction = sortDir === "asc" ? 1 : -1;
  const sorted = [...filtered].sort((a, b) => {
    const left = a[sortBy];
    const right = b[sortBy];
    // Elements with no measured value for the property always sort to the bottom.
    if (left === null && right === null) return a.atomicNumber - b.atomicNumber;
    if (left === null) return 1;
    if (right === null) return -1;
    if (left === right) return a.atomicNumber - b.atomicNumber;
    return left < right ? -direction : direction;
  });

  return { elements: sorted, count: sorted.length };
}

/**
 * Builds a side-by-side comparison of two or more elements.
 * @param {string[]} identifiers Symbols, names or atomic numbers.
 * @returns {{elements:Array, rows:Array}|{error:string}}
 */
export function compareElements(identifiers) {
  if (!Array.isArray(identifiers) || identifiers.length < 2) {
    return { error: "Pick at least two elements to compare." };
  }
  if (identifiers.length > 4) {
    return { error: "Compare up to four elements at a time so the table stays readable." };
  }

  const elements = [];
  for (const identifier of identifiers) {
    const element = findElement(identifier);
    if (!element) return { error: `No element matches "${identifier}".` };
    if (elements.some((existing) => existing.atomicNumber === element.atomicNumber)) {
      return { error: `${element.name} is listed twice — pick different elements.` };
    }
    elements.push(element);
  }

  const rows = SORTABLE_PROPERTIES.map((property) => ({
    key: property.key,
    label: property.label,
    unit: property.unit,
    values: elements.map((element) => element[property.key]),
  }));

  return { elements, rows };
}

/** Escapes and joins a set of elements as CSV text. */
export function elementsToCSV(elements) {
  if (!Array.isArray(elements) || elements.length === 0) return "";
  const columns = [
    "atomicNumber",
    "symbol",
    "name",
    "atomicMass",
    "category",
    "period",
    "group",
    "block",
    "standardState",
    "electronegativity",
    "ionizationEnergy",
    "meltingPoint",
    "boilingPoint",
    "density",
    "yearDiscovered",
  ];
  const escape = (value) => {
    if (value === null || value === undefined) return "";
    const text = String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [columns.join(",")];
  for (const element of elements) {
    lines.push(columns.map((column) => escape(element[column])).join(","));
  }
  return lines.join("\n");
}

/** Formats a numeric property for display, returning an em dash when unmeasured. */
export function formatProperty(value, unit = "", digits = 3) {
  if (!isNum(value)) return "—";
  const rounded = Math.abs(value) >= 1000 ? Math.round(value) : Number(value.toFixed(digits));
  return unit ? `${rounded} ${unit}` : String(rounded);
}
