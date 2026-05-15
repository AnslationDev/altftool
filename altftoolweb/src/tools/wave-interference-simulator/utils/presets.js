export const PRESETS = {
  perfectConstructive: {
    mode: "interference",
    waves: [
      { amplitude: 1.5, frequency: 2, wavelength: 1.2, phase: 0, speed: 1 },
      { amplitude: 1.5, frequency: 2, wavelength: 1.2, phase: 0, speed: 1 },
    ],
    emitterDistance: 3,
  },
  perfectDestructive: {
    mode: "interference",
    waves: [
      { amplitude: 1.5, frequency: 2, wavelength: 1.2, phase: Math.PI, speed: 1 },
      { amplitude: 1.5, frequency: 2, wavelength: 1.2, phase: 0, speed: 1 },
    ],
    emitterDistance: 3,
  },
  standingWave: {
    mode: "standing",
    waves: [
      { amplitude: 1.5, frequency: 2.5, wavelength: 1.0, phase: 0, speed: 1 },
      { amplitude: 1.5, frequency: 2.5, wavelength: 1.0, phase: Math.PI, speed: -1 },
    ],
    emitterDistance: 0,
  },
  rippleChaos: {
    mode: "ripple",
    waves: [
      { amplitude: 2.0, frequency: 1.8, wavelength: 1.5, phase: 0, speed: 1 },
      { amplitude: 2.0, frequency: 1.8, wavelength: 1.5, phase: Math.PI / 2, speed: 1 },
    ],
    emitterDistance: 2.8,
  },
  harmonic: {
    mode: "interference",
    waves: [
      { amplitude: 1.5, frequency: 2, wavelength: 1.5, phase: 0, speed: 1 },
      { amplitude: 0.8, frequency: 4, wavelength: 0.75, phase: 0, speed: 1 },
    ],
    emitterDistance: 0,
  },
  slowMotion: {
    mode: "single",
    waves: [{ amplitude: 2, frequency: 1, wavelength: 2, phase: 0, speed: 0.3 }],
    emitterDistance: 0,
  },
  // Laser presets for double-slit mode
  laser405: {
    mode: "doubleslit",
    waves: [
      { amplitude: 1, frequency: 1, wavelength: 0.001, phase: 0, speed: 1 },
      { amplitude: 1, frequency: 1, wavelength: 0.001, phase: 0, speed: 1 },
    ],
    emitterDistance: 0,
    doubleSettings: {
      wavelength: 405e-9,
      slitSep: 0.2e-3,
      screenDist: 1.5,
      slitWidth: 0,
    },
  },
  laser532: {
    mode: "doubleslit",
    waves: [
      { amplitude: 1, frequency: 1, wavelength: 0.001, phase: 0, speed: 1 },
      { amplitude: 1, frequency: 1, wavelength: 0.001, phase: 0, speed: 1 },
    ],
    emitterDistance: 0,
    doubleSettings: {
      wavelength: 532e-9,
      slitSep: 0.2e-3,
      screenDist: 1.5,
      slitWidth: 0,
    },
  },
  laser633: {
    mode: "doubleslit",
    waves: [
      { amplitude: 1, frequency: 1, wavelength: 0.001, phase: 0, speed: 1 },
      { amplitude: 1, frequency: 1, wavelength: 0.001, phase: 0, speed: 1 },
    ],
    emitterDistance: 0,
    doubleSettings: {
      wavelength: 633e-9,
      slitSep: 0.2e-3,
      screenDist: 1.5,
      slitWidth: 0,
    },
  },
};