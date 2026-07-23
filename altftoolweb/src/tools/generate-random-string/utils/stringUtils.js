"use client";

export const STORAGE_KEY = "random_string_studio_state";
export const HISTORY_LIMIT = 12;

export const defaultSettings = {
  length: 16,
  count: 5,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  customCharset: "",
  useCustomOnly: false,
  pattern: "",
};

export const characterSets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

export function uniqueCharacters(value) {
  return Array.from(new Set(String(value || "").split(""))).join("");
}

export function buildCharset(settings) {
  if (settings.useCustomOnly && settings.customCharset.trim()) {
    return uniqueCharacters(settings.customCharset);
  }

  let pool = "";
  if (settings.uppercase) pool += characterSets.uppercase;
  if (settings.lowercase) pool += characterSets.lowercase;
  if (settings.numbers) pool += characterSets.numbers;
  if (settings.symbols) pool += characterSets.symbols;
  if (settings.customCharset.trim()) pool += settings.customCharset;
  return uniqueCharacters(pool);
}

function secureIndex(max) {
  if (!max) return 0;
  const array = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  do {
    crypto.getRandomValues(array);
  } while (array[0] >= limit);
  return array[0] % max;
}

function pickFrom(pool) {
  return pool[secureIndex(pool.length)] || "";
}

export function generateFromPattern(pattern, settings) {
  const charset = buildCharset(settings);
  const upper = characterSets.uppercase;
  const lower = characterSets.lowercase;
  const nums = characterSets.numbers;
  const symbols = characterSets.symbols;

  return String(pattern || "").replace(/[Aa9#Xx*?]/g, (token) => {
    if (token === "A") return pickFrom(upper);
    if (token === "a") return pickFrom(lower);
    if (token === "9" || token === "#") return pickFrom(nums);
    if (token === "*") return pickFrom(symbols);
    return pickFrom(charset);
  });
}

export function generateString(settings) {
  if (settings.pattern.trim()) return generateFromPattern(settings.pattern, settings);
  const charset = buildCharset(settings);
  if (!charset.length) return "";
  const length = clampNumber(settings.length, 1, 256);
  return Array.from({ length }, () => pickFrom(charset)).join("");
}

export function generateBatch(settings) {
  const count = clampNumber(settings.count, 1, 100);
  const results = new Set();
  const maxAttempts = count * 20;
  let attempts = 0;

  while (results.size < count && attempts < maxAttempts) {
    attempts += 1;
    const value = generateString(settings);
    if (value) results.add(value);
  }

  return Array.from(results);
}

export function calculateEntropy(settings) {
  const length = settings.pattern.trim() ? generatedPatternSlots(settings.pattern) : clampNumber(settings.length, 1, 256);
  const charsetSize = buildCharset(settings).length;
  const bits = charsetSize > 1 ? length * Math.log2(charsetSize) : 0;
  let label = "Weak";
  if (bits >= 128) label = "Very Strong";
  else if (bits >= 80) label = "Strong";
  else if (bits >= 45) label = "Medium";
  return { bits, label, charsetSize, length };
}

export function generatedPatternSlots(pattern) {
  return (String(pattern || "").match(/[Aa9#Xx*?]/g) || []).length;
}

export function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, Math.round(number)));
}

export function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function buildTxt(strings) {
  return strings.join("\n");
}

export function buildCsv(strings) {
  return ["index,value", ...strings.map((value, index) => `${index + 1},"${String(value).replace(/"/g, '""')}"`)].join("\n");
}

export function makeHistoryItem(strings, settings) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${strings.length}`,
    strings,
    settings,
    createdAt: new Date().toISOString(),
  };
}

export function loadState() {
  if (typeof window === "undefined") return { settings: defaultSettings, history: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      settings: { ...defaultSettings, ...(saved.settings || {}) },
      history: Array.isArray(saved.history) ? saved.history : [],
    };
  } catch {
    return { settings: defaultSettings, history: [] };
  }
}
