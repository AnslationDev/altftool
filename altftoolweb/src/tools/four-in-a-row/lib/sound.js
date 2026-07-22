// Tiny Web Audio synth for the four-in-a-row game. No audio files.
// The AudioContext is created lazily on the first user gesture and every
// browser API call lives inside functions (nothing at module scope).

export default function createSoundEngine() {
  let ctx = null;

  const ensureContext = () => {
    if (typeof window === "undefined") return null;
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  };

  const tone = (frequency, { at = 0, duration = 0.12, type = "sine", volume = 0.06, slideTo = null } = {}) => {
    const ac = ensureContext();
    if (!ac) return;
    const start = ac.currentTime + at;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
    }
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  };

  return {
    /** Warm up / resume the context on a user gesture. */
    unlock() {
      ensureContext();
    },
    drop() {
      tone(520, { duration: 0.16, type: "triangle", volume: 0.07, slideTo: 170 });
    },
    select() {
      tone(660, { duration: 0.07, type: "square", volume: 0.03 });
    },
    win() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        tone(f, { at: i * 0.12, duration: 0.22, type: "triangle", volume: 0.07 }),
      );
    },
    lose() {
      [392, 311.13, 233.08].forEach((f, i) =>
        tone(f, { at: i * 0.14, duration: 0.24, type: "sawtooth", volume: 0.045 }),
      );
    },
    draw() {
      [440, 440].forEach((f, i) => tone(f, { at: i * 0.16, duration: 0.14, type: "sine", volume: 0.05 }));
    },
    dispose() {
      if (ctx) {
        ctx.close().catch(() => {});
        ctx = null;
      }
    },
  };
}
