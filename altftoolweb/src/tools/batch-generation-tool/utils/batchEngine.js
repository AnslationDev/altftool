/**
 * Batch generation engine — pure and dependency-free so every counting,
 * padding, capping and dedupe rule is unit-testable in Node.
 *
 * Pattern tokens (inside {curly braces}):
 *   {0000…}  zero-padded sequence number (width = number of zeros);
 *            in "random" mode it becomes that many random digits
 *   {N}      plain sequence number; a random digit in "random" mode
 *   {A}      one random UPPERCASE letter
 *   {a}      one random lowercase letter
 *   {R}      one random alphanumeric character
 *   {YYYY}   current year (e.g. 2026)
 * Unknown tokens are left untouched so typos are visible, not swallowed.
 *
 * Modes: "sequential" (start→end by step), "text" and "random" (count items,
 * sequence starts at `start`), "custom" (one item per non-empty line).
 * Post-transforms: prefix, suffix, uppercase, uniqueOnly. Everything is
 * hard-capped at MAX_ITEMS.
 */

export const MAX_ITEMS = 10000;

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const ALNUM = UPPER + LOWER + DIGITS;

const pick = (set) => set[Math.floor(Math.random() * set.length)];
const randomDigits = (n) => Array.from({ length: n }, () => pick(DIGITS)).join("");

export function fillPattern(pattern, seq, mode, year = new Date().getFullYear()) {
  return (pattern || "").replace(/\{([^{}]*)\}/g, (whole, body) => {
    if (/^0+$/.test(body)) {
      return mode === "random"
        ? randomDigits(body.length)
        : String(seq).padStart(body.length, "0");
    }
    if (body === "N") return mode === "random" ? pick(DIGITS) : String(seq);
    if (body === "A") return pick(UPPER);
    if (body === "a") return pick(LOWER);
    if (body === "R") return pick(ALNUM);
    if (body === "YYYY") return String(year);
    return whole; // unknown token — leave visible
  });
}

/**
 * @returns {{items: string[], capped: boolean}}
 */
export function generateBatch(cfg) {
  const {
    type = "sequential",
    pattern = "",
    start = 1,
    end = 1,
    step = 1,
    count = 0,
    customList = "",
    prefix = "",
    suffix = "",
    uppercase = false,
    uniqueOnly = false,
  } = cfg || {};

  let raw = [];
  let capped = false;

  if (type === "custom") {
    const lines = customList
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    capped = lines.length > MAX_ITEMS;
    raw = lines.slice(0, MAX_ITEMS);
  } else if (type === "sequential") {
    const s = Math.trunc(Number(start)) || 0;
    const e = Math.trunc(Number(end)) || 0;
    const st = Math.max(1, Math.trunc(Number(step)) || 1);
    for (let v = s; v <= e; v += st) {
      if (raw.length >= MAX_ITEMS) {
        capped = true;
        break;
      }
      raw.push(fillPattern(pattern, v, type));
    }
  } else {
    // "text" and "random": generate `count` items, sequence from `start`
    const wanted = Math.max(0, Math.trunc(Number(count)) || 0);
    capped = wanted > MAX_ITEMS;
    const n = Math.min(wanted, MAX_ITEMS);
    const s = Math.trunc(Number(start)) || 1;
    for (let i = 0; i < n; i += 1) {
      raw.push(fillPattern(pattern, s + i, type));
    }
  }

  let items = raw.map((v) => `${prefix}${v}${suffix}`);
  if (uppercase) items = items.map((v) => v.toUpperCase());

  if (uniqueOnly) {
    const seen = new Set(items);
    if (seen.size < items.length && type === "random") {
      // Random mode can retry to replace collisions (bounded attempts).
      const target = items.length;
      let attempts = target * 10;
      while (seen.size < target && attempts > 0) {
        attempts -= 1;
        let candidate = `${prefix}${fillPattern(pattern, 0, "random")}${suffix}`;
        if (uppercase) candidate = candidate.toUpperCase();
        seen.add(candidate);
      }
    }
    items = [...seen];
  }

  return { items, capped };
}

/**
 * generateBatch + wall-clock timing + output size in one call, so UI code can
 * stay a pure memo (no timer calls inside React hooks).
 */
export function generateBatchTimed(cfg) {
  const now =
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? () => performance.now()
      : () => Date.now();
  const t0 = now();
  const out = generateBatch(cfg);
  const elapsedMs = now() - t0;
  return { ...out, elapsedMs, bytes: outputBytes(out.items) };
}

/** Byte size of the joined output (what a downloaded .txt would weigh). */
export function outputBytes(items) {
  if (!items.length) return 0;
  return new TextEncoder().encode(items.join("\n")).length;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function toCsv(items) {
  const esc = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return ["index,value", ...items.map((v, i) => `${i + 1},${esc(v)}`)].join("\n");
}

export function toJson(items) {
  return JSON.stringify(items, null, 2);
}
