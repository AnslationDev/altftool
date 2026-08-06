"use client";

/**
 * Alarm utilities for analog-clock-alarm tool.
 */

const STORAGE_KEY = "altftool_analog_clock_alarms";

export function pad2(n) {
  return n.toString().padStart(2, "0");
}

/**
 * Generates a unique ID.
 */
export function genId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/**
 * Default alarm template.
 */
export function createDefaultAlarm(overrides = {}) {
  return {
    id: genId(),
    label: "Alarm",
    hour: 7,    // 0-23
    minute: 0,
    enabled: true,
    repeat: "one-time", // "one-time" | "daily" | "weekdays" | "weekends" | "custom"
    customDays: [],     // 0=Sun..6=Sat when repeat==="custom"
    snoozeMinutes: 5,
    sound: "beep",      // "beep" | "chime" | "bell" | "buzzer"
    volume: 80,
    ...overrides,
  };
}

/**
 * Loads alarms from localStorage.
 */
export function loadAlarms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Saves alarms to localStorage.
 */
export function saveAlarms(alarms) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
  } catch {
    // ignore
  }
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Returns a human-readable label for the repeat setting.
 */
export function repeatLabel(alarm) {
  switch (alarm.repeat) {
    case "one-time": return "One-time";
    case "daily": return "Daily";
    case "weekdays": return "Mon–Fri";
    case "weekends": return "Sat–Sun";
    case "custom":
      if (!alarm.customDays.length) return "Custom";
      return alarm.customDays.map((d) => DAY_NAMES[d]).join(", ");
    default: return alarm.repeat;
  }
}

/**
 * Checks if an alarm should fire right now.
 * @param {object} alarm
 * @param {Date} now
 * @returns {boolean}
 */
export function shouldFire(alarm, now) {
  if (!alarm.enabled) return false;
  if (now.getHours() !== alarm.hour) return false;
  if (now.getMinutes() !== alarm.minute) return false;
  if (now.getSeconds() !== 0) return false;

  return runsOnDay(alarm, now.getDay());
}

function runsOnDay(alarm, day) {
  switch (alarm.repeat) {
    case "one-time": return true;
    case "daily": return true;
    case "weekdays": return day >= 1 && day <= 5;
    case "weekends": return day === 0 || day === 6;
    case "custom": return Array.isArray(alarm.customDays) && alarm.customDays.includes(day);
    default: return false;
  }
}

/**
 * Returns minutes until next alarm fires (from now).
 * Returns null if no enabled alarms.
 */
export function minutesUntilNextAlarm(alarms, now = new Date()) {
  let minDiff = Infinity;

  for (const alarm of alarms) {
    if (!alarm.enabled) continue;
    if (!Number.isInteger(alarm.hour) || alarm.hour < 0 || alarm.hour > 23) continue;
    if (!Number.isInteger(alarm.minute) || alarm.minute < 0 || alarm.minute > 59) continue;

    // Search a full week so weekday, weekend and custom repeats land on the
    // next day on which they can actually fire, not merely the next clock time.
    for (let dayOffset = 0; dayOffset <= 7; dayOffset += 1) {
      const candidate = new Date(now);
      candidate.setDate(now.getDate() + dayOffset);
      candidate.setHours(alarm.hour, alarm.minute, 0, 0);

      if (candidate.getTime() <= now.getTime()) continue;
      if (!runsOnDay(alarm, candidate.getDay())) continue;

      const diff = Math.ceil((candidate.getTime() - now.getTime()) / 60_000);
      if (diff < minDiff) minDiff = diff;
      break;
    }
  }

  return minDiff === Infinity ? null : minDiff;
}

/**
 * Returns a formatted "next alarm in X" string.
 */
export function nextAlarmLabel(alarms, now = new Date()) {
  const mins = minutesUntilNextAlarm(alarms, now);
  if (mins === null) return null;
  if (mins < 60) return `Next alarm in ${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `Next alarm in ${h}h` : `Next alarm in ${h}h ${m}m`;
}

/**
 * Plays an alarm sound using Web Audio API.
 * Returns a stop function.
 */
export function playAlarmSound(sound = "beep", volume = 80) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume / 100;
    gainNode.connect(ctx.destination);

    let stopped = false;
    const oscillators = [];

    const patterns = {
      beep: [{ freq: 880, dur: 0.15, gap: 0.1 }],
      chime: [
        { freq: 523, dur: 0.3, gap: 0.1 },
        { freq: 659, dur: 0.3, gap: 0.1 },
        { freq: 784, dur: 0.5, gap: 0.2 },
      ],
      bell: [{ freq: 1046, dur: 0.8, gap: 0.3 }],
      buzzer: [{ freq: 200, dur: 0.2, gap: 0.05 }],
    };

    const pat = patterns[sound] || patterns.beep;
    let t = ctx.currentTime;
    const REPS = 10;

    for (let rep = 0; rep < REPS; rep++) {
      for (const note of pat) {
        const osc = ctx.createOscillator();
        osc.type = sound === "buzzer" ? "sawtooth" : "sine";
        osc.frequency.value = note.freq;
        osc.connect(gainNode);
        osc.start(t);
        osc.stop(t + note.dur);
        oscillators.push(osc);
        t += note.dur + note.gap;
      }
    }

    return () => {
      if (stopped) return;
      stopped = true;
      oscillators.forEach((o) => {
        try { o.stop(); } catch {}
      });
      setTimeout(() => ctx.close(), 200);
    };
  } catch {
    return () => {};
  }
}
