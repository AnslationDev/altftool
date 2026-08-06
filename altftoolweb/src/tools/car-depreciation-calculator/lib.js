/**
 * Car depreciation: the market resale curve and the statutory insurance curve.
 *
 * Two different numbers are called "depreciation" for a car and they are not
 * interchangeable:
 *
 * 1. RESALE / MARKET depreciation — the declining-balance model.
 *      value(n) = P x (1 - r1) x (1 - r)^(n - 1)
 *    Each year's loss is a percentage of the value at the START of that year,
 *    not of the original price, which is why the rupee loss shrinks every year
 *    while the percentage stays constant. The first year carries a larger rate
 *    because a car loses its "new" premium the moment it is registered — the
 *    buyer of a one-year-old car pays no road tax, no insurance loading and no
 *    dealer margin on it.
 *
 * 2. IDV depreciation — the schedule in the Indian Motor Tariff, which insurers
 *    apply to the manufacturer's listed selling price to arrive at the Insured
 *    Declared Value on a comprehensive own-damage policy:
 *
 *      Age of vehicle                       % depreciation for IDV
 *      not exceeding 6 months                        5%
 *      over 6 months to 1 year                      15%
 *      over 1 year to 2 years                       20%
 *      over 2 years to 3 years                      30%
 *      over 3 years to 4 years                      40%
 *      over 4 years to 5 years                      50%
 *      over 5 years                    mutually agreed between insurer and insured
 *
 *    These are CUMULATIVE percentages off the listed price, not year-on-year
 *    rates, and they exclude registration cost and insurance premium.
 *
 * A third real constraint is the registration certificate. Under the Central
 * Motor Vehicles Rules an RC is issued for 15 years and then renewed in 5-year
 * blocks; court orders in Delhi-NCR additionally bar diesel vehicles over 10
 * years and petrol vehicles over 15 years from the roads, which collapses
 * resale value as those dates approach.
 *
 * All functions are pure and total: bad input returns { error }, never NaN.
 */

/** Indian Motor Tariff IDV depreciation schedule. maxYears is inclusive. */
export const IDV_DEPRECIATION_SCHEDULE = [
  { maxYears: 0.5, pct: 5, label: "Not exceeding 6 months" },
  { maxYears: 1, pct: 15, label: "Over 6 months, up to 1 year" },
  { maxYears: 2, pct: 20, label: "Over 1 year, up to 2 years" },
  { maxYears: 3, pct: 30, label: "Over 2 years, up to 3 years" },
  { maxYears: 4, pct: 40, label: "Over 3 years, up to 4 years" },
  { maxYears: 5, pct: 50, label: "Over 4 years, up to 5 years" },
];

/** Registration-life limits that cap a car's resale window. */
export const RC_LIFE_YEARS = {
  petrol: 15, // CMVR: RC valid 15 years, renewable in 5-year blocks
  diesel: 15, // 10 years in Delhi-NCR under NGT / Supreme Court orders
  cng: 15,
  ev: 15,
};

/** Delhi-NCR court-ordered end-of-life age, by fuel. */
export const NCR_BAN_YEARS = { petrol: 15, diesel: 10, cng: 15, ev: 15 };

export const FUEL_TYPES = [
  { id: "petrol", label: "Petrol" },
  { id: "diesel", label: "Diesel" },
  { id: "cng", label: "CNG" },
  { id: "ev", label: "Electric" },
];

/** Default declining-balance rates for a mainstream Indian hatchback/sedan. */
export const DEFAULT_FIRST_YEAR_RATE = 20;
export const DEFAULT_SUBSEQUENT_RATE = 15;

/** Benchmark running used to judge whether a car is high- or low-mileage. */
export const BENCHMARK_KM_PER_YEAR = 12000;

/** Value adjustment per 1,000 km away from the benchmark, as % of value. */
export const KM_ADJUST_PCT_PER_1000KM = 0.5;

/** The km adjustment is capped so it can never dominate the model. */
export const MAX_KM_ADJUST_PCT = 20;

/** Resale rarely falls below this share of ex-showroom while the car runs. */
export const DEFAULT_FLOOR_PCT = 8;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

const round = (v, dp = 2) => {
  if (!Number.isFinite(v)) return 0;
  const f = 10 ** dp;
  return Math.round((v + Number.EPSILON) * f) / f;
};

/**
 * IDV depreciation from the Indian Motor Tariff schedule.
 * Beyond 5 years the tariff says the figure is mutually agreed, so no
 * percentage is invented — the caller is told to negotiate it.
 */
export function irdaiIdv({ listedPrice, ageYears }) {
  if (!isNum(listedPrice) || listedPrice <= 0) {
    return { error: "Enter the manufacturer's listed (ex-showroom) price." };
  }
  if (!isNum(ageYears) || ageYears < 0) {
    return { error: "Vehicle age cannot be negative." };
  }

  const band = IDV_DEPRECIATION_SCHEDULE.find((b) => ageYears <= b.maxYears);
  if (!band) {
    return {
      beyondSchedule: true,
      depreciationPct: null,
      idv: null,
      label: "Over 5 years — mutually agreed",
      note:
        "Past five years the tariff leaves IDV to be agreed between you and the insurer, usually anchored to current market value.",
    };
  }

  const idv = listedPrice * (1 - band.pct / 100);
  return {
    beyondSchedule: false,
    depreciationPct: band.pct,
    idv: round(idv, 0),
    label: band.label,
    note:
      "IDV is set on the listed selling price of the make/model/variant, excluding registration cost and insurance premium. Accessories fitted later are insured separately.",
  };
}

/**
 * Adjustment for running above or below the benchmark, expressed as a
 * percentage of value. Positive result = value is reduced.
 */
export function kmAdjustmentPct({ kmDriven, ageYears, benchmarkKmPerYear = BENCHMARK_KM_PER_YEAR, ratePer1000 = KM_ADJUST_PCT_PER_1000KM }) {
  if (!isNum(kmDriven) || !isNum(ageYears) || ageYears <= 0) return 0;
  const expected = benchmarkKmPerYear * ageYears;
  const excessThousands = (kmDriven - expected) / 1000;
  const raw = excessThousands * ratePer1000;
  return round(Math.max(-MAX_KM_ADJUST_PCT, Math.min(MAX_KM_ADJUST_PCT, raw)), 2);
}

/**
 * Full declining-balance curve plus the current-value estimate.
 *
 * The curve is generated to `horizonYears`; the current value is read off the
 * curve at `ageYears` using fractional-year compounding so a 3.5-year-old car
 * is not rounded up to 4.
 */
export function computeCarDepreciation({
  exShowroomPrice,
  ageYears,
  kmDriven,
  firstYearRate = DEFAULT_FIRST_YEAR_RATE,
  subsequentRate = DEFAULT_SUBSEQUENT_RATE,
  horizonYears = 10,
  fuelType = "petrol",
  floorPct = DEFAULT_FLOOR_PCT,
  applyKmAdjustment = true,
}) {
  if (!isNum(exShowroomPrice) || exShowroomPrice <= 0) {
    return { error: "Enter the ex-showroom price the car was bought at." };
  }
  if (exShowroomPrice > 500000000) {
    return { error: "That price is beyond any realistic car — check the number." };
  }
  if (!isNum(ageYears) || ageYears < 0) {
    return { error: "Age cannot be negative. Use 0 for a brand-new car." };
  }
  if (ageYears > 40) {
    return { error: "Enter an age of 40 years or less." };
  }
  if (!isNum(kmDriven) || kmDriven < 0) {
    return { error: "Kilometres driven cannot be negative." };
  }
  if (kmDriven > 2000000) {
    return { error: "That odometer reading is not realistic for a car." };
  }
  if (!isNum(firstYearRate) || firstYearRate < 0 || firstYearRate >= 100) {
    return { error: "First-year depreciation must be between 0% and 99%." };
  }
  if (!isNum(subsequentRate) || subsequentRate < 0 || subsequentRate >= 100) {
    return { error: "Later-year depreciation must be between 0% and 99%." };
  }
  if (!isNum(floorPct) || floorPct < 0 || floorPct > 100) {
    return { error: "Residual floor must be between 0% and 100% of the price." };
  }

  const r1 = firstYearRate / 100;
  const r = subsequentRate / 100;
  const floor = exShowroomPrice * (floorPct / 100);
  const years = Math.max(1, Math.min(30, Math.round(horizonYears)));

  /** Un-floored curve value at any (possibly fractional) age. */
  const rawValueAt = (age) => {
    if (age <= 0) return exShowroomPrice;
    if (age <= 1) return exShowroomPrice * (1 - r1) ** age;
    return exShowroomPrice * (1 - r1) * (1 - r) ** (age - 1);
  };
  const valueAt = (age) => Math.max(floor, rawValueAt(age));

  const rows = [];
  let previous = exShowroomPrice;
  for (let year = 1; year <= years; year += 1) {
    const value = valueAt(year);
    const lossThisYear = previous - value;
    rows.push({
      year,
      value: round(value, 0),
      lossThisYear: round(lossThisYear, 0),
      cumulativeLoss: round(exShowroomPrice - value, 0),
      retainedPct: round((value / exShowroomPrice) * 100, 1),
    });
    previous = value;
  }

  const curveValue = valueAt(ageYears);
  const kmAdjust = applyKmAdjustment
    ? kmAdjustmentPct({ kmDriven, ageYears })
    : 0;
  // A negative kmAdjust (well-below-benchmark mileage) raises the value, but a car can never be
  // worth more than it was bought for — clamp the upper bound at the ex-showroom price so
  // totalLoss/perYearLoss/effectiveAnnualPct can never go negative.
  const adjustedValue = Math.min(
    exShowroomPrice,
    Math.max(floor, curveValue * (1 - kmAdjust / 100)),
  );

  const totalLoss = exShowroomPrice - adjustedValue;
  const perYearLoss = ageYears > 0 ? totalLoss / ageYears : 0;
  const perKmLoss = kmDriven > 0 ? totalLoss / kmDriven : 0;
  // Effective compound rate actually realised over the holding period.
  const effectiveAnnualPct =
    ageYears > 0 && adjustedValue > 0
      ? (1 - (adjustedValue / exShowroomPrice) ** (1 / ageYears)) * 100
      : 0;

  const idv = irdaiIdv({ listedPrice: exShowroomPrice, ageYears });
  const ncrLimit = NCR_BAN_YEARS[fuelType] ?? 15;
  const rcLimit = RC_LIFE_YEARS[fuelType] ?? 15;

  return {
    exShowroomPrice: round(exShowroomPrice, 0),
    ageYears: round(ageYears, 2),
    kmDriven: round(kmDriven, 0),
    expectedKm: round(BENCHMARK_KM_PER_YEAR * ageYears, 0),
    kmAdjustPct: kmAdjust,
    curveValue: round(curveValue, 0),
    currentValue: round(adjustedValue, 0),
    retainedPct: round((adjustedValue / exShowroomPrice) * 100, 1),
    totalLoss: round(totalLoss, 0),
    perYearLoss: round(perYearLoss, 0),
    perKmLoss: round(perKmLoss, 2),
    effectiveAnnualPct: round(effectiveAnnualPct, 2),
    floorValue: round(floor, 0),
    rows,
    idv,
    yearsToRcExpiry: round(Math.max(0, rcLimit - ageYears), 1),
    yearsToNcrLimit: round(Math.max(0, ncrLimit - ageYears), 1),
    ncrLimit,
    rcLimit,
    fuelType,
  };
}
