// Web Audio API Sound Effects Synthesizer for Bingo Game

class SoundManager {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playHover() {
    try {
      const ctx = this.init();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(580, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  playClick() {
    try {
      const ctx = this.init();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  playNumberDraw() {
    try {
      const ctx = this.init();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Arpeggio chime: 523Hz (C5), 659Hz (E5), 783Hz (G5)
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;

        const startTime = now + idx * 0.06;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch {}
  }

  playMark() {
    try {
      const ctx = this.init();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.12); // E6

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  playWin() {
    try {
      const ctx = this.init();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Victory Fanfare Notes
      const notes = [
        { freq: 523.25, duration: 0.15 },
        { freq: 659.25, duration: 0.15 },
        { freq: 783.99, duration: 0.15 },
        { freq: 1046.50, duration: 0.4 },
      ];

      let timeAcc = now;
      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = note.freq;

        gain.gain.setValueAtTime(0, timeAcc);
        gain.gain.linearRampToValueAtTime(0.12, timeAcc + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, timeAcc + note.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(timeAcc);
        osc.stop(timeAcc + note.duration);

        timeAcc += note.duration * 0.8;
      });
    } catch {}
  }
}

export const soundManager = new SoundManager();
