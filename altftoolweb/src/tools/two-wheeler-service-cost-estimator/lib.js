/**
 * Two-wheeler periodic service cost estimator.
 *
 * The bill for an Indian bike/scooter service is built the same way at every
 * workshop:  (engine oil) + (wear parts whose replacement interval falls inside
 * this service window) + (chain lube / consumables) + (labour) + GST.
 *
 * Which wear parts are "due" is decided purely by the odometer: an item with a
 * replacement interval of I km is due at this service when the odometer has
 * crossed a multiple of I since the previous service, i.e.
 *     floor(odo / I) > floor((odo - serviceInterval) / I)
 * This is the rule printed in OEM owner's-manual maintenance charts.
 */

/**
 * Engine-oil capacity, standard periodic-service labour and a parts price
 * multiplier per displacement band.
 * Oil quantities are the wet-sump refill volumes quoted in Indian OEM owner's
 * manuals (e.g. ~0.8 L for a 100-110 cc commuter, ~1.0 L for a 150 cc,
 * ~1.7 L for a 350 cc single, ~2.5 L for a 650 twin).
 * Labour and part factors are typical 2025-26 authorised-workshop rates and are
 * user-adjustable in the UI.
 */
export const CC_BANDS = [
  { id: "u110", max: 110, label: "Up to 110 cc", oilLitres: 0.8, labour: 350, partFactor: 0.8 },
  { id: "u160", max: 160, label: "111 - 160 cc", oilLitres: 1.0, labour: 450, partFactor: 1.0 },
  { id: "u250", max: 250, label: "161 - 250 cc", oilLitres: 1.2, labour: 600, partFactor: 1.4 },
  { id: "u400", max: 400, label: "251 - 400 cc", oilLitres: 1.7, labour: 900, partFactor: 2.0 },
  { id: "u650", max: 650, label: "401 - 650 cc", oilLitres: 2.5, labour: 1400, partFactor: 2.8 },
  { id: "o650", max: Infinity, label: "Above 650 cc", oilLitres: 3.5, labour: 2200, partFactor: 3.5 },
];

/** Typical Indian retail price per litre of 10W-30/10W-40 motorcycle oil, INR. */
export const OIL_GRADE_PRICES = {
  mineral: 380,
  semi: 560,
  full: 850,
};

export const OIL_GRADE_LABELS = {
  mineral: "Mineral",
  semi: "Semi-synthetic",
  full: "Full synthetic",
};

/**
 * Labour multiplier by workshop type. Authorised service centres are the
 * reference (1.00); multi-brand chains and neighbourhood mechanics quote less
 * because their shop rate per hour is lower.
 */
export const WORKSHOP_FACTORS = {
  authorised: 1,
  multibrand: 0.85,
  local: 0.6,
};

export const WORKSHOP_LABELS = {
  authorised: "Authorised service centre",
  multibrand: "Multi-brand chain",
  local: "Local mechanic",
};

/**
 * Replacement intervals from OEM maintenance charts, with typical 2025-26 Indian
 * spare-part MRP for a 150 cc bike (scaled by the band's partFactor).
 * `coolantOnly` items are billed only for liquid-cooled engines.
 */
export const WEAR_ITEMS = [
  { key: "oilFilter", label: "Oil filter", intervalKm: 6000, basePrice: 180 },
  { key: "airFilter", label: "Air filter", intervalKm: 12000, basePrice: 350 },
  { key: "sparkPlug", label: "Spark plug", intervalKm: 12000, basePrice: 220 },
  { key: "brakeFluid", label: "Brake fluid (DOT 3/4)", intervalKm: 20000, basePrice: 250 },
  { key: "brakePads", label: "Front brake pads", intervalKm: 20000, basePrice: 550 },
  { key: "coolant", label: "Coolant", intervalKm: 20000, basePrice: 400, coolantOnly: true },
  { key: "chainKit", label: "Chain and sprocket kit", intervalKm: 25000, basePrice: 2200 },
];

/** Chain cleaning + lube is charged at every service on a chain-drive bike. */
export const CHAIN_LUBE_COST = 150;

/** Shop consumables (degreaser, rags, cleaner) billed as a share of parts. */
export const CONSUMABLES_RATE = 0.05;

/** GST on both automotive spares and workshop labour is 18% (CGST 9 + SGST 9). */
export const GST_RATE = 0.18;

/** Most Indian OEMs give 3 to 5 free services: labour is waived, parts are not. */
export const TYPICAL_FREE_SERVICES = 3;

const MAX_ENGINE_CC = 3000;
const MAX_ODOMETER_KM = 500000;
const MIN_SERVICE_INTERVAL_KM = 1000;
const MAX_SERVICE_INTERVAL_KM = 20000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Pick the displacement band that contains the given engine capacity. */
export function bandForCc(engineCc) {
  return CC_BANDS.find((band) => engineCc <= band.max) ?? CC_BANDS[CC_BANDS.length - 1];
}

/** True when a part with interval `intervalKm` falls inside (prevOdo, odo]. */
export function isDueAt(odometerKm, prevOdometerKm, intervalKm) {
  if (!(intervalKm > 0)) return false;
  return Math.floor(odometerKm / intervalKm) > Math.floor(prevOdometerKm / intervalKm);
}

/**
 * Itemised estimate for one periodic service.
 * All money is returned unrounded in INR; format at the edge.
 */
export function estimateServiceCost({
  engineCc,
  odometerKm,
  serviceIntervalKm,
  oilGrade = "semi",
  oilPricePerLitre,
  workshop = "authorised",
  freeService = false,
  liquidCooled = false,
  chainDrive = true,
} = {}) {
  if (!isNum(engineCc) || !isNum(odometerKm) || !isNum(serviceIntervalKm)) {
    return { error: "Enter engine capacity, odometer reading and service interval as numbers." };
  }
  if (engineCc <= 0) return { error: "Engine capacity must be greater than 0 cc." };
  if (engineCc > MAX_ENGINE_CC) {
    return { error: `Engine capacity above ${MAX_ENGINE_CC} cc is outside this estimator's range.` };
  }
  if (odometerKm < 0) return { error: "Odometer reading cannot be negative." };
  if (odometerKm > MAX_ODOMETER_KM) {
    return { error: `Odometer readings above ${MAX_ODOMETER_KM.toLocaleString("en-IN")} km are outside this estimator's range.` };
  }
  if (serviceIntervalKm < MIN_SERVICE_INTERVAL_KM || serviceIntervalKm > MAX_SERVICE_INTERVAL_KM) {
    return {
      error: `Service interval should be between ${MIN_SERVICE_INTERVAL_KM} and ${MAX_SERVICE_INTERVAL_KM} km.`,
    };
  }

  const gradePrice = OIL_GRADE_PRICES[oilGrade] ?? OIL_GRADE_PRICES.semi;
  const oilRate = isNum(oilPricePerLitre) && oilPricePerLitre > 0 ? oilPricePerLitre : gradePrice;
  if (oilRate > 5000) return { error: "Engine oil price per litre looks unrealistic." };

  const factor = WORKSHOP_FACTORS[workshop] ?? WORKSHOP_FACTORS.authorised;
  const band = bandForCc(engineCc);
  const prevOdometerKm = Math.max(0, odometerKm - serviceIntervalKm);
  const serviceNumber = Math.max(1, Math.round(odometerKm / serviceIntervalKm));

  const items = [
    {
      key: "engineOil",
      label: `Engine oil (${band.oilLitres} L ${OIL_GRADE_LABELS[oilGrade] ?? "oil"})`,
      cost: band.oilLitres * oilRate,
      reason: "Replaced at every periodic service",
    },
  ];

  for (const item of WEAR_ITEMS) {
    if (item.coolantOnly && !liquidCooled) continue;
    if (item.key === "chainKit" && !chainDrive) continue;
    if (!isDueAt(odometerKm, prevOdometerKm, item.intervalKm)) continue;
    items.push({
      key: item.key,
      label: item.label,
      cost: item.basePrice * band.partFactor,
      reason: `Due every ${item.intervalKm.toLocaleString("en-IN")} km`,
    });
  }

  const partsSubtotal = items.reduce((sum, item) => sum + item.cost, 0);
  const chainLube = chainDrive ? CHAIN_LUBE_COST : 0;
  const consumables = partsSubtotal * CONSUMABLES_RATE + chainLube;
  const labour = freeService ? 0 : band.labour * factor;
  const preTax = partsSubtotal + consumables + labour;
  const gst = preTax * GST_RATE;
  const total = preTax + gst;

  return {
    band: band.label,
    serviceNumber,
    prevOdometerKm,
    oilRate,
    oilLitres: band.oilLitres,
    items,
    partsSubtotal,
    consumables,
    labour,
    preTax,
    gst,
    total,
    perKm: total / serviceIntervalKm,
    freeService,
  };
}

/** Rough running cost: what these services add up to across a year of riding. */
export function annualServiceCost(total, serviceIntervalKm, annualKm) {
  if (!isNum(total) || !isNum(serviceIntervalKm) || !isNum(annualKm)) return null;
  if (serviceIntervalKm <= 0 || annualKm < 0) return null;
  return (annualKm / serviceIntervalKm) * total;
}
