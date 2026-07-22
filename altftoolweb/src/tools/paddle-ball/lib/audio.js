// Tiny Web Audio synth for game feedback. The AudioContext is created lazily on
// the first user gesture (via `unlock`) — nothing touches browser APIs at import.

export function createSynth() {
  let ctx = null;

  function ensureContext() {
    if (typeof window === "undefined") return null;
    if (!ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, { duration = 0.06, type = "square", volume = 0.045, delay = 0 } = {}) {
    const ac = ensureContext();
    if (!ac || ac.state !== "running") return;
    const start = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  return {
    /** Call from a user gesture so later loop-driven sounds are allowed to play. */
    unlock: ensureContext,
    paddleHit() {
      tone(540 + Math.random() * 50, { duration: 0.05 });
    },
    wallHit() {
      tone(320, { duration: 0.05, type: "triangle" });
    },
    point() {
      tone(210, { duration: 0.16, type: "sawtooth", volume: 0.05 });
    },
    matchWin() {
      [523, 659, 784, 1047].forEach((f, i) =>
        tone(f, { duration: 0.14, type: "triangle", volume: 0.05, delay: i * 0.11 }),
      );
    },
    matchLoss() {
      [392, 311, 262].forEach((f, i) =>
        tone(f, { duration: 0.18, type: "triangle", volume: 0.05, delay: i * 0.14 }),
      );
    },
    dispose() {
      if (ctx) {
        ctx.close().catch(() => {});
        ctx = null;
      }
    },
  };
}
