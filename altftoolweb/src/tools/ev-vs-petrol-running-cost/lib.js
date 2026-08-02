/**
 * EV versus petrol car running cost, per kilometre.
 *
 * EV
 *   batteryToWheelKwhPerKm = usableBatteryKwh / realWorldRangeKm
 *   gridKwhPerKm           = batteryToWheelKwhPerKm / chargingEfficiency
 *   blendedTariff          = homeShare x homeTariff + (1 - homeShare) x publicTariff
 *   evEnergyCostPerKm      = gridKwhPerKm x blendedTariff
 *
 * Petrol
 *   petrolCostPerKm = petrolPrice / mileageKmPerLitre
 *
 * Each side then adds its own maintenance rupees per km. Payback on the EV's higher
 * purchase price is  premium / savingPerKm  kilometres, and  premium / annualSaving  years.
 */

/**
 * Round-trip charging efficiency. Energy drawn from the wall is more than the energy
 * stored, because of charger conversion losses and battery internal resistance.
 * AC home charging typically lands near 85-90%; DC fast charging near 90-93%
 * at the charger but with extra thermal loss. 88% is a fair blended default.
 */
export const DEFAULT_CHARGING_EFFICIENCY = 0.88;

/**
 * Combustion emission factor for petrol: burning one litre of motor gasoline releases
 * about 2.31 kg of CO2 (tank-to-wheel), from its carbon content and density.
 */
export const PETROL_KG_CO2_PER_LITRE = 2.31;

/**
 * Average CO2 intensity of grid electricity in India, kg per kWh. The CEA CO2 baseline
 * database has placed the combined-margin grid factor in the 0.70-0.80 range in recent
 * years; 0.71 is used here. Adjust if you charge from rooftop solar (close to zero).
 */
export const GRID_KG_CO2_PER_KWH = 0.71;

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
 * @param {number|string} [input.publicTariff] Public/DC charger tariff, INR per kWh.
 * @param {number|string} [input.homeSharePct] Share of charging done at home, %.
 * @param {number|string} [input.chargingEfficiencyPct] Wall-to-battery efficiency, %.
 * @param {number|string} [input.evMaintenancePerKm] EV service and tyres, INR per km.
 * @param {number|string} input.petrolMileage Petrol car mileage, km per litre.
 * @param {number|string} [input.petrolPrice] Petrol pump price, INR per litre.
 * @param {number|string} [input.petrolMaintenancePerKm] Petrol service, INR per km.
 * @param {number|string} [input.annualKm] Kilometres driven per year.
 * @param {number|string} [input.evPricePremium] How much more the EV costs to buy, INR.
 */
export function compareEvPetrol({
  batteryKwh,
  evRangeKm,
  homeTariff = 8,
  publicTariff = 20,
  homeSharePct = 80,
  chargingEfficiencyPct = DEFAULT_CHARGING_EFFICIENCY * 100,
  evMaintenancePerKm = 0.4,
  petrolMileage,
  petrolPrice = 105,
  petrolMaintenancePerKm = 1.2,
  annualKm = 15000,
  evPricePremium = 500000,
} = {}) {
  const values = {
    battery: toNumber(batteryKwh),
    range: toNumber(evRangeKm),
    home: toNumber(homeTariff),
    publicRate: toNumber(publicTariff),
    homeShare: toNumber(homeSharePct),
    chargeEff: toNumber(chargingEfficiencyPct),
    evMaint: toNumber(evMaintenancePerKm),
    mileage: toNumber(petrolMileage),
    fuelPrice: toNumber(petrolPrice),
    petrolMaint: toNumber(petrolMaintenancePerKm),
    km: toNumber(annualKm),
    premium: toNumber(evPricePremium),
  };

  if (Object.values(values).some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (!(values.battery > 0)) return { error: "Enter the EV's usable battery size in kWh." };
  if (!(values.range > 0)) return { error: "Enter the EV's real-world range in km." };
  if (values.battery > 300) return { error: "Battery size above 300 kWh is outside car territory." };
  if (values.range > 2000) return { error: "Enter a realistic range — under 2000 km per charge." };
  if (!(values.mileage > 0)) return { error: "Enter the petrol car's mileage in km per litre." };
  if (values.mileage > 100) return { error: "Petrol mileage above 100 km/l is not realistic for a car." };
  if (values.chargeEff <= 0 || values.chargeEff > 100) {
    return { error: "Charging efficiency must be between 1% and 100%." };
  }
  if (values.homeShare < 0 || values.homeShare > 100) {
    return { error: "Home charging share must be between 0% and 100%." };
  }
  if (
    [values.home, values.publicRate, values.evMaint, values.fuelPrice, values.petrolMaint, values.km, values.premium].some(
      (value) => value < 0,
    )
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

  // Petrol side.
  const petrolLitresPerKm = 1 / values.mileage;
  const petrolFuelPerKm = petrolLitresPerKm * values.fuelPrice;
  const petrolTotalPerKm = petrolFuelPerKm + values.petrolMaint;

  const savingPerKm = petrolTotalPerKm - evTotalPerKm;
  const evAnnual = evTotalPerKm * values.km;
  const petrolAnnual = petrolTotalPerKm * values.km;
  const annualSaving = petrolAnnual - evAnnual;

  const cheaper = savingPerKm > 0 ? "ev" : savingPerKm < 0 ? "petrol" : "tie";
  const savingPct = petrolTotalPerKm > 0 ? (savingPerKm / petrolTotalPerKm) * 100 : 0;

  let paybackKm = null;
  let paybackYears = null;
  let paybackNote;
  if (savingPerKm <= 0) {
    paybackNote = "The EV does not run cheaper on these inputs, so the higher purchase price never pays back.";
  } else if (values.premium <= 0) {
    paybackNote = "No price premium entered, so the EV is cheaper from the first kilometre.";
  } else {
    paybackKm = values.premium / savingPerKm;
    paybackYears = values.km > 0 ? values.premium / annualSaving : null;
    paybackNote =
      paybackYears === null
        ? `The price premium pays back after about ${round(paybackKm)} km.`
        : `The price premium pays back after about ${round(paybackKm)} km, roughly ${round(paybackYears, 1)} years at ${round(values.km)} km a year.`;
  }

  // Tank-to-wheel / grid emissions.
  const evCo2PerKm = gridKwhPerKm * GRID_KG_CO2_PER_KWH;
  const petrolCo2PerKm = petrolLitresPerKm * PETROL_KG_CO2_PER_LITRE;
  const co2SavedPerYearKg = (petrolCo2PerKm - evCo2PerKm) * values.km;

  return {
    batteryKwhPerKm: round(batteryKwhPerKm, 4),
    kwhPer100Km: round(batteryKwhPerKm * 100, 1),
    gridKwhPerKm: round(gridKwhPerKm, 4),
    blendedTariff: round(blendedTariff, 2),
    evEnergyPerKm: round(evEnergyPerKm, 2),
    evMaintenancePerKm: round(values.evMaint, 2),
    evTotalPerKm: round(evTotalPerKm, 2),
    evFullChargeCost: round(evFullChargeCost),
    evRangeKm: round(values.range),
    petrolLitresPer100Km: round(petrolLitresPerKm * 100, 2),
    petrolFuelPerKm: round(petrolFuelPerKm, 2),
    petrolMaintenancePerKm: round(values.petrolMaint, 2),
    petrolTotalPerKm: round(petrolTotalPerKm, 2),
    savingPerKm: round(savingPerKm, 2),
    savingPct: round(savingPct, 1),
    cheaper,
    annualKm: round(values.km),
    evAnnual: round(evAnnual),
    petrolAnnual: round(petrolAnnual),
    annualSaving: round(annualSaving),
    premium: round(values.premium),
    paybackKm: paybackKm === null ? null : round(paybackKm),
    paybackYears: paybackYears === null ? null : round(paybackYears, 1),
    paybackNote,
    evCo2PerKm: round(evCo2PerKm, 3),
    petrolCo2PerKm: round(petrolCo2PerKm, 3),
    evCo2PerYearKg: round(evCo2PerKm * values.km),
    petrolCo2PerYearKg: round(petrolCo2PerKm * values.km),
    co2SavedPerYearKg: round(co2SavedPerYearKg),
  };
}
