// Tiny Web Audio synth for Tap Glider. No audio files. The AudioContext is
// created lazily — the game only constructs this engine from a user gesture
// (first flap or the sound toggle), so autoplay policies are satisfied.

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

  const tone = ({ freq, endFreq, delay = 0, duration = 0.12, type = "sine", peak = 0.06 }) => {
    const ac = ensureContext();
    if (!ac) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + duration);
    }
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  };

  return {
    /** Warm up / resume the context from a user gesture. */
    unlock: ensureContext,
    flap() {
      tone({ freq: 500, endFreq: 780, duration: 0.09, type: "triangle", peak: 0.05 });
    },
    score() {
      tone({ freq: 660, duration: 0.09, type: "sine", peak: 0.06 });
      tone({ freq: 880, delay: 0.09, duration: 0.12, type: "sine", peak: 0.06 });
    },
    hit() {
      tone({ freq: 300, endFreq: 90, duration: 0.3, type: "sawtooth", peak: 0.07 });
    },
    dispose() {
      if (ctx) {
        ctx.close().catch(() => {});
        ctx = null;
      }
    },
  };
}
