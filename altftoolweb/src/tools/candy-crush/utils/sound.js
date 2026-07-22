// Lightweight Web Audio sound engine — no asset files required.
// Tones are synthesised with an AudioContext oscillator so the game works
// fully offline and respects the mute toggle.

let ctx = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

function playTone(freq, duration = 0.12, type = "sine", volume = 0.14) {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export function playSound(kind) {
  switch (kind) {
    case "swap":
      playTone(440, 0.1, "triangle");
      break;
    case "match":
      playTone(660, 0.12, "sine");
      setTimeout(() => playTone(880, 0.12, "sine"), 60);
      break;
    case "invalid":
      playTone(180, 0.15, "sawtooth", 0.1);
      break;
    case "win":
      [523, 659, 784, 1046].forEach((f, i) =>
        setTimeout(() => playTone(f, 0.18, "triangle"), i * 120)
      );
      break;
    case "lose":
      [400, 300, 200].forEach((f, i) =>
        setTimeout(() => playTone(f, 0.2, "sawtooth", 0.12), i * 150)
      );
      break;
    default:
      break;
  }
}
