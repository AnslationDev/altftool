/**
 * Dishwasher vs hand-washing running-cost model.
 *
 * Dishwasher side
 *  The energy and water printed on the appliance label are already per cycle
 *  and already include the machine heating its own water, so a cycle costs
 *    kWh_cycle x tariff  +  litres_cycle / 1000 x water_price_per_kL  +  detergent.
 *
 * Hand-washing side
 *  Water volume  = tap flow rate (L/min) x minutes at the tap.
 *  Heating energy uses the specific heat of water:
 *    Q (kJ) = mass (kg) x c x deltaT,  c = 4.186 kJ/(kg.K), 1 L of water = 1 kg
 *    kWh    = Q / 3600, then divided by the water heater's efficiency.
 *  Only the share of water drawn hot is heated. Time is priced at whatever
 *  value you put on an hour of your own labour (zero by default).
 *
 * Cycle figures below are typical values from EU energy-label declarations for
 * a full-size 60 cm dishwasher; enter your own model's label numbers for an
 * exact answer.
 */

export const DAYS_PER_MONTH = 365 / 12;
export const DAYS_PER_YEAR = 365;

/** Specific heat capacity of liquid water, kJ per kg per kelvin. */
export const WATER_SPECIFIC_HEAT_KJ_PER_KG_K = 4.186;
/** 1 kWh = 3600 kJ. */
export const KJ_PER_KWH = 3600;
/** Water density used to convert litres to kilograms. */
export const KG_PER_LITRE = 1;

/** Typical per-cycle label figures for a full-size dishwasher. */
export const PROGRAMS = [
  { id: "eco", label: "Eco (label programme)", kwh: 0.83, litres: 9.5 },
  { id: "auto", label: "Auto / normal", kwh: 1.05, litres: 12 },
  { id: "intensive", label: "Intensive / pots", kwh: 1.45, litres: 16 },
  { id: "quick", label: "Quick 30-60 min", kwh: 0.75, litres: 11 },
];

export const MIN_TEMP_C = 0;
export const MAX_TEMP_C = 100;

const num = (value) => {
  if (value === "" || value === null || value === undefined) return Number.NaN;
  const n = Number(value);
  return Number.isFinite(n) ? n : Number.NaN;
};

/**
 * Electrical energy needed to raise `litres` of water by `deltaC` kelvin.
 * @returns {number} kilowatt-hours at the socket.
 */
export function waterHeatingKwh(litres, deltaC, efficiency = 1) {
  if (!(litres > 0) || !(deltaC > 0) || !(efficiency > 0)) return 0;
  const kj = litres * KG_PER_LITRE * WATER_SPECIFIC_HEAT_KJ_PER_KG_K * deltaC;
  return kj / KJ_PER_KWH / efficiency;
}

/**
 * @param {object} input
 * @param {string} input.programId       PROGRAMS id (ignored if custom figures given).
 * @param {number} [input.cycleKwh]      Override kWh per dishwasher cycle.
 * @param {number} [input.cycleLitres]   Override litres per dishwasher cycle.
 * @param {number} input.detergentCost   Tablet or powder cost per cycle.
 * @param {number} input.tapFlowLpm      Kitchen tap flow rate, litres per minute.
 * @param {number} input.handMinutes     Minutes spent at the running tap.
 * @param {number} input.hotSharePct     Percent of hand-wash water drawn hot.
 * @param {number} input.coldInletC      Cold supply temperature, Celsius.
 * @param {number} input.hotWaterC       Washing-up water temperature, Celsius.
 * @param {number} input.heaterEfficiency Water heater efficiency, 0-1.
 * @param {number} input.soapCost        Dish soap cost per hand wash.
 * @param {number} input.tariff          Electricity price per kWh.
 * @param {number} input.waterPricePerKl Water price per 1000 litres.
 * @param {number} input.hourlyValue     Value you put on an hour of your time.
 * @param {number} input.cyclesPerWeek   Loads washed per week.
 * @returns {object} result or { error }
 */
export function compareDishwashing({
  programId = "eco",
  cycleKwh = null,
  cycleLitres = null,
  detergentCost,
  tapFlowLpm,
  handMinutes,
  hotSharePct,
  coldInletC,
  hotWaterC,
  heaterEfficiency,
  soapCost,
  tariff,
  waterPricePerKl,
  hourlyValue,
  cyclesPerWeek,
}) {
  const program = PROGRAMS.find((p) => p.id === programId);
  if (!program) return { error: "Choose a dishwasher programme." };

  const kwhCycle = cycleKwh === null || cycleKwh === "" ? program.kwh : num(cycleKwh);
  const litresCycle = cycleLitres === null || cycleLitres === "" ? program.litres : num(cycleLitres);
  const detergent = num(detergentCost);
  const flow = num(tapFlowLpm);
  const minutes = num(handMinutes);
  const hotShare = num(hotSharePct);
  const cold = num(coldInletC);
  const hot = num(hotWaterC);
  const eff = num(heaterEfficiency);
  const soap = num(soapCost);
  const rate = num(tariff);
  const waterPrice = num(waterPricePerKl);
  const hourly = num(hourlyValue);
  const perWeek = num(cyclesPerWeek);

  const all = [kwhCycle, litresCycle, detergent, flow, minutes, hotShare, cold, hot, eff, soap, rate, waterPrice, hourly, perWeek];
  if (all.some((v) => Number.isNaN(v))) return { error: "Enter a number in every field." };
  if (kwhCycle < 0 || litresCycle < 0) return { error: "Cycle energy and water cannot be negative." };
  if (kwhCycle > 10) return { error: "A dishwasher cycle above 10 kWh is out of range — check the label figure." };
  if (detergent < 0 || soap < 0 || hourly < 0 || waterPrice < 0) {
    return { error: "Prices cannot be negative." };
  }
  if (flow < 0 || flow > 60) return { error: "Tap flow should be between 0 and 60 litres per minute." };
  if (minutes < 0 || minutes > 240) return { error: "Hand-wash time should be between 0 and 240 minutes." };
  if (hotShare < 0 || hotShare > 100) return { error: "Hot-water share must be between 0% and 100%." };
  if (cold < MIN_TEMP_C || cold > MAX_TEMP_C || hot < MIN_TEMP_C || hot > MAX_TEMP_C) {
    return { error: "Water temperatures must be between 0degC and 100degC." };
  }
  if (hot < cold) return { error: "Washing-up water cannot be colder than the cold supply." };
  if (!(eff > 0) || eff > 1) return { error: "Water heater efficiency must be above 0 and at most 1." };
  if (rate <= 0) return { error: "Electricity tariff must be greater than zero." };
  if (perWeek <= 0 || perWeek > 70) return { error: "Loads per week should be between 1 and 70." };

  // Dishwasher, per cycle
  const dwElectricity = kwhCycle * rate;
  const dwWaterCost = (litresCycle / 1000) * waterPrice;
  const dwTotal = dwElectricity + dwWaterCost + detergent;

  // Hand washing, per equivalent load
  const handLitres = flow * minutes;
  const hotLitres = handLitres * (hotShare / 100);
  const deltaC = hot - cold;
  const handKwh = waterHeatingKwh(hotLitres, deltaC, eff);
  const handElectricity = handKwh * rate;
  const handWaterCost = (handLitres / 1000) * waterPrice;
  const handTimeCost = (minutes / 60) * hourly;
  const handTotal = handElectricity + handWaterCost + soap + handTimeCost;

  const savingPerCycle = handTotal - dwTotal;
  const waterSavedPerCycle = handLitres - litresCycle;
  const energyDeltaPerCycle = handKwh - kwhCycle;

  const cyclesPerYear = perWeek * (DAYS_PER_YEAR / 7);
  const cyclesPerMonth = cyclesPerYear / 12;

  return {
    program,
    kwhCycle,
    litresCycle,
    dwElectricity,
    dwWaterCost,
    detergent,
    dwTotal,
    handLitres,
    hotLitres,
    deltaC,
    handKwh,
    handElectricity,
    handWaterCost,
    soapCost: soap,
    handWaterAndSoapCost: handWaterCost + soap,
    handTimeCost,
    handTotal,
    savingPerCycle,
    cheaperOption: savingPerCycle > 0 ? "dishwasher" : savingPerCycle < 0 ? "hand" : "tie",
    waterSavedPerCycle,
    energyDeltaPerCycle,
    cyclesPerMonth,
    cyclesPerYear,
    dwCostPerMonth: dwTotal * cyclesPerMonth,
    handCostPerMonth: handTotal * cyclesPerMonth,
    savingPerMonth: savingPerCycle * cyclesPerMonth,
    savingPerYear: savingPerCycle * cyclesPerYear,
    waterSavedPerYear: waterSavedPerCycle * cyclesPerYear,
    handHoursPerYear: (minutes / 60) * cyclesPerYear,
  };
}
