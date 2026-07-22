// Tiny Web Audio synth for game feedback. No audio files, no network.
// The AudioContext is created lazily inside unlock(), which callers invoke
// from a user gesture; nothing touches browser APIs at module scope.

export default class GameAudio {
  constructor() {
    this.ctx = null;
  }

  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      try {
        this.ctx = new Ctx();
      } catch {
        this.ctx = null;
        return;
      }
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  tone({ freq = 440, to = null, dur = 0.1, type = "square", vol = 0.045, at = 0 }) {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== "running") return;
    try {
      const t0 = ctx.currentTime + at;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch {
      // Audio is a nice-to-have; never let it break gameplay.
    }
  }

  jump() {
    this.tone({ freq: 320, to: 560, dur: 0.12, type: "triangle", vol: 0.05 });
  }

  milestone() {
    this.tone({ freq: 620, dur: 0.07, type: "square", vol: 0.03 });
    this.tone({ freq: 830, dur: 0.09, type: "square", vol: 0.03, at: 0.08 });
  }

  crash() {
    this.tone({ freq: 300, to: 70, dur: 0.35, type: "sawtooth", vol: 0.06 });
  }

  dispose() {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
