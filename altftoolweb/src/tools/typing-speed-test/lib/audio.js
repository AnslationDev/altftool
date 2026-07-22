/**
 * Tiny Web Audio synth for keystroke feedback. The AudioContext is created
 * lazily on the first call (always a user gesture: a keystroke), never at
 * module scope, and can be disposed on unmount.
 */
export function createSoundEngine() {
  let ctx = null;

  const ensureContext = () => {
    if (typeof window === "undefined") return null;
    if (!ctx) {
      const AudioContextImpl = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextImpl) return null;
      ctx = new AudioContextImpl();
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  };

  const blip = (frequency, durationSec, type, peakGain, delaySec = 0) => {
    const audio = ensureContext();
    if (!audio) return;
    const startAt = audio.currentTime + delaySec;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(peakGain, startAt);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durationSec);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(startAt);
    osc.stop(startAt + durationSec);
  };

  return {
    tick() {
      blip(720, 0.045, "square", 0.02);
    },
    error() {
      blip(170, 0.09, "sawtooth", 0.03);
    },
    finish() {
      // Short ascending chime, scheduled on the audio clock (no timeouts).
      blip(523.25, 0.16, "sine", 0.05, 0);
      blip(659.25, 0.16, "sine", 0.05, 0.13);
      blip(783.99, 0.3, "sine", 0.05, 0.26);
    },
    dispose() {
      if (ctx) {
        ctx.close().catch(() => {});
        ctx = null;
      }
    },
  };
}
