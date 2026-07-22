"use client";
import { useState, useCallback, useRef } from "react";

const STORAGE_KEY = "human_benchmark_scores";
const LOWER_BETTER = new Set(["reaction_time", "aim_trainer"]);

export function useScores() {
  const [scores, setScores] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch { return {}; }
  });

  const saveScore = useCallback((testId, score) => {
    setScores(prev => {
      const ex = prev[testId] || { best: null, attempts: [] };
      const lb = LOWER_BETTER.has(testId);
      const best = ex.best === null ? score : lb ? Math.min(ex.best, score) : Math.max(ex.best, score);
      const updated = {
        ...prev,
        [testId]: { best, attempts: [{ score, date: new Date().toISOString() }, ...ex.attempts].slice(0, 50) }
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const resetAll = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setScores({});
  }, []);

  return { scores, saveScore, resetAll };
}

export function useBeep() {
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef(null);

  const beep = useCallback((freq = 440, dur = 0.15) => {
    if (muted) return;
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = "sine";
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(); osc.stop(ctx.currentTime + dur);
    } catch {}
  }, [muted]);

  return {
    muted,
    toggleMute: () => setMuted(m => !m),
    correct: () => beep(523, 0.12),
    wrong: () => beep(196, 0.2),
  };
}
