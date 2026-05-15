export const PRESETS = {
  classic: {
    label: "Classic 3:2",
    freqX: 3,
    freqY: 2,
    phase: 90,
    amplitudeX: 88,
    amplitudeY: 88,
    samples: 1400,
    decay: 0,
    rotation: 0,
  },
  infinity: {
    label: "Infinity Loop",
    freqX: 1,
    freqY: 2,
    phase: 0,
    amplitudeX: 92,
    amplitudeY: 80,
    samples: 1200,
    decay: 0,
    rotation: 0,
  },
  flower: {
    label: "Five Petal",
    freqX: 5,
    freqY: 4,
    phase: 90,
    amplitudeX: 88,
    amplitudeY: 88,
    samples: 1800,
    decay: 0,
    rotation: 0,
  },
  oscilloscope: {
    label: "Oscilloscope",
    freqX: 7,
    freqY: 6,
    phase: 35,
    amplitudeX: 84,
    amplitudeY: 84,
    samples: 2200,
    decay: 0.18,
    rotation: 0,
  },
  ribbon: {
    label: "Rotated Ribbon",
    freqX: 4,
    freqY: 3,
    phase: 45,
    amplitudeX: 94,
    amplitudeY: 72,
    samples: 1600,
    decay: 0.05,
    rotation: 28,
  },
};

export function buildPoints(settings, time = 0) {
  const points = [];
  const total = Math.max(120, settings.samples);
  const phase = degreesToRadians(settings.phase + time * settings.phaseSpeed);
  const rotation = degreesToRadians(settings.rotation);
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const ampX = settings.amplitudeX / 100;
  const ampY = settings.amplitudeY / 100;
  const decay = Math.max(0, settings.decay);

  for (let i = 0; i <= total; i++) {
    const progress = i / total;
    const t = progress * Math.PI * 2;
    const envelope = decay > 0 ? Math.exp(-decay * progress * 4) : 1;
    const rawX = ampX * envelope * Math.sin(settings.freqX * t + phase);
    const rawY = ampY * envelope * Math.sin(settings.freqY * t);

    points.push({
      x: rawX * cos - rawY * sin,
      y: rawX * sin + rawY * cos,
      progress,
    });
  }

  return points;
}

export function frequencyRatio(freqX, freqY) {
  const divisor = gcd(Math.round(freqX), Math.round(freqY));
  return `${Math.round(freqX / divisor)}:${Math.round(freqY / divisor)}`;
}

export function estimateLobes(freqX, freqY) {
  const divisor = gcd(Math.round(freqX), Math.round(freqY));
  return {
    horizontal: Math.round(freqY / divisor),
    vertical: Math.round(freqX / divisor),
  };
}

function degreesToRadians(value) {
  return (value * Math.PI) / 180;
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x || 1;
}
