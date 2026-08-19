/**
 * Pantry Expiry Tracker — pure shelf-life and expiry logic.
 *
 * Storage times come from the USDA FoodKeeper guidance published by FoodSafety.gov,
 * which the USDA Food Safety and Inspection Service maintains with Cornell University
 * and the Food Marketing Institute. Where FoodKeeper gives a range ("3 to 5 weeks"),
 * the conservative end of the range is used, because the point of the tool is to warn
 * you early rather than late.
 *
 * Every function takes dates as arguments — nothing here reads the system clock, so the
 * same inputs always produce the same output.
 */

/** Milliseconds in a day, used for all date differences. */
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Storage locations a household actually has. */
export const STORAGE_LOCATIONS = [
  { key: "pantry", label: "Pantry / cupboard (room temperature)" },
  { key: "fridge", label: "Refrigerator (4 °C or below)" },
  { key: "freezer", label: "Freezer (−18 °C or below)" },
];

/**
 * Shelf life in days by storage location, from the USDA FoodKeeper database.
 * `null` means the location is not recommended for that food.
 * "afterOpening" is true where the clock starts when the pack is opened, not bought.
 */
export const FOOD_TYPES = [
  {
    key: "milk",
    label: "Milk (pasteurised, opened)",
    afterOpening: true,
    // FoodKeeper: milk keeps 1 week in the refrigerator; 3 months frozen.
    days: { pantry: null, fridge: 7, freezer: 90 },
  },
  {
    key: "yogurt",
    label: "Yogurt / curd",
    afterOpening: true,
    // FoodKeeper: 1 to 2 weeks refrigerated; 1 to 2 months frozen.
    days: { pantry: null, fridge: 7, freezer: 30 },
  },
  {
    key: "hard-cheese",
    label: "Hard cheese (opened)",
    afterOpening: true,
    // FoodKeeper: 3 to 4 weeks refrigerated after opening; 6 to 8 months frozen.
    days: { pantry: null, fridge: 21, freezer: 180 },
  },
  {
    key: "butter",
    label: "Butter",
    afterOpening: false,
    // FoodKeeper: 1 to 3 months refrigerated; 6 to 9 months frozen.
    days: { pantry: null, fridge: 30, freezer: 180 },
  },
  {
    key: "eggs",
    label: "Eggs in shell",
    afterOpening: false,
    // FoodKeeper: 3 to 5 weeks refrigerated. Shell eggs should not be frozen.
    days: { pantry: null, fridge: 21, freezer: null },
  },
  {
    key: "raw-poultry",
    label: "Raw chicken or turkey",
    afterOpening: false,
    // FoodKeeper: 1 to 2 days refrigerated; up to 9 months (pieces) frozen.
    days: { pantry: null, fridge: 1, freezer: 270 },
  },
  {
    key: "raw-mince",
    label: "Raw minced meat",
    afterOpening: false,
    // FoodKeeper: 1 to 2 days refrigerated; 3 to 4 months frozen.
    days: { pantry: null, fridge: 1, freezer: 90 },
  },
  {
    key: "fresh-fish",
    label: "Fresh fish or prawns",
    afterOpening: false,
    // FoodKeeper: 1 to 2 days refrigerated; 3 to 8 months frozen depending on species.
    days: { pantry: null, fridge: 1, freezer: 90 },
  },
  {
    key: "leftovers",
    label: "Cooked leftovers",
    afterOpening: false,
    // FoodKeeper and FSIS: cooked dishes keep 3 to 4 days refrigerated; 2 to 6 months frozen.
    days: { pantry: null, fridge: 3, freezer: 60 },
  },
  {
    key: "leafy-greens",
    label: "Leafy greens / herbs",
    afterOpening: false,
    // FoodKeeper: 3 to 7 days refrigerated. Not suited to pantry storage.
    days: { pantry: null, fridge: 3, freezer: 240 },
  },
  {
    key: "apples",
    label: "Apples and firm fruit",
    afterOpening: false,
    // FoodKeeper: 3 weeks at room temperature, 4 to 6 weeks refrigerated.
    days: { pantry: 21, fridge: 28, freezer: 240 },
  },
  {
    key: "bread",
    label: "Bread",
    afterOpening: false,
    // FoodKeeper: 5 to 7 days at room temperature; 3 months frozen. Refrigeration stales bread.
    days: { pantry: 5, fridge: 14, freezer: 90 },
  },
  {
    key: "dry-staples",
    label: "Dry pasta, rice, lentils",
    afterOpening: false,
    // FoodKeeper: dry pasta and white rice keep about 2 years in the pantry.
    days: { pantry: 730, fridge: 730, freezer: 730 },
  },
  {
    key: "canned-low-acid",
    label: "Canned goods (low acid: beans, meat, veg)",
    afterOpening: false,
    // FoodKeeper: low-acid canned food keeps 2 to 5 years unopened.
    days: { pantry: 730, fridge: 730, freezer: null },
  },
  {
    key: "canned-high-acid",
    label: "Canned goods (high acid: tomato, citrus)",
    afterOpening: false,
    // FoodKeeper: high-acid canned food keeps 12 to 18 months unopened.
    days: { pantry: 365, fridge: 365, freezer: null },
  },
  {
    key: "opened-sauce",
    label: "Opened sauce / condiment jar",
    afterOpening: true,
    // FoodKeeper: most opened jarred sauces keep about 2 months refrigerated.
    days: { pantry: null, fridge: 60, freezer: 180 },
  },
];

/** Status bands, in the order they are tested. */
export const EXPIRY_STATUSES = [
  { key: "expired", label: "Expired", maxDaysLeft: -1, advice: "Throw it out — do not taste to check." },
  { key: "today", label: "Use today", maxDaysLeft: 0, advice: "Cook or freeze it today." },
  { key: "critical", label: "Use within 2 days", maxDaysLeft: 2, advice: "Move it to the front of the shelf." },
  { key: "soon", label: "Use this week", maxDaysLeft: 7, advice: "Plan a meal around it." },
  { key: "fresh", label: "Fresh", maxDaysLeft: Infinity, advice: "No action needed." },
];

/** Default reminder window — one weekly shop, so nothing is missed between trips. */
export const DEFAULT_REMINDER_DAYS = 7;

/** Guard so a pasted list cannot lock the page. */
export const MAX_ITEMS = 200;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Parses "YYYY-MM-DD" to milliseconds at UTC midnight, or null. Avoids timezone drift. */
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return ms;
}

/** Formats milliseconds at UTC midnight back to "YYYY-MM-DD". */
export function toISODate(ms) {
  if (!isNum(ms)) return "";
  const date = new Date(ms);
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Whole days from one ISO date to another. Negative when `toISO` is in the past. */
export function daysBetween(fromISO, toISO) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISO);
  if (from === null || to === null) return null;
  return Math.round((to - from) / MS_PER_DAY);
}

/** Adds whole days to an ISO date, returning an ISO date. */
export function addDays(isoDate, days) {
  const base = parseISODate(isoDate);
  if (base === null || !isNum(days)) return "";
  return toISODate(base + Math.round(days) * MS_PER_DAY);
}

/** Looks up a food type by key. */
export function getFoodType(key) {
  return FOOD_TYPES.find((food) => food.key === key) || null;
}

/** Status band for a number of days remaining. */
export function statusForDaysLeft(daysLeft) {
  if (!isNum(daysLeft)) return EXPIRY_STATUSES[EXPIRY_STATUSES.length - 1];
  return EXPIRY_STATUSES.find((band) => daysLeft <= band.maxDaysLeft) || EXPIRY_STATUSES[EXPIRY_STATUSES.length - 1];
}

/**
 * Suggests an expiry date from the FoodKeeper shelf life for a food and storage location.
 *
 * @param {string} foodKey     Key from FOOD_TYPES.
 * @param {string} storageKey  Key from STORAGE_LOCATIONS.
 * @param {string} startISO    Purchase date, or opening date for foods where the clock
 *                             starts on opening.
 * @returns {{expiryISO:string, shelfLifeDays:number, food:object}|{error:string}}
 */
export function suggestExpiry(foodKey, storageKey, startISO) {
  const food = getFoodType(foodKey);
  if (!food) return { error: "Pick a food type to look up its shelf life." };
  if (parseISODate(startISO) === null) {
    return { error: "Enter the purchase or opening date as YYYY-MM-DD." };
  }
  const shelfLifeDays = food.days[storageKey];
  if (shelfLifeDays === null || shelfLifeDays === undefined) {
    return {
      error: `${food.label} should not be stored in the ${storageKey}. Choose another location.`,
    };
  }
  return { expiryISO: addDays(startISO, shelfLifeDays), shelfLifeDays, food };
}

/**
 * Evaluates one pantry item against a given "today".
 *
 * @param {object} item
 * @param {string} item.name
 * @param {string} item.expiryISO
 * @param {number} [item.quantity]
 * @param {number} [item.unitCost]  Cost of one unit, for the value-at-risk figure.
 * @param {string} todayISO
 * @returns {object} evaluation, or { error }.
 */
export function evaluateItem(item = {}, todayISO = "") {
  const name = String(item.name || "").trim() || "Unnamed item";
  const daysLeft = daysBetween(todayISO, item.expiryISO);
  if (daysLeft === null) {
    return { error: `"${name}" needs a valid expiry date and a valid today's date (YYYY-MM-DD).` };
  }
  const quantity = isNum(item.quantity) && item.quantity >= 0 ? item.quantity : 1;
  const unitCost = isNum(item.unitCost) && item.unitCost >= 0 ? item.unitCost : 0;
  const status = statusForDaysLeft(daysLeft);
  return {
    name,
    expiryISO: item.expiryISO,
    daysLeft,
    quantity,
    unitCost,
    value: quantity * unitCost,
    status: status.key,
    statusLabel: status.label,
    advice: status.advice,
    storage: item.storage || "fridge",
  };
}

/**
 * Summarises a whole pantry as of a given date.
 *
 * @param {Array} items
 * @param {string} todayISO
 * @param {number} [reminderDays] Window used for the "needs attention" count.
 * @returns {object} summary, or { error }.
 */
export function summarisePantry(items, todayISO, reminderDays = DEFAULT_REMINDER_DAYS) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Add at least one item to track." };
  }
  if (items.length > MAX_ITEMS) {
    return { error: `This tracker handles up to ${MAX_ITEMS} items at a time.` };
  }
  if (parseISODate(todayISO) === null) {
    return { error: "Enter today's date as YYYY-MM-DD." };
  }
  if (!isNum(reminderDays) || reminderDays < 0 || reminderDays > 365) {
    return { error: "The reminder window must be between 0 and 365 days." };
  }

  const evaluated = [];
  for (const item of items) {
    const row = evaluateItem(item, todayISO);
    if (row.error) return { error: row.error };
    evaluated.push(row);
  }

  evaluated.sort((a, b) => a.daysLeft - b.daysLeft);

  const counts = EXPIRY_STATUSES.reduce((acc, band) => ({ ...acc, [band.key]: 0 }), {});
  let expiredValue = 0;
  let atRiskValue = 0;
  let totalValue = 0;

  for (const row of evaluated) {
    counts[row.status] += 1;
    totalValue += row.value;
    if (row.daysLeft < 0) expiredValue += row.value;
    else if (row.daysLeft <= reminderDays) atRiskValue += row.value;
  }

  const next = evaluated.find((row) => row.daysLeft >= 0) || null;

  return {
    items: evaluated,
    todayISO,
    reminderDays: Math.round(reminderDays),
    counts,
    totalItems: evaluated.length,
    needsAttention: evaluated.filter((row) => row.daysLeft <= reminderDays).length,
    totalValue,
    expiredValue,
    atRiskValue,
    savableValue: atRiskValue,
    wastePercent: totalValue > 0 ? (expiredValue / totalValue) * 100 : 0,
    nextExpiry: next,
  };
}

/** Plain-language phrase for a days-remaining count, with correct singulars. */
export function describeDaysLeft(daysLeft) {
  if (!isNum(daysLeft)) return "—";
  if (daysLeft === 0) return "today";
  if (daysLeft === 1) return "tomorrow";
  if (daysLeft === -1) return "yesterday";
  if (daysLeft < 0) return `${Math.abs(daysLeft)} days ago`;
  return `in ${daysLeft} days`;
}

/** Renders the summary as plain text for a shopping list or reminder note. */
export function pantryToText(summary, currencyLabel = "INR") {
  if (!summary || summary.error) return "";
  const lines = [
    `Pantry check on ${summary.todayISO}`,
    `${summary.totalItems} items · ${summary.needsAttention} need attention within ${summary.reminderDays} days`,
    `Value at risk: ${currencyLabel} ${Math.round(summary.atRiskValue)} · already expired: ${currencyLabel} ${Math.round(summary.expiredValue)}`,
    "",
  ];
  for (const row of summary.items) {
    const when = describeDaysLeft(row.daysLeft);
    lines.push(`- ${row.name} (${row.quantity}) — ${row.statusLabel}, expires ${when}`);
  }
  return lines.join("\n");
}
