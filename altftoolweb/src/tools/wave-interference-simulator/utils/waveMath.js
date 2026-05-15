export const TWO_PI = Math.PI * 2;

const MATH_SCOPE = {
  abs: Math.abs,
  acos: Math.acos,
  asin: Math.asin,
  atan: Math.atan,
  atan2: Math.atan2,
  ceil: Math.ceil,
  cos: Math.cos,
  exp: Math.exp,
  floor: Math.floor,
  log: Math.log,
  log10: Math.log10,
  max: Math.max,
  min: Math.min,
  pow: Math.pow,
  round: Math.round,
  sin: Math.sin,
  sqrt: Math.sqrt,
  tan: Math.tan,
};

const SAFE_FORMULA_PATTERN = /^[\d\sA-Za-z_+\-*/%^().,]+$/;
const BLOCKED_TOKENS = /\b(?:constructor|document|eval|export|function|globalThis|import|new|process|prototype|return|this|window)\b|__/i;

function normalizeFormula(formulaStr) {
  return String(formulaStr || "")
    .replace(/\bMath\./g, "")
    .replace(/\^/g, "**")
    .trim();
}

export function sinWave(x, t, { amplitude, frequency, wavelength, phase, speed = 1 }) {
  const k = TWO_PI / wavelength;
  const omega = TWO_PI * frequency * speed;
  return amplitude * Math.sin(k * x - omega * t + phase);
}

export function rippleWave(px, py, sourceX, sourceY, t, params) {
  const dx = px - sourceX;
  const dy = py - sourceY;
  const r = Math.sqrt(dx * dx + dy * dy);
  const safeR = Math.max(r, 0.01);
  const k = TWO_PI / params.wavelength;
  const omega = TWO_PI * params.frequency * params.speed;
  const decay = 1 / Math.sqrt(safeR + 0.5);
  return params.amplitude * decay * Math.sin(k * safeR - omega * t + params.phase);
}

// Double‑slit intensity on screen
export function doubleSlitIntensity(y, { wavelength, slitSep, screenDist, slitWidth = null }) {
  const k = TWO_PI / wavelength;
  const phaseDiff = k * slitSep * y / screenDist;
  const cosTerm = Math.cos(phaseDiff / 2) ** 2;

  if (slitWidth && slitWidth > 0) {
    const beta = Math.PI * slitWidth * y / (wavelength * screenDist);
    const sinc = beta === 0 ? 1 : Math.sin(beta) / beta;
    return (sinc ** 2) * cosTerm;
  }
  return cosTerm;
}

// Custom formula compilation
export function createCustomWaveFn(formulaStr) {
  try {
    const expression = normalizeFormula(formulaStr);
    if (!expression || !SAFE_FORMULA_PATTERN.test(expression) || BLOCKED_TOKENS.test(expression)) {
      return null;
    }

    const argNames = [
      "x",
      "t",
      "A",
      "k",
      "w",
      "phi",
      "PI",
      "E",
      "wavelength",
      "frequency",
      "phase",
      "amplitude",
      "speed",
      ...Object.keys(MATH_SCOPE),
    ];
    const evaluator = new Function(...argNames, `"use strict"; return (${expression});`);

    return {
      evaluate(scope = {}) {
        const values = [
          scope.x,
          scope.t,
          scope.A,
          scope.k,
          scope.w,
          scope.phi,
          scope.PI ?? Math.PI,
          scope.E ?? Math.E,
          scope.wavelength,
          scope.frequency,
          scope.phase,
          scope.amplitude,
          scope.speed,
          ...Object.values(MATH_SCOPE),
        ];
        return evaluator(...values);
      },
    };
  } catch (e) {
    return null;
  }
}

export function evalCustomWave(compiledFn, x, t, constants = {}) {
  if (!compiledFn) return 0;
  try {
    const scope = { x, t, PI: Math.PI, E: Math.E, ...constants };
    const result = compiledFn.evaluate(scope);
    return Number(result) || 0;
  } catch (e) {
    return 0;
  }
}
