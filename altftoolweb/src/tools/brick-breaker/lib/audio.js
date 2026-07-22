// Minimal Web Audio synthesizer for the game's sound effects. No audio files.
// The AudioContext is created lazily — call unlock() from a user gesture
// handler before any effect is expected to be audible.

export default function createSynth() {
  let ctx = null;

  const ensureContext = () => {
    if (typeof window === "undefined") return null;
    if (!ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  };

  const blip = (freq, opts = {}) => {
    const { type = "square", dur = 0.08, vol = 0.14, at = 0, slideTo = 0 } = opts;
    const c = ensureContext();
    if (!c) return;
    const t = c.currentTime + at;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  };

  return {
    unlock: () => {
      ensureContext();
    },
    paddle: () => blip(196, { type: "triangle", dur: 0.06, vol: 0.12 }),
    wall: () => blip(130, { type: "triangle", dur: 0.04, vol: 0.05 }),
    brickHit: (tier = 1) => blip(300 + tier * 70, { dur: 0.05, vol: 0.09 }),
    brickBreak: (tier = 1) => blip(420 + tier * 90, { dur: 0.12, vol: 0.13, slideTo: 180 }),
    power: () => {
      blip(440, { type: "sine", dur: 0.09, vol: 0.14 });
      blip(660, { type: "sine", dur: 0.12, vol: 0.14, at: 0.08 });
    },
    lifeLost: () => blip(240, { type: "sawtooth", dur: 0.4, vol: 0.11, slideTo: 90 }),
    levelClear: () => {
      blip(523, { type: "sine", dur: 0.12, vol: 0.15 });
      blip(659, { type: "sine", dur: 0.12, vol: 0.15, at: 0.11 });
      blip(784, { type: "sine", dur: 0.18, vol: 0.15, at: 0.22 });
    },
    gameOver: () => blip(392, { type: "sawtooth", dur: 0.5, vol: 0.11, slideTo: 110 }),
    win: () => {
      [523, 659, 784, 1046].forEach((freq, i) =>
        blip(freq, { type: "sine", dur: 0.14, vol: 0.15, at: i * 0.11 }),
      );
    },
    dispose: () => {
      if (ctx) {
        ctx.close().catch(() => {});
        ctx = null;
      }
    },
  };
}
