"use client";

// Lightweight Web Audio sound engine — no asset files required, so the
// "Sound On/Off" toggle actually does something (previously it only flipped
// an icon; nothing in the tool ever called an audio API).

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
    case "eat":
      playTone(660, 0.08, "triangle", 0.12);
      break;
    case "gameover":
      [392, 330, 262].forEach((f, i) => setTimeout(() => playTone(f, 0.18, "sawtooth", 0.1), i * 110));
      break;
    default:
      break;
  }
}
