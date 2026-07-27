/**
 * Aquarium electricity cost.
 *
 * Filter, air pump and light are simple: watts x hours. The heater is not,
 * because a heater almost never runs continuously — it cycles to replace the
 * heat the tank loses to the room. So the energy it uses is set by the heat
 * loss, not by the heater's wattage:
 *
 *   steady heat loss (W) = loss coefficient (W/K) x (tank temp - room temp)
 *   duty cycle           = heat loss / installed heater watts
 *
 * A bigger heater in the same tank therefore costs nothing extra to run; it just
 * cycles less often. That is the single most misunderstood point in aquarium
 * running costs.
 */

export const HOURS_PER_DAY = 24;
export const WATTS_PER_KW = 1000;
export const MONTHS_PER_YEAR = 12;

/**
 * Heat loss of a covered glass aquarium of 100 litres, in watts per kelvin of
 * difference between water and room air. Derived from the glass area of a
 * typical 100 L tank (about 1.3 m^2 of wetted glass) and an overall heat
 * transfer coefficient near 5.5 W/m^2K for single glass with still air films.
 */
export const REFERENCE_LOSS_W_PER_K = 7.5;

/** The tank volume the reference loss above is measured at, in litres. */
export const REFERENCE_VOLUME_LITRES = 100;

/**
 * Heat loss follows surface area, and surface area grows as volume^(2/3), so a
 * tank twice the size loses about 1.59 times as much, not twice as much.
 */
export const AREA_EXPONENT = 2 / 3;

/**
 * An open top loses heat by evaporation as well as conduction, which roughly
 * doubles the total. A glass lid or hood is the cheapest energy saving available
 * to an aquarium.
 */
export const COVER_FACTORS = {
  covered: { id: "covered", label: "Glass lid or hood", factor: 1 },
  partial: { id: "partial", label: "Partly covered", factor: 1.4 },
  open: { id: "open", label: "Open top", factor: 1.8 },
};

/**
 * Heater sizing carries a margin so the heater can also recover from a cold
 * night and a water change, not just hold steady state.
 */
export const HEATER_SIZING_MARGIN = 2.5;

/** Wattages aquarium heaters are actually sold in. */
export const STANDARD_HEATER_WATTS = [25, 50, 75, 100, 150, 200, 250, 300];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Heat loss coefficient for a tank of this volume and cover, in W per K. */
export function lossCoefficientWPerK(volumeLitres, coverId = "covered") {
  const cover = COVER_FACTORS[coverId] ?? COVER_FACTORS.covered;
  if (!isNum(volumeLitres) || volumeLitres <= 0) return 0;
  const scale = Math.pow(volumeLitres / REFERENCE_VOLUME_LITRES, AREA_EXPONENT);
  return REFERENCE_LOSS_W_PER_K * scale * cover.factor;
}

/** Smallest standard heater at or above `watts`; null if it needs two heaters. */
export function recommendHeaterWatts(watts) {
  if (!isNum(watts) || watts <= 0) return 0;
  for (const size of STANDARD_HEATER_WATTS) {
    if (size >= watts) return size;
  }
  return null;
}

/**
 * Full monthly running cost. Returns { error } for input that cannot give a
 * meaningful answer.
 */
export function computeAquariumCost({
  volumeLitres = 100,
  coverId = "covered",
  tankTempC = 26,
  roomTempC = 22,
  heaterWatts = 100,
  filterWatts = 12,
  filterHours = 24,
  airPumpWatts = 4,
  airPumpHours = 24,
  lightWatts = 18,
  lightHours = 8,
  otherWatts = 0,
  otherHours = 24,
  daysPerMonth = 30,
  tariffPerKwh = 8,
} = {}) {
  if (!COVER_FACTORS[coverId]) return { error: "Choose a cover option from the list." };

  const values = [
    volumeLitres,
    tankTempC,
    roomTempC,
    heaterWatts,
    filterWatts,
    filterHours,
    airPumpWatts,
    airPumpHours,
    lightWatts,
    lightHours,
    otherWatts,
    otherHours,
    daysPerMonth,
    tariffPerKwh,
  ];
  if (values.some((value) => !isNum(value))) return { error: "Enter valid numbers in every field." };

  if (volumeLitres <= 0) return { error: "Tank volume must be greater than zero." };
  if (volumeLitres > 20000) return { error: "Over 20,000 litres is a public aquarium, not a home tank." };
  if (tankTempC < 5 || tankTempC > 40) {
    return { error: "Aquarium water is kept between 5 °C and 40 °C — check the target temperature." };
  }
  if (roomTempC < -10 || roomTempC > 50) return { error: "Room temperature should be between -10 °C and 50 °C." };
  if ([heaterWatts, filterWatts, airPumpWatts, lightWatts, otherWatts].some((value) => value < 0)) {
    return { error: "Wattages cannot be negative." };
  }
  if ([filterHours, airPumpHours, lightHours, otherHours].some((value) => value < 0 || value > HOURS_PER_DAY)) {
    return { error: "Running hours must be between 0 and 24 a day." };
  }
  if ([heaterWatts, filterWatts, airPumpWatts, lightWatts, otherWatts].some((value) => value > 2000)) {
    return { error: "Aquarium equipment above 2000 W is not domestic — check the wattages." };
  }
  if (daysPerMonth <= 0 || daysPerMonth > 31) {
    return { error: "Days per month should be between 1 and 31." };
  }
  if (tariffPerKwh <= 0) return { error: "Electricity tariff must be greater than zero." };
  if (tariffPerKwh > 100) return { error: "Check the tariff — it is entered in rupees per unit (kWh)." };

  const deltaT = Math.max(0, tankTempC - roomTempC);
  const lossPerK = lossCoefficientWPerK(volumeLitres, coverId);
  const steadyHeatLossW = lossPerK * deltaT;

  const heaterDuty = heaterWatts > 0 ? Math.min(1, steadyHeatLossW / heaterWatts) : 0;
  /** Average watts the heater actually draws over a day. */
  const heaterAverageW = heaterWatts > 0 ? Math.min(steadyHeatLossW, heaterWatts) : 0;
  const heaterUndersized = steadyHeatLossW > heaterWatts;

  const recommendedHeaterW = recommendHeaterWatts(steadyHeatLossW * HEATER_SIZING_MARGIN);

  const devices = [
    { id: "heater", label: "Heater", watts: heaterAverageW, hours: HOURS_PER_DAY },
    { id: "filter", label: "Filter", watts: filterWatts, hours: filterHours },
    { id: "air-pump", label: "Air pump", watts: airPumpWatts, hours: airPumpHours },
    { id: "light", label: "Light", watts: lightWatts, hours: lightHours },
    { id: "other", label: "Other equipment", watts: otherWatts, hours: otherHours },
  ].map((device) => {
    const kwhPerDay = (device.watts / WATTS_PER_KW) * device.hours;
    const monthlyKwh = kwhPerDay * daysPerMonth;
    return {
      ...device,
      kwhPerDay,
      monthlyKwh,
      monthlyCost: monthlyKwh * tariffPerKwh,
      annualCost: monthlyKwh * tariffPerKwh * MONTHS_PER_YEAR,
    };
  });

  const kwhPerDay = devices.reduce((sum, device) => sum + device.kwhPerDay, 0);
  const monthlyKwh = kwhPerDay * daysPerMonth;
  const monthlyCost = monthlyKwh * tariffPerKwh;

  const ranked = [...devices].filter((device) => device.monthlyKwh > 0).sort((a, b) => b.monthlyKwh - a.monthlyKwh);

  /** What a lid would save, if the tank is not already covered. */
  const coveredLossW = lossCoefficientWPerK(volumeLitres, "covered") * deltaT;
  const lidSavingMonthlyCost =
    coverId === "covered"
      ? 0
      : ((Math.min(steadyHeatLossW, heaterWatts > 0 ? heaterWatts : steadyHeatLossW) - coveredLossW) /
          WATTS_PER_KW) *
        HOURS_PER_DAY *
        daysPerMonth *
        tariffPerKwh;

  return {
    deltaT,
    lossPerK,
    steadyHeatLossW,
    heaterDuty,
    heaterAverageW,
    heaterUndersized,
    recommendedHeaterW,
    devices,
    ranked,
    kwhPerDay,
    monthlyKwh,
    monthlyCost,
    annualKwh: monthlyKwh * MONTHS_PER_YEAR,
    annualCost: monthlyCost * MONTHS_PER_YEAR,
    costPerLitrePerMonth: volumeLitres > 0 ? monthlyCost / volumeLitres : 0,
    lidSavingMonthlyCost: Math.max(0, lidSavingMonthlyCost),
  };
}
