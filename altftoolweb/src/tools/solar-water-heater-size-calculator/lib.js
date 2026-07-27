/**
 * Solar water heater sizing.
 *
 * A solar water heater is rated in litres per day (LPD) of water stored at
 * about 60 C, but people bathe at roughly 40 C. The two are linked by the
 * mixing equation:
 *
 *   storedLitres = demandLitres x (Tuse - Tcold) / (Tstore - Tcold)
 *
 * which is why a 100 LPD system genuinely serves a family of four: 100 litres
 * at 60 C blends with cold to give well over 200 litres of 40 C water.
 * Thermal energy uses Q = m x c x dT with the specific heat of water.
 */

/** Specific heat capacity of liquid water, kJ per kg per K (at ~20-60 C). */
export const WATER_SPECIFIC_HEAT_KJ_PER_KG_K = 4.186;

/** 1 kWh = 3600 kJ. */
export const KJ_PER_KWH = 3600;

/** Density of water, kg per litre (close enough to 1 across 20-60 C). */
export const WATER_KG_PER_LITRE = 1;

/** Mean days per year in the Gregorian calendar. */
export const DAYS_PER_YEAR = 365.25;

/** Litres of blended (use-temperature) water a single bath consumes. */
export const BATHING_STYLES = {
  bucket: { id: "bucket", label: "Bucket bath", hint: "One to two buckets", litres: 25 },
  shortShower: { id: "shortShower", label: "Short shower", hint: "About 5 minutes", litres: 45 },
  longShower: { id: "longShower", label: "Long shower", hint: "About 10 minutes", litres: 85 },
  rainShower: { id: "rainShower", label: "Rain shower", hint: "High flow head, 10 minutes", litres: 120 },
  tub: { id: "tub", label: "Bathtub soak", hint: "Filled tub", litres: 140 },
};

/** Children use roughly 60% of an adult's bathing water. */
export const CHILD_FACTOR = 0.6;

/**
 * MNRE / BIS benchmark collector sizing. A 100 LPD flat plate system uses
 * about 2 m2 of collector; evacuated tube collectors are a little more compact
 * for the same daily delivery.
 */
export const COLLECTOR_TYPES = {
  fpc: { id: "fpc", label: "Flat plate collector (FPC)", hint: "Glazed copper, hard water tolerant", lpdPerSqm: 50 },
  etc: { id: "etc", label: "Evacuated tube collector (ETC)", hint: "Glass tubes, cheaper, scale prone", lpdPerSqm: 60 },
};

/** Roof footprint per m2 of collector: tilt frame, tank stand and service access. */
export const ROOF_AREA_FACTOR = 1.6;

/** Catalogue sizes sold in India, litres per day at 60 C. */
export const STANDARD_LPD_SIZES = [100, 125, 150, 200, 250, 300, 400, 500];

/**
 * @param {object} input
 * @param {number} input.adults
 * @param {number} input.children
 * @param {string} input.bathingStyle    key of BATHING_STYLES
 * @param {number} input.bathsPerDay     baths per person per day
 * @param {number} input.kitchenLitres   kitchen and laundry hot water, litres/day at use temp
 * @param {number} input.useTempC        temperature water is actually used at
 * @param {number} input.coldTempC       mains inlet temperature
 * @param {number} input.storeTempC      tank storage temperature
 * @param {string} input.collectorType   key of COLLECTOR_TYPES
 * @param {number} input.solarFractionPct share of annual demand the sun covers
 * @param {number} input.tariff          electricity price per kWh
 * @param {number} input.geyserEfficiency electric geyser efficiency, 0-1
 * @param {number} input.systemCost      installed cost after subsidy (0 = skip payback)
 */
export function computeSolarWaterHeater({
  adults,
  children,
  bathingStyle = "bucket",
  bathsPerDay = 1,
  kitchenLitres = 0,
  useTempC = 40,
  coldTempC = 25,
  storeTempC = 60,
  collectorType = "fpc",
  solarFractionPct = 70,
  tariff = 0,
  geyserEfficiency = 0.9,
  systemCost = 0,
} = {}) {
  const numbers = {
    adults,
    children,
    bathsPerDay,
    kitchenLitres,
    useTempC,
    coldTempC,
    storeTempC,
    solarFractionPct,
    tariff,
    geyserEfficiency,
    systemCost,
  };
  for (const [key, value] of Object.entries(numbers)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return { error: `Enter a valid number for ${key}.` };
    }
  }

  const style = BATHING_STYLES[bathingStyle];
  if (!style) return { error: "Choose how the household bathes." };
  const collector = COLLECTOR_TYPES[collectorType];
  if (!collector) return { error: "Choose a collector type." };

  if (adults < 0 || children < 0) return { error: "People counts cannot be negative." };
  if (bathsPerDay < 0 || kitchenLitres < 0) return { error: "Baths and kitchen litres cannot be negative." };
  if (systemCost < 0 || tariff < 0) return { error: "Cost and tariff cannot be negative." };
  if (coldTempC < 0 || coldTempC > 40) return { error: "Mains inlet temperature should be between 0 °C and 40 °C." };
  if (useTempC <= coldTempC) {
    return { error: "Bathing temperature must be above the mains inlet temperature." };
  }
  if (useTempC > 60) return { error: "Bathing above 60 °C scalds skin in seconds — keep the use temperature at or below 60 °C." };
  if (storeTempC <= coldTempC) return { error: "Storage temperature must be above the mains inlet temperature." };
  if (storeTempC < useTempC) {
    return { error: "Storage temperature cannot be below the temperature you bathe at." };
  }
  if (storeTempC > 90) return { error: "Solar tanks are not stored above 90 °C." };
  if (solarFractionPct <= 0 || solarFractionPct > 100) {
    return { error: "Solar fraction must be between 1% and 100%." };
  }
  if (geyserEfficiency <= 0 || geyserEfficiency > 1) {
    return { error: "Geyser efficiency must be between 0 and 1 (0.90 is typical)." };
  }

  const adultLitres = adults * style.litres * bathsPerDay;
  const childLitres = children * style.litres * CHILD_FACTOR * bathsPerDay;
  const bathingLitres = adultLitres + childLitres;
  const demandLitres = bathingLitres + kitchenLitres;

  if (!(demandLitres > 0)) {
    return { error: "Add at least one person or some kitchen hot water to size a system." };
  }

  // Mixing equation: how much 60 C water it takes to make that much 40 C water.
  const blendRatio = (useTempC - coldTempC) / (storeTempC - coldTempC);
  const storedLitresNeeded = demandLitres * blendRatio;

  const recommendedLpd =
    STANDARD_LPD_SIZES.find((size) => size >= storedLitresNeeded) ??
    STANDARD_LPD_SIZES[STANDARD_LPD_SIZES.length - 1];
  const oversizedBeyondCatalogue = storedLitresNeeded > STANDARD_LPD_SIZES[STANDARD_LPD_SIZES.length - 1];

  // Q = m c dT. Identical whether measured at storage or at use temperature.
  const dailyKj =
    storedLitresNeeded * WATER_KG_PER_LITRE * WATER_SPECIFIC_HEAT_KJ_PER_KG_K * (storeTempC - coldTempC);
  const dailyKwhThermal = dailyKj / KJ_PER_KWH;

  const collectorAreaSqm = recommendedLpd / collector.lpdPerSqm;
  const roofAreaSqm = collectorAreaSqm * ROOF_AREA_FACTOR;

  const solarFraction = solarFractionPct / 100;
  const dailyKwhSaved = (dailyKwhThermal * solarFraction) / geyserEfficiency;
  const dailyKwhBackup = (dailyKwhThermal * (1 - solarFraction)) / geyserEfficiency;

  const annualKwhSaved = dailyKwhSaved * DAYS_PER_YEAR;
  const annualKwhBackup = dailyKwhBackup * DAYS_PER_YEAR;
  const annualSavings = annualKwhSaved * tariff;
  const annualBackupCost = annualKwhBackup * tariff;
  const monthlySavings = annualSavings / 12;

  const paybackYears = systemCost > 0 && annualSavings > 0 ? systemCost / annualSavings : null;

  return {
    bathingLitres,
    kitchenLitres,
    demandLitres,
    blendRatio,
    storedLitresNeeded,
    recommendedLpd,
    oversizedBeyondCatalogue,
    litresPerPersonAtUseTemp: adults + children > 0 ? bathingLitres / (adults + children) : 0,
    dailyKwhThermal,
    collectorLabel: collector.label,
    collectorAreaSqm,
    roofAreaSqm,
    styleLabel: style.label,
    dailyKwhSaved,
    dailyKwhBackup,
    annualKwhSaved,
    annualKwhBackup,
    annualSavings,
    annualBackupCost,
    monthlySavings,
    paybackYears,
  };
}
