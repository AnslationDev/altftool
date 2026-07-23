"use client";

const COLOR_FREQUENCIES = {
  green: 329.63,
  red: 261.63,
  yellow: 392.0,
  blue: 440.0,
};

const SFX = {
  correct: 523.25,
  wrong: 196.0,
  gameOver: 146.83,
  levelUp: 659.25,
  click: 800,
};

let audioCtx = null;
let muted = false;
let volume = 0.6;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq, duration = 0.15, type = "sine", vol = volume) {
  if (muted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (_) {
    /* silent */
  }
}

export function playColorSound(color) {
  playTone(COLOR_FREQUENCIES[color] || 440, 0.18, "sine");
}

export function playCorrect() {
  playTone(SFX.correct, 0.12, "sine");
}

export function playWrong() {
  playTone(SFX.wrong, 0.35, "sawtooth");
}

export function playGameOver() {
  playTone(SFX.gameOver, 0.5, "triangle");
  setTimeout(() => playTone(SFX.wrong, 0.4, "sawtooth"), 200);
}

export function playLevelUp() {
  playTone(SFX.levelUp, 0.1, "sine");
  setTimeout(() => playTone(SFX.correct, 0.15, "sine"), 100);
}

export function playClick() {
  playTone(SFX.click, 0.05, "square", volume * 0.3);
}

export function setMuted(value) {
  muted = value;
}

export function setVolume(value) {
  volume = Math.max(0, Math.min(1, value));
}

export function getMuted() {
  return muted;
}

export function getVolume() {
  return volume;
}

export function resumeAudioContext() {
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}
