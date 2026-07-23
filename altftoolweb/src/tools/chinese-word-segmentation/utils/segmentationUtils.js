"use client";

export const STORAGE_KEY = "chinese_word_segmentation_lab_v1";
export const HISTORY_LIMIT = 12;
export const MAX_INPUT_LENGTH = 12000;

export const SCRIPT_PATTERNS = {
  chinese: /[\u3400-\u9FFF\uF900-\uFAFF]/u,
  hindi: /[\u0900-\u097F]/u,
  english: /[A-Za-z]/u,
  number: /[0-9]/u,
};

export const SCRIPT_LABELS = {
  chinese: "Chinese",
  english: "English",
  hindi: "Hindi",
  number: "Number",
  mixed: "Mixed",
  punctuation: "Punctuation",
  unknown: "Unknown",
};

export function getScript(char) {
  if (SCRIPT_PATTERNS.chinese.test(char)) return "chinese";
  if (SCRIPT_PATTERNS.hindi.test(char)) return "hindi";
  if (SCRIPT_PATTERNS.english.test(char)) return "english";
  if (SCRIPT_PATTERNS.number.test(char)) return "number";
  if (/\s/u.test(char)) return "space";
  if (/\p{P}|\p{S}/u.test(char)) return "punctuation";
  return "unknown";
}

export function detectLanguage(text) {
  const counts = { chinese: 0, english: 0, hindi: 0, number: 0, unknown: 0 };

  for (const char of text) {
    const script = getScript(char);
    if (counts[script] !== undefined) counts[script] += 1;
  }

  const present = ["chinese", "english", "hindi"].filter((key) => counts[key] > 0);
  const totalLetters = present.reduce((sum, key) => sum + counts[key], 0);

  if (!text.trim()) return { type: "empty", label: "Waiting", confidence: 0, counts };
  if (present.length > 1) return { type: "mixed", label: "Mixed language", confidence: 100, counts };
  if (present.length === 1) {
    const type = present[0];
    return {
      type,
      label: SCRIPT_LABELS[type],
      confidence: totalLetters ? Math.round((counts[type] / totalLetters) * 100) : 0,
      counts,
    };
  }

  return { type: "unknown", label: "Unsupported or symbolic", confidence: 0, counts };
}

export function splitRuns(text) {
  const runs = [];
  let current = null;

  for (const char of text) {
    const script = getScript(char);
    if (script === "space") {
      if (current) {
        runs.push(current);
        current = null;
      }
      continue;
    }

    if (!current || current.script !== script) {
      if (current) runs.push(current);
      current = { script, text: char };
    } else {
      current.text += char;
    }
  }

  if (current) runs.push(current);
  return runs;
}

export function segmentWithIntl(text, locale) {
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    return Array.from(new Intl.Segmenter(locale, { granularity: "word" }).segment(text))
      .filter((item) => item.isWordLike)
      .map((item) => item.segment);
  }

  return text.match(/[\p{L}\p{N}]+/gu) || [];
}

export function segmentRun(run) {
  if (run.script === "chinese") return segmentWithIntl(run.text, "zh-Hans");
  if (run.script === "hindi") return segmentWithIntl(run.text, "hi-IN");
  if (run.script === "english") return segmentWithIntl(run.text, "en-US");
  if (run.script === "number") return run.text.match(/\d+(?:[.,]\d+)*/g) || [];
  if (run.script === "punctuation") return Array.from(run.text);
  return run.text.match(/[\p{L}\p{N}]+/gu) || Array.from(run.text);
}

export function parseMeaningMap(raw) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((map, line) => {
      const match = line.match(/^(.+?)(?:\s*=\s*|\s*:\s*|\s*-\s*)(.+)$/u);
      if (match) map.set(match[1].trim(), match[2].trim());
      return map;
    }, new Map());
}

export function analyzeText(text, meaningSource) {
  const normalized = text.slice(0, MAX_INPUT_LENGTH);
  const language = detectLanguage(normalized);
  const meaningMap = parseMeaningMap(meaningSource);
  const tokens = splitRuns(normalized).flatMap((run) =>
    segmentRun(run).map((value) => ({
      id: `${run.script}-${value}-${globalThis.crypto?.randomUUID?.() || Math.random()}`,
      value,
      script: run.script,
      label: SCRIPT_LABELS[run.script] || SCRIPT_LABELS.unknown,
      length: Array.from(value).length,
      meaning: meaningMap.get(value) || "",
    }))
  );

  return {
    original: normalized,
    language,
    tokens,
    segmentedText: tokens.map((token) => token.value).join(" | "),
    wordCount: tokens.filter((token) => token.script !== "punctuation").length,
    charCount: Array.from(normalized.replace(/\s/g, "")).length,
    lineCount: normalized ? normalized.split(/\r\n|\r|\n/).length : 0,
    truncated: text.length > MAX_INPUT_LENGTH,
  };
}

export function safeReadState() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function downloadText(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
