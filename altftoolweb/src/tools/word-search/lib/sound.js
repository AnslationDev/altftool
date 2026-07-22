// Tiny Web Audio synth for the word search game. No audio files — every
// effect is generated from oscillators. The AudioContext is created lazily on
// the first user gesture and disposed by the owning component on unmount.

export default function createSoundEngine() {
  let ctx = null;

  function ensureContext() {
    if (typeof window === "undefined") return null;
    if (!ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      try {
        ctx = new AudioContextClass();
      } catch {
        return null;
      }
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function tone(frequency, { delay = 0, duration = 0.14, type = "sine", volume = 0.045 } = {}) {
    const context = ensureContext();
    if (!context) return;
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }

  return {
    start() {
      tone(392, { type: "triangle", duration: 0.1 });
      tone(523.25, { delay: 0.08, type: "triangle", duration: 0.12 });
    },
    found() {
      tone(523.25, { type: "triangle" });
      tone(659.25, { delay: 0.07, type: "triangle" });
      tone(783.99, { delay: 0.14, type: "triangle", duration: 0.16 });
    },
    miss() {
      tone(196, { type: "sawtooth", duration: 0.16, volume: 0.028 });
      tone(146.83, { delay: 0.08, type: "sawtooth", duration: 0.18, volume: 0.028 });
    },
    win() {
      tone(523.25, { type: "triangle" });
      tone(659.25, { delay: 0.09, type: "triangle" });
      tone(783.99, { delay: 0.18, type: "triangle" });
      tone(1046.5, { delay: 0.27, type: "triangle", duration: 0.3 });
    },
    dispose() {
      if (ctx) {
        ctx.close().catch(() => {});
        ctx = null;
      }
    },
  };
}
