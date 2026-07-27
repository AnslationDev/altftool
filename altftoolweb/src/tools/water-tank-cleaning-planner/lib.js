/**
 * Water Tank Cleaning Planner.
 *
 * Interval: the CPHEEO Manual on Water Supply and Treatment and most municipal
 * guidance say domestic storage tanks should be cleaned at least twice a year.
 * Six months is therefore the baseline for treated municipal supply; untreated
 * borewell, tanker and open-well supply, concrete tanks, underground sumps and
 * poorly sealed lids all shorten it.
 *
 * Disinfection: after scrubbing, the tank is chlorinated to about 50 mg/L free
 * chlorine with roughly six hours of contact before flushing. Bleaching powder is
 * assumed to carry 33% available chlorine, the usual commercial grade. IS 10500:2012
 * requires a minimum residual free chlorine of 0.2 mg/L at the consumer tap.
 *
 * Storage adequacy uses the CPHEEO domestic norm of 135 litres per capita per day
 * for cities with a full flushing system.
 *
 * Pure module: no React, no DOM, no clock reads. Dates are always passed in.
 */

/** CPHEEO domestic water demand norm, litres per capita per day. */
export const LPCD_NORM = 135;

/** Target free chlorine for tank disinfection, in mg/L, with a 6-hour contact time. */
export const DISINFECTION_PPM = 50;
export const DISINFECTION_CONTACT_HOURS = 6;
/** Available chlorine in commercial bleaching powder (stable bleaching powder, ~33%). */
export const BLEACHING_POWDER_AVAILABLE_CHLORINE = 0.33;
/** Minimum residual free chlorine at the tap, IS 10500:2012. */
export const MIN_RESIDUAL_CHLORINE_MGL = 0.2;

/** Share of tank capacity consumed as drain, scrub and rinse water during a clean. */
export const RINSE_WATER_SHARE = 0.2;

/** Baseline cleaning interval by water source, in months. */
export const WATER_SOURCES = [
  { id: "municipal", label: "Treated municipal supply", months: 6 },
  { id: "mixed", label: "Municipal plus borewell", months: 4 },
  { id: "borewell", label: "Borewell — hard or sediment-heavy", months: 3 },
  { id: "tanker", label: "Tanker supply", months: 3 },
  { id: "open", label: "Open well or untreated surface source", months: 3 },
];

/**
 * Tank type: cost factor reflects access and dewatering effort;
 * monthsAdjust shortens the interval where biofilm and silt build faster.
 */
export const TANK_TYPES = [
  { id: "plastic", label: "Overhead plastic / HDPE (Sintex type)", costFactor: 1, monthsAdjust: 0 },
  { id: "stainless", label: "Overhead stainless steel", costFactor: 1, monthsAdjust: 0 },
  { id: "rcc-overhead", label: "Overhead RCC / concrete", costFactor: 1.15, monthsAdjust: -1 },
  { id: "sump", label: "Underground sump", costFactor: 1.35, monthsAdjust: -1 },
];

/** A lid that does not seal lets in dust, insects and light, which feeds algae. */
export const LID_CONDITIONS = [
  { id: "sealed", label: "Lid seals properly", monthsAdjust: 0 },
  { id: "loose", label: "Lid loose, cracked or missing", monthsAdjust: -1 },
];

/** City tier factors relative to a tier-1 non-metro baseline. */
export const CITY_TIERS = [
  { id: "metro", label: "Metro (Mumbai, Delhi NCR, Bengaluru)", factor: 1.15 },
  { id: "tier1", label: "Tier 1 (Pune, Hyderabad, Chennai, Kolkata)", factor: 1 },
  { id: "tier2", label: "Tier 2 city", factor: 0.85 },
  { id: "tier3", label: "Tier 3 / small town", factor: 0.72 },
];

/** GST on cleaning services, SAC 998533. */
export const GST_RATE = 0.18;
/** Minimum call-out for a tank clean, INR, at the tier-1 baseline. */
export const BASE_CALLOUT_INR = 600;
/** Volume-linked labour and consumables, INR per litre of capacity. */
export const RATE_PER_LITRE_INR = 0.32;

export const MIN_INTERVAL_MONTHS = 3;
export const MAX_INTERVAL_MONTHS = 12;
export const MIN_CAPACITY_LITRES = 100;
export const MAX_CAPACITY_LITRES = 200000;
export const MAX_PERSONS = 500;

/** Average days in a month (365.25 / 12), used to date the next clean. */
export const DAYS_PER_MONTH = 30.4375;

const MS_PER_DAY = 86400000;
const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/** Parse a YYYY-MM-DD string into a UTC timestamp. Returns null if unusable. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return stamp;
}

export function toIsoDate(stamp) {
  if (!isFiniteNumber(stamp)) return null;
  return new Date(stamp).toISOString().slice(0, 10);
}

/**
 * Bleaching powder needed to chlorinate a tank to DISINFECTION_PPM.
 * grams = litres x ppm / 1000 / availableChlorineFraction
 */
export function bleachingPowderGrams(capacityLitres, ppm = DISINFECTION_PPM) {
  if (!isFiniteNumber(capacityLitres) || capacityLitres <= 0) return 0;
  if (!isFiniteNumber(ppm) || ppm <= 0) return 0;
  return (capacityLitres * ppm) / 1000 / BLEACHING_POWDER_AVAILABLE_CHLORINE;
}

/**
 * @param {object} input
 * @param {number} input.capacityLitres
 * @param {string} input.tankType     TANK_TYPES id
 * @param {string} input.waterSource  WATER_SOURCES id
 * @param {string} input.lidCondition LID_CONDITIONS id
 * @param {string} input.cityTier     CITY_TIERS id
 * @param {number} input.persons      people the tank serves
 * @param {boolean} input.includeGst
 * @param {string} input.lastCleanedIso YYYY-MM-DD
 * @returns {object} plan, or { error }
 */
export function planTankCleaning({
  capacityLitres,
  tankType = "plastic",
  waterSource = "municipal",
  lidCondition = "sealed",
  cityTier = "tier1",
  persons = 4,
  includeGst = true,
  lastCleanedIso = "",
} = {}) {
  if (!isFiniteNumber(capacityLitres)) return { error: "Enter the tank capacity in litres." };
  if (capacityLitres < MIN_CAPACITY_LITRES) {
    return { error: `Tank capacity should be at least ${MIN_CAPACITY_LITRES} litres.` };
  }
  if (capacityLitres > MAX_CAPACITY_LITRES) {
    return { error: `Above ${MAX_CAPACITY_LITRES} litres this is a municipal reservoir, not a domestic tank.` };
  }

  const tank = TANK_TYPES.find((entry) => entry.id === tankType);
  if (!tank) return { error: "Choose the tank type." };

  const source = WATER_SOURCES.find((entry) => entry.id === waterSource);
  if (!source) return { error: "Choose where your water comes from." };

  const lid = LID_CONDITIONS.find((entry) => entry.id === lidCondition);
  if (!lid) return { error: "Choose the lid condition." };

  const tier = CITY_TIERS.find((entry) => entry.id === cityTier);
  if (!tier) return { error: "Choose your city tier." };

  if (!isFiniteNumber(persons) || persons < 1) return { error: "The tank must serve at least one person." };
  if (persons > MAX_PERSONS) return { error: `Enter ${MAX_PERSONS} people or fewer.` };

  const lastCleaned = lastCleanedIso ? parseIsoDate(lastCleanedIso) : null;
  if (lastCleanedIso && lastCleaned === null) {
    return { error: "Last cleaned date must be a real date in YYYY-MM-DD form." };
  }

  const rawMonths = source.months + tank.monthsAdjust + lid.monthsAdjust;
  const intervalMonths = Math.min(MAX_INTERVAL_MONTHS, Math.max(MIN_INTERVAL_MONTHS, rawMonths));
  const intervalDays = Math.round(intervalMonths * DAYS_PER_MONTH);
  const cleansPerYear = 12 / intervalMonths;

  const costBeforeTax = (BASE_CALLOUT_INR + capacityLitres * RATE_PER_LITRE_INR) * tank.costFactor * tier.factor;
  const gstAmount = includeGst ? costBeforeTax * GST_RATE : 0;
  const costPerClean = costBeforeTax + gstAmount;

  const rinseLitres = capacityLitres * RINSE_WATER_SHARE;
  const powderGrams = bleachingPowderGrams(capacityLitres);

  const dailyDemand = persons * LPCD_NORM;
  const storageDays = dailyDemand > 0 ? capacityLitres / dailyDemand : 0;

  const nextDueIso = lastCleaned === null ? null : toIsoDate(lastCleaned + intervalDays * MS_PER_DAY);

  const upcoming = [];
  if (lastCleaned !== null) {
    for (let n = 1; n <= 4; n += 1) {
      upcoming.push(toIsoDate(lastCleaned + intervalDays * n * MS_PER_DAY));
    }
  }

  return {
    tankLabel: tank.label,
    sourceLabel: source.label,
    lidLabel: lid.label,
    tierLabel: tier.label,
    intervalMonths,
    intervalDays,
    cleansPerYear: round2(cleansPerYear),
    intervalFloored: rawMonths < MIN_INTERVAL_MONTHS,
    costBeforeTax: Math.round(costBeforeTax),
    gstAmount: Math.round(gstAmount),
    gstRate: includeGst ? GST_RATE : 0,
    costPerClean: Math.round(costPerClean),
    annualCost: Math.round(costPerClean * cleansPerYear),
    costPerThousandLitres: round1((costPerClean / capacityLitres) * 1000),
    rinseLitres: Math.round(rinseLitres),
    rinseLitresPerYear: Math.round(rinseLitres * cleansPerYear),
    powderGrams: Math.round(powderGrams),
    powderGramsPerYear: Math.round(powderGrams * cleansPerYear),
    contactHours: DISINFECTION_CONTACT_HOURS,
    dailyDemand: Math.round(dailyDemand),
    storageDays: round1(storageDays),
    storageAdequate: storageDays >= 1,
    nextDueIso,
    upcoming,
  };
}
