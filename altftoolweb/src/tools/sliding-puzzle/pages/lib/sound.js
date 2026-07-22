/**
 * Tiny Web Audio synth for the sliding puzzle. No audio files.
 * The AudioContext is created lazily on the first user gesture that
 * actually plays a sound, and every method is a safe no-op when the
 * Web Audio API is unavailable.
 */
export default function createSoundEngine() {
  let ctx = null;

  function getContext() {
    if (typeof window === "undefined") return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) {
      try {
        ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(context, { frequency, start, duration, type = "triangle", peak = 0.05 }) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  }

  return {
    /** Short tick for a tile slide. */
    slide() {
      const context = getContext();
      if (!context) return;
      tone(context, {
        frequency: 340,
        start: context.currentTime,
        duration: 0.07,
        type: "triangle",
        peak: 0.04,
      });
    },
    /** Rising arpeggio for solving the board. */
    win() {
      const context = getContext();
      if (!context) return;
      const now = context.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((frequency, i) => {
        tone(context, {
          frequency,
          start: now + i * 0.12,
          duration: 0.24,
          type: "triangle",
          peak: 0.055,
        });
      });
    },
    /** Release the AudioContext (call on unmount). */
    dispose() {
      if (ctx) {
        ctx.close().catch(() => {});
        ctx = null;
      }
    },
  };
}
