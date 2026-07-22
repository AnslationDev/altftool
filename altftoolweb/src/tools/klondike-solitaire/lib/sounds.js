// Tiny Web Audio effect engine. No audio files — every effect is synthesized.
// The AudioContext is created lazily, on the first play() triggered by a user
// gesture, and disposed by the owning component on unmount.

export function createAudioEngine() {
  let ctx = null;

  const ensureCtx = () => {
    if (typeof window === "undefined") return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  };

  const tone = (freq, startOffset, duration, type, peak) => {
    const ac = ensureCtx();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const t0 = ac.currentTime + startOffset;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  };

  const effects = {
    draw: () => tone(190, 0, 0.06, "triangle", 0.05),
    place: () => tone(240, 0, 0.09, "triangle", 0.06),
    flip: () => tone(430, 0, 0.07, "triangle", 0.05),
    foundation: () => {
      tone(523.25, 0, 0.09, "sine", 0.06);
      tone(783.99, 0.07, 0.12, "sine", 0.05);
    },
    undo: () => tone(150, 0, 0.08, "sine", 0.05),
    win: () => {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        tone(freq, i * 0.13, 0.28, "triangle", 0.07);
      });
    },
  };

  return {
    play(name) {
      const effect = effects[name];
      if (effect) effect();
    },
    dispose() {
      if (ctx) {
        ctx.close().catch(() => {});
        ctx = null;
      }
    },
  };
}
