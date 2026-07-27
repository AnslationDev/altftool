/**
 * Car air-conditioning regas and service cost estimation.
 *
 * The bill is built the way a workshop builds it:
 *   gas (grams x rate) + labour + any parts, then GST on the whole invoice.
 *
 * Rates vary hugely by city and by workshop, so every money figure is an input
 * with an editable default rather than a fixed number. What is NOT variable is
 * the structure: the refrigerant charge weight is specified by the vehicle
 * maker and stamped on an underbonnet label, and Indian GST on motor vehicle
 * servicing is 18%.
 */

/** GST rate applied to motor vehicle servicing in India. */
export const GST_RATE_PERCENT = 18;

export const REFRIGERANTS = [
  {
    id: "r134a",
    label: "R134a (HFC)",
    defaultPricePerGram: 1.6,
    globalWarmingPotential: 1430,
    fitment: "Fitted to most cars sold up to the late 2010s.",
    note: "Widely available and cheap, but a high-GWP gas being phased down worldwide.",
  },
  {
    id: "r1234yf",
    label: "R1234yf (HFO)",
    defaultPricePerGram: 14,
    globalWarmingPotential: 4,
    fitment: "Fitted to newer models; check the underbonnet label before assuming R134a.",
    note: "Very low global warming potential, but many times the price per gram and needs its own service machine.",
  },
  {
    id: "r12",
    label: "R12 (CFC, pre-1995 cars)",
    defaultPricePerGram: 0,
    globalWarmingPotential: 10900,
    fitment: "Original fitment on cars built before the mid-1990s.",
    note: "Banned under the Montreal Protocol. These systems must be retrofitted, not refilled.",
    retrofitRequired: true,
  },
];

/** Typical factory charge weights. Always confirm against the underbonnet label. */
export const VEHICLE_CLASSES = [
  { id: "hatchback", label: "Hatchback", typicalGrams: 450, rangeText: "400-500 g" },
  { id: "sedan", label: "Sedan / compact SUV", typicalGrams: 575, rangeText: "500-650 g" },
  { id: "suv", label: "SUV / MPV", typicalGrams: 775, rangeText: "650-900 g" },
  { id: "suvRear", label: "SUV / MPV with rear AC", typicalGrams: 950, rangeText: "800-1100 g" },
];

/** Optional parts, with editable default prices. */
export const SERVICE_PARTS = [
  { id: "oring", label: "O-ring and seal kit", defaultCost: 300, why: "Replaced whenever a joint is opened; the cheapest way to stop a slow leak returning." },
  { id: "drier", label: "Receiver drier / accumulator", defaultCost: 1200, why: "Should be replaced any time the system has been open to atmosphere for long." },
  { id: "expansionValve", label: "Expansion valve or orifice tube", defaultCost: 1800, why: "Replaced when cooling is poor despite a correct charge." },
  { id: "cabinFilter", label: "Cabin / AC filter", defaultCost: 600, why: "A blocked filter mimics low gas — weak airflow with cold air at the vent." },
  { id: "condenser", label: "Condenser", defaultCost: 4500, why: "Stone damage and corrosion at the front of the car are a common leak point." },
  { id: "compressor", label: "Compressor", defaultCost: 12000, why: "The big-ticket item; a seized compressor usually takes the drier and pipes with it." },
];

/** Optional service-bay charges. */
export const SERVICE_EXTRAS = [
  { id: "leakTest", label: "Leak test with UV dye or sniffer", defaultCost: 500 },
  { id: "recovery", label: "Recovery and recycling of old gas", defaultCost: 300 },
  { id: "vacuum", label: "Vacuum / evacuation cycle", defaultCost: 400 },
  { id: "sanitise", label: "Evaporator cleaning and cabin sanitisation", defaultCost: 700 },
];

export const MAX_CHARGE_GRAMS = 3000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

export function getRefrigerant(id) {
  return REFRIGERANTS.find((item) => item.id === id) || null;
}

export function getVehicleClass(id) {
  return VEHICLE_CLASSES.find((item) => item.id === id) || null;
}

function collectLineItems(catalogue, selectedIds, overrides) {
  const chosen = Array.isArray(selectedIds) ? selectedIds : [];
  const costs = overrides && typeof overrides === "object" ? overrides : {};
  const items = [];
  for (const entry of catalogue) {
    if (!chosen.includes(entry.id)) continue;
    const raw = costs[entry.id];
    const cost = isNum(raw) ? raw : entry.defaultCost;
    if (cost < 0) return { error: `Cost for "${entry.label}" cannot be negative.` };
    items.push({ id: entry.id, label: entry.label, cost });
  }
  return { items };
}

/**
 * @param {object} input
 * @param {string} input.refrigerant     REFRIGERANTS[].id
 * @param {number} input.chargeGrams     grams of gas to be charged
 * @param {number} input.pricePerGram    workshop rate per gram
 * @param {number} input.labourCost      labour for evacuate and recharge
 * @param {string[]} [input.partIds]     SERVICE_PARTS[].id values
 * @param {string[]} [input.extraIds]    SERVICE_EXTRAS[].id values
 * @param {object} [input.costOverrides] { [id]: cost } to override defaults
 * @param {boolean} [input.applyGst]     add GST to the invoice
 */
export function estimateAcServiceCost({
  refrigerant,
  chargeGrams,
  pricePerGram,
  labourCost,
  partIds = [],
  extraIds = [],
  costOverrides = {},
  applyGst = true,
}) {
  const gas = getRefrigerant(refrigerant);
  if (!gas) return { error: "Choose the refrigerant your car uses." };

  if (![chargeGrams, pricePerGram, labourCost].every(isNum)) {
    return { error: "Enter valid numbers for charge weight, gas rate and labour." };
  }
  if (chargeGrams <= 0) return { error: "Charge weight must be greater than zero." };
  if (chargeGrams > MAX_CHARGE_GRAMS) {
    return { error: `A car AC charge above ${MAX_CHARGE_GRAMS} g is not plausible — check the label figure.` };
  }
  if (pricePerGram < 0 || labourCost < 0) {
    return { error: "Rates and labour cannot be negative." };
  }

  const partsResult = collectLineItems(SERVICE_PARTS, partIds, costOverrides);
  if (partsResult.error) return { error: partsResult.error };
  const extrasResult = collectLineItems(SERVICE_EXTRAS, extraIds, costOverrides);
  if (extrasResult.error) return { error: extrasResult.error };

  const gasCost = chargeGrams * pricePerGram;
  const partsCost = partsResult.items.reduce((acc, item) => acc + item.cost, 0);
  const extrasCost = extrasResult.items.reduce((acc, item) => acc + item.cost, 0);
  const subtotal = gasCost + partsCost + extrasCost + labourCost;
  const gstAmount = applyGst ? (subtotal * GST_RATE_PERCENT) / 100 : 0;
  const total = subtotal + gstAmount;

  // A charge of X grams of a gas with GWP G is equivalent to X/1000 x G kg of CO2.
  const co2EquivalentKg = (chargeGrams / 1000) * gas.globalWarmingPotential;

  const warnings = [];
  if (gas.retrofitRequired) {
    warnings.push(
      "R12 has been banned under the Montreal Protocol since the 1990s. This system needs a retrofit to R134a, not a refill.",
    );
  }
  warnings.push(
    "Refrigerant is not consumed. If the system needed gas, it has a leak — find and fix it or you will pay for the same gas again.",
  );
  if (!partIds.includes("oring") && !partIds.includes("drier")) {
    warnings.push(
      "Ask whether the O-rings and drier are being replaced; refilling without them is the usual reason a regas lasts a season.",
    );
  }
  warnings.push(
    "Refuse hydrocarbon or 'cooling gas' substitutes sold as a cheap R134a replacement — they are flammable and not approved for automotive systems.",
  );

  return {
    refrigerantLabel: gas.label,
    chargeGrams,
    pricePerGram,
    gasCost: round2(gasCost),
    partsBreakdown: partsResult.items,
    partsCost: round2(partsCost),
    extrasBreakdown: extrasResult.items,
    extrasCost: round2(extrasCost),
    labourCost: round2(labourCost),
    subtotal: round2(subtotal),
    gstRatePercent: applyGst ? GST_RATE_PERCENT : 0,
    gstAmount: round2(gstAmount),
    total: round2(total),
    costPerGramAllIn: round2(total / chargeGrams),
    globalWarmingPotential: gas.globalWarmingPotential,
    co2EquivalentKg: round2(co2EquivalentKg),
    warnings,
  };
}

/**
 * Compare the same job done with each refrigerant, to show why an R1234yf car
 * costs several times more to regas than an older R134a one.
 */
export function compareRefrigerantCost({ chargeGrams, labourCost = 0 }) {
  if (![chargeGrams, labourCost].every(isNum)) {
    return { error: "Enter the charge weight and labour as numbers." };
  }
  if (chargeGrams <= 0) return { error: "Charge weight must be greater than zero." };
  if (labourCost < 0) return { error: "Labour cannot be negative." };

  return REFRIGERANTS.filter((gas) => !gas.retrofitRequired).map((gas) => {
    const gasCost = chargeGrams * gas.defaultPricePerGram;
    const subtotal = gasCost + labourCost;
    return {
      id: gas.id,
      label: gas.label,
      pricePerGram: gas.defaultPricePerGram,
      gasCost: round2(gasCost),
      totalWithGst: round2(subtotal * (1 + GST_RATE_PERCENT / 100)),
      globalWarmingPotential: gas.globalWarmingPotential,
    };
  });
}
