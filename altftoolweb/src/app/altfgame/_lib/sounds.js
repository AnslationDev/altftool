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
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

// Browsers only allow audio to start during a real user gesture (click/tap/key).
// Sounds are triggered from state effects (outside the gesture call stack), so we
// unlock the AudioContext here, directly inside the user's first interactions.
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
  const c = ensure();
  if (!c) return;
  const t = c.currentTime + time;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (end !== freq) o.frequency.exponentialRampToValueAtTime(Math.max(end, 1), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise({ time = 0, dur = 0.12, vol = 0.6, from = 3000, to = 800 }) {
  const c = ensure();
  if (!c) return;
  const t = c.currentTime + time;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(Math.max(to, 40), t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(t);
}

const SFX = {
  // round begins — quick rising two-note cue
  start() {
    tone({ freq: 392, end: 523, dur: 0.12, type: "triangle", vol: 0.7 });
    tone({ freq: 523, end: 784, time: 0.1, dur: 0.16, type: "triangle", vol: 0.7 });
  },
  // victory — bright ascending arpeggio with shimmer
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, dur: 0.34, time: i * 0.11, type: "triangle", vol: 0.8 }));
    tone({ freq: 1568, dur: 0.5, time: 0.44, type: "sine", vol: 0.35 });
  },
  // defeat — three sagging notes
  lose() {
    [330, 262, 196].forEach((f, i) => tone({ freq: f, end: f * 0.92, dur: 0.3, time: i * 0.16, type: "sawtooth", vol: 0.45 }));
  },
  // scoring blip (coin-like)
  point() {
    tone({ freq: 880, end: 1320, dur: 0.09, type: "square", vol: 0.35 });
    tone({ freq: 1760, dur: 0.08, time: 0.07, type: "square", vol: 0.25 });
  },
  // solid impact (knife thunk / target hit)
  hit() {
    tone({ freq: 180, end: 70, dur: 0.12, type: "sine", vol: 0.9 });
    noise({ dur: 0.06, vol: 0.5, from: 4000, to: 1200 });
  },
  // bat crack (cricket shot)
  bat() {
    noise({ dur: 0.05, vol: 0.7, from: 6000, to: 2500 });
    tone({ freq: 220, end: 110, dur: 0.1, type: "triangle", vol: 0.7 });
  },
  // bubble / balloon pop
  pop() {
    tone({ freq: 600, end: 180, dur: 0.09, type: "sine", vol: 0.7 });
    noise({ dur: 0.04, vol: 0.35, from: 5000, to: 2000 });
  },
  // soft piece-move tick
  move() {
    noise({ dur: 0.035, vol: 0.25, from: 2500, to: 1200 });
  },
  // dice rattle
  roll() {
    for (let i = 0; i < 5; i++) noise({ time: i * 0.06, dur: 0.04, vol: 0.3, from: 3000 - i * 300, to: 900 });
  },
  // explosion (mine)
  boom() {
    noise({ dur: 0.5, vol: 0.9, from: 900, to: 60 });
    tone({ freq: 110, end: 40, dur: 0.5, type: "sine", vol: 0.9 });
  },
  // level up — two quick rising notes
  level() {
    tone({ freq: 659, dur: 0.1, type: "triangle", vol: 0.6 });
    tone({ freq: 880, dur: 0.18, time: 0.09, type: "triangle", vol: 0.6 });
  },
};

export function playSound(name) {
  try {
    if (SFX[name]) SFX[name]();
  } catch {
    /* audio unavailable — stay silent rather than break the game */
  }
}

// Plays sounds when a game's existing state transitions:
//   started (false→true), won, lost, roll — booleans
//   score, level — numbers (sound on increase)
//   tick — any value; plays a soft move tick when its reference changes
// `sounds` remaps defaults per game, e.g. { point: "pop", lose: "boom" }.
export function useGameSounds({ started, won, lost, score, level, roll, tick, sounds = {} }) {
  const prev = useRef(null);
  useEffect(() => {
    const p = prev.current;
    prev.current = { started, won, lost, score, level, roll, tick };
    if (!p) return; // first render — never play on mount
    if (started && !p.started) playSound(sounds.start || "start");
    if (won && !p.won) playSound(sounds.win || "win");
    if (lost && !p.lost) playSound(sounds.lose || "lose");
    if (typeof score === "number" && typeof p.score === "number" && score > p.score) playSound(sounds.point || "point");
    if (typeof level === "number" && typeof p.level === "number" && level > p.level) playSound(sounds.level || "level");
    if (roll && !p.roll) playSound(sounds.roll || "roll");
    if (tick !== undefined && p.tick !== undefined && tick !== p.tick && !won && !lost) playSound(sounds.tick || "move");
  });
}
