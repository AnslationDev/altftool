/**
 * Weight of reinforcement steel from bar diameter, length and count.
 *
 * A round bar of nominal diameter d (mm) has a cross-section of pi.d^2/4 mm^2.
 * At the standard density of steel, 7850 kg/m^3 (IS 1786 / ASTM A615), the mass
 * of one metre of bar is
 *
 *   w = (pi/4) x (d/1000)^2 x 7850  kg/m
 *     = d^2 x 0.00616538            kg/m
 *     = d^2 / 162.195               kg/m
 *
 * which is the site shorthand "d squared over 162". Checks against the IS 1786
 * unit-weight table: 8 mm -> 0.395 kg/m, 12 mm -> 0.888 kg/m, 16 mm -> 1.58 kg/m,
 * 25 mm -> 3.85 kg/m.
 */

/** Density of carbon steel used for reinforcement, kg/m3. */
export const STEEL_DENSITY_KG_M3 = 7850;

/** The d^2 divisor that falls out of the density above. */
export const D2_DIVISOR = 1 / ((Math.PI / 4) * STEEL_DENSITY_KG_M3 * 1e-6);

/** Nominal bar diameters rolled to IS 1786, in millimetres. */
export const IS_BAR_SIZES = [6, 8, 10, 12, 16, 20, 25, 28, 32, 36, 40];

/** ASTM A615 bar designations and their nominal diameters in millimetres. */
export const ASTM_BAR_SIZES = [
  { label: "#3", mm: 9.525 },
  { label: "#4", mm: 12.7 },
  { label: "#5", mm: 15.875 },
  { label: "#6", mm: 19.05 },
  { label: "#7", mm: 22.225 },
  { label: "#8", mm: 25.4 },
  { label: "#9", mm: 28.65 },
  { label: "#10", mm: 32.26 },
  { label: "#11", mm: 35.81 },
  { label: "#14", mm: 43.0 },
  { label: "#18", mm: 57.33 },
];

/** Mill length a rebar bundle is normally supplied in, metres. */
export const DEFAULT_STOCK_LENGTH_M = 12;

export const KG_PER_TONNE = 1000;

/** Largest diameter the calculator will accept, mm. */
export const MAX_DIAMETER_MM = 100;

/** Unit weight of one metre of round bar, kg/m. */
export function weightPerMetre(diameterMm, densityKgM3 = STEEL_DENSITY_KG_M3) {
  const d = Number(diameterMm);
  const rho = Number(densityKgM3);
  if (!(d > 0) || !(rho > 0)) return 0;
  const areaM2 = (Math.PI / 4) * Math.pow(d / 1000, 2);
  return areaM2 * rho;
}

/** Cross-sectional area of one bar, mm2. */
export function barAreaMm2(diameterMm) {
  const d = Number(diameterMm);
  if (!(d > 0)) return 0;
  return (Math.PI / 4) * d * d;
}

/**
 * @param {object} input
 * @param {Array}  input.rows        [{ diameterMm, lengthM, count }]
 * @param {number} input.lapWastagePct extra length for laps, bends and offcuts
 * @param {number} input.ratePerKg   optional price of steel per kg
 * @param {number} input.stockLengthM mill length one bar is supplied in
 * @param {number} input.densityKgM3
 * @returns {object} per-row and total figures, or { error }
 */
export function computeRebar({
  rows = [],
  lapWastagePct = 0,
  ratePerKg = 0,
  stockLengthM = DEFAULT_STOCK_LENGTH_M,
  densityKgM3 = STEEL_DENSITY_KG_M3,
}) {
  const allowance = Number(lapWastagePct);
  const rate = Number(ratePerKg);
  const stock = Number(stockLengthM);
  const rho = Number(densityKgM3);

  if (!Array.isArray(rows) || rows.length === 0) {
    return { error: "Add at least one bar row." };
  }
  if (!Number.isFinite(allowance) || allowance < 0 || allowance > 100) {
    return { error: "Lap and wastage allowance should be between 0% and 100%." };
  }
  if (!Number.isFinite(rate) || rate < 0) return { error: "Rate per kg cannot be negative." };
  if (!Number.isFinite(stock) || stock <= 0 || stock > 30) {
    return { error: "Stock bar length should be between 0 and 30 metres." };
  }
  if (!Number.isFinite(rho) || rho < 6000 || rho > 9000) {
    return { error: "Steel density should be between 6000 and 9000 kg/m³." };
  }

  const detail = [];
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const d = Number(row?.diameterMm);
    const len = Number(row?.lengthM);
    const count = Number(row?.count);

    if (![d, len, count].every((v) => Number.isFinite(v))) {
      return { error: `Row ${i + 1}: enter a number for diameter, length and count.` };
    }
    if (d <= 0 || d > MAX_DIAMETER_MM) {
      return { error: `Row ${i + 1}: bar diameter must be between 0 and ${MAX_DIAMETER_MM} mm.` };
    }
    if (len <= 0 || len > 1000) {
      return { error: `Row ${i + 1}: length per bar must be between 0 and 1000 m.` };
    }
    if (count < 1 || count > 1000000 || !Number.isInteger(count)) {
      return { error: `Row ${i + 1}: number of bars must be a whole number of at least 1.` };
    }

    const unit = weightPerMetre(d, rho);
    const cutLength = len * count;
    const orderLength = cutLength * (1 + allowance / 100);
    detail.push({
      index: i,
      diameterMm: d,
      lengthM: len,
      count,
      weightPerMetre: unit,
      areaMm2: barAreaMm2(d),
      cutLength,
      orderLength,
      cutWeight: cutLength * unit,
      orderWeight: orderLength * unit,
      stockBars: Math.ceil(orderLength / stock),
    });
  }

  const cutWeight = detail.reduce((sum, row) => sum + row.cutWeight, 0);
  const orderWeight = detail.reduce((sum, row) => sum + row.orderWeight, 0);
  const cutLength = detail.reduce((sum, row) => sum + row.cutLength, 0);
  const orderLength = detail.reduce((sum, row) => sum + row.orderLength, 0);
  const stockBars = detail.reduce((sum, row) => sum + row.stockBars, 0);

  return {
    detail,
    cutLength,
    orderLength,
    cutWeight,
    orderWeight,
    tonnes: orderWeight / KG_PER_TONNE,
    stockBars,
    stockLengthM: stock,
    lapWastagePct: allowance,
    cost: rate > 0 ? orderWeight * rate : 0,
    ratePerKg: rate,
  };
}

/** IS 1786 unit-weight table, generated from the same formula. */
export function unitWeightTable(densityKgM3 = STEEL_DENSITY_KG_M3) {
  return IS_BAR_SIZES.map((mm) => ({
    diameterMm: mm,
    weightPerMetre: weightPerMetre(mm, densityKgM3),
    areaMm2: barAreaMm2(mm),
    weightPer12m: weightPerMetre(mm, densityKgM3) * DEFAULT_STOCK_LENGTH_M,
  }));
}
