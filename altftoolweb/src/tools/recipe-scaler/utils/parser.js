
/**
 * Parses an ingredient line into its components.
 * Supports: "2 cups flour", "1 1/2 tsp salt", "0.5 lb chicken", "3 eggs"
 */
export const parseIngredient = (line) => {
  if (!line.trim()) return null;

  // Regex to match quantity:
  // Supports: "1", "1.5", "1/2", "1 1/2", "2.3/4" (though 2 3/4 is more common)
  const quantityRegex = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.?\d+)/;
  const match = line.match(quantityRegex);

  if (!match) {
    return {
      original: line,
      quantity: null,
      unit: null,
      name: line.trim(),
      isScalable: false,
    };
  }

  const quantityStr = match[0].trim();
  const rest = line.slice(quantityStr.length).trim();

  // Common kitchen units
  const units = [
    "tsp", "teaspoon", "tbsp", "tablespoon", "cup", "cups",
    "ml", "l", "liter", "liters", "g", "gram", "grams",
    "kg", "kilogram", "kilograms", "oz", "ounce", "ounces",
    "lb", "pound", "pounds", "pinch", "pinches", "clove", "cloves",
    "slice", "slices", "can", "cans", "bottle", "bottles", "piece", "pieces"
  ];

  // Try to find a unit at the start of the remaining string
  let unit = null;
  let name = rest;

  const firstWord = rest.split(/\s+/)[0].toLowerCase().replace(/[.,]/g, "");
  if (units.includes(firstWord)) {
    unit = rest.split(/\s+/)[0];
    name = rest.slice(unit.length).trim();
  }

  return {
    original: line,
    quantity: quantityStr,
    unit: unit,
    name: name,
    isScalable: true,
  };
};

/**
 * Converts quantity string to float
 */
export const quantityToFloat = (qStr) => {
  if (!qStr) return 0;

  // Mixed fraction: "1 1/2"
  if (qStr.includes(" ")) {
    const [whole, fraction] = qStr.split(/\s+/);
    const [num, den] = fraction.split("/");
    return parseFloat(whole) + (parseFloat(num) / parseFloat(den));
  }

  // Fraction: "1/2"
  if (qStr.includes("/")) {
    const [num, den] = qStr.split("/");
    return parseFloat(num) / parseFloat(den);
  }

  return parseFloat(qStr);
};
