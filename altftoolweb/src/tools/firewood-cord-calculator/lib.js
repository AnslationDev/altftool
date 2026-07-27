/**
 * Firewood cord calculator.
 *
 * A full (legal) cord is a stack 4 ft x 4 ft x 8 ft = 128 cubic feet of wood,
 * air and bark together. Roughly two thirds of that is solid wood; the rest is
 * the gaps between split pieces.
 *
 * Heat available per cord depends almost entirely on density, because oven-dry
 * wood of every species releases close to the same heat per pound. At the 20%
 * moisture content of properly seasoned firewood, usable heat is about
 * 6,400 BTU per pound, so:
 *
 *     pounds per cord = million BTU per cord x 1,000,000 / 6,400
 *
 * which reproduces published seasoned cord weights closely (red oak works out
 * at 3,750 lb against a published figure near 3,760 lb).
 *
 * Cords needed = delivered heat demand / (MMBtu per cord x appliance efficiency).
 */

/** A full cord is 128 cubic feet of stacked wood. */
export const CUBIC_FEET_PER_CORD = 128;
/** 1 cubic foot = 0.0283168 m³, so a cord is 3.6246 m³. */
export const M3_PER_CUBIC_FOOT = 0.0283168;
/** 1 pound = 0.45359237 kg exactly. */
export const KG_PER_POUND = 0.45359237;
/** 1 foot = 12 inches. */
export const INCHES_PER_FOOT = 12;

/** Usable heat from seasoned wood at 20% moisture content, BTU per pound. */
export const BTU_PER_POUND_AT_20PCT = 6400;

/** 1 million BTU = 293.071 kWh = 1.055056 GJ. */
export const KWH_PER_MMBTU = 293.071;
export const GJ_PER_MMBTU = 1.055056;

/**
 * Heat content of a full cord of seasoned wood at 20% moisture content, in
 * million BTU. These are the values published in university extension
 * firewood-value tables (Wisconsin, Utah State and similar).
 */
export const SPECIES = {
  osageOrange: { key: "osageOrange", label: "Osage orange", mmbtuPerCord: 32.9 },
  hickory: { key: "hickory", label: "Shagbark hickory", mmbtuPerCord: 27.7 },
  whiteOak: { key: "whiteOak", label: "White oak", mmbtuPerCord: 26.4 },
  beech: { key: "beech", label: "Beech", mmbtuPerCord: 24.0 },
  sugarMaple: { key: "sugarMaple", label: "Sugar maple", mmbtuPerCord: 24.0 },
  redOak: { key: "redOak", label: "Red oak", mmbtuPerCord: 24.0 },
  yellowBirch: { key: "yellowBirch", label: "Yellow birch", mmbtuPerCord: 23.6 },
  whiteAsh: { key: "whiteAsh", label: "White ash", mmbtuPerCord: 23.6 },
  douglasFir: { key: "douglasFir", label: "Douglas fir", mmbtuPerCord: 20.7 },
  redMaple: { key: "redMaple", label: "Red maple", mmbtuPerCord: 18.6 },
  whitePine: { key: "whitePine", label: "White pine", mmbtuPerCord: 15.9 },
  spruce: { key: "spruce", label: "Spruce", mmbtuPerCord: 15.0 },
  aspen: { key: "aspen", label: "Aspen / poplar", mmbtuPerCord: 14.7 },
  cedar: { key: "cedar", label: "Cedar", mmbtuPerCord: 13.0 },
};

/**
 * Appliance efficiency — the share of the wood's heat that reaches the room.
 * An open fireplace loses most of it up the chimney; a modern certified stove
 * is tested to EPA methods at far higher efficiency.
 */
export const APPLIANCES = {
  openFireplace: { key: "openFireplace", label: "Open masonry fireplace", efficiency: 0.12 },
  insert: { key: "insert", label: "Fireplace insert", efficiency: 0.55 },
  outdoorFurnace: { key: "outdoorFurnace", label: "Outdoor wood furnace / boiler", efficiency: 0.5 },
  noncatStove: { key: "noncatStove", label: "EPA-certified non-catalytic stove", efficiency: 0.7 },
  catStove: { key: "catStove", label: "Catalytic wood stove", efficiency: 0.78 },
  masonryHeater: { key: "masonryHeater", label: "Masonry heater", efficiency: 0.8 },
};

const round = (value, decimals = 0) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/** Convert a heat demand into million BTU. */
export function toMMBtu(value, unit) {
  if (unit === "mmbtu") return value;
  if (unit === "kwh") return value / KWH_PER_MMBTU;
  if (unit === "gj") return value / GJ_PER_MMBTU;
  return NaN;
}

/**
 * Work out firewood needed for a season.
 *
 * @param {object} input
 * @param {"demand"|"burn"} input.basis    size from a heat demand or from burn habit
 * @param {number|string} input.heatDemand delivered heat needed for the season
 * @param {"mmbtu"|"kwh"|"gj"} input.demandUnit
 * @param {number|string} input.hoursPerDay burning hours per day, when basis is "burn"
 * @param {number|string} input.seasonDays  days in the heating season
 * @param {number|string} input.burnRateKgH kilograms of wood burned per hour
 * @param {string} input.species            key of SPECIES
 * @param {string} input.appliance          key of APPLIANCES
 * @param {number|string} input.logLengthIn stacked log length (stack depth) in inches
 * @param {number|string} input.stackHeightFt stack height in feet
 * @param {number|string} input.pricePerCord delivered price of one cord
 * @returns {object} firewood result, or { error } for invalid input
 */
export function calculateFirewood({
  basis = "demand",
  heatDemand = 60,
  demandUnit = "mmbtu",
  hoursPerDay = 6,
  seasonDays = 120,
  burnRateKgH = 2,
  species = "redOak",
  appliance = "noncatStove",
  logLengthIn = 16,
  stackHeightFt = 4,
  pricePerCord = 300,
}) {
  const wood = SPECIES[species];
  if (!wood) return { error: "Choose one of the listed firewood species." };

  const unit = APPLIANCES[appliance];
  if (!unit) return { error: "Choose one of the listed burning appliances." };

  const logLen = toNumber(logLengthIn);
  const stackH = toNumber(stackHeightFt);
  const price = toNumber(pricePerCord);

  if ([logLen, stackH, price].some((v) => Number.isNaN(v))) {
    return { error: "Enter valid numbers for log length, stack height and price." };
  }
  if (logLen < 8 || logLen > 48) {
    return { error: "Log length should be between 8 and 48 inches." };
  }
  if (stackH <= 0 || stackH > 8) {
    return { error: "Stack height must be between 0 and 8 feet — taller stacks topple." };
  }
  if (price < 0) return { error: "Price per cord cannot be negative." };

  const mmbtuPerCord = wood.mmbtuPerCord;
  const poundsPerCord = (mmbtuPerCord * 1e6) / BTU_PER_POUND_AT_20PCT;

  let cords;
  let deliveredMMBtu;
  let basisNote;

  if (basis === "demand") {
    const demand = toNumber(heatDemand);
    if (Number.isNaN(demand)) return { error: "Enter the heat demand as a number." };
    if (demand <= 0) return { error: "Heat demand must be greater than zero." };
    const mmbtu = toMMBtu(demand, demandUnit);
    if (Number.isNaN(mmbtu)) return { error: "Heat demand unit must be MMBtu, kWh or GJ." };
    if (mmbtu > 5000) return { error: "Above 5,000 MMBtu this is an industrial load, not a wood stove." };
    deliveredMMBtu = mmbtu;
    cords = mmbtu / (mmbtuPerCord * unit.efficiency);
    basisNote = `${round(mmbtu, 1)} MMBtu delivered ÷ (${mmbtuPerCord} MMBtu per cord × ${round(unit.efficiency * 100, 0)}% efficiency)`;
  } else if (basis === "burn") {
    const hours = toNumber(hoursPerDay);
    const days = toNumber(seasonDays);
    const rate = toNumber(burnRateKgH);
    if ([hours, days, rate].some((v) => Number.isNaN(v))) {
      return { error: "Enter valid numbers for burning hours, season length and burn rate." };
    }
    if (hours <= 0 || hours > 24) return { error: "Burning hours per day must be between 0 and 24." };
    if (days <= 0 || days > 365) return { error: "Heating season must be between 1 and 365 days." };
    if (rate <= 0 || rate > 30) return { error: "Burn rate should be between 0 and 30 kg per hour." };
    const totalKg = hours * days * rate;
    const totalPounds = totalKg / KG_PER_POUND;
    cords = totalPounds / poundsPerCord;
    deliveredMMBtu = cords * mmbtuPerCord * unit.efficiency;
    basisNote = `${round(hours, 1)} h/day × ${round(days, 0)} days × ${round(rate, 2)} kg/h = ${round(totalKg, 0)} kg of wood`;
  } else {
    return { error: "Basis must be a heat demand or a burning habit." };
  }

  const totalPounds = cords * poundsPerCord;
  const totalKg = totalPounds * KG_PER_POUND;
  const cubicFeet = cords * CUBIC_FEET_PER_CORD;
  const cubicMetres = cubicFeet * M3_PER_CUBIC_FOOT;

  // Stack geometry: length = volume / (height x depth).
  const depthFt = logLen / INCHES_PER_FOOT;
  const stackLengthFt = cubicFeet / (stackH * depthFt);
  const stackLengthM = stackLengthFt * 0.3048;

  // A face cord is 4 ft x 8 ft x log length, so 32 x depth cubic feet.
  const faceCordCubicFeet = 32 * depthFt;
  const faceCords = cubicFeet / faceCordCubicFeet;

  const totalCost = cords * price;
  const costPerDeliveredMMBtu = deliveredMMBtu > 0 ? totalCost / deliveredMMBtu : 0;

  return {
    speciesLabel: wood.label,
    applianceLabel: unit.label,
    efficiencyPercent: round(unit.efficiency * 100, 0),
    mmbtuPerCord,
    poundsPerCord: round(poundsPerCord, 0),
    kgPerCord: round(poundsPerCord * KG_PER_POUND, 0),
    basisNote,
    cords: round(cords, 2),
    faceCords: round(faceCords, 2),
    deliveredMMBtu: round(deliveredMMBtu, 1),
    deliveredKwh: round(deliveredMMBtu * KWH_PER_MMBTU, 0),
    totalPounds: round(totalPounds, 0),
    totalKg: round(totalKg, 0),
    cubicFeet: round(cubicFeet, 1),
    cubicMetres: round(cubicMetres, 2),
    stackLengthFt: round(stackLengthFt, 1),
    stackLengthM: round(stackLengthM, 1),
    stackHeightFt: stackH,
    logLengthIn: logLen,
    totalCost: round(totalCost, 2),
    costPerDeliveredMMBtu: round(costPerDeliveredMMBtu, 2),
  };
}
