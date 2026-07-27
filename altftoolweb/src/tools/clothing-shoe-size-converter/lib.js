/**
 * Clothing & Shoe Size Converter — pure logic.
 *
 * Two different problems, handled separately:
 *
 *  - Conversion is a table lookup, not arithmetic. There is no formula that
 *    turns a US shoe size into an EU one: the EU (Paris point) scale counts
 *    2/3 cm per size while the US/UK (barleycorn) scale counts 1/3 inch,
 *    so the two only line up at fixed reference points. The table in
 *    ./utils/sizeData.js holds those points; a lookup is the correct method.
 *  - Recommendation is measurement-driven. For shoes the tool picks the first
 *    row whose last length in cm is at least the measured foot length — you
 *    size up, never down. For clothing it picks the first size whose chest or
 *    waist range covers the measurement once the fit offset is applied.
 *
 * Fit offsets, in inches, applied to the body measurement before matching:
 *   Slim −2, Regular 0, Loose +2, Oversized +4.
 * A negative offset makes a smaller size match, which is what "slim" means.
 */

export { SIZE_DATA, FIT_TYPES, CATEGORIES, GENDERS } from "./utils/sizeData";
export {
  convertShoeSize,
  convertClothingSize,
  getRecommendation,
} from "./utils/conversionLogic";

/** Size systems held for footwear. */
export const SHOE_SYSTEMS = ["us", "uk", "eu", "in", "cm"];

/**
 * EU shoe sizes advance 2/3 cm per size (the Paris point), which is why EU
 * numbers move in fractional steps against whole US sizes.
 */
export const PARIS_POINT_CM = 2 / 3;

/**
 * US and UK shoe sizes advance 1/3 inch per size (one barleycorn = 8.46 mm),
 * the mediaeval English unit the scale is still built on.
 */
export const BARLEYCORN_INCH = 1 / 3;
