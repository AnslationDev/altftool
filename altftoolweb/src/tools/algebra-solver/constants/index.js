export const EQUATION_TYPES = [
  { id: "linear", label: "Linear Equation", desc: "ax + b = c", example: "2x + 5 = 13" },
  { id: "quadratic", label: "Quadratic Equation", desc: "ax² + bx + c = 0", example: "x² - 5x + 6 = 0" },
  { id: "system", label: "System of Equations", desc: "Two equations, two unknowns", example: "2x + y = 7, x - y = 2" },
];

export const SAMPLE_EQUATIONS = {
  linear: [
    "2x + 5 = 13",
    "3x - 7 = 8",
    "5x + 10 = 0",
    "4x - 3 = 2x + 7",
    "7x + 2 = 2x + 27",
  ],
  quadratic: [
    "x^2 - 5x + 6 = 0",
    "x^2 + 3x - 10 = 0",
    "2x^2 - 8x + 6 = 0",
    "x^2 - 4 = 0",
    "x^2 + 6x + 9 = 0",
  ],
  system: [
    "2x + y = 7, x - y = 2",
    "3x + 2y = 12, x - y = 1",
    "x + y = 5, 2x - y = 1",
    "4x + 3y = 10, 2x - y = 0",
    "3x - 2y = 6, x + y = 5",
  ],
};
