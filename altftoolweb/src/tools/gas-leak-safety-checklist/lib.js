/**
 * Gas leak safety: how a domestic LPG or PNG leak builds up, and what to do.
 *
 * Two pieces of physics decide everything about a household gas leak.
 *
 * 1. Density relative to air. LPG (propane/butane) is heavier than air, so it
 *    sinks, pools at floor level and collects in basements, lift pits and
 *    drains. PNG (natural gas, mostly methane) is lighter than air and rises
 *    to the ceiling and out of a high window. That single difference changes
 *    where you smell it, where a detector goes, and where the danger sits.
 *
 * 2. The flammable range. A gas only ignites between its Lower Explosive
 *    Limit (LEL) and Upper Explosive Limit (UEL), expressed as % of the air by
 *    volume. Below the LEL the mixture is too lean to burn; above the UEL it
 *    is too rich. Published limits at ambient temperature and pressure:
 *
 *      Methane  LEL 5.0 %   UEL 15.0 %
 *      Propane  LEL 2.1 %   UEL  9.5 %
 *      Butane   LEL 1.8 %   UEL  8.4 %
 *
 *    For a blend, the limits are combined with Le Chatelier's mixing rule,
 *    1 / L_mix = sum( x_i / L_i ), where x_i are the mole fractions. That is
 *    how the commercial LPG figures below are derived rather than guessed.
 *
 * The build-up model is the standard single-zone, well-mixed room mass
 * balance used in ventilation engineering:
 *
 *    steady state   C_ss = Q_gas / (ACH * V_room)
 *    over time      C(t) = C_ss * (1 - e^(-ACH * t))
 *    with no air change (ACH = 0)   C(t) = Q_gas * t / V_room
 *
 * It assumes the gas mixes evenly through the room, which is optimistic for
 * LPG — in reality a heavier-than-air gas forms a much richer layer near the
 * floor and reaches its LEL there long before the room average does.
 *
 * Informational only. It is not a substitute for a certified gas engineer or
 * your supplier's emergency service.
 */

/**
 * Molar volume of an ideal gas at 25 C and 101.325 kPa, in litres per mole:
 * RT/P = 8.314 x 298.15 / 101325 = 0.024465 m3/mol.
 */
export const MOLAR_VOLUME_L_PER_MOL = 24.465;

/** Density of dry air at 25 C, kg/m3, for the relative-density figures. */
export const AIR_DENSITY_KG_M3 = 1.184;

/**
 * Pure components. Molar mass in g/mol, explosive limits in % by volume in
 * air at ambient conditions, vapour relative density against air = 1.
 */
export const COMPONENTS = {
  methane: { label: "Methane", molarMass: 16.043, lel: 5.0, uel: 15.0, relativeDensity: 0.55 },
  propane: { label: "Propane", molarMass: 44.096, lel: 2.1, uel: 9.5, relativeDensity: 1.55 },
  butane: { label: "Butane", molarMass: 58.122, lel: 1.8, uel: 8.4, relativeDensity: 2.07 },
};

/**
 * Combine explosive limits for a mixture using Le Chatelier's rule:
 * 1 / L_mix = sum( x_i / L_i ) with x_i the mole fractions.
 *
 * @param {Array<{key: string, fraction: number}>} parts mole fractions, summing to 1.
 */
export function mixtureLimits(parts) {
  if (!Array.isArray(parts) || parts.length === 0) return null;
  let sumLel = 0;
  let sumUel = 0;
  let molarMass = 0;
  let relativeDensity = 0;
  let total = 0;
  for (const part of parts) {
    const component = COMPONENTS[part.key];
    if (!component || !Number.isFinite(part.fraction) || part.fraction < 0) return null;
    sumLel += part.fraction / component.lel;
    sumUel += part.fraction / component.uel;
    molarMass += part.fraction * component.molarMass;
    relativeDensity += part.fraction * component.relativeDensity;
    total += part.fraction;
  }
  if (total <= 0 || sumLel <= 0 || sumUel <= 0) return null;
  return {
    lel: 1 / sumLel,
    uel: 1 / sumUel,
    molarMass: molarMass / total,
    relativeDensity: relativeDensity / total,
  };
}

const lpgMix = mixtureLimits([
  { key: "butane", fraction: 0.6 },
  { key: "propane", fraction: 0.4 },
]);

/**
 * The gases a household actually meets.
 * Commercial domestic LPG is taken as 60% butane / 40% propane by mole, a
 * representative blend; its limits are computed with Le Chatelier above.
 */
export const GASES = {
  lpg: {
    id: "lpg",
    label: "LPG cylinder (butane/propane blend)",
    short: "LPG",
    molarMass: lpgMix.molarMass,
    lel: lpgMix.lel,
    uel: lpgMix.uel,
    relativeDensity: lpgMix.relativeDensity,
    heavierThanAir: true,
    note: "Heavier than air. It sinks, pools at floor level and runs into basements, drains and lift pits.",
  },
  png: {
    id: "png",
    label: "PNG / natural gas (methane)",
    short: "PNG",
    molarMass: COMPONENTS.methane.molarMass,
    lel: COMPONENTS.methane.lel,
    uel: COMPONENTS.methane.uel,
    relativeDensity: COMPONENTS.methane.relativeDensity,
    heavierThanAir: false,
    note: "Lighter than air. It rises to the ceiling and will vent through a high window or open door.",
  },
  propane: {
    id: "propane",
    label: "Propane only",
    short: "Propane",
    molarMass: COMPONENTS.propane.molarMass,
    lel: COMPONENTS.propane.lel,
    uel: COMPONENTS.propane.uel,
    relativeDensity: COMPONENTS.propane.relativeDensity,
    heavierThanAir: true,
    note: "Heavier than air, and the usual gas in caravan, barbecue and forklift cylinders.",
  },
  butane: {
    id: "butane",
    label: "Butane only",
    short: "Butane",
    molarMass: COMPONENTS.butane.molarMass,
    lel: COMPONENTS.butane.lel,
    uel: COMPONENTS.butane.uel,
    relativeDensity: COMPONENTS.butane.relativeDensity,
    heavierThanAir: true,
    note: "The heaviest of the domestic fuels and the slowest to disperse from a floor-level pool.",
  },
};

/** Typical domestic cylinder net gas masses, in kilograms. */
export const CYLINDER_SIZES = [
  { label: "Domestic 14.2 kg", kg: 14.2 },
  { label: "Small 5 kg", kg: 5 },
  { label: "Commercial 19 kg", kg: 19 },
  { label: "Commercial 47.5 kg", kg: 47.5 },
];

/**
 * Detector mounting heights. A detector for a heavier-than-air gas goes low,
 * one for a lighter-than-air gas goes high, because that is where the gas
 * collects before the room average means anything.
 */
export const DETECTOR_PLACEMENT = {
  heavy: "Mount 15 to 30 cm above the floor, within about 3 m of the appliance, and not behind furniture.",
  light: "Mount 15 to 30 cm below the ceiling, within about 3 m of the appliance, and away from the airflow of a window or fan.",
};

/** The response sequence, in the order it must actually happen. */
export const RESPONSE_STEPS = [
  {
    step: "Do not touch any electrical switch, plug, doorbell or phone in the room",
    why: "A switch contact arcs as it makes or breaks. That spark is an ignition source, and turning a light off is just as dangerous as turning it on.",
  },
  {
    step: "Put out every flame — stove, lamp, incense, cigarette",
    why: "A pilot light or a burner left on low is a continuous ignition source sitting in the room the gas is filling.",
  },
  {
    step: "Turn off the regulator knob, then close the cylinder valve or the meter's main valve",
    why: "Stopping the source is what ends the incident. Everything else only buys time.",
  },
  {
    step: "Open all doors and windows to cross-ventilate",
    why: "Ventilation is the only way to get the room back below the lower explosive limit. Open at low level too for LPG, since it sits on the floor.",
  },
  {
    step: "Get everyone out and stay out, including from the floor below if it is LPG",
    why: "LPG runs downhill into stairwells, basements and lift pits, so the danger can be one floor below the leak.",
  },
  {
    step: "Call the supplier's emergency number from outside the building",
    why: "In India that is the 24-hour LPG emergency helpline 1906, which also covers piped natural gas. Ring it from outside, not from the room.",
  },
  {
    step: "Do not restart the appliance until the source has been found and fixed",
    why: "A leak that stopped when the cylinder emptied has not been repaired. Have the regulator, hose and appliance checked before relighting.",
  },
];

/** What not to do, and why the instinctive response is often the wrong one. */
export const NEVER_DO = [
  {
    action: "Never look for a leak with a lighter, match or candle",
    why: "Use a brush of soapy water on the joints instead — bubbles mark the leak. This is the only home test that is safe.",
  },
  {
    action: "Never store an LPG cylinder in a basement, below ground or under a stair",
    why: "The gas is heavier than air, so a leak in a below-ground space has nowhere to drain to and simply fills the space from the floor up.",
  },
  {
    action: "Never lay a cylinder on its side or invert it to get the last of the gas",
    why: "The valve and pressure relief are designed for vapour withdrawal. Tipping it lets liquid reach the regulator, which then passes many times the intended flow.",
  },
  {
    action: "Never run an extension hose or a hose that is cracked, sticky or past its date",
    why: "Replace at the interval printed on the tube — commonly two years for a plain rubber hose and five for a reinforced Suraksha-type one.",
  },
  {
    action: "Never leave the burner knob on overnight, even when the flame is out",
    why: "The regulator knob is the one to close after cooking. A knocked burner knob with the regulator open leaks straight into a closed kitchen.",
  },
];

/** Warning signs of a leak or of incomplete combustion. */
export const WARNING_SIGNS = [
  {
    sign: "Rotten-egg or garlic smell",
    meaning:
      "That is ethyl mercaptan, the odorant added deliberately because both LPG and natural gas are odourless. It is detectable far below the lower explosive limit, which is the point of adding it.",
  },
  {
    sign: "Hissing near the regulator, hose or meter",
    meaning: "An audible leak is a large one. Shut the valve and evacuate before investigating.",
  },
  {
    sign: "A yellow or orange flame instead of a crisp blue one",
    meaning:
      "Incomplete combustion, usually a blocked burner port or too little air. It wastes gas and produces carbon monoxide.",
  },
  {
    sign: "Soot marks around the burner or on the base of pans",
    meaning: "The same incomplete combustion, recorded over weeks. Have the burner serviced.",
  },
  {
    sign: "Headache, nausea or drowsiness that clears when you leave the kitchen",
    meaning:
      "A possible carbon monoxide symptom. Ventilate, leave, and get medical advice — CO is odourless and the mercaptan warning does not apply to it.",
  },
  {
    sign: "The cylinder empties much faster than usual",
    meaning: "A slow leak still consumes gas. Compare against your normal refill interval.",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const MAX_ROOM_M3 = 5000;
const MAX_LEAK_G_PER_H = 100000;
const MAX_ACH = 30;

/** Convert a mass of gas, in grams, to its vapour volume in litres at 25 C. */
export function gramsToVapourLitres(grams, molarMass) {
  if (!isNum(grams) || !isNum(molarMass) || grams < 0 || molarMass <= 0) return null;
  return (grams / molarMass) * MOLAR_VOLUME_L_PER_MOL;
}

/**
 * Model a leak into a room.
 *
 * @param {object} input
 * @param {string} input.gasId          Key of GASES.
 * @param {number} input.lengthM        Room length in metres.
 * @param {number} input.widthM         Room width in metres.
 * @param {number} input.heightM        Room height in metres.
 * @param {number} input.leakGramsPerHour Leak rate in grams per hour.
 * @param {number} [input.airChangesPerHour] Ventilation, room volumes per hour.
 * @param {number} [input.cylinderKg]   Cylinder contents, for the worst case.
 */
export function modelGasLeak({
  gasId = "lpg",
  lengthM,
  widthM,
  heightM,
  leakGramsPerHour,
  airChangesPerHour = 0,
  cylinderKg = 14.2,
} = {}) {
  const gas = GASES[gasId];
  if (!gas) return { error: "Choose LPG, PNG, propane or butane." };
  if (![lengthM, widthM, heightM, leakGramsPerHour, airChangesPerHour].every(isNum)) {
    return { error: "Enter valid numbers for the room size, leak rate and ventilation." };
  }
  if (lengthM <= 0 || widthM <= 0 || heightM <= 0) {
    return { error: "Room length, width and height must all be greater than zero." };
  }
  const roomVolumeM3 = lengthM * widthM * heightM;
  if (roomVolumeM3 > MAX_ROOM_M3) {
    return { error: `Room volume of ${Math.round(roomVolumeM3)} m³ is beyond this model — it is meant for domestic rooms.` };
  }
  if (leakGramsPerHour <= 0) {
    return { error: "Enter a leak rate greater than zero grams per hour." };
  }
  if (leakGramsPerHour > MAX_LEAK_G_PER_H) {
    return { error: "Leak rate is beyond a domestic range. Use grams per hour, not grams per minute." };
  }
  if (airChangesPerHour < 0 || airChangesPerHour > MAX_ACH) {
    return { error: `Air changes per hour should be between 0 and ${MAX_ACH}.` };
  }
  if (!isNum(cylinderKg) || cylinderKg < 0) {
    return { error: "Cylinder contents must be zero or more kilograms." };
  }

  // Volumetric leak rate, m3 of vapour per hour.
  const gasVolumeM3PerHour = gramsToVapourLitres(leakGramsPerHour, gas.molarMass) / 1000;

  const lelFraction = gas.lel / 100;
  const uelFraction = gas.uel / 100;

  let steadyStatePct = null;
  let hoursToLel = null;
  let hoursToUel = null;
  let reachesLel;

  if (airChangesPerHour > 0) {
    const dilutionM3PerHour = airChangesPerHour * roomVolumeM3;
    const ssFraction = gasVolumeM3PerHour / dilutionM3PerHour;
    steadyStatePct = ssFraction * 100;
    reachesLel = ssFraction > lelFraction;
    if (reachesLel) {
      hoursToLel = -Math.log(1 - lelFraction / ssFraction) / airChangesPerHour;
      if (ssFraction > uelFraction) {
        hoursToUel = -Math.log(1 - uelFraction / ssFraction) / airChangesPerHour;
      }
    }
  } else {
    reachesLel = true;
    hoursToLel = (lelFraction * roomVolumeM3) / gasVolumeM3PerHour;
    hoursToUel = (uelFraction * roomVolumeM3) / gasVolumeM3PerHour;
  }

  // Whole-cylinder worst case, released into the same sealed room.
  const cylinderVapourM3 = gramsToVapourLitres(cylinderKg * 1000, gas.molarMass) / 1000;
  const cylinderPct = (cylinderVapourM3 / roomVolumeM3) * 100;
  const cylinderVerdict =
    cylinderPct > gas.uel
      ? "Above the upper explosive limit — the room average would be too rich to burn, but every doorway and window where it meets fresh air passes through the flammable range."
      : cylinderPct > gas.lel
        ? "Inside the flammable range. A full cylinder emptied into this room would produce an explosive atmosphere."
        : "Below the lower explosive limit even if the whole cylinder emptied into this room, assuming it mixed evenly.";

  const massToLelGrams =
    (lelFraction * roomVolumeM3 * 1000 * gas.molarMass) / MOLAR_VOLUME_L_PER_MOL;

  let verdict;
  if (!reachesLel) {
    verdict = `At ${airChangesPerHour} air changes an hour the room settles at about ${steadyStatePct.toFixed(3)} % gas, below the ${gas.lel.toFixed(1)} % lower explosive limit. Ventilation is winning — but only while the window stays open.`;
  } else if (hoursToLel < 1) {
    verdict = `The room reaches its lower explosive limit in about ${Math.round(hoursToLel * 60)} minutes. That is a leak to act on immediately, not to investigate.`;
  } else {
    verdict = `The room reaches its lower explosive limit in about ${hoursToLel.toFixed(1)} hours with the doors and windows as they are.`;
  }

  return {
    gas,
    roomVolumeM3,
    gasVolumeM3PerHour,
    litresPerHour: gasVolumeM3PerHour * 1000,
    airChangesPerHour,
    steadyStatePct,
    reachesLel,
    hoursToLel,
    minutesToLel: hoursToLel === null ? null : hoursToLel * 60,
    hoursToUel,
    massToLelGrams,
    cylinderKg,
    cylinderVapourM3,
    cylinderPct,
    cylinderVerdict,
    detectorAdvice: gas.heavierThanAir ? DETECTOR_PLACEMENT.heavy : DETECTOR_PLACEMENT.light,
    verdict,
  };
}
