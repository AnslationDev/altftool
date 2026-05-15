/**
 * Color Vision Deficiency (CVD) Engine
 * Implements Machado et al. model for accurate color blindness simulation.
 */

// Helper: sRGB to Linear RGB
const sRGBtoLinear = (c) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

// Helper: Linear RGB to sRGB
const linearToSRGB = (c) => {
  c = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, c * 255));
};

// Matrix multiplication: 3x3 * 3x1
const multiplyMatrix = (m, v) => {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
  ];
};

// Matrices for Linear RGB <-> LMS (Hunt-Pointer-Estevez)
const LIN_TO_LMS = [
  0.313990, 0.639512, 0.046497,
  0.155372, 0.757894, 0.086701,
  0.017752, 0.109443, 0.872569
];

const LMS_TO_LIN = [
  5.472212, -4.641989, 0.169637,
  -1.125241, 2.293170, -0.167895,
  0.029801, -0.193136, 1.163647
];

// CVD Matrices in LMS space
const CVD_MATRICES = {
  protanopia: [
    0, 1.05118294, -0.05116099,
    0, 1, 0,
    0, 0, 1
  ],
  deuteranopia: [
    1, 0, 0,
    0.9513092, 0, 0.04866992,
    0, 0, 1
  ],
  tritanopia: [
    1, 0, 0,
    0, 1, 0,
    -0.86744736, 1.86727089, 0
  ]
};

/**
 * Pre-computes a combined 3x3 matrix for direct application on Linear RGB
 * @param {string} type - 'protanopia', 'deuteranopia', 'tritanopia'
 * @param {number} severity - 0 to 1
 */
export const getCVDMatrix = (type, severity = 1) => {
  if (type === 'normal') return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  if (type === 'achromatopsia') return null; // Handled separately via luminance

  const cvd = CVD_MATRICES[type] || CVD_MATRICES.protanopia;
  
  // Interpolate CVD matrix with identity matrix based on severity
  const interpolatedCvd = cvd.map((val, i) => {
    const identity = [1, 0, 0, 0, 1, 0, 0, 0, 1][i];
    return identity + (val - identity) * severity;
  });

  // M_total = LMS_TO_LIN * interpolatedCvd * LIN_TO_LMS
  // We'll do it manually for performance
  const temp = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) {
        sum += LMS_TO_LIN[i * 3 + k] * interpolatedCvd[k * 3 + j];
      }
      temp[i * 3 + j] = sum;
    }
  }

  const final = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) {
        sum += temp[i * 3 + k] * LIN_TO_LMS[k * 3 + j];
      }
      final[i * 3 + j] = sum;
    }
  }

  return final;
};

/**
 * Applies the CVD filter to image data
 */
export const applyCVDFilter = (imageData, type, severity = 1, options = {}) => {
  const { brightness = 1, contrast = 1, saturation = 1 } = options;
  const data = imageData.data;
  const matrix = getCVDMatrix(type, severity);

  // Pre-calculate contrast factor
  const contrastFactor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Basic adjustments (Brightness/Contrast) before simulation
    if (brightness !== 1) {
      r *= brightness;
      g *= brightness;
      b *= brightness;
    }
    if (contrast !== 1) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    if (type === 'achromatopsia') {
      // Achromatopsia uses weighted luminance
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = g = b = lum;
    } else if (matrix) {
      // Simulation pipeline
      // sRGB -> Linear
      const lr = sRGBtoLinear(r);
      const lg = sRGBtoLinear(g);
      const lb = sRGBtoLinear(b);

      // Apply Matrix
      const nr = matrix[0] * lr + matrix[1] * lg + matrix[2] * lb;
      const ng = matrix[3] * lr + matrix[4] * lg + matrix[5] * lb;
      const nb = matrix[6] * lr + matrix[7] * lg + matrix[8] * lb;

      // Linear -> sRGB
      r = linearToSRGB(nr);
      g = linearToSRGB(ng);
      b = linearToSRGB(nb);
    }

    // Saturation adjustment after simulation if needed
    if (saturation !== 1 && type !== 'achromatopsia') {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * saturation;
      g = gray + (g - gray) * saturation;
      b = gray + (b - gray) * saturation;
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
};
