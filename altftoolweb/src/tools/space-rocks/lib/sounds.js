// Tiny Web Audio synth for Space Rocks. No audio files; the AudioContext is
// created lazily, only while sound is enabled and a user gesture unlocks it.

export default function createSoundEngine() {
  let ctx = null;
  let enabled = true;

  const ensure = () => {
    if (!enabled) return null;
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
  };

  const tone = ({ from, to, duration, type = "square", peak = 0.05, delay = 0 }) => {
    const ac = ensure();
    if (!ac) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(1, from), t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + duration);
    gain.gain.setValueAtTime(peak, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  };

  const noise = ({ duration, peak = 0.12, freq = 800 }) => {
    const ac = ensure();
    if (!ac) return;
    const t0 = ac.currentTime;
    const length = Math.max(1, Math.floor(ac.sampleRate * duration));
    const buffer = ac.createBuffer(1, length, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(freq, t0);
    filter.frequency.exponentialRampToValueAtTime(Math.max(60, freq * 0.15), t0 + duration);
    const gain = ac.createGain();
    gain.gain.setValueAtTime(peak, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(filter).connect(gain).connect(ac.destination);
    src.start(t0);
    src.stop(t0 + duration);
  };

  return {
    setEnabled(value) {
      enabled = Boolean(value);
    },
    /** Call from a user-gesture handler so playback is allowed later. */
    unlock() {
      ensure();
    },
    fire() {
      tone({ from: 640, to: 170, duration: 0.11, type: "square", peak: 0.04 });
    },
    explode(tier) {
      noise({
        duration: 0.45 - tier * 0.09,
        peak: 0.14 - tier * 0.03,
        freq: 900 - tier * 220,
      });
    },
    shipHit() {
      noise({ duration: 0.7, peak: 0.18, freq: 420 });
      tone({ from: 220, to: 40, duration: 0.6, type: "sawtooth", peak: 0.06 });
    },
    waveClear() {
      tone({ from: 440, to: 660, duration: 0.12, type: "triangle", peak: 0.05 });
      tone({ from: 660, to: 880, duration: 0.16, type: "triangle", peak: 0.05, delay: 0.13 });
    },
    dispose() {
      if (ctx) {
        ctx.close().catch(() => {});
        ctx = null;
      }
    },
  };
}
