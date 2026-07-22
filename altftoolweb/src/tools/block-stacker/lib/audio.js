// Synthesized Web Audio sound effects — no audio files, no external assets.
// The AudioContext is created lazily via unlock(), which callers invoke from a
// user gesture (start button, keydown, touch control).

export function createSoundEngine() {
  let ctx = null;
  let enabled = false;

  function ensureContext() {
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
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  function beep(freq, duration, type = "square", volume = 0.04, delay = 0) {
    if (!ctx) return;
    try {
      const t0 = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(volume, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
    } catch {
      // Audio glitches are never fatal to gameplay.
    }
  }

  return {
    setEnabled(on) {
      enabled = Boolean(on);
    },
    /** Call from a user gesture so the context is allowed to start. */
    unlock() {
      ensureContext();
    },
    play(name) {
      if (!enabled || !ctx) return;
      switch (name) {
        case "move":
          beep(220, 0.04, "square", 0.02);
          break;
        case "rotate":
          beep(330, 0.05, "square", 0.03);
          break;
        case "hold":
          beep(262, 0.06, "triangle", 0.035);
          break;
        case "harddrop":
          beep(140, 0.08, "sawtooth", 0.045);
          break;
        case "lock":
          beep(180, 0.05, "sine", 0.04);
          break;
        case "clear":
          beep(440, 0.07, "square", 0.04);
          beep(554, 0.07, "square", 0.04, 0.07);
          beep(659, 0.1, "square", 0.04, 0.14);
          break;
        case "levelup":
          beep(523, 0.08, "triangle", 0.045);
          beep(784, 0.12, "triangle", 0.045, 0.09);
          break;
        case "over":
          beep(330, 0.12, "sawtooth", 0.04);
          beep(247, 0.12, "sawtooth", 0.04, 0.13);
          beep(165, 0.22, "sawtooth", 0.04, 0.26);
          break;
        default:
          break;
      }
    },
    dispose() {
      if (ctx) {
        ctx.close().catch(() => {});
        ctx = null;
      }
    },
  };
}
