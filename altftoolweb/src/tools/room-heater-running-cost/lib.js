/**
 * Room heater running cost.
 *
 * Two facts drive everything here:
 *
 * 1. Every resistive heater — fan blower, oil-filled radiator, halogen rod,
 *    carbon panel — converts electricity to heat at essentially 100%. One unit
 *    of electricity always becomes one unit of heat. So no resistive heater is
 *    "more efficient" than another; they differ only in how many hours the
 *    thermostat lets the element run.
 *
 * 2. A reverse-cycle air conditioner is not a heater, it is a heat pump. It
 *    moves heat in from outside rather than creating it, so one unit of
 *    electricity delivers roughly three units of heat. That is the only genuine
 *    efficiency difference in the list.
 */

export const WATTS_PER_KW = 1000;

/**
 * dutyCycle — share of the running hours the element is actually energised once
 *   the room is up to temperature (a thermostat cuts a radiator in and out; a
 *   halogen rod with no thermostat runs flat out).
 * cop — coefficient of performance: units of heat delivered per unit of
 *   electricity drawn. Exactly 1 for anything resistive.
 */
export const HEATER_TYPES = {
  "fan-blower": {
    id: "fan-blower",
    label: "Fan heater / blower",
    defaultWatts: 2000,
    dutyCycle: 0.9,
    cop: 1,
    note: "Heats the air fast and dries it out; the element is on nearly all the time it is switched on.",
  },
  "oil-filled": {
    id: "oil-filled",
    label: "Oil-filled radiator (OFR)",
    defaultWatts: 2000,
    dutyCycle: 0.55,
    cop: 1,
    note: "Slow to warm up, but the thermostat then cycles the element roughly half the time, so it draws less over an evening.",
  },
  halogen: {
    id: "halogen",
    label: "Halogen / quartz rod heater",
    defaultWatts: 1200,
    dutyCycle: 1,
    cop: 1,
    note: "Radiant heat you feel instantly, but with no thermostat it draws its full rating for every minute it is on.",
  },
  "carbon-panel": {
    id: "carbon-panel",
    label: "Carbon / infrared panel",
    defaultWatts: 1000,
    dutyCycle: 1,
    cop: 1,
    note: "Warms people and surfaces rather than air, so a lower wattage can feel adequate.",
  },
  "heat-pump": {
    id: "heat-pump",
    label: "Air conditioner in heat mode",
    defaultWatts: 1000,
    dutyCycle: 0.6,
    cop: 3,
    note: "A heat pump moves heat rather than making it, delivering roughly 3 kWh of warmth per kWh drawn. Efficiency falls as the outdoor temperature drops.",
  },
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Electricity drawn per day, in kWh. */
export function dailyKwh({ ratedWatts, dutyCycle, hoursPerDay, count = 1 }) {
  if (![ratedWatts, dutyCycle, hoursPerDay, count].every(isNum)) return 0;
  if (ratedWatts <= 0 || dutyCycle <= 0 || hoursPerDay <= 0 || count <= 0) return 0;
  return (ratedWatts / WATTS_PER_KW) * dutyCycle * hoursPerDay * count;
}

/**
 * Full running cost for a winter. Returns { error } for input that cannot give a
 * meaningful answer.
 */
export function computeHeaterCost({
  heaterTypeId = "fan-blower",
  ratedWatts = 2000,
  hoursPerDay = 6,
  count = 1,
  daysPerMonth = 30,
  winterMonths = 3,
  tariffPerKwh = 8,
} = {}) {
  const heater = HEATER_TYPES[heaterTypeId];
  if (!heater) return { error: "Choose a heater type from the list." };

  const values = [ratedWatts, hoursPerDay, count, daysPerMonth, winterMonths, tariffPerKwh];
  if (values.some((value) => !isNum(value))) return { error: "Enter valid numbers in every field." };
  if (values.some((value) => value < 0)) return { error: "None of these values can be negative." };

  if (ratedWatts <= 0) return { error: "Rated wattage must be greater than zero." };
  if (ratedWatts > 5000) {
    return { error: "A domestic heater above 5000 W would trip a normal 16 A circuit — check the wattage." };
  }
  if (hoursPerDay > 24) return { error: "A day only has 24 hours." };
  if (count <= 0) return { error: "You need at least one heater." };
  if (count > 20) return { error: "More than 20 heaters is a warehouse, not a home." };
  if (daysPerMonth <= 0 || daysPerMonth > 31) {
    return { error: "Days used per month should be between 1 and 31." };
  }
  if (winterMonths <= 0 || winterMonths > 12) {
    return { error: "Heating season should be between 1 and 12 months." };
  }
  if (tariffPerKwh <= 0) return { error: "Electricity tariff must be greater than zero." };
  if (tariffPerKwh > 100) return { error: "Check the tariff — it is entered in rupees per unit (kWh)." };

  const kwhPerDay = dailyKwh({
    ratedWatts,
    dutyCycle: heater.dutyCycle,
    hoursPerDay,
    count,
  });
  const heatDeliveredKwhPerDay = kwhPerDay * heater.cop;

  const costPerDay = kwhPerDay * tariffPerKwh;
  const costPerHour = hoursPerDay > 0 ? costPerDay / hoursPerDay : 0;
  const monthlyKwh = kwhPerDay * daysPerMonth;
  const seasonKwh = monthlyKwh * winterMonths;

  /** The connected load matters for the wiring, not just the bill. */
  const connectedLoadKw = (ratedWatts * count) / WATTS_PER_KW;
  /** Current on a 230 V single-phase supply, so users can check the socket rating. */
  const currentAmps = (ratedWatts * count) / 230;

  return {
    heaterLabel: heater.label,
    heaterNote: heater.note,
    dutyCycle: heater.dutyCycle,
    cop: heater.cop,
    connectedLoadKw,
    currentAmps,
    kwhPerDay,
    heatDeliveredKwhPerDay,
    costPerHour,
    costPerDay,
    monthlyKwh,
    monthlyCost: costPerDay * daysPerMonth,
    seasonKwh,
    seasonCost: costPerDay * daysPerMonth * winterMonths,
    costPerKwhOfHeat: tariffPerKwh / heater.cop,
  };
}

/**
 * Cost of delivering the SAME amount of heat with each heater type. Because
 * every resistive heater is 100% efficient, they all land on the same figure —
 * only the heat pump differs.
 */
export function buildHeaterTypeComparison({ heatKwhPerDay, daysPerMonth, winterMonths, tariffPerKwh }) {
  if (![heatKwhPerDay, daysPerMonth, winterMonths, tariffPerKwh].every(isNum)) return { rows: [] };
  if (heatKwhPerDay <= 0 || tariffPerKwh <= 0) return { rows: [] };
  const rows = Object.values(HEATER_TYPES).map((heater) => {
    const electricityKwhPerDay = heatKwhPerDay / heater.cop;
    const costPerDay = electricityKwhPerDay * tariffPerKwh;
    return {
      id: heater.id,
      label: heater.label,
      cop: heater.cop,
      electricityKwhPerDay,
      costPerDay,
      seasonCost: costPerDay * daysPerMonth * winterMonths,
    };
  });
  const cheapest = rows.reduce((best, row) => (row.costPerDay < best.costPerDay ? row : best), rows[0]);
  return { rows, cheapestId: cheapest.id };
}
