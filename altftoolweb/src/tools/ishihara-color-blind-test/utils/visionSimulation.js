/**
 * Color vision deficiency simulation logic.
 * Based on LMS color space transformations.
 */

const CVD_MATRICES = {
  normal: [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ],
  protanopia: [
    0.567, 0.433, 0.0,
    0.558, 0.442, 0.0,
    0.0, 0.242, 0.758
  ],
  deuteranopia: [
    0.625, 0.375, 0.0,
    0.7, 0.3, 0.0,
    0.0, 0.3, 0.7
  ],
  tritanopia: [
    0.95, 0.05, 0.0,
    0.0, 0.433, 0.567,
    0.0, 0.475, 0.525
  ],
  achromatopsia: [
    0.299, 0.587, 0.114,
    0.299, 0.587, 0.114,
    0.299, 0.587, 0.114
  ]
};

export const simulateCVD = (hex, mode) => {
  if (mode === "normal" || !CVD_MATRICES[mode]) return hex;

  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const m = CVD_MATRICES[mode];
  
  // Apply matrix
  const nr = Math.min(255, Math.max(0, r * m[0] + g * m[1] + b * m[2]));
  const ng = Math.min(255, Math.max(0, r * m[3] + g * m[4] + b * m[5]));
  const nb = Math.min(255, Math.max(0, r * m[6] + g * m[7] + b * m[8]));

  // Convert back to hex
  return `#${Math.round(nr).toString(16).padStart(2, '0')}${Math.round(ng).toString(16).padStart(2, '0')}${Math.round(nb).toString(16).padStart(2, '0')}`;
};
