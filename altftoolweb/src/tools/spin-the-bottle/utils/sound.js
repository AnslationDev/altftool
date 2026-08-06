"use client";

// Lightweight Web Audio sound engine — no asset files required.
// Tones are synthesised with an AudioContext oscillator so the tool works
// fully offline and respects the sound-effects toggle.
// Pattern follows src/tools/rock-paper-scissors/utils/sound.js.

let ctx = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

function playTone(freq, duration = 0.12, type = "sine", volume = 0.14, startAt = 0) {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") {
    try {
      c.resume();
    } catch {
      /* ignore */
    }
  }
  const startTime = c.currentTime + startAt;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function playSound(kind) {
  switch (kind) {
    case "spin": {
      // Short ticking whoosh to mark the start of a spin.
      const ticks = 6;
      for (let i = 0; i < ticks; i += 1) {
        playTone(220 + i * 18, 0.05, "square", 0.06, i * 0.045);
      }
      break;
    }
    case "winner":
      // Bright ascending chime for the reveal.
      [523, 659, 784, 1046].forEach((f, i) =>
        setTimeout(() => playTone(f, 0.2, "triangle", 0.13), i * 100)
      );
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
