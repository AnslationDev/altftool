// Tiny Web Audio synth for game feedback. No audio files are used; the
// AudioContext is created lazily by unlock(), which must be called from a
// user gesture (tap, click, or keypress). All effects are short envelopes on
// basic oscillators, so muting simply skips scheduling.

export default function createAudio() {
  let ctx = null;
  let enabled = false;
  let lastChomp = 0;
  let chompHigh = false;

  function unlock() {
    if (!enabled) return;
    if (!ctx) {
      const AC =
        typeof window !== "undefined" ? window.AudioContext || window.webkitAudioContext : null;
      if (!AC) return;
      try {
        ctx = new AC();
      } catch {
        ctx = null;
        return;
      }
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
  }

  function setEnabled(value) {
    enabled = value;
  }

  function tone({ freq, end = freq, time = 0.12, type = "square", vol = 0.04, delay = 0 }) {
    if (!enabled || !ctx) return;
    try {
      const t0 = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(freq, 1), t0);
      if (end !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(end, 1), t0 + time);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + time);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + time + 0.03);
    } catch {
      // Audio is decorative; never let it break the game loop.
    }
  }

  return {
    unlock,
    setEnabled,
    chomp() {
      const now = typeof performance !== "undefined" ? performance.now() : 0;
      if (now - lastChomp < 70) return;
      lastChomp = now;
      chompHigh = !chompHigh;
      tone({ freq: chompHigh ? 440 : 330, time: 0.06, vol: 0.03 });
    },
    power() {
      tone({ freq: 200, end: 640, time: 0.35, type: "sawtooth", vol: 0.05 });
    },
    eatGhost() {
      tone({ freq: 760, end: 180, time: 0.28, vol: 0.05 });
    },
    death() {
      tone({ freq: 520, end: 70, time: 0.8, type: "triangle", vol: 0.06 });
    },
    levelUp() {
      [392, 523, 659, 784].forEach((freq, i) => tone({ freq, time: 0.14, vol: 0.05, delay: i * 0.11 }));
    },
    ready() {
      tone({ freq: 523, time: 0.1 });
      tone({ freq: 659, time: 0.12, delay: 0.12 });
    },
    dispose() {
      if (ctx) {
        ctx.close().catch(() => {});
        ctx = null;
      }
    },
  };
}
