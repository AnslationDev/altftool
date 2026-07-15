let ctx = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    } catch {
      return null;
    }
  }
  return ctx;
}

function tone(freq, duration, type = "sine", gain = 0.08, when = 0) {
  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export const sfx = {
  enabled: true,
  setEnabled(v) {
    this.enabled = !!v;
    if (this.enabled) {
      const ac = getCtx();
      if (ac && ac.state === "suspended") ac.resume();
    }
  },
  click() {
    if (this.enabled) tone(420, 0.07, "triangle", 0.05);
  },
  roll() {
    if (!this.enabled) return;
    tone(300, 0.06, "square", 0.04, 0);
    tone(440, 0.06, "square", 0.04, 0.08);
    tone(580, 0.09, "square", 0.04, 0.16);
  },
  move() {
    if (this.enabled) tone(540, 0.1, "sine", 0.06);
  },
  kill() {
    if (!this.enabled) return;
    tone(190, 0.18, "sawtooth", 0.07, 0);
    tone(120, 0.22, "sawtooth", 0.05, 0.06);
  },
  win() {
    if (!this.enabled) return;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, "triangle", 0.06, i * 0.12));
  },
};
