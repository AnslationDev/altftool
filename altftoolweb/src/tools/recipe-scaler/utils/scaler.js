
import { quantityToFloat } from "./parser";

/**
 * Converts decimal to a readable fraction if appropriate.
 * Common kitchen fractions: 1/8, 1/4, 1/3, 1/2, 2/3, 3/4
 */
export const floatToFraction = (val) => {
  if (val === 0) return "0";

  const whole = Math.floor(val);
  const remainder = val - whole;

  if (remainder < 0.01) return whole.toString();

  const tolerance = 0.02;
  const fractions = [
    { n: 1, d: 8, v: 0.125 },
    { n: 1, d: 4, v: 0.25 },
    { n: 1, d: 3, v: 0.333 },
    { n: 1, d: 2, v: 0.5 },
    { n: 2, d: 3, v: 0.666 },
    { n: 3, d: 4, v: 0.75 },
    { n: 7, d: 8, v: 0.875 },
  ];

  for (const f of fractions) {
    if (Math.abs(remainder - f.v) < tolerance) {
      return whole > 0 ? `${whole} ${f.n}/${f.d}` : `${f.n}/${f.d}`;
    }
  }

  // If no common fraction fits, return rounded decimal
  return parseFloat(val.toFixed(2)).toString();
};

/**
 * Scales a parsed ingredient object
 */
export const scaleIngredient = (parsed, factor) => {
  if (!parsed.isScalable) return parsed.original;

  const originalFloat = quantityToFloat(parsed.quantity);
  const scaledFloat = originalFloat * factor;
  const formattedQuantity = floatToFraction(scaledFloat);

  const unitPart = parsed.unit ? ` ${parsed.unit}` : "";
  const namePart = parsed.name ? ` ${parsed.name}` : "";

  return `${formattedQuantity}${unitPart}${namePart}`;
};
