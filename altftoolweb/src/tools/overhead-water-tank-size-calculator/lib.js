/**
 * Overhead water tank sizing.
 *
 * DEMAND RULE — IS 1172:1993 (Code of Basic Requirements for Water Supply,
 * Drainage and Sanitation) recommends a minimum of 135 litres per capita per
 * day (LPCD) for residences with a full flushing system. CPHEEO's Manual on
 * Water Supply and Treatment uses 70 LPCD where there is piped supply but no
 * sewerage, and 150-200 LPCD for metropolitan cities with sewerage.
 *
 * STORAGE RULE — Standard Indian plumbing practice is to keep at least one
 * full day's demand stored on the plot, divided between an underground sump
 * (filled from the mains) and an overhead tank (filled by the pump), with the
 * overhead tank normally holding a third to a half of the total so that a
 * single pump run covers a day of use.
 *
 * Nothing here is a statutory requirement for a specific building; local
 * bye-laws and the plumbing consultant's design always take precedence.
 */

/** Litres per capita per day options, from IS 1172:1993 and the CPHEEO manual. */
export const LPCD_PRESETS = [
  {
    id: "no-sewerage",
    label: "Piped supply, no sewerage",
    lpcd: 70,
    note: "CPHEEO minimum where waste water is not carried away by sewers.",
  },
  {
    id: "is1172",
    label: "House with full flushing system",
    lpcd: 135,
    note: "IS 1172:1993 minimum for residences (excludes fire fighting).",
  },
  {
    id: "metro",
    label: "Metro apartment with sewerage",
    lpcd: 150,
    note: "CPHEEO allowance for metropolitan cities with a sewerage system.",
  },
  {
    id: "premium",
    label: "Premium / villa with landscaping",
    lpcd: 200,
    note: "Upper end of the CPHEEO metropolitan range.",
  },
];

/** Off-the-shelf moulded tank capacities sold in India, in litres. */
export const STANDARD_TANK_SIZES_L = [
  200, 300, 500, 750, 1000, 1500, 2000, 3000, 5000, 7500, 10000, 15000, 20000,
];

/** Exact unit conversions. */
export const LITRES_PER_CUBIC_METRE = 1000;
export const LITRES_PER_CUBIC_FOOT = 28.316846592; // 1 ft = 0.3048 m exactly

/** Smallest catalogue tank that holds `litres`, or null if beyond the range. */
export function nextStandardTank(litres) {
  if (!Number.isFinite(litres) || litres <= 0) return null;
  return STANDARD_TANK_SIZES_L.find((size) => size >= litres) ?? null;
}

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @param {object} input
 * @param {number} input.residents            people living in the home
 * @param {number} input.lpcd                 litres per capita per day
 * @param {number} input.gardenLitresPerDay   extra daily litres for plants
 * @param {number} input.carWashLitresPerDay  extra daily litres for vehicles
 * @param {number} input.storageDays          days of demand to keep in storage
 * @param {number} input.overheadSharePct     % of total storage held overhead
 */
export function computeTankSize({
  residents,
  lpcd,
  gardenLitresPerDay = 0,
  carWashLitresPerDay = 0,
  storageDays,
  overheadSharePct,
}) {
  const values = [
    residents,
    lpcd,
    gardenLitresPerDay,
    carWashLitresPerDay,
    storageDays,
    overheadSharePct,
  ];
  if (!values.every(isNum)) {
    return { error: "Enter a valid number in every field." };
  }
  if (residents < 1) return { error: "There must be at least one resident." };
  if (residents > 5000) return { error: "Enter 5000 residents or fewer." };
  if (lpcd <= 0) return { error: "Litres per person per day must be greater than zero." };
  if (lpcd > 1000) return { error: "Litres per person per day above 1000 is not realistic." };
  if (gardenLitresPerDay < 0 || carWashLitresPerDay < 0) {
    return { error: "Extra daily usage cannot be negative." };
  }
  if (storageDays <= 0) return { error: "Days of storage must be greater than zero." };
  if (storageDays > 14) return { error: "Storing more than 14 days of water risks stagnation." };
  if (overheadSharePct < 5 || overheadSharePct > 100) {
    return { error: "The overhead share must be between 5% and 100% of total storage." };
  }

  const domesticDemand = residents * lpcd;
  const extraDemand = gardenLitresPerDay + carWashLitresPerDay;
  const dailyDemand = domesticDemand + extraDemand;

  const totalStorage = dailyDemand * storageDays;
  const overheadLitres = (totalStorage * overheadSharePct) / 100;
  const sumpLitres = totalStorage - overheadLitres;

  const recommendedOverheadTank = nextStandardTank(overheadLitres);
  const recommendedSumpTank = sumpLitres > 0 ? nextStandardTank(sumpLitres) : 0;

  const overheadCubicMetres = overheadLitres / LITRES_PER_CUBIC_METRE;
  const overheadCubicFeet = overheadLitres / LITRES_PER_CUBIC_FOOT;

  // Hours of use the overhead tank alone covers, at the calculated daily demand.
  const overheadHoursOfSupply = (overheadLitres / dailyDemand) * 24;

  const notes = [];
  if (recommendedOverheadTank === null) {
    notes.push(
      "The overhead requirement is larger than the biggest moulded tank sold (20,000 L) — this needs an RCC tank or a bank of tanks designed by a plumbing consultant.",
    );
  }
  if (overheadSharePct >= 100) {
    notes.push("With 100% overhead there is no sump, so the pump must draw straight off the mains.");
  }
  if (storageDays > 3) {
    notes.push(
      "Water stored beyond about three days should be chlorinated and the tank cleaned more often.",
    );
  }

  return {
    domesticDemand,
    extraDemand,
    dailyDemand,
    perPersonDemand: dailyDemand / residents,
    storageDays,
    totalStorage,
    overheadLitres,
    sumpLitres,
    recommendedOverheadTank,
    recommendedSumpTank,
    overheadCubicMetres,
    overheadCubicFeet,
    overheadHoursOfSupply,
    notes,
  };
}
