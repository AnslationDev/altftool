export const CONVERSION_MODES = [
  { id: "fraction-to-decimal", label: "Fraction → Decimal", from: "Fraction", to: "Decimal" },
  { id: "decimal-to-fraction", label: "Decimal → Fraction", from: "Decimal", to: "Fraction" },
  { id: "fraction-to-percent", label: "Fraction → Percentage", from: "Fraction", to: "Percentage" },
  { id: "percent-to-fraction", label: "Percentage → Fraction", from: "Percentage", to: "Fraction" },
  { id: "decimal-to-percent", label: "Decimal → Percentage", from: "Decimal", to: "Percentage" },
  { id: "percent-to-decimal", label: "Percentage → Decimal", from: "Percentage", to: "Decimal" },
  { id: "mixed-to-improper", label: "Mixed → Improper", from: "Mixed Number", to: "Improper Fraction" },
  { id: "improper-to-mixed", label: "Improper → Mixed", from: "Improper Fraction", to: "Mixed Number" },
];

export const QUICK_FRACTIONS = [
  [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5],
  [1, 6], [5, 6], [1, 8], [3, 8], [5, 8], [7, 8], [1, 10], [3, 10], [7, 10], [9, 10],
  [1, 12], [5, 12], [7, 12], [11, 12], [1, 16], [3, 16], [7, 16], [15, 16],
];

export const QUICK_DECIMALS = [0.1, 0.25, 0.333, 0.5, 0.667, 0.75, 0.8, 0.9, 1.25, 1.5, 2.5, 3.333];

export const QUICK_PERCENTAGES = [10, 12.5, 20, 25, 33.33, 50, 66.67, 75, 80, 90, 100, 150];
