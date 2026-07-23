"use client";

import { STORAGE_KEY } from "../constants/quizConfig";

function safeGet(key, fallback) {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

export function getLeaderboard() {
  return safeGet(STORAGE_KEY, []);
}

export function saveQuizResult(result) {
  const history = getLeaderboard();
  const entry = {
    ...result,
    id: Date.now(),
    timestamp: new Date().toISOString(),
  };
  history.unshift(entry);
  const trimmed = history.slice(0, 50);
  safeSet(STORAGE_KEY, trimmed);
  return trimmed;
}

export function clearLeaderboard() {
  safeSet(STORAGE_KEY, []);
}

export function getRecentAttempts(count = 5) {
  return getLeaderboard().slice(0, count);
}

export function getHighestScore() {
  const history = getLeaderboard();
  if (history.length === 0) return null;
  return history.reduce((best, entry) => (entry.score > best.score ? entry : best), history[0]);
}

export function getBestAccuracy() {
  const history = getLeaderboard();
  if (history.length === 0) return null;
  return history.reduce((best, entry) => (entry.accuracy > best.accuracy ? entry : best), history[0]);
}
