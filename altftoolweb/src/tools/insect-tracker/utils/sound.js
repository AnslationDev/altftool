"use client";

// Lightweight Web Audio engine — synthesises every sound at runtime so the
// game ships with zero audio asset files. SFX respect the mute toggle; the
// background music is a gentle looping arpeggio driven by a scheduler.

let ctx = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

// Resume the context after a user gesture (browsers start it suspended).
export function resumeAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") c.resume();
}

function tone(freq, duration = 0.12, type = "sine", volume = 0.14, when = 0) {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + when;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

// Short sound effects for game events.
export function playSound(kind) {
  switch (kind) {
    case "catch":
      tone(660, 0.1, "triangle", 0.16);
      tone(990, 0.1, "sine", 0.12, 0.05);
      break;
    case "escape":
      tone(320, 0.16, "sawtooth", 0.12);
      tone(170, 0.2, "sawtooth", 0.1, 0.08);
      break;
    case "level":
      [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, "triangle", 0.14, i * 0.09));
      break;
    case "win":
      [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.2, "triangle", 0.15, i * 0.12));
      break;
    case "lose":
      [440, 330, 247, 196].forEach((f, i) => tone(f, 0.22, "sawtooth", 0.12, i * 0.14));
      break;
    case "click":
      tone(520, 0.06, "square", 0.08);
      break;
    default:
      break;
  }
}

// --- Background music -------------------------------------------------------
let musicTimer = null;
let musicGain = null;
let musicStep = 0;
const SCALE = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63]; // C-major arpeggio

export function startMusic() {
  const c = getCtx();
  if (!c || musicTimer) return;
  if (c.state === "suspended") c.resume();
  musicGain = c.createGain();
  musicGain.gain.value = 0.05;
  musicGain.connect(c.destination);
  const tick = () => {
    const f = SCALE[musicStep % SCALE.length];
    musicStep += 1;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.06, c.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.35);
    o.connect(g);
    g.connect(musicGain);
    o.start();
    o.stop(c.currentTime + 0.4);
  };
  musicTimer = setInterval(tick, 320);
  tick();
}

export function stopMusic() {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
  musicGain = null;
}

export function isMusicPlaying() {
  return !!musicTimer;
}
