"use client";

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
  if (c.state === "suspended") {
    try {
      c.resume();
    } catch {
      /* ignore */
    }
  }
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
    case "select":
      playTone(440, 0.1, "triangle");
      break;
    case "click":
      playTone(330, 0.07, "square", 0.08);
      break;
    case "win":
      [523, 659, 784, 1046, 1318].forEach((f, i) =>
        setTimeout(() => playTone(f, 0.2, "triangle"), i * 110)
      );
      break;
    case "lose":
      [392, 330, 262].forEach((f, i) =>
        setTimeout(() => playTone(f, 0.2, "sawtooth", 0.1), i * 130)
      );
      break;
    case "draw":
      [440, 440].forEach((f, i) =>
        setTimeout(() => playTone(f, 0.14, "sine"), i * 120)
      );
      break;
    case "flip":
      playTone(680, 0.08, "square", 0.07);
      break;
    default:
      break;
  }
}

// Resume the AudioContext on the first user gesture (browsers require this).
export function resumeAudio() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") {
    try {
      c.resume();
    } catch {
      /* ignore */
    }
  }
}
