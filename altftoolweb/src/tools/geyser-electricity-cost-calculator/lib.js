/**
 * Electric water heater (geyser) running cost.
 *
 * Two separate pieces of electricity are involved:
 *
 * 1. USEFUL HEAT — raising the water you actually use from mains temperature to
 *    bath temperature. Q = m x c x dT, so
 *      kWh = litres x 4.186 kJ/kg/C x dT / 3600 / heating efficiency
 *    Mixing hot and cold at the tap does not change this: the energy in the
 *    blended water is the same either way, so the calculation works directly on
 *    litres used at bath temperature.
 *
 * 2. STANDING LOSS — a storage tank held hot loses heat to the room through the
 *    insulation whether or not you draw water. BEE labels electric storage water
 *    heaters on exactly this figure, declared in kWh per 24 hours at a 45 K
 *    difference between stored water and surrounding air.
 */

/** Specific heat capacity of water, kJ per kg per degree C. */
export const SPECIFIC_HEAT_WATER_KJ_PER_KG_C = 4.186;

/** 1 kWh = 3600 kJ. */
export const KJ_PER_KWH = 3600;

/** 1 litre of water = 1 kg. */
export const KG_PER_LITRE = 1;

/**
 * Immersion elements sit inside the water, so essentially all the electrical
 * input becomes heat in the water; the small shortfall is heat lost through the
 * tank wall while the element is running.
 */
export const HEATING_EFFICIENCY = {
  storage: 0.98,
  instant: 0.97,
};

/**
 * BEE reference standing loss for a 25 litre electric storage water heater,
 * kWh per 24 hours at the label's 45 K temperature difference. Higher star =
 * thicker insulation = less loss.
 */
export const STANDING_LOSS_25L_KWH_PER_DAY = {
  5: 0.66,
  4: 0.75,
  3: 0.86,
  2: 0.98,
  1: 1.12,
};

/** The temperature difference the BEE standing-loss figure is measured at, in K. */
export const STANDING_LOSS_REFERENCE_DELTA_K = 45;

/** Reference tank volume for the standing-loss figures above, in litres. */
export const STANDING_LOSS_REFERENCE_LITRES = 25;

/** Typical factory thermostat setting on an Indian storage geyser, in degrees C. */
export const TANK_THERMOSTAT_C = 60;

/** Typical bathroom air temperature the tank loses heat into, in degrees C. */
export const AMBIENT_AIR_C = 28;

/** A standard Indian bathing bucket. */
export const BUCKET_LITRES = 20;

/** Flow of a plain (non-aerated) overhead shower head, litres per minute. */
export const SHOWER_FLOW_LPM = 9;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Litres of water at bath temperature drawn in a day. */
export function dailyHotWaterLitres({
  bucketsPerDay = 0,
  litresPerBucket = BUCKET_LITRES,
  showersPerDay = 0,
  showerMinutes = 8,
  showerFlowLpm = SHOWER_FLOW_LPM,
  otherLitresPerDay = 0,
} = {}) {
  const buckets = bucketsPerDay * litresPerBucket;
  const showers = showersPerDay * showerMinutes * showerFlowLpm;
  return buckets + showers + otherLitresPerDay;
}

/** kWh needed to raise `litres` of water by `deltaT` degrees C at a given efficiency. */
export function heatingKwh(litres, deltaT, efficiency) {
  if (!isNum(litres) || !isNum(deltaT) || litres <= 0 || deltaT <= 0) return 0;
  if (!isNum(efficiency) || efficiency <= 0) return 0;
  return (litres * KG_PER_LITRE * SPECIFIC_HEAT_WATER_KJ_PER_KG_C * deltaT) / KJ_PER_KWH / efficiency;
}

/**
 * Standing loss for a tank of `litres` at `starRating`, for the hours it is left
 * switched on. Heat loss follows tank surface area, which grows as volume^(2/3),
 * so the 25 litre label figure is scaled by (V/25)^(2/3) and then by the real
 * temperature difference against the 45 K label condition.
 */
export function standingLossKwhPerDay({ tankLitres, starRating, hoursOnPerDay }) {
  const reference = STANDING_LOSS_25L_KWH_PER_DAY[starRating];
  if (!isNum(tankLitres) || tankLitres <= 0 || !reference) return 0;
  if (!isNum(hoursOnPerDay) || hoursOnPerDay <= 0) return 0;
  const areaScale = Math.pow(tankLitres / STANDING_LOSS_REFERENCE_LITRES, 2 / 3);
  const deltaScale = (TANK_THERMOSTAT_C - AMBIENT_AIR_C) / STANDING_LOSS_REFERENCE_DELTA_K;
  const hoursScale = Math.min(24, hoursOnPerDay) / 24;
  return reference * areaScale * Math.max(0, deltaScale) * hoursScale;
}

/**
 * Full geyser running cost. Returns { error } for input that cannot give a
 * meaningful answer.
 */
export function computeGeyserCost({
  heaterType = "storage",
  tankLitres = 25,
  starRating = 5,
  hoursOnPerDay = 2,
  bucketsPerDay = 2,
  litresPerBucket = BUCKET_LITRES,
  showersPerDay = 0,
  showerMinutes = 8,
  showerFlowLpm = SHOWER_FLOW_LPM,
  otherLitresPerDay = 10,
  usageTempC = 42,
  inletTempC = 22,
  daysPerMonth = 30,
  tariffPerKwh = 8,
} = {}) {
  if (heaterType !== "storage" && heaterType !== "instant") {
    return { error: "Choose either a storage tank or an instant water heater." };
  }

  const values = [
    tankLitres,
    hoursOnPerDay,
    bucketsPerDay,
    litresPerBucket,
    showersPerDay,
    showerMinutes,
    showerFlowLpm,
    otherLitresPerDay,
    usageTempC,
    inletTempC,
    daysPerMonth,
    tariffPerKwh,
  ];
  if (values.some((value) => !isNum(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (values.some((value) => value < 0)) {
    return { error: "None of these values can be negative." };
  }
  if (heaterType === "storage") {
    if (tankLitres <= 0) return { error: "Tank capacity must be greater than zero." };
    if (tankLitres > 500) return { error: "Domestic storage geysers are 6 to 100 litres — check the tank size." };
    if (!STANDING_LOSS_25L_KWH_PER_DAY[starRating]) {
      return { error: "Choose a BEE star rating between 1 and 5." };
    }
    if (hoursOnPerDay > 24) return { error: "A day only has 24 hours." };
  }
  if (usageTempC > 80) return { error: "Bathing water above 80 °C is a scald risk — check the temperature." };
  if (inletTempC > 60) return { error: "Inlet water temperature should be below 60 °C." };
  if (daysPerMonth <= 0 || daysPerMonth > 31) {
    return { error: "Days used per month should be between 1 and 31." };
  }
  if (tariffPerKwh <= 0) return { error: "Electricity tariff must be greater than zero." };
  if (tariffPerKwh > 100) return { error: "Check the tariff — it is entered in rupees per unit (kWh)." };

  const litresPerDay = dailyHotWaterLitres({
    bucketsPerDay,
    litresPerBucket,
    showersPerDay,
    showerMinutes,
    showerFlowLpm,
    otherLitresPerDay,
  });
  if (litresPerDay > 2000) {
    return { error: "That is over 2000 litres of hot water a day — check the usage figures." };
  }

  const efficiency = HEATING_EFFICIENCY[heaterType];
  const deltaT = Math.max(0, usageTempC - inletTempC);
  const usefulKwhPerDay = heatingKwh(litresPerDay, deltaT, efficiency);
  const lossKwhPerDay =
    heaterType === "storage"
      ? standingLossKwhPerDay({ tankLitres, starRating, hoursOnPerDay })
      : 0;

  const kwhPerDay = usefulKwhPerDay + lossKwhPerDay;
  const costPerDay = kwhPerDay * tariffPerKwh;
  const monthlyKwh = kwhPerDay * daysPerMonth;
  const annualKwh = monthlyKwh * 12;

  const costPerLitre = litresPerDay > 0 ? costPerDay / litresPerDay : 0;

  return {
    litresPerDay,
    deltaT,
    efficiency,
    usefulKwhPerDay,
    lossKwhPerDay,
    kwhPerDay,
    lossShare: kwhPerDay > 0 ? (lossKwhPerDay / kwhPerDay) * 100 : 0,
    costPerDay,
    monthlyKwh,
    monthlyCost: costPerDay * daysPerMonth,
    annualKwh,
    annualCost: costPerDay * daysPerMonth * 12,
    costPerLitre,
    costPerBucket: costPerLitre * litresPerBucket,
    costPerShowerMinute: costPerLitre * showerFlowLpm,
    tankLitres: heaterType === "storage" ? tankLitres : 0,
  };
}

/** Monthly cost against how long the geyser is left switched on each day. */
export const HOURS_ON_SCENARIOS = [0.5, 1, 2, 4, 8, 24];

export function buildHoursOnComparison(input = {}) {
  if (input.heaterType === "instant") return { rows: [] };
  const rows = [];
  for (const hours of HOURS_ON_SCENARIOS) {
    const result = computeGeyserCost({ ...input, hoursOnPerDay: hours });
    if (result.error) return { error: result.error };
    rows.push({
      hours,
      lossKwhPerDay: result.lossKwhPerDay,
      monthlyCost: result.monthlyCost,
      annualCost: result.annualCost,
    });
  }
  return { rows };
}
