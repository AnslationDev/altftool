/**
 * Shower vs bucket bath: water, water heating energy and cost.
 *
 * WATER — a shower uses (flow rate in litres per minute) x (minutes running).
 * A bucket bath uses (buckets) x (litres per bucket). Nothing more to it; the
 * whole difference between the two is time under a running head.
 *
 * HEATING ENERGY — sensible heat:  Q = m x c x dT
 *   m  = litres delivered (1 litre of water = 1 kg to within 0.3% at bath
 *        temperatures, so litres and kilograms are used interchangeably)
 *   c  = 4.186 kJ/(kg K), the specific heat capacity of liquid water
 *   dT = bath temperature minus the cold inlet temperature
 * 1 kWh = 3600 kJ, so kWh = litres x 4.186 x dT / 3600.
 *
 * Heating the WHOLE delivered volume through dT is the correct energy figure
 * even when hot water is mixed with cold at the tap: the enthalpy of a mixture
 * delivered at dT above inlet equals the enthalpy of heating all of it by dT.
 *
 * The result is divided by the water heater's efficiency. An electric storage
 * geyser converts electricity to heat at essentially 100%, but standing losses
 * through the tank over a day bring the useful figure down to roughly 85-92%,
 * which is why 90% is the default here.
 */

/** Specific heat capacity of liquid water, kJ per kg per kelvin. */
export const SPECIFIC_HEAT_WATER_KJ = 4.186;

/** 1 kWh = 3600 kJ, by definition. */
export const KJ_PER_KWH = 3600;

/** 1 kilolitre = 1000 litres. */
export const LITRES_PER_KILOLITRE = 1000;

/** Measured discharge of common shower fittings, litres per minute. */
export const SHOWER_PRESETS = [
  {
    id: "aerated",
    label: "Low-flow aerated head",
    lpm: 6,
    note: "Close to the WaterSense limit of 2.0 US gallons per minute (7.6 L/min).",
  },
  { id: "hand", label: "Hand shower", lpm: 9, note: "Typical Indian hand shower on mains pressure." },
  { id: "overhead", label: "Overhead shower", lpm: 12, note: "Standard fixed overhead rose." },
  { id: "rain", label: "Rain shower", lpm: 20, note: "Large-face rain head on a pressure pump." },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Energy in kWh needed to raise `litres` of water by `deltaT` kelvin. */
export function heatingKwh(litres, deltaT, efficiencyPct) {
  if (!(litres > 0) || !(deltaT > 0) || !(efficiencyPct > 0)) return 0;
  const useful = (litres * SPECIFIC_HEAT_WATER_KJ * deltaT) / KJ_PER_KWH;
  return useful / (efficiencyPct / 100);
}

/**
 * @param {object} input
 * @param {number} input.showerFlowLpm     shower head discharge, L/min
 * @param {number} input.showerMinutes     minutes the shower runs
 * @param {number} input.buckets           buckets used for a bucket bath
 * @param {number} input.bucketLitres      litres per bucket
 * @param {number} input.inletTempC        cold water inlet temperature
 * @param {number} input.bathTempC         temperature water is used at
 * @param {number} input.heaterEfficiency  water heater efficiency, percent
 * @param {number} input.tariffPerKwh      electricity tariff per kWh
 * @param {number} input.waterRatePerKl    water cost per kilolitre
 * @param {number} input.people            people bathing
 * @param {number} input.bathsPerDay       baths each person takes per day
 */
export function compareBathing({
  showerFlowLpm,
  showerMinutes,
  buckets,
  bucketLitres,
  inletTempC,
  bathTempC,
  heaterEfficiency,
  tariffPerKwh = 0,
  waterRatePerKl = 0,
  people = 1,
  bathsPerDay = 1,
}) {
  const values = [
    showerFlowLpm,
    showerMinutes,
    buckets,
    bucketLitres,
    inletTempC,
    bathTempC,
    heaterEfficiency,
    tariffPerKwh,
    waterRatePerKl,
    people,
    bathsPerDay,
  ];
  if (!values.every(isNum)) return { error: "Enter a valid number in every field." };
  if (showerFlowLpm <= 0) return { error: "Shower flow rate must be greater than zero." };
  if (showerFlowLpm > 60) return { error: "A shower flow above 60 L/min is not a domestic fitting." };
  if (showerMinutes <= 0) return { error: "Shower time must be greater than zero minutes." };
  if (showerMinutes > 120) return { error: "Enter a shower time of 120 minutes or less." };
  if (buckets <= 0) return { error: "Enter at least one bucket for the bucket bath." };
  if (bucketLitres <= 0) return { error: "Bucket size must be greater than zero litres." };
  if (bucketLitres > 100) return { error: "A bucket above 100 litres is not a bathing bucket." };
  if (inletTempC < 0 || inletTempC > 60) return { error: "Inlet temperature must be between 0 and 60 °C." };
  if (bathTempC < inletTempC) {
    return { error: "Bath temperature cannot be below the cold inlet temperature." };
  }
  if (bathTempC > 60) return { error: "Water above 60 °C scalds skin in seconds — keep it below 60 °C." };
  if (heaterEfficiency <= 0 || heaterEfficiency > 100) {
    return { error: "Heater efficiency must be between 1% and 100%." };
  }
  if (tariffPerKwh < 0 || waterRatePerKl < 0) return { error: "Rates cannot be negative." };
  if (people < 1) return { error: "There must be at least one person bathing." };
  if (bathsPerDay <= 0) return { error: "Baths per day must be greater than zero." };

  const deltaT = bathTempC - inletTempC;
  const showerLitres = showerFlowLpm * showerMinutes;
  const bucketBathLitres = buckets * bucketLitres;

  const build = (litres) => {
    const kwh = heatingKwh(litres, deltaT, heaterEfficiency);
    const energyCost = kwh * tariffPerKwh;
    const waterCost = (litres / LITRES_PER_KILOLITRE) * waterRatePerKl;
    return {
      litres,
      kwh,
      energyCost,
      waterCost,
      totalCost: energyCost + waterCost,
    };
  };

  const shower = build(showerLitres);
  const bucket = build(bucketBathLitres);

  const bathsPerHousehold = people * bathsPerDay;
  const scale = (per, count) => ({
    litres: per.litres * count,
    kwh: per.kwh * count,
    energyCost: per.energyCost * count,
    waterCost: per.waterCost * count,
    totalCost: per.totalCost * count,
  });

  const showerDaily = scale(shower, bathsPerHousehold);
  const bucketDaily = scale(bucket, bathsPerHousehold);
  const showerMonthly = scale(shower, bathsPerHousehold * 30);
  const bucketMonthly = scale(bucket, bathsPerHousehold * 30);
  const showerYearly = scale(shower, bathsPerHousehold * 365);
  const bucketYearly = scale(bucket, bathsPerHousehold * 365);

  const litresSavedPerBath = showerLitres - bucketBathLitres;
  const savingSharePct = showerLitres > 0 ? (litresSavedPerBath / showerLitres) * 100 : 0;

  // Minutes of shower that use the same water as one bucket bath.
  const equivalentShowerMinutes = bucketBathLitres / showerFlowLpm;

  const notes = [];
  if (deltaT === 0) {
    notes.push("Bath temperature equals the inlet temperature, so no heating energy is counted.");
  }
  if (litresSavedPerBath < 0) {
    notes.push("At these settings the bucket bath uses more water than the shower.");
  }
  if (bathTempC > 50) {
    notes.push("Above 50 °C water can scald — most geysers are set between 45 °C and 50 °C.");
  }

  return {
    deltaT,
    shower,
    bucket,
    showerDaily,
    bucketDaily,
    showerMonthly,
    bucketMonthly,
    showerYearly,
    bucketYearly,
    litresSavedPerBath,
    savingSharePct,
    equivalentShowerMinutes,
    litresSavedPerYear: showerYearly.litres - bucketYearly.litres,
    costSavedPerYear: showerYearly.totalCost - bucketYearly.totalCost,
    bathsPerHousehold,
    notes,
  };
}
