import { STORAGE_KEY } from "../constants/trackerConfig";

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

export function getCheckIns() {
  return safeGet(`${STORAGE_KEY}_checkins`, []);
}

export function saveCheckIn(entry) {
  const checkIns = getCheckIns();
  const dateStr = entry.date;
  const existing = checkIns.findIndex((c) => c.date === dateStr);

  const record = {
    ...entry,
    updatedAt: new Date().toISOString(),
  };

  if (existing >= 0) {
    checkIns[existing] = record;
  } else {
    checkIns.push(record);
  }

  checkIns.sort((a, b) => b.date.localeCompare(a.date));
  const trimmed = checkIns.slice(0, 365);
  safeSet(`${STORAGE_KEY}_checkins`, trimmed);
  return trimmed;
}

export function deleteCheckIn(date) {
  const checkIns = getCheckIns().filter((c) => c.date !== date);
  safeSet(`${STORAGE_KEY}_checkins`, checkIns);
  return checkIns;
}

export function getGoals() {
  return safeGet(`${STORAGE_KEY}_goals`, []);
}

export function saveGoals(goals) {
  safeSet(`${STORAGE_KEY}_goals`, goals);
  return goals;
}

export function getBadges() {
  return safeGet(`${STORAGE_KEY}_badges`, []);
}

export function saveBadges(badges) {
  safeSet(`${STORAGE_KEY}_badges`, badges);
  return badges;
}

export function exportAllData() {
  const data = {
    checkIns: getCheckIns(),
    goals: getGoals(),
    badges: getBadges(),
    exportDate: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.checkIns) safeSet(`${STORAGE_KEY}_checkins`, data.checkIns);
    if (data.goals) safeSet(`${STORAGE_KEY}_goals`, data.goals);
    if (data.badges) safeSet(`${STORAGE_KEY}_badges`, data.badges);
    return true;
  } catch {
    return false;
  }
}
