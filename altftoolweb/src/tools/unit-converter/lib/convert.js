import { LengthFactors, WeightFactors } from "./constants";

export function convertValue(category, fromUnit, toUnit, value) {
  if (!Number.isFinite(value)) return NaN;
  if (fromUnit === toUnit) return value;

  if (category === "temperature") {
    // Normalize to Celsius
    let c = value;
    if (fromUnit === "F") c = ((value - 32) * 5) / 9;
    else if (fromUnit === "K") c = value - 273.15;

    if (toUnit === "C") return c;
    if (toUnit === "F") return (c * 9) / 5 + 32;
    if (toUnit === "K") return c + 273.15;
    return NaN;
  }

  const FACTORS = category === "length" ? LengthFactors : WeightFactors;
  const toBase = value * FACTORS[fromUnit];
  return toBase / FACTORS[toUnit];
}
