/**
 * Deep freezer sizing.
 *
 * Storage density comes from the long-standing cooperative-extension rule that
 * one cubic foot of freezer space holds about 35 lb of packaged food:
 *     35 lb = 15.8757 kg over 28.3168 L  ->  0.5607 kg per litre.
 *
 * Household allowance uses the equally standard 1.5 cubic feet (42.48 L) of
 * freezer space per person, adjusted for how much bulk buying the household
 * actually does.
 *
 * Holdover during a power cut follows USDA Food Safety and Inspection Service
 * guidance: a full freezer holds a safe temperature for about 48 hours and a
 * half-full one for about 24 hours, provided the lid stays shut. Those two data
 * points are linear through the origin, so holdover = 48 x fill fraction.
 */

/** 35 lb per cubic foot of packed food = 0.560657 kg per litre. */
export const KG_PER_LITRE = 0.560657;

/** 1 cubic foot = 28.3168 litres. */
export const LITRES_PER_CUBIC_FOOT = 28.3168;

/** 1.5 cubic feet of freezer space per person. */
export const LITRES_PER_PERSON = 1.5 * LITRES_PER_CUBIC_FOOT;

/** USDA: a full freezer stays safe for about 48 hours with the lid closed. */
export const FULL_FREEZER_HOLDOVER_HOURS = 48;

/**
 * Freezer styles. Chest freezers pack tighter and lose less cold air when
 * opened; uprights lose usable volume to baskets, shelves and the door.
 * Running watts per litre and duty cycle are typical figures for a domestic
 * unit in a 30 °C ambient.
 */
export const FREEZER_STYLES = {
  chest: {
    key: "chest",
    label: "Chest freezer (lid on top)",
    packing: 0.8,
    wattsPerLitre: 0.6,
  },
  upright: {
    key: "upright",
    label: "Upright freezer (front door, baskets)",
    packing: 0.7,
    wattsPerLitre: 0.8,
  },
};

/** Typical compressor duty cycle in a 30 °C ambient. */
export const DUTY_CYCLE = 0.3;

/** Bulk-buying habit multipliers on the per-person allowance. */
export const BUYING_HABITS = {
  light: { key: "light", label: "Light — weekly shopping, little frozen stock", factor: 0.8 },
  moderate: { key: "moderate", label: "Moderate — monthly bulk buys", factor: 1.0 },
  heavy: { key: "heavy", label: "Heavy — bulk meat, garden produce, batch cooking", factor: 1.5 },
};

/** Capacities that domestic and small-commercial chest freezers are sold in. */
export const STANDARD_LITRES = [100, 150, 200, 250, 300, 350, 400, 500, 600];
export const MAX_STANDARD_LITRES = STANDARD_LITRES[STANDARD_LITRES.length - 1];

/** Lead-acid tubular batteries are sized to 50% depth of discharge. */
export const BATTERY_DOD = 0.5;
/** Typical sine-wave inverter conversion efficiency. */
export const INVERTER_EFFICIENCY = 0.85;
/** Battery bank nominal voltage assumed for the Ah figure. */
export const BATTERY_VOLTS = 12;
/**
 * A small hermetic compressor draws roughly 3x its running current at start-up,
 * and inverters are rated in VA at about 0.8 power factor.
 */
export const STARTING_CURRENT_MULTIPLE = 3;
export const INVERTER_POWER_FACTOR = 0.8;

const round = (value, decimals = 0) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Recommend a deep freezer size.
 *
 * @param {object} input
 * @param {"people"|"weight"} input.basis   size from household head-count or from stock weight
 * @param {number|string} input.people      number of people in the household
 * @param {string} input.habit              key of BUYING_HABITS
 * @param {number|string} input.foodKg      weight of food to store, when basis is "weight"
 * @param {string} input.style              key of FREEZER_STYLES
 * @param {number|string} input.backupHours hours of power backup wanted
 * @returns {object} sizing result, or { error } for invalid input
 */
export function selectFreezer({
  basis = "people",
  people = 4,
  habit = "moderate",
  foodKg = 100,
  style = "chest",
  backupHours = 4,
}) {
  const styleSpec = FREEZER_STYLES[style];
  if (!styleSpec) return { error: "Choose either a chest or an upright freezer." };

  const backup = toNumber(backupHours);
  if (Number.isNaN(backup)) return { error: "Enter backup hours as a number." };
  if (backup < 0) return { error: "Backup hours cannot be negative." };
  if (backup > 72) return { error: "Beyond 72 hours a generator, not a battery bank, is the answer." };

  let requiredNetLitres;
  let basisNote;

  if (basis === "people") {
    const heads = toNumber(people);
    const habitSpec = BUYING_HABITS[habit];
    if (!habitSpec) return { error: "Choose one of the listed buying habits." };
    if (Number.isNaN(heads)) return { error: "Enter the number of people as a number." };
    if (heads <= 0) return { error: "Household size must be at least one person." };
    if (heads > 50) return { error: "Above 50 people this is catering — size commercial cold storage." };
    requiredNetLitres = heads * LITRES_PER_PERSON * habitSpec.factor;
    basisNote = `${heads} × ${round(LITRES_PER_PERSON, 1)} L per person × ${habitSpec.factor} for ${habitSpec.label.split(" — ")[0].toLowerCase()} buying`;
  } else if (basis === "weight") {
    const kg = toNumber(foodKg);
    if (Number.isNaN(kg)) return { error: "Enter the food weight as a number." };
    if (kg <= 0) return { error: "Food weight must be greater than zero." };
    if (kg > 5000) return { error: "Above 5 tonnes you need a cold room, not a deep freezer." };
    requiredNetLitres = kg / KG_PER_LITRE;
    basisNote = `${kg} kg ÷ ${KG_PER_LITRE} kg per litre of packed food`;
  } else {
    return { error: "Sizing basis must be household size or food weight." };
  }

  const requiredGrossLitres = requiredNetLitres / styleSpec.packing;

  const units = Math.max(1, Math.ceil(requiredGrossLitres / MAX_STANDARD_LITRES));
  const perUnitGross = requiredGrossLitres / units;
  const unitLitres =
    STANDARD_LITRES.find((size) => size >= perUnitGross) ?? MAX_STANDARD_LITRES;
  const totalLitres = unitLitres * units;

  const usableLitres = totalLitres * styleSpec.packing;
  const foodCapacityKg = usableLitres * KG_PER_LITRE;

  const fillFraction = usableLitres > 0 ? Math.min(1, requiredNetLitres / usableLitres) : 0;
  const holdoverHours = FULL_FREEZER_HOLDOVER_HOURS * fillFraction;

  const runningWatts = totalLitres * styleSpec.wattsPerLitre;
  const averageWatts = runningWatts * DUTY_CYCLE;
  const dailyKwh = (averageWatts * 24) / 1000;
  const annualKwh = dailyKwh * 365;

  const backupWh = averageWatts * backup;
  const batteryWh = backupWh / (INVERTER_EFFICIENCY * BATTERY_DOD);
  const batteryAh = batteryWh / BATTERY_VOLTS;
  const inverterVa = (runningWatts * STARTING_CURRENT_MULTIPLE) / INVERTER_POWER_FACTOR;

  const notes = [
    "Keep the freezer at least two-thirds full — packed food is thermal mass, and a half-empty freezer both costs more to run and loses temperature twice as fast in an outage.",
    "Set the thermostat to −18 °C. Food stays safe indefinitely below that; quality, not safety, is what degrades with time.",
    `Leave 5-8 cm of clearance around the cabinet so the condenser can reject heat, or running cost rises well above the ${round(annualKwh, 0)} kWh a year estimated here.`,
  ];
  if (units > 1) {
    notes.push(
      `The requirement exceeds one cabinet, so ${units} units are shown. Two smaller freezers also mean a failure never costs you the whole stock.`,
    );
  }
  if (styleSpec.key === "upright") {
    notes.push(
      "An upright loses cold air every time the door opens because cold air falls out; a chest of the same litres will usually run cheaper.",
    );
  }

  return {
    styleLabel: styleSpec.label,
    basisNote,
    requiredNetLitres: round(requiredNetLitres, 0),
    requiredGrossLitres: round(requiredGrossLitres, 0),
    requiredCubicFeet: round(requiredGrossLitres / LITRES_PER_CUBIC_FOOT, 1),
    unitLitres,
    units,
    totalLitres,
    totalCubicFeet: round(totalLitres / LITRES_PER_CUBIC_FOOT, 1),
    usableLitres: round(usableLitres, 0),
    foodCapacityKg: round(foodCapacityKg, 0),
    fillPercent: round(fillFraction * 100, 0),
    holdoverHours: round(holdoverHours, 1),
    runningWatts: round(runningWatts, 0),
    averageWatts: round(averageWatts, 0),
    dailyKwh: round(dailyKwh, 2),
    annualKwh: round(annualKwh, 0),
    backupHours: backup,
    batteryAh: round(batteryAh, 0),
    inverterVa: round(inverterVa, 0),
    notes,
  };
}
