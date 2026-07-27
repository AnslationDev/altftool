/**
 * Tyre size conversion between the metric (P-metric / ISO) and inch (flotation) systems.
 *
 * Metric — 205/55R16
 *   205 = section width in millimetres
 *    55 = aspect ratio, sidewall height as a PERCENTAGE of section width
 *    16 = rim diameter in inches
 *   sidewall = width x aspect / 100
 *   overall  = rim x 25.4 + 2 x sidewall
 *
 * Inch / flotation — 31x10.50R15
 *   31    = overall diameter in inches
 *   10.50 = section width in inches
 *   15    = rim diameter in inches
 *   sidewall = (overall - rim) / 2
 *   aspect   = sidewall / width x 100
 *
 * Rolling geometry follows from the overall diameter:
 *   circumference   = pi x overall
 *   revolutions/km  = 1,000,000 mm / circumference(mm)
 *   revolutions/mile= 1,609,344 mm / circumference(mm)
 *
 * A speedometer is calibrated to the factory tyre's rolling circumference, so fitting a
 * different diameter scales true speed by (newDiameter / stockDiameter).
 */

/** Exact international inch, in millimetres. */
export const MM_PER_INCH = 25.4;

/** Millimetres in one statute mile (1609.344 m). */
export const MM_PER_MILE = 1609344;

/**
 * Industry fitment guidance: keep a replacement tyre's overall diameter within about
 * 3% of the original, otherwise speedometer, odometer, ABS and stability-control
 * calibration all drift and gearing changes noticeably.
 */
export const SAFE_DIAMETER_TOLERANCE_PCT = 3;

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
 * Derive every dimension from section width (mm), aspect ratio (%) and rim (inches).
 * @returns {object} spec, or { error } if the numbers are not a real tyre.
 */
export function specFromMetric({ widthMm, aspectRatio, rimInch }) {
  const width = toNumber(widthMm);
  const aspect = toNumber(aspectRatio);
  const rim = toNumber(rimInch);

  if ([width, aspect, rim].some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers for width, aspect ratio and rim size." };
  }
  if (width < 100 || width > 500) return { error: "Section width should be between 100 mm and 500 mm." };
  if (aspect < 20 || aspect > 95) return { error: "Aspect ratio should be between 20 and 95." };
  if (rim < 8 || rim > 30) return { error: "Rim diameter should be between 8 and 30 inches." };

  const sidewallMm = (width * aspect) / 100;
  const rimMm = rim * MM_PER_INCH;
  const overallMm = rimMm + 2 * sidewallMm;

  return buildSpec({ widthMm: width, aspectRatio: aspect, rimInch: rim, sidewallMm, rimMm, overallMm });
}

/**
 * Derive every dimension from overall diameter (in), section width (in) and rim (in).
 * @returns {object} spec, or { error } if the numbers are not a real tyre.
 */
export function specFromInch({ diameterInch, widthInch, rimInch }) {
  const diameter = toNumber(diameterInch);
  const widthIn = toNumber(widthInch);
  const rim = toNumber(rimInch);

  if ([diameter, widthIn, rim].some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers for diameter, width and rim size." };
  }
  if (rim < 8 || rim > 30) return { error: "Rim diameter should be between 8 and 30 inches." };
  if (widthIn < 4 || widthIn > 20) return { error: "Section width should be between 4 and 20 inches." };
  if (diameter <= rim) return { error: "Overall diameter must be larger than the rim diameter." };
  if (diameter > 60) return { error: "Overall diameter above 60 inches is not a road tyre." };

  const sidewallIn = (diameter - rim) / 2;
  const sidewallMm = sidewallIn * MM_PER_INCH;
  const widthMm = widthIn * MM_PER_INCH;
  const aspectRatio = (sidewallMm / widthMm) * 100;

  if (aspectRatio < 20 || aspectRatio > 95) {
    return {
      error: `That works out to a ${round(aspectRatio)} aspect ratio, which is outside the 20–95 range real tyres are made in. Check the diameter and width.`,
    };
  }

  return buildSpec({
    widthMm,
    aspectRatio,
    rimInch: rim,
    sidewallMm,
    rimMm: rim * MM_PER_INCH,
    overallMm: diameter * MM_PER_INCH,
  });
}

function buildSpec({ widthMm, aspectRatio, rimInch, sidewallMm, rimMm, overallMm }) {
  const circumferenceMm = Math.PI * overallMm;
  const widthInch = widthMm / MM_PER_INCH;
  const overallInch = overallMm / MM_PER_INCH;

  return {
    widthMm: round(widthMm, 1),
    widthInch: round(widthInch, 2),
    aspectRatio: round(aspectRatio, 1),
    rimInch: round(rimInch, 1),
    rimMm: round(rimMm, 1),
    sidewallMm: round(sidewallMm, 1),
    sidewallInch: round(sidewallMm / MM_PER_INCH, 2),
    overallMm: round(overallMm, 1),
    overallInch: round(overallInch, 2),
    circumferenceMm: round(circumferenceMm, 1),
    circumferenceInch: round(circumferenceMm / MM_PER_INCH, 2),
    revsPerKm: round(1000000 / circumferenceMm, 1),
    revsPerMile: round(MM_PER_MILE / circumferenceMm, 1),
    metricLabel: `${Math.round(widthMm)}/${Math.round(aspectRatio)}R${round(rimInch, 1)}`,
    inchLabel: `${round(overallInch, 1)}x${round(widthInch, 2)}R${round(rimInch, 1)}`,
  };
}

/**
 * Parse either "205/55R16" or "31x10.50R15" into the inputs for the matching spec builder.
 * @returns {object} { system, widthMm, aspectRatio, rimInch } or { system, diameterInch, widthInch, rimInch }, or { error }.
 */
export function parseTyreSize(text) {
  const raw = String(text || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!raw) return { error: "Enter a tyre size such as 205/55R16 or 31x10.50R15." };

  const metric = raw.match(/^[PLT]?(\d{2,3})\/(\d{2})\s*[RDB-]?\s*(\d{1,2}(?:\.\d)?)$/);
  if (metric) {
    return {
      system: "metric",
      widthMm: Number(metric[1]),
      aspectRatio: Number(metric[2]),
      rimInch: Number(metric[3]),
    };
  }

  const inch = raw.match(/^(\d{2}(?:\.\d+)?)[X*](\d{1,2}(?:\.\d+)?)\s*[RDB-]?\s*(\d{1,2}(?:\.\d)?)$/);
  if (inch) {
    return {
      system: "inch",
      diameterInch: Number(inch[1]),
      widthInch: Number(inch[2]),
      rimInch: Number(inch[3]),
    };
  }

  return { error: "Could not read that size. Use the form 205/55R16 or 31x10.50R15." };
}

/**
 * Compare a fitted tyre against the factory size.
 * @param {object} spec The tyre you are fitting.
 * @param {object} stock The factory tyre.
 * @param {number|string} [indicatedSpeed] Speed shown on the dial, km/h.
 */
export function compareToStock(spec, stock, indicatedSpeed = 100) {
  if (!spec || spec.error || !stock || stock.error) return null;
  const indicated = toNumber(indicatedSpeed);
  if (Number.isNaN(indicated) || indicated < 0 || indicated > 400) return null;
  if (!(stock.overallMm > 0)) return null;

  const ratio = spec.overallMm / stock.overallMm;
  const diffMm = spec.overallMm - stock.overallMm;
  const diffPct = (ratio - 1) * 100;
  const trueSpeed = indicated * ratio;
  // Odometer reads short when the new tyre is larger: 100 real km displays as 100 / ratio.
  const odometerPer100Km = 100 / ratio;

  return {
    diffMm: round(diffMm, 1),
    diffPct: round(diffPct, 2),
    withinTolerance: Math.abs(diffPct) <= SAFE_DIAMETER_TOLERANCE_PCT,
    indicatedSpeed: round(indicated, 1),
    trueSpeed: round(trueSpeed, 1),
    speedErrorKmph: round(trueSpeed - indicated, 1),
    odometerPer100Km: round(odometerPer100Km, 1),
    groundClearanceChangeMm: round(diffMm / 2, 1),
  };
}

/**
 * One-call entry point used by the UI.
 * @param {object} input
 * @param {"metric"|"inch"} [input.mode] Which system the tyre is entered in.
 * @param {object} input.tyre Inputs for the chosen mode.
 * @param {object} [input.stock] Factory size, always in metric form.
 * @param {number|string} [input.indicatedSpeed] Speedo reading to convert, km/h.
 */
export function convertTyreSize({ mode = "metric", tyre = {}, stock = null, indicatedSpeed = 100 } = {}) {
  const spec = mode === "inch" ? specFromInch(tyre) : specFromMetric(tyre);
  if (spec.error) return { error: spec.error };

  const stockSpec = stock ? specFromMetric(stock) : null;
  if (stockSpec && stockSpec.error) {
    return { spec, stockError: stockSpec.error, comparison: null };
  }

  return {
    spec,
    stockSpec,
    comparison: stockSpec ? compareToStock(spec, stockSpec, indicatedSpeed) : null,
  };
}
