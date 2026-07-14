// Lightweight Web Audio sound engine — no asset files required.
// Tones are synthesised with an AudioContext oscillator so the tool works
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
    case "shuffle":
      [320, 400, 480, 560].forEach((f, i) =>
        setTimeout(() => playTone(f, 0.07, "triangle", 0.1), i * 45)
      );
      break;
    case "draw":
      playTone(520, 0.1, "sine");
      break;
    case "flip":
      playTone(660, 0.07, "square", 0.06);
      break;
    case "select":
      playTone(440, 0.1, "triangle");
      break;
    case "reveal":
      [523, 659, 784, 1046].forEach((f, i) =>
        setTimeout(() => playTone(f, 0.16, "triangle"), i * 110)
      );
      break;
    case "win":
      [523, 659, 784, 1046, 1318].forEach((f, i) =>
        setTimeout(() => playTone(f, 0.2, "triangle"), i * 120)
      );
      break;
    case "error":
      playTone(180, 0.18, "sawtooth", 0.1);
      break;
    default:
      break;
  }
}
