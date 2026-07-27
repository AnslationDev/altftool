"use client";

// Original synthesized game sound effects (Web Audio API).
// No audio files, no downloads — every sound is generated in the browser.
// playSound(name) fires one effect; useGameSounds() watches a game's existing
// state and plays the right sound on transitions (start / win / lose / score…).
import { useEffect, useRef } from "react";

let ctx = null;
let master = null;

function ensure() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    ctx = new AudioContextClass();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

if (typeof window !== "undefined") {
  const unlock = () => {
    ensure();
    if (ctx && ctx.state === "running") {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      window.removeEventListener("touchstart", unlock, true);
    }
  };
  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);
  window.addEventListener("touchstart", unlock, true);
}

function tone({ freq = 440, end = freq, time = 0, dur = 0.15, type = "sine", vol = 1 }) {
  const audioContext = ensure();
  if (!audioContext || !master) return;
  const startAt = audioContext.currentTime + time;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, startAt);
  if (end !== freq) oscillator.frequency.exponentialRampToValueAtTime(Math.max(end, 1), startAt + dur);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(vol, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + dur);
  oscillator.connect(gain);
  gain.connect(master);
  oscillator.start(startAt);
  oscillator.stop(startAt + dur + 0.05);
}

function noise({ time = 0, dur = 0.12, vol = 0.6, from = 3000, to = 800 }) {
  const audioContext = ensure();
  if (!audioContext || !master) return;
  const startAt = audioContext.currentTime + time;
  const len = Math.max(1, Math.floor(audioContext.sampleRate * dur));
  const buffer = audioContext.createBuffer(1, len, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < len; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / len);
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(from, startAt);
  filter.frequency.exponentialRampToValueAtTime(Math.max(to, 40), startAt + dur);
  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(vol, startAt);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + dur);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  source.start(startAt);
}

const SFX = {
  start() {
    tone({ freq: 392, end: 523, dur: 0.12, type: "triangle", vol: 0.7 });
    tone({ freq: 523, end: 784, time: 0.1, dur: 0.16, type: "triangle", vol: 0.7 });
  },
  win() {
    [523, 659, 784, 1047].forEach((freq, index) =>
      tone({ freq, dur: 0.34, time: index * 0.11, type: "triangle", vol: 0.8 }),
    );
    tone({ freq: 1568, dur: 0.5, time: 0.44, type: "sine", vol: 0.35 });
  },
  lose() {
    [330, 262, 196].forEach((freq, index) =>
      tone({ freq, end: freq * 0.92, dur: 0.3, time: index * 0.16, type: "sawtooth", vol: 0.45 }),
    );
  },
  point() {
    tone({ freq: 880, end: 1320, dur: 0.09, type: "square", vol: 0.35 });
    tone({ freq: 1760, dur: 0.08, time: 0.07, type: "square", vol: 0.25 });
  },
  hit() {
    tone({ freq: 180, end: 70, dur: 0.12, type: "sine", vol: 0.9 });
    noise({ dur: 0.06, vol: 0.5, from: 4000, to: 1200 });
  },
  bat() {
    noise({ dur: 0.05, vol: 0.7, from: 6000, to: 2500 });
    tone({ freq: 220, end: 110, dur: 0.1, type: "triangle", vol: 0.7 });
  },
  pop() {
    tone({ freq: 600, end: 180, dur: 0.09, type: "sine", vol: 0.7 });
    noise({ dur: 0.04, vol: 0.35, from: 5000, to: 2000 });
  },
  move() {
    noise({ dur: 0.035, vol: 0.25, from: 2500, to: 1200 });
  },
  roll() {
    for (let index = 0; index < 5; index += 1) {
      noise({ time: index * 0.06, dur: 0.04, vol: 0.3, from: 3000 - index * 300, to: 900 });
    }
  },
  boom() {
    noise({ dur: 0.5, vol: 0.9, from: 900, to: 60 });
    tone({ freq: 110, end: 40, dur: 0.5, type: "sine", vol: 0.9 });
  },
  level() {
    tone({ freq: 659, dur: 0.1, type: "triangle", vol: 0.6 });
    tone({ freq: 880, dur: 0.18, time: 0.09, type: "triangle", vol: 0.6 });
  },
};

export function playSound(name) {
  try {
    if (SFX[name]) SFX[name]();
  } catch {
    // Audio can be unavailable or blocked; games should stay playable.
  }
}

export function useGameSounds({ started, won, lost, score, level, roll, tick, sounds = {} }) {
  const prev = useRef(null);

  useEffect(() => {
    const previous = prev.current;
    prev.current = { started, won, lost, score, level, roll, tick };
    if (!previous) return;
    if (started && !previous.started) playSound(sounds.start || "start");
    if (won && !previous.won) playSound(sounds.win || "win");
    if (lost && !previous.lost) playSound(sounds.lose || "lose");
    if (typeof score === "number" && typeof previous.score === "number" && score > previous.score) {
      playSound(sounds.point || "point");
    }
    if (typeof level === "number" && typeof previous.level === "number" && level > previous.level) {
      playSound(sounds.level || "level");
    }
    if (roll && !previous.roll) playSound(sounds.roll || "roll");
    if (tick !== undefined && previous.tick !== undefined && tick !== previous.tick && !won && !lost) {
      playSound(sounds.tick || "move");
    }
  });
}
