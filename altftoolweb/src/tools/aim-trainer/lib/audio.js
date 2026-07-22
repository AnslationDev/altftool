// Tiny Web Audio synth for the Aim Trainer. No audio files — every cue is an
// oscillator envelope. The AudioContext is created lazily on the first user
// gesture (unlockAudio / any sfx call) and torn down via closeAudio().

let ctx = null;

function getContext() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

/** Call from a user gesture so later cues can play without delay. */
export function unlockAudio() {
  getContext();
}

/** Release the context (component unmount). */
export function closeAudio() {
  if (ctx) {
    ctx.close().catch(() => {});
    ctx = null;
  }
}

function tone(
  freq,
  { start = 0, duration = 0.09, type = "sine", gain = 0.06, slideTo = null } = {},
) {
  const ac = getContext();
  if (!ac) return;
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
  }
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export const sfx = {
  /** Bright pop; pitch creeps up with the streak for a sense of momentum. */
  hit(streak = 0) {
    const base = 620 + Math.min(streak, 14) * 24;
    tone(base, { duration: 0.07, type: "triangle", gain: 0.07, slideTo: base + 320 });
  },
  miss() {
    tone(170, { duration: 0.12, type: "square", gain: 0.04, slideTo: 110 });
  },
  vanish() {
    tone(340, { duration: 0.16, type: "sine", gain: 0.05, slideTo: 180 });
  },
  start() {
    tone(440, { duration: 0.07, type: "triangle", gain: 0.05 });
    tone(660, { start: 0.09, duration: 0.09, type: "triangle", gain: 0.05 });
  },
  over() {
    tone(330, { duration: 0.14, type: "triangle", gain: 0.05 });
    tone(220, { start: 0.16, duration: 0.2, type: "triangle", gain: 0.05 });
  },
  best() {
    tone(523, { duration: 0.09, type: "triangle", gain: 0.055 });
    tone(659, { start: 0.1, duration: 0.09, type: "triangle", gain: 0.055 });
    tone(784, { start: 0.2, duration: 0.14, type: "triangle", gain: 0.06 });
  },
};
