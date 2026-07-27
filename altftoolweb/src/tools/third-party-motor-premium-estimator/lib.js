/**
 * Motor Third Party (TP) premium estimator for India.
 *
 * Rate source: the motor third party premium rates notified by the Ministry of
 * Road Transport and Highways in consultation with IRDAI, effective 1 June 2022.
 * These rates are statutory — every insurer must charge the same TP premium for
 * the same vehicle, so only the own-damage part of a comprehensive policy varies
 * between companies.
 *
 * Electric vehicles are notified at a 15% concession, which is exactly what the
 * separate EV table in the notification works out to (e.g. 2094 x 0.85 = 1780).
 */

export const TP_RATES_EFFECTIVE_FROM = "1 June 2022";

/** Concession applied to battery electric vehicles under the same notification. */
export const EV_DISCOUNT_PERCENT = 15;

/** GST on general (motor) insurance premium. */
export const GST_RATE_PERCENT = 18;

/**
 * Compulsory Personal Accident cover for the owner-driver: Rs 15 lakh sum
 * insured at a flat Rs 375 per year (IRDAI circular of 2019).
 */
export const CPA_SUM_INSURED = 1500000;
export const CPA_PREMIUM_PER_YEAR = 375;

/** New private cars must buy a 3-year TP policy; new two-wheelers a 5-year one. */
export const LONG_TERM_YEARS = { car: 3, twoWheeler: 5 };

/** Private car, internal combustion — bands by cubic capacity. */
export const CAR_CC_BANDS = [
  { max: 1000, label: "Up to 1000 cc", annual: 2094, longTerm: 6521 },
  { max: 1500, label: "1001 cc to 1500 cc", annual: 3416, longTerm: 10640 },
  { max: Infinity, label: "Above 1500 cc", annual: 7897, longTerm: 24596 },
];

/** Private car, battery electric — bands by motor power in kW. */
export const CAR_KW_BANDS = [
  { max: 30, label: "Up to 30 kW", annual: 1780, longTerm: 5543 },
  { max: 65, label: "Above 30 kW to 65 kW", annual: 2904, longTerm: 9044 },
  { max: Infinity, label: "Above 65 kW", annual: 6712, longTerm: 20907 },
];

/** Two-wheeler, internal combustion — bands by cubic capacity. */
export const TW_CC_BANDS = [
  { max: 75, label: "Up to 75 cc", annual: 538, longTerm: 2901 },
  { max: 150, label: "76 cc to 150 cc", annual: 714, longTerm: 3851 },
  { max: 350, label: "151 cc to 350 cc", annual: 1366, longTerm: 7365 },
  { max: Infinity, label: "Above 350 cc", annual: 2804, longTerm: 15117 },
];

/** Two-wheeler, battery electric — bands by motor power in kW. */
export const TW_KW_BANDS = [
  { max: 3, label: "Up to 3 kW", annual: 457, longTerm: 2466 },
  { max: 7, label: "Above 3 kW to 7 kW", annual: 607, longTerm: 3273 },
  { max: 16, label: "Above 7 kW to 16 kW", annual: 1161, longTerm: 6260 },
  { max: Infinity, label: "Above 16 kW", annual: 2383, longTerm: 12849 },
];

/** Sanity ceilings so a typo cannot silently land in the top band. */
export const MAX_CC = 10000;
export const MAX_KW = 1000;

export function bandsFor(vehicleClass, isElectric) {
  if (vehicleClass === "car") return isElectric ? CAR_KW_BANDS : CAR_CC_BANDS;
  return isElectric ? TW_KW_BANDS : TW_CC_BANDS;
}

/** First band whose upper bound is not exceeded by the rating value. */
export function pickBand(bands, value) {
  return bands.find((band) => value <= band.max) || bands[bands.length - 1];
}

/**
 * Estimate the statutory third party premium payable.
 *
 * @param {object} input
 * @param {"car"|"twoWheeler"} input.vehicleClass
 * @param {boolean} input.isElectric  true rates the vehicle on motor kW instead of cc.
 * @param {number}  input.rating      Engine cubic capacity, or motor kW for an EV.
 * @param {"annual"|"longTerm"} input.term
 * @param {boolean} input.includeCpa  Add the compulsory owner-driver personal accident cover.
 * @returns {object} breakdown or { error }
 */
export function estimateTpPremium({
  vehicleClass = "car",
  isElectric = false,
  rating,
  term = "annual",
  includeCpa = true,
}) {
  if (vehicleClass !== "car" && vehicleClass !== "twoWheeler") {
    return { error: "Choose either a private car or a two-wheeler." };
  }
  if (term !== "annual" && term !== "longTerm") {
    return { error: "Choose an annual or a long-term policy." };
  }
  if (typeof rating !== "number" || !Number.isFinite(rating)) {
    return { error: isElectric ? "Enter the motor power in kW." : "Enter the engine capacity in cc." };
  }
  if (rating <= 0) {
    return {
      error: isElectric
        ? "Motor power must be greater than zero kW."
        : "Engine capacity must be greater than zero cc.",
    };
  }
  const ceiling = isElectric ? MAX_KW : MAX_CC;
  if (rating > ceiling) {
    return {
      error: isElectric
        ? `Motor power above ${MAX_KW} kW looks like a typo.`
        : `Engine capacity above ${MAX_CC} cc looks like a typo — check the value.`,
    };
  }

  const bands = bandsFor(vehicleClass, isElectric);
  const band = pickBand(bands, rating);
  const years = term === "longTerm" ? LONG_TERM_YEARS[vehicleClass] : 1;
  const tpPremium = term === "longTerm" ? band.longTerm : band.annual;
  const cpaPremium = includeCpa ? CPA_PREMIUM_PER_YEAR * years : 0;
  const taxable = tpPremium + cpaPremium;
  const gst = (taxable * GST_RATE_PERCENT) / 100;
  const total = taxable + gst;

  return {
    band: band.label,
    years,
    tpPremium,
    cpaPremium,
    taxable,
    gst,
    total,
    perYear: total / years,
    monthlyEquivalent: total / (years * 12),
    isElectric,
    evSaving: isElectric ? Math.round(tpPremium / (1 - EV_DISCOUNT_PERCENT / 100)) - tpPremium : 0,
    ratingUnit: isElectric ? "kW" : "cc",
  };
}
