/**
 * EV versus BS6 diesel car running cost, per kilometre.
 *
 * The diesel side is deliberately not just "price / mileage". A BS6 diesel also burns
 * diesel exhaust fluid (AdBlue) in its SCR catalyst and carries a heavier service bill
 * than a petrol or electric car, so both are separate lines:
 *
 *   dieselLitresPerKm = 1 / mileageKmPerLitre
 *   defLitresPerKm    = dieselLitresPerKm x defDoseFraction
 *   dieselCostPerKm   = dieselLitresPerKm x dieselPrice
 *                     + defLitresPerKm x defPrice
 *                     + dieselMaintenancePerKm
 *
 * EV
 *   gridKwhPerKm  = (usableBatteryKwh / realRangeKm) / chargingEfficiency
 *   blendedTariff = homeShare x homeTariff + (1 - homeShare) x publicTariff
 *   evCostPerKm   = gridKwhPerKm x blendedTariff + evMaintenancePerKm
 */

/** Wall-to-battery efficiency; AC home charging is typically 85-90%. */
export const DEFAULT_CHARGING_EFFICIENCY = 0.88;

/**
 * Tank-to-wheel emission factor for diesel: one litre releases about 2.68 kg of CO2,
 * higher than petrol's 2.31 kg because diesel is denser and more carbon-rich per litre.
 */
export const DIESEL_KG_CO2_PER_LITRE = 2.68;

/**
 * Average CO2 intensity of Indian grid electricity, kg per kWh. The CEA CO2 baseline
 * database has placed the grid factor in the 0.70-0.80 range in recent years.
 */
export const GRID_KG_CO2_PER_KWH = 0.71;

/**
 * AdBlue / DEF consumption on a BS6 (Euro 6 equivalent) diesel car, as a fraction of
 * diesel volume burnt. Manufacturers typically quote 2-6% of fuel consumption for
 * passenger cars; 4% is the mid value used as the default here.
 */
export const DEFAULT_DEF_DOSE_FRACTION = 0.04;

const round = (value, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

/**
 * @param {object} input
 * @param {number|string} input.batteryKwh Usable battery capacity, kWh.
 * @param {number|string} input.evRangeKm Real-world range on a full charge, km.
 * @param {number|string} [input.homeTariff] Home electricity tariff, INR per kWh.
 * @param {number|string} [input.publicTariff] Public charger tariff, INR per kWh.
 * @param {number|string} [input.homeSharePct] Share of charging done at home, %.
 * @param {number|string} [input.chargingEfficiencyPct] Wall-to-battery efficiency, %.
 * @param {number|string} [input.evMaintenancePerKm] EV service and tyres, INR per km.
 * @param {number|string} input.dieselMileage Diesel car mileage, km per litre.
 * @param {number|string} [input.dieselPrice] Diesel pump price, INR per litre.
 * @param {number|string} [input.defDosePct] AdBlue used as % of diesel volume.
 * @param {number|string} [input.defPrice] AdBlue price, INR per litre.
 * @param {number|string} [input.dieselMaintenancePerKm] Diesel service, INR per km.
 * @param {number|string} [input.annualKm] Kilometres driven per year.
 * @param {number|string} [input.evPricePremium] How much more the EV costs to buy, INR.
 */
export function compareEvDiesel({
  batteryKwh,
  evRangeKm,
  homeTariff = 8,
  publicTariff = 20,
  homeSharePct = 80,
  chargingEfficiencyPct = DEFAULT_CHARGING_EFFICIENCY * 100,
  evMaintenancePerKm = 0.4,
  dieselMileage,
  dieselPrice = 92,
  defDosePct = DEFAULT_DEF_DOSE_FRACTION * 100,
  defPrice = 70,
  dieselMaintenancePerKm = 1.8,
  annualKm = 20000,
  evPricePremium = 600000,
} = {}) {
  const values = {
    battery: toNumber(batteryKwh),
    range: toNumber(evRangeKm),
    home: toNumber(homeTariff),
    publicRate: toNumber(publicTariff),
    homeShare: toNumber(homeSharePct),
    chargeEff: toNumber(chargingEfficiencyPct),
    evMaint: toNumber(evMaintenancePerKm),
    mileage: toNumber(dieselMileage),
    fuelPrice: toNumber(dieselPrice),
    defDose: toNumber(defDosePct),
    defRate: toNumber(defPrice),
    dieselMaint: toNumber(dieselMaintenancePerKm),
    km: toNumber(annualKm),
    premium: toNumber(evPricePremium),
  };

  if (Object.values(values).some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (!(values.battery > 0)) return { error: "Enter the EV's usable battery size in kWh." };
  if (values.battery > 300) return { error: "Battery size above 300 kWh is outside car territory." };
  if (!(values.range > 0)) return { error: "Enter the EV's real-world range in km." };
  if (values.range > 2000) return { error: "Enter a realistic range — under 2000 km per charge." };
  if (!(values.mileage > 0)) return { error: "Enter the diesel car's mileage in km per litre." };
  if (values.mileage > 100) return { error: "Diesel mileage above 100 km/l is not realistic for a car." };
  if (values.chargeEff <= 0 || values.chargeEff > 100) {
    return { error: "Charging efficiency must be between 1% and 100%." };
  }
  if (values.homeShare < 0 || values.homeShare > 100) {
    return { error: "Home charging share must be between 0% and 100%." };
  }
  if (values.defDose < 0 || values.defDose > 20) {
    return { error: "AdBlue dosing is a few percent of fuel volume — enter between 0% and 20%." };
  }
  if (
    [
      values.home,
      values.publicRate,
      values.evMaint,
      values.fuelPrice,
      values.defRate,
      values.dieselMaint,
      values.km,
      values.premium,
    ].some((value) => value < 0)
  ) {
    return { error: "Tariffs, prices, maintenance, distance and premium cannot be negative." };
  }
  if (values.km > 500000) return { error: "Enter annual distance under 5,00,000 km." };

  const chargingEfficiency = values.chargeEff / 100;
  const homeShare = values.homeShare / 100;

  // EV side.
  const batteryKwhPerKm = values.battery / values.range;
  const gridKwhPerKm = batteryKwhPerKm / chargingEfficiency;
  const blendedTariff = homeShare * values.home + (1 - homeShare) * values.publicRate;
  const evEnergyPerKm = gridKwhPerKm * blendedTariff;
  const evTotalPerKm = evEnergyPerKm + values.evMaint;
  const evFullChargeCost = (values.battery / chargingEfficiency) * blendedTariff;

  // Diesel side.
  const dieselLitresPerKm = 1 / values.mileage;
  const dieselFuelPerKm = dieselLitresPerKm * values.fuelPrice;
  const defLitresPerKm = dieselLitresPerKm * (values.defDose / 100);
  const defCostPerKm = defLitresPerKm * values.defRate;
  const dieselTotalPerKm = dieselFuelPerKm + defCostPerKm + values.dieselMaint;

  const savingPerKm = dieselTotalPerKm - evTotalPerKm;
  const evAnnual = evTotalPerKm * values.km;
  const dieselAnnual = dieselTotalPerKm * values.km;
  const annualSaving = dieselAnnual - evAnnual;
  const savingPct = dieselTotalPerKm > 0 ? (savingPerKm / dieselTotalPerKm) * 100 : 0;
  const cheaper = savingPerKm > 0 ? "ev" : savingPerKm < 0 ? "diesel" : "tie";

  const defLitresPerYear = defLitresPerKm * values.km;

  let paybackKm = null;
  let paybackYears = null;
  let paybackNote;
  if (values.premium <= 0) {
    paybackNote = "No price premium entered, so whichever car is cheaper per km is cheaper from day one.";
  } else if (savingPerKm <= 0) {
    paybackNote = "The EV does not run cheaper than this diesel, so the higher purchase price never pays back.";
  } else {
    paybackKm = values.premium / savingPerKm;
    paybackYears = values.km > 0 ? values.premium / annualSaving : null;
    paybackNote =
      paybackYears === null
        ? `The price premium pays back after about ${round(paybackKm)} km.`
        : `The price premium pays back after about ${round(paybackKm)} km, roughly ${round(paybackYears, 1)} years at ${round(values.km)} km a year.`;
  }

  const evCo2PerKm = gridKwhPerKm * GRID_KG_CO2_PER_KWH;
  const dieselCo2PerKm = dieselLitresPerKm * DIESEL_KG_CO2_PER_LITRE;
  const co2SavedPerYearKg = (dieselCo2PerKm - evCo2PerKm) * values.km;

  return {
    batteryKwhPerKm: round(batteryKwhPerKm, 4),
    kwhPer100Km: round(batteryKwhPerKm * 100, 1),
    gridKwhPerKm: round(gridKwhPerKm, 4),
    blendedTariff: round(blendedTariff, 2),
    evEnergyPerKm: round(evEnergyPerKm, 2),
    evMaintenancePerKm: round(values.evMaint, 2),
    evTotalPerKm: round(evTotalPerKm, 2),
    evFullChargeCost: round(evFullChargeCost),
    dieselLitresPer100Km: round(dieselLitresPerKm * 100, 2),
    dieselFuelPerKm: round(dieselFuelPerKm, 2),
    defDosePct: round(values.defDose, 2),
    defCostPerKm: round(defCostPerKm, 2),
    defLitresPerYear: round(defLitresPerYear, 1),
    dieselMaintenancePerKm: round(values.dieselMaint, 2),
    dieselTotalPerKm: round(dieselTotalPerKm, 2),
    savingPerKm: round(savingPerKm, 2),
    savingPct: round(savingPct, 1),
    cheaper,
    annualKm: round(values.km),
    evAnnual: round(evAnnual),
    dieselAnnual: round(dieselAnnual),
    annualSaving: round(annualSaving),
    premium: round(values.premium),
    paybackKm: paybackKm === null ? null : round(paybackKm),
    paybackYears: paybackYears === null ? null : round(paybackYears, 1),
    paybackNote,
    evCo2PerKm: round(evCo2PerKm, 3),
    dieselCo2PerKm: round(dieselCo2PerKm, 3),
    evCo2PerYearKg: round(evCo2PerKm * values.km),
    dieselCo2PerYearKg: round(dieselCo2PerKm * values.km),
    co2SavedPerYearKg: round(co2SavedPerYearKg),
  };
}
