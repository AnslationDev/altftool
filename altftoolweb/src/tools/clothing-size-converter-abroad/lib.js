/**
 * Clothing size conversion across regional systems.
 *
 * Clothing sizes are NOT a unit conversion — there is no exact factor between a US 6
 * and an EU 38, because each system is a nominal label attached to a body measurement
 * table. The only stable anchor is the body measurement, which is why EN 13402 (the
 * European standard) requires garments to be labelled with the body dimensions they
 * fit, in centimetres.
 *
 * This tool therefore works from measurement tables, not from arithmetic tricks. Two
 * regularities do hold across the mainstream charts and they are what the tables below
 * encode:
 *   Women: UK = EU - 28, US = EU - 32, France = EU + 2, Italy = EU + 4, Japan = US + 3.
 *          EU size is roughly (bust in cm / 2) - 6.
 *   Men:   EU jacket = chest in cm / 2, and UK/US jacket = EU - 10 (chest in inches).
 *
 * Indian retail overwhelmingly follows UK sizing for women and UK/US chest sizing for
 * men, so India is shown alongside UK rather than as a separate column.
 *
 * Vanity sizing means a given brand can run one to two sizes off any chart. Treat the
 * result as the size to try first, not a guarantee.
 */

/** Exact by definition (1959 international yard and pound agreement). */
export const CM_PER_INCH = 2.54;

/**
 * Women's outerwear and dresses. Body measurements are the EU/German table
 * (EU 36 = 84 cm bust, 68 cm waist, 92 cm hip), which the UK, US, French, Italian and
 * Japanese labels are aligned to on the mainstream conversion charts.
 */
export const WOMENS_SIZE_CHART = [
  { eu: 32, uk: 4, us: 0, fr: 34, it: 36, jp: 3, intl: "XXS", bustCm: 76, waistCm: 60, hipCm: 84 },
  { eu: 34, uk: 6, us: 2, fr: 36, it: 38, jp: 5, intl: "XS", bustCm: 80, waistCm: 64, hipCm: 88 },
  { eu: 36, uk: 8, us: 4, fr: 38, it: 40, jp: 7, intl: "S", bustCm: 84, waistCm: 68, hipCm: 92 },
  { eu: 38, uk: 10, us: 6, fr: 40, it: 42, jp: 9, intl: "M", bustCm: 88, waistCm: 72, hipCm: 96 },
  { eu: 40, uk: 12, us: 8, fr: 42, it: 44, jp: 11, intl: "L", bustCm: 92, waistCm: 76, hipCm: 100 },
  { eu: 42, uk: 14, us: 10, fr: 44, it: 46, jp: 13, intl: "XL", bustCm: 96, waistCm: 80, hipCm: 104 },
  { eu: 44, uk: 16, us: 12, fr: 46, it: 48, jp: 15, intl: "XXL", bustCm: 100, waistCm: 84, hipCm: 108 },
  { eu: 46, uk: 18, us: 14, fr: 48, it: 50, jp: 17, intl: "3XL", bustCm: 104, waistCm: 88, hipCm: 112 },
  { eu: 48, uk: 20, us: 16, fr: 50, it: 52, jp: 19, intl: "4XL", bustCm: 110, waistCm: 94, hipCm: 118 },
  { eu: 50, uk: 22, us: 18, fr: 52, it: 54, jp: 21, intl: "5XL", bustCm: 116, waistCm: 100, hipCm: 124 },
];

/**
 * Men's jackets, suits and tops. EU/Italian jacket size is half the chest measurement
 * in centimetres; the UK and US quote the chest in inches, which is EU minus 10.
 */
export const MENS_SIZE_CHART = [
  { eu: 44, ukUs: 34, intl: "XS", chestCm: 88, waistCm: 74 },
  { eu: 46, ukUs: 36, intl: "S", chestCm: 92, waistCm: 78 },
  { eu: 48, ukUs: 38, intl: "S", chestCm: 96, waistCm: 82 },
  { eu: 50, ukUs: 40, intl: "M", chestCm: 100, waistCm: 86 },
  { eu: 52, ukUs: 42, intl: "M", chestCm: 104, waistCm: 90 },
  { eu: 54, ukUs: 44, intl: "L", chestCm: 108, waistCm: 94 },
  { eu: 56, ukUs: 46, intl: "L", chestCm: 112, waistCm: 98 },
  { eu: 58, ukUs: 48, intl: "XL", chestCm: 116, waistCm: 102 },
  { eu: 60, ukUs: 50, intl: "XL", chestCm: 120, waistCm: 106 },
  { eu: 62, ukUs: 52, intl: "XXL", chestCm: 124, waistCm: 110 },
];

/** Men's formal shirt collar sizes: the neck measurement in cm and in inches. */
export const MENS_NECK_CHART = [
  { neckCm: 36, neckIn: 14, intl: "XS" },
  { neckCm: 37, neckIn: 14.5, intl: "S" },
  { neckCm: 38, neckIn: 15, intl: "S" },
  { neckCm: 39, neckIn: 15.5, intl: "M" },
  { neckCm: 41, neckIn: 16, intl: "M" },
  { neckCm: 42, neckIn: 16.5, intl: "L" },
  { neckCm: 43, neckIn: 17, intl: "L" },
  { neckCm: 44, neckIn: 17.5, intl: "XL" },
  { neckCm: 45, neckIn: 18, intl: "XXL" },
];

export const WOMENS_SYSTEMS = [
  { key: "us", label: "US" },
  { key: "uk", label: "UK / India / Australia" },
  { key: "eu", label: "EU (Germany, Spain, Netherlands)" },
  { key: "fr", label: "France" },
  { key: "it", label: "Italy" },
  { key: "jp", label: "Japan" },
  { key: "intl", label: "Letter (XS-XXL)" },
];

export const MENS_SYSTEMS = [
  { key: "ukUs", label: "UK / US / India (chest in inches)" },
  { key: "eu", label: "EU / Italy (jacket size)" },
  { key: "intl", label: "Letter (XS-XXL)" },
];

/** Furthest a body measurement can sit from a chart row before the answer is useless. */
export const MAX_MEASUREMENT_GAP_CM = 8;

/** Plausible human range for a bust or chest measurement, in cm. */
export const MIN_MEASUREMENT_CM = 60;
export const MAX_MEASUREMENT_CM = 160;

export function toCm(value, unit = "cm") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return NaN;
  return unit === "in" ? amount * CM_PER_INCH : amount;
}

const chartFor = (chart) => (chart === "men" ? MENS_SIZE_CHART : WOMENS_SIZE_CHART);
const measurementKeyFor = (chart) => (chart === "men" ? "chestCm" : "bustCm");

/**
 * Find the chart row carrying a given label in a given system.
 *
 * @returns {{error:string}|{row:object}}
 */
export function rowFromLabel({ chart = "women", system = "us", label }) {
  const table = chartFor(chart);
  const wanted = String(label).trim().toUpperCase();
  if (!wanted) return { error: "Pick the size printed on the label." };

  const row = table.find((entry) => String(entry[system]).toUpperCase() === wanted);
  if (!row) return { error: `${wanted} is not in the ${chart === "men" ? "men's" : "women's"} chart for that system.` };
  return { row };
}

/**
 * Find the row closest to a body measurement, and say whether it is a clean match.
 *
 * @returns {{error:string}|{row:object,gapCm:number,exact:boolean,advice:string}}
 */
export function rowFromMeasurement({ chart = "women", measurement, unit = "cm" }) {
  const cm = toCm(measurement, unit);
  if (!Number.isFinite(cm)) return { error: "Enter your measurement as a number." };
  if (cm < MIN_MEASUREMENT_CM || cm > MAX_MEASUREMENT_CM) {
    return { error: `A ${chart === "men" ? "chest" : "bust"} measurement should be between ${MIN_MEASUREMENT_CM} cm and ${MAX_MEASUREMENT_CM} cm — check the unit.` };
  }

  const table = chartFor(chart);
  const key = measurementKeyFor(chart);

  let best = table[0];
  let bestGap = Math.abs(cm - best[key]);
  for (const entry of table) {
    const gap = Math.abs(cm - entry[key]);
    if (gap < bestGap) {
      best = entry;
      bestGap = gap;
    }
  }

  if (bestGap > MAX_MEASUREMENT_GAP_CM) {
    return { error: "That measurement is outside this chart — the shop's own size guide will serve you better." };
  }

  const signedGap = cm - best[key];
  let advice;
  if (Math.abs(signedGap) < 1) advice = "A clean match to the chart.";
  else if (signedGap > 0) advice = `You are ${signedGap.toFixed(1)} cm above this row, so try the next size up as well.`;
  else advice = `You are ${Math.abs(signedGap).toFixed(1)} cm below this row, so the size down may fit better.`;

  return { row: best, gapCm: signedGap, exact: Math.abs(signedGap) < 1, advice, measurementCm: cm };
}

/**
 * One call for the whole tool: convert either a label or a measurement, and return the
 * matching row expressed in every system.
 *
 * @returns {{error:string}|object}
 */
export function convertClothingSize({ chart = "women", mode = "label", system = "us", label, measurement, unit = "cm" }) {
  const found = mode === "measurement"
    ? rowFromMeasurement({ chart, measurement, unit })
    : rowFromLabel({ chart, system, label });

  if (found.error) return { error: found.error };

  const row = found.row;
  const systems = chart === "men" ? MENS_SYSTEMS : WOMENS_SYSTEMS;
  const key = measurementKeyFor(chart);

  return {
    chart,
    row,
    equivalents: systems.map((entry) => ({ key: entry.key, label: entry.label, value: row[entry.key] })),
    measurementCm: row[key],
    measurementIn: row[key] / CM_PER_INCH,
    gapCm: found.gapCm ?? 0,
    advice: found.advice ?? "",
    exact: found.exact ?? true,
  };
}

/** Nearest collar size for a neck measurement. */
export function neckSizeFor({ measurement, unit = "cm" }) {
  const cm = toCm(measurement, unit);
  if (!Number.isFinite(cm)) return { error: "Enter your neck measurement as a number." };
  if (cm < 30 || cm > 55) return { error: "A neck measurement should be between 30 cm and 55 cm — check the unit." };

  let best = MENS_NECK_CHART[0];
  let bestGap = Math.abs(cm - best.neckCm);
  for (const entry of MENS_NECK_CHART) {
    const gap = Math.abs(cm - entry.neckCm);
    if (gap < bestGap) {
      best = entry;
      bestGap = gap;
    }
  }
  return { row: best, gapCm: cm - best.neckCm, measurementCm: cm };
}
