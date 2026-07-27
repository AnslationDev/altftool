/**
 * Housing society maintenance apportionment.
 *
 * Basis of allocation follows bye-law 68 of the Model Bye-laws for Co-operative
 * Housing Societies (Maharashtra, 2014 edition), which most states' societies
 * follow in substance:
 *
 *   Service charges (security, housekeeping, lift running, office, audit,
 *     common electricity, sitting fees)      -> divided EQUALLY between flats
 *   Repairs and maintenance fund             -> in proportion to BUILT-UP AREA
 *   Sinking fund                             -> in proportion to BUILT-UP AREA
 *   Building insurance                       -> in proportion to BUILT-UP AREA
 *   Lease rent                               -> in proportion to BUILT-UP AREA
 *   Water charges                            -> by the NUMBER OF INLETS in the flat
 *   Parking charges                          -> per PARKING SLOT, as the general body fixes
 *   Municipal property tax                   -> the ACTUAL tax billed on each flat
 *
 * Non-occupancy charges on a flat let out to a tenant are capped at 10% of the
 * service charges (excluding municipal taxes) by the Government of Maharashtra
 * circular dated 1 August 2001, which the Bombay High Court upheld.
 *
 * Interest on arrears is capped at 21% per annum simple interest (bye-law 72).
 * The repairs fund must be at least 0.75% per annum and the sinking fund at
 * least 0.25% per annum of the construction cost of each flat (bye-law 13).
 */

export const NON_OCCUPANCY_MAX_PERCENT = 10;
export const ARREARS_INTEREST_MAX_PERCENT = 21;
export const REPAIRS_FUND_MIN_PERCENT_PA = 0.75;
export const SINKING_FUND_MIN_PERCENT_PA = 0.25;

/** Every head of expenditure and the basis on which it is shared. */
export const CHARGE_HEADS = [
  { id: "serviceCharges", label: "Service charges", basis: "equal", hint: "Security, housekeeping, lift, common lights, office, audit" },
  { id: "repairsFund", label: "Repairs and maintenance fund", basis: "area", hint: "At least 0.75% a year of construction cost" },
  { id: "sinkingFund", label: "Sinking fund", basis: "area", hint: "At least 0.25% a year of construction cost" },
  { id: "insurance", label: "Building insurance", basis: "area", hint: "Fire and allied perils policy premium" },
  { id: "leaseRent", label: "Lease rent", basis: "area", hint: "Payable where the land is leasehold" },
  { id: "waterCharges", label: "Water charges", basis: "inlets", hint: "Shared by the number of water inlets in each flat" },
  { id: "parkingCharges", label: "Parking charges", basis: "parking", hint: "Per slot, at the rate the general body fixes" },
];

export const BASIS_LABELS = {
  equal: "Equally per flat",
  area: "In proportion to built-up area",
  inlets: "By number of water inlets",
  parking: "Per parking slot",
  actual: "Actual bill for the flat",
};

const sum = (list, pick) => list.reduce((total, item) => total + pick(item), 0);

/**
 * Split a period's charges between flats.
 *
 * @param {object} input
 * @param {object} input.heads  { serviceCharges, repairsFund, ... } amounts for the period, INR.
 * @param {Array}  input.flats  [{ id, name, area, inlets, parking, propertyTax, tenanted }]
 * @param {number} input.nonOccupancyPercent  Surcharge on tenanted flats, max 10%.
 * @returns {object} allocation or { error }
 */
export function splitSocietyCharges({ heads = {}, flats = [], nonOccupancyPercent = 0 }) {
  if (!Array.isArray(flats) || flats.length === 0) {
    return { error: "Add at least one flat to split the charges." };
  }

  const amounts = {};
  for (const head of CHARGE_HEADS) {
    const value = Number(heads[head.id]);
    if (!Number.isFinite(value)) {
      return { error: `Enter a valid amount for ${head.label.toLowerCase()}.` };
    }
    if (value < 0) {
      return { error: `${head.label} cannot be negative.` };
    }
    amounts[head.id] = value;
  }

  if (typeof nonOccupancyPercent !== "number" || !Number.isFinite(nonOccupancyPercent)) {
    return { error: "Enter a valid non-occupancy percentage." };
  }
  if (nonOccupancyPercent < 0 || nonOccupancyPercent > NON_OCCUPANCY_MAX_PERCENT) {
    return {
      error: `Non-occupancy charges cannot exceed ${NON_OCCUPANCY_MAX_PERCENT}% of service charges.`,
    };
  }

  const clean = [];
  for (const flat of flats) {
    const area = Number(flat.area);
    const inlets = Number(flat.inlets);
    const parking = Number(flat.parking);
    const propertyTax = Number(flat.propertyTax);
    if ([area, inlets, parking, propertyTax].some((n) => !Number.isFinite(n))) {
      return { error: `Enter valid numbers for flat ${flat.name || flat.id}.` };
    }
    if (area < 0 || inlets < 0 || parking < 0 || propertyTax < 0) {
      return { error: `Flat ${flat.name || flat.id} has a negative value.` };
    }
    clean.push({
      id: flat.id,
      name: flat.name || String(flat.id),
      area,
      inlets,
      parking,
      propertyTax,
      tenanted: Boolean(flat.tenanted),
    });
  }

  const totalArea = sum(clean, (f) => f.area);
  const totalInlets = sum(clean, (f) => f.inlets);
  const totalParking = sum(clean, (f) => f.parking);
  const flatCount = clean.length;

  const areaPool = amounts.repairsFund + amounts.sinkingFund + amounts.insurance + amounts.leaseRent;
  if (areaPool > 0 && totalArea <= 0) {
    return { error: "Area-based charges need a built-up area for at least one flat." };
  }
  if (amounts.waterCharges > 0 && totalInlets <= 0) {
    return { error: "Water charges need at least one water inlet across the flats." };
  }
  if (amounts.parkingCharges > 0 && totalParking <= 0) {
    return { error: "Parking charges need at least one parking slot across the flats." };
  }

  const equalPerFlat = amounts.serviceCharges / flatCount;

  const rows = clean.map((flat) => {
    const areaShare = totalArea > 0 ? (areaPool * flat.area) / totalArea : 0;
    const waterShare = totalInlets > 0 ? (amounts.waterCharges * flat.inlets) / totalInlets : 0;
    const parkingShare =
      totalParking > 0 ? (amounts.parkingCharges * flat.parking) / totalParking : 0;
    const nonOccupancy = flat.tenanted ? (equalPerFlat * nonOccupancyPercent) / 100 : 0;
    const total =
      equalPerFlat + areaShare + waterShare + parkingShare + flat.propertyTax + nonOccupancy;
    return {
      ...flat,
      serviceShare: equalPerFlat,
      areaShare,
      waterShare,
      parkingShare,
      nonOccupancy,
      total,
      perSqft: flat.area > 0 ? total / flat.area : 0,
    };
  });

  const grandTotal = sum(rows, (r) => r.total);
  const totalPropertyTax = sum(clean, (f) => f.propertyTax);
  const totalNonOccupancy = sum(rows, (r) => r.nonOccupancy);

  return {
    rows: rows.map((row) => ({
      ...row,
      sharePercent: grandTotal > 0 ? (row.total / grandTotal) * 100 : 0,
    })),
    flatCount,
    totalArea,
    totalInlets,
    totalParking,
    equalPerFlat,
    areaPool,
    areaRatePerSqft: totalArea > 0 ? areaPool / totalArea : 0,
    totalPropertyTax,
    totalNonOccupancy,
    budgetTotal:
      amounts.serviceCharges +
      areaPool +
      amounts.waterCharges +
      amounts.parkingCharges +
      totalPropertyTax,
    grandTotal,
    annualTotal: grandTotal * 12,
    amounts,
  };
}

/**
 * Simple interest on arrears, capped at the bye-law ceiling of 21% per annum.
 * @param {number} outstanding Amount in arrears, INR.
 * @param {number} months      Months overdue.
 * @param {number} ratePercent Annual simple interest the society has resolved.
 */
export function arrearsInterest(outstanding, months, ratePercent) {
  if (![outstanding, months, ratePercent].every((n) => typeof n === "number" && Number.isFinite(n))) {
    return { error: "Enter valid numbers to compute arrears interest." };
  }
  if (outstanding < 0 || months < 0) {
    return { error: "Arrears and months overdue cannot be negative." };
  }
  if (ratePercent < 0 || ratePercent > ARREARS_INTEREST_MAX_PERCENT) {
    return {
      error: `A society cannot charge more than ${ARREARS_INTEREST_MAX_PERCENT}% a year on arrears.`,
    };
  }
  const interest = (outstanding * ratePercent * months) / (100 * 12);
  return { interest, payable: outstanding + interest };
}
