/**
 * Shoe size conversion, anchored on foot length.
 *
 * Every shoe sizing system is a scale over the length of the shoe's last, so the only
 * honest way to convert between them is through foot length. The three scales used here:
 *
 * UK / INDIA — the barleycorn system. One size step is 1/3 of an inch (8.467 mm) and
 * the last is about 2/3 of an inch longer than the foot, which reduces to:
 *       UK size = 3 x (foot length in inches) - 23
 *   Indian adult sizing follows UK sizing, which is why Indian boxes carry UK numbers.
 *
 * US — the same barleycorn steps, offset from UK:
 *       US men = UK + 1        US women = UK + 2.5
 *
 * EU — the Paris point, 2/3 cm per size, over a last about 1.5 cm longer than the foot:
 *       EU size = 1.5 x (foot length in cm + 1.5)
 *
 * JAPAN / MONDOPOINT — the foot length in centimetres itself, no offset.
 *
 * UK, US and Japanese sizes come in half steps; EU sizes are whole numbers, which is
 * why an EU number sometimes lands between two UK half sizes.
 */

/** Exact by definition (1959 international yard and pound agreement). */
export const CM_PER_INCH = 2.54;

/** One barleycorn: 1/3 inch = 8.4667 mm, the UK and US size step. */
export const BARLEYCORN_MM = (CM_PER_INCH * 10) / 3;

/** One Paris point: 2/3 cm, the EU size step. */
export const PARIS_POINT_CM = 2 / 3;

/** Constant in the UK barleycorn formula: UK = 3 x foot inches - 23. */
export const UK_BARLEYCORN_OFFSET = 23;

/** Last allowance built into the EU formula, in centimetres. */
export const EU_LAST_ALLOWANCE_CM = 1.5;

/** US men's sizes run one barleycorn above UK. */
export const US_MEN_OFFSET = 1;
/** US women's sizes run two and a half barleycorns above UK. */
export const US_WOMEN_OFFSET = 2.5;

/** Plausible adult and child foot lengths, in centimetres. */
export const MIN_FOOT_CM = 15;
export const MAX_FOOT_CM = 40;

export const SYSTEMS = [
  { key: "uk", label: "UK / India", step: 0.5 },
  { key: "usMen", label: "US men's", step: 0.5 },
  { key: "usWomen", label: "US women's", step: 0.5 },
  { key: "eu", label: "EU (Paris point)", step: 1 },
  { key: "jp", label: "Japan / Mondopoint (cm)", step: 0.5 },
  { key: "footCm", label: "Foot length (cm)", step: 0.5 },
];

const roundTo = (value, step) => Math.round(value / step) * step;

/** Foot length in centimetres implied by a size in each system. */
export function footCmFromSize({ system = "uk", value }) {
  const size = Number(value);
  if (!Number.isFinite(size)) return NaN;

  switch (system) {
    case "uk":
      return ((size + UK_BARLEYCORN_OFFSET) / 3) * CM_PER_INCH;
    case "usMen":
      return ((size - US_MEN_OFFSET + UK_BARLEYCORN_OFFSET) / 3) * CM_PER_INCH;
    case "usWomen":
      return ((size - US_WOMEN_OFFSET + UK_BARLEYCORN_OFFSET) / 3) * CM_PER_INCH;
    case "eu":
      return size / 1.5 - EU_LAST_ALLOWANCE_CM;
    case "jp":
    case "footCm":
      return size;
    default:
      return NaN;
  }
}

/**
 * Every system's size for a given foot length.
 *
 * @param {number} footCm foot length in centimetres
 * @returns {{error:string}|object}
 */
export function sizesFromFootCm(footCm) {
  const foot = Number(footCm);
  if (!Number.isFinite(foot)) return { error: "Enter the size or measurement as a number." };
  if (foot < MIN_FOOT_CM || foot > MAX_FOOT_CM) {
    return { error: `That works out to a ${foot.toFixed(1)} cm foot, outside the ${MIN_FOOT_CM}-${MAX_FOOT_CM} cm range this chart covers.` };
  }

  const footInches = foot / CM_PER_INCH;
  const ukExact = 3 * footInches - UK_BARLEYCORN_OFFSET;
  const euExact = 1.5 * (foot + EU_LAST_ALLOWANCE_CM);

  return {
    footCm: foot,
    footInches,
    exact: {
      uk: ukExact,
      usMen: ukExact + US_MEN_OFFSET,
      usWomen: ukExact + US_WOMEN_OFFSET,
      eu: euExact,
      jp: foot,
      footCm: foot,
    },
    rounded: {
      uk: roundTo(ukExact, 0.5),
      usMen: roundTo(ukExact + US_MEN_OFFSET, 0.5),
      usWomen: roundTo(ukExact + US_WOMEN_OFFSET, 0.5),
      eu: roundTo(euExact, 1),
      jp: roundTo(foot, 0.5),
      footCm: roundTo(foot, 0.5),
    },
  };
}

/**
 * Convert from any system to all the others.
 *
 * @param {object} input
 * @param {"uk"|"usMen"|"usWomen"|"eu"|"jp"|"footCm"} input.system
 * @param {number} input.value the size or measurement as entered
 * @param {"cm"|"in"} input.unit only used when the system is a length
 * @returns {{error:string}|object}
 */
export function convertShoeSize({ system = "uk", value, unit = "cm" }) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) return { error: "Enter the size or measurement as a number." };
  if (raw <= 0) return { error: "Enter a size or measurement greater than zero." };

  const lengthSystem = system === "footCm" || system === "jp";
  const input = lengthSystem && unit === "in" ? raw * CM_PER_INCH : raw;

  const footCm = footCmFromSize({ system, value: input });
  if (!Number.isFinite(footCm)) return { error: "Pick a sizing system." };

  const result = sizesFromFootCm(footCm);
  if (result.error) return { error: result.error };

  return {
    system,
    entered: raw,
    ...result,
    /** How far the rounded EU number sits from the exact figure, in Paris points. */
    euRoundingGap: result.rounded.eu - result.exact.eu,
  };
}

/**
 * A printable ladder of sizes around the converted one, for a size chart.
 *
 * @param {number} centreFootCm foot length to centre the ladder on
 * @param {number} steps rows on each side
 */
export function sizeLadder(centreFootCm, steps = 4) {
  const rows = [];
  const centre = Number(centreFootCm);
  if (!Number.isFinite(centre)) return rows;

  // One UK half size is half a barleycorn: 4.233 mm.
  const stepCm = BARLEYCORN_MM / 20;
  for (let index = -steps; index <= steps; index += 1) {
    const foot = centre + index * stepCm;
    const entry = sizesFromFootCm(foot);
    if (!entry.error) rows.push({ offset: index, ...entry });
  }
  return rows;
}
