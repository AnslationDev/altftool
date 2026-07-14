"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import confetti from "canvas-confetti";

import { INSECT_TYPES, DIFFICULTIES, CHOICE_INSECTS } from "./insects";
import {
  COMBO_WINDOW,
  MAX_LEVEL,
  levelFromScore,
  scoreForCatch,
  LEVEL_THRESHOLDS,
  weightedPick,
  levelParams,
  randomInterior,
  randomEdgeSpawn,
  nearestExit,
} from "./game";
import { playSound, resumeAudio, startMusic, stopMusic } from "./sound";

const HS_KEY = "it_highscore";
const SOUND_KEY = "it_sound";
const MUSIC_KEY = "it_music";

export function useInsectGame() {
  // ---- render-relevant state ----
  const [status, setStatus] = useState("start"); // start|playing|paused|won|lost
  const [difficulty, setDifficulty] = useState("medium");
  const [chosenInsect, setChosenInsect] = useState(CHOICE_INSECTS[0]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(DIFFICULTIES.medium.lives);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTIES.medium.time);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [insects, setInsects] = useState([]); // active insect list (render mirror)
  const [bursts, setBursts] = useState([]); // particle bursts
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const [levelFlash, setLevelFlash] = useState(0); // increments to trigger banner

  // ---- refs (source of truth for the loop) ----
  const statusRef = useRef(status);
  const scoreRef = useRef(0);
  const livesRef = useRef(0);
  const timeRef = useRef(0);
  const levelRef = useRef(1);
  const comboRef = useRef(0);
  const lastCatchRef = useRef(0);
  const highScoreRef = useRef(0);
  const soundRef = useRef(true);
  const musicRef = useRef(true);
  const difficultyRef = useRef(difficulty);
  const chosenRef = useRef(chosenInsect);

  const insectsRef = useRef(new Map()); // id -> live instance (movement + DOM node)
  const boundsRef = useRef({ w: 0, h: 0 });
  const paramsRef = useRef(levelParams(DIFFICULTIES.medium, 1));
  const rafRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const lastTsRef = useRef(0);
  const pauseAtRef = useRef(0);
  const seededRef = useRef(false);

  // ---- keep refs in sync with state ----
  useEffect(() => void (statusRef.current = status), [status]);
  useEffect(() => void (difficultyRef.current = difficulty), [difficulty]);
  useEffect(() => void (chosenRef.current = chosenInsect), [chosenInsect]);
  useEffect(() => void (soundRef.current = soundOn), [soundOn]);
  useEffect(() => void (musicRef.current = musicOn), [musicOn]);

  // ---- load persisted prefs ----
  useEffect(() => {
    const apply = () => {
      try {
        const hs = Number(localStorage.getItem(HS_KEY) || 0);
        highScoreRef.current = hs;
        setHighScore(hs);
        const so = localStorage.getItem(SOUND_KEY);
        if (so !== null) setSoundOn(so === "1");
        const mo = localStorage.getItem(MUSIC_KEY);
        if (mo !== null) setMusicOn(mo === "1");
      } catch {}
    };
    apply();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0");
    } catch {}
  }, [soundOn]);
  useEffect(() => {
    try {
      localStorage.setItem(MUSIC_KEY, musicOn ? "1" : "0");
    } catch {}
  }, [musicOn]);

  const sfx = useCallback((kind) => {
    if (soundRef.current) playSound(kind);
  }, []);

  // ---- particle bursts ----
  const removeBurst = useCallback((id) => {
    setBursts((prev) => prev.filter((b) => b.id !== id));
  }, []);
  const addBurst = useCallback((x, y, color) => {
    const id = nanoid();
    // safety cap handled inside the updater so this callback stays stable
    setBursts((prev) => (prev.length > 24 ? prev : [...prev, { id, x, y, color }]));
  }, []);

  // ---- scoring + high score ----
  const addScore = useCallback((n) => {
    scoreRef.current += n;
    setScore(scoreRef.current);
    if (scoreRef.current > highScoreRef.current) {
      highScoreRef.current = scoreRef.current;
      setHighScore(scoreRef.current);
      try {
        localStorage.setItem(HS_KEY, String(scoreRef.current));
      } catch {}
    }
  }, []);

  // ---- spawn / remove insects ----
  const removeInsect = useCallback((id) => {
    insectsRef.current.delete(id);
    setInsects((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const maybeSpawn = useCallback(() => {
    const b = boundsRef.current;
    if (!b.w) return;
    const params = paramsRef.current;
    if (insectsRef.current.size >= params.maxInsects) return;
    const type = weightedPick(INSECT_TYPES);
    const size = type.size;
    const pos = randomEdgeSpawn(b, size);
    const id = nanoid();
    const inst = {
      id,
      type: type.key,
      x: pos.x,
      y: pos.y,
      tx: pos.x,
      ty: pos.y,
      speed: type.speed * params.speedMul,
      bornAt: performance.now(),
      lifetime: params.lifetime,
      size,
      fleeing: false,
      dead: false,
      rot: 0,
      node: null,
    };
    insectsRef.current.set(id, inst);
    const t = randomInterior(b, size);
    inst.tx = t.x;
    inst.ty = t.y;
    setInsects((prev) => [
      ...prev,
      {
        id,
        type: type.key,
        size,
        color: type.color,
        points: type.points,
        name: type.name,
        x: pos.x,
        y: pos.y,
        rot: 0,
        caught: false,
      },
    ]);
  }, []);

  const seed = useCallback(
    (n) => {
      for (let i = 0; i < n; i++) maybeSpawn();
    },
    [maybeSpawn]
  );

  // ---- register DOM node for imperative movement ----
  const registerNode = useCallback((id, node) => {
    if (!node) return; // ignore unmount nulls
    const inst = insectsRef.current.get(id);
    if (inst) inst.node = node;
  }, []);

  // ---- catch / escape ----
  const catchInsect = useCallback(
    (id) => {
      const inst = insectsRef.current.get(id);
      if (!inst || inst.dead) return;
      inst.dead = true;
      const now = performance.now();
      let c = comboRef.current;
      c = now - lastCatchRef.current <= COMBO_WINDOW ? c + 1 : 1;
      lastCatchRef.current = now;
      comboRef.current = c;
      const type = INSECT_TYPES[inst.type];
      const gained = scoreForCatch(type.points, c);
      addScore(gained);
      setCombo(c);
      sfx("catch");
      addBurst(inst.x, inst.y, type.color);
      // mark caught so the component plays its catch animation, then remove.
      setInsects((prev) => prev.map((i) => (i.id === id ? { ...i, caught: true } : i)));
      setTimeout(() => removeInsect(id), 180);
      // level progression
      const lvl = levelFromScore(scoreRef.current);
      if (lvl > levelRef.current) {
        levelRef.current = lvl;
        setLevel(lvl);
        paramsRef.current = levelParams(difficultyRef.current, lvl);
        setLevelFlash((f) => f + 1);
        sfx("level");
        toast.success(`Level ${lvl}!`);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        if (lvl >= MAX_LEVEL) {
          setStatus("won");
          sfx("win");
          stopMusic();
          confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
        }
      }
    },
    [addScore, sfx, addBurst, removeInsect]
  );

  const loseLife = useCallback(() => {
    livesRef.current = Math.max(0, livesRef.current - 1);
    setLives(livesRef.current);
    if (livesRef.current <= 0) {
      setStatus("lost");
      sfx("lose");
      stopMusic();
    }
  }, [sfx]);

  // ---- main animation loop (imperative, minimal re-renders) ----
  useEffect(() => {
    if (status !== "playing" && status !== "paused") return;

    const loop = (ts) => {
      const last = lastTsRef.current || ts;
      let dt = (ts - last) / 1000;
      lastTsRef.current = ts;
      if (dt > 0.05) dt = 0.05; // clamp after tab switches

      if (statusRef.current === "playing") {
        const b = boundsRef.current;
        const now = performance.now();
        const escaped = [];
        if (b.w > 0) {
          for (const inst of insectsRef.current.values()) {
            if (inst.dead) continue;
            // decide to flee once its lifetime expires
            if (!inst.fleeing && now - inst.bornAt > inst.lifetime) {
              inst.fleeing = true;
              const exit = nearestExit(inst, b);
              inst.tx = exit.x;
              inst.ty = exit.y;
            }
            const dx = inst.tx - inst.x;
            const dy = inst.ty - inst.y;
            const dist = Math.hypot(dx, dy);
            const step = inst.speed * dt;
            if (dist <= step || dist < 1) {
              if (inst.fleeing) {
                inst.dead = true;
                inst.escaped = true;
              } else {
                const t = randomInterior(b, inst.size);
                inst.tx = t.x;
                inst.ty = t.y;
              }
            } else {
              inst.x += (dx / dist) * step;
              inst.y += (dy / dist) * step;
              inst.rot = (Math.atan2(dy, dx) * 180) / Math.PI;
            }
            const node = inst.node;
            if (node) {
              node.style.transform = `translate(${inst.x}px, ${inst.y}px) translate(-50%, -50%) rotate(${inst.rot}deg)`;
            }
          }
          // process escapes outside the iterator
          for (const [id, inst] of insectsRef.current) {
            if (inst.dead && inst.escaped && !inst.removed) {
              inst.removed = true;
              escaped.push(id);
            }
          }
        }
        if (escaped.length) {
          escaped.forEach((id) => {
            const inst = insectsRef.current.get(id);
            if (inst) addBurst(inst.x, inst.y, "#94a3b8");
            removeInsect(id);
          });
          sfx("escape");
          loseLife();
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    lastTsRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);

    // spawn scheduler (respects pause via status check)
    const scheduleSpawn = () => {
      spawnTimerRef.current = setTimeout(() => {
        if (statusRef.current === "playing") maybeSpawn();
        scheduleSpawn();
      }, paramsRef.current.spawnInterval * (0.8 + Math.random() * 0.4));
    };
    scheduleSpawn();

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(spawnTimerRef.current);
    };
  }, [status, maybeSpawn, removeInsect, addBurst, sfx, loseLife]);

  // ---- game clock ----
  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setStatus(scoreRef.current >= LEVEL_THRESHOLDS[MAX_LEVEL - 1] ? "won" : "lost");
          stopMusic();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [status, difficulty]);

  // ---- background music lifecycle ----
  useEffect(() => {
    if (musicOn && status === "playing") startMusic();
    else stopMusic();
    return () => stopMusic();
  }, [musicOn, status]);

  // ---- play-area bounds reporter ----
  const reportBounds = useCallback(
    (w, h) => {
      boundsRef.current = { w, h };
      if (statusRef.current === "playing" && !seededRef.current && w > 0) {
        seededRef.current = true;
        seed(3);
      }
    },
    [seed]
  );

  // ---- controls ----
  const startGame = useCallback(
    (diff, insect) => {
      resumeAudio();
      const d = DIFFICULTIES[diff] || DIFFICULTIES.medium;
      difficultyRef.current = diff;
      setDifficulty(diff);
      chosenRef.current = insect;
      setChosenInsect(insect);

      const bonus = insect ? 1 : 0; // favourite insect = +1 starting life
      scoreRef.current = 0;
      setScore(0);
      livesRef.current = d.lives + bonus;
      setLives(d.lives + bonus);
      timeRef.current = d.time;
      setTimeLeft(d.time);
      levelRef.current = 1;
      setLevel(1);
      comboRef.current = 0;
      setCombo(0);
      lastCatchRef.current = 0;
      insectsRef.current.clear();
      setInsects([]);
      setBursts([]);
      seededRef.current = false;
      paramsRef.current = levelParams(d, 1);
      pauseAtRef.current = 0;
      setStatus("playing");
      // if play area already mounted (e.g. restart), seed immediately
      if (boundsRef.current.w > 0) {
        seed(3);
        seededRef.current = true;
      }
    },
    [seed]
  );

  const togglePause = useCallback(() => {
    if (statusRef.current === "playing") {
      pauseAtRef.current = performance.now();
      setStatus("paused");
      stopMusic();
    } else if (statusRef.current === "paused") {
      // offset lifetimes so paused time doesn't age insects
      const delta = performance.now() - pauseAtRef.current;
      for (const inst of insectsRef.current.values()) inst.bornAt += delta;
      setStatus("playing");
      if (musicRef.current) startMusic();
    }
  }, []);

  const restart = useCallback(() => {
    startGame(difficultyRef.current, chosenRef.current);
  }, [startGame]);

  const toStart = useCallback(() => {
    stopMusic();
    insectsRef.current.clear();
    setInsects([]);
    setBursts([]);
    setStatus("start");
  }, []);

  return {
    status,
    difficulty,
    chosenInsect,
    score,
    lives,
    timeLeft,
    level,
    combo,
    highScore,
    insects,
    bursts,
    soundOn,
    musicOn,
    levelFlash,
    maxLevel: MAX_LEVEL,
    setSound: setSoundOn,
    setMusic: setMusicOn,
    setDifficulty,
    setChosenInsect,
    startGame,
    togglePause,
    restart,
    toStart,
    catchInsect,
    registerNode,
    removeBurst,
    reportBounds,
  };
}
