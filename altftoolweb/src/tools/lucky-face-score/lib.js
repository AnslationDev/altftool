/**
 * Lucky Face Score — a deterministic, entirely fictional luck reading.
 *
 * There is no face detection and no AI here, and the score means nothing about
 * you. What the module actually does is hash the bytes of the picture you chose
 * with FNV-1a (32-bit, Fowler–Noll–Vo, offset basis 2166136261, prime
 * 16777619) and expand that hash with a small xorshift generator into a set of
 * numbers between 0 and 100.
 *
 * The one real property it guarantees is determinism: the same image always
 * produces the same score, on any device, forever — because nothing in here
 * reads the clock or calls Math.random. Change one pixel and every number
 * changes.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** FNV-1a 32-bit parameters (Fowler–Noll–Vo, 1991). */
export const FNV_OFFSET_BASIS = 2166136261;
export const FNV_PRIME = 16777619;

/** Scores run 1–100; zero is reserved for "nothing hashed yet". */
export const MIN_SCORE = 1;
export const MAX_SCORE = 100;

/** Sampling stride — reading every 97th byte keeps a 12 MP photo instant while
 * still touching the whole file. 97 is prime, so the stride never aligns with
 * a row width and skips the same column of pixels each time. */
export const SAMPLE_STRIDE = 97;

/** Badge bands, checked from the top down. */
export const BADGES = [
  { min: 90, label: "Grand Luck Master", emoji: "👑", note: "Statistically absurd. Buy the raffle ticket." },
  { min: 75, label: "Fortune's Favourite", emoji: "💫", note: "The day is leaning your way." },
  { min: 55, label: "Lucky Star", emoji: "⭐", note: "Comfortably above average, whatever that means." },
  { min: 35, label: "Beginner's Luck", emoji: "✨", note: "Small wins, quietly stacking up." },
  { min: 0, label: "Needs a Four-Leaf Clover", emoji: "🍀", note: "Today is for staying in and making tea." },
];

/** Fortune lines — one is picked by the hash, never at random. */
export const FORTUNES = [
  "Something you gave up looking for turns up this week.",
  "The queue you join will be the fast one, for once.",
  "A message you have been avoiding turns out to be good news.",
  "Say yes to the plan you were about to cancel.",
  "The thing you forgot was never as important as you feared.",
  "Someone remembers a favour you had already forgotten.",
  "Your next guess will be closer than it has any right to be.",
  "An old idea becomes useful again on Thursday.",
  "The weather cooperates exactly once, at exactly the right moment.",
  "You will find money in a coat pocket. It will be a small amount.",
  "A door you assumed was locked opens on the first push.",
  "The recipe works even though you improvised half of it.",
  "You are one conversation away from a much better week.",
  "Something breaks, and it turns out to be covered by warranty.",
  "The song you cannot name comes on the radio and gets named.",
  "Your patience runs out one minute after it stopped being needed.",
];

/** Named lucky colours — names only, so the page can theme them properly. */
export const LUCKY_COLOURS = [
  "Crimson",
  "Tangerine",
  "Amber",
  "Gold",
  "Spring Green",
  "Emerald",
  "Teal",
  "Sky Blue",
  "Royal Blue",
  "Violet",
  "Purple",
  "Rose",
];

/** Days of the week, Monday first. */
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** The four sub-readings shown under the main score. */
export const FACETS = [
  { id: "charm", label: "Charm", note: "How well strangers take to you today" },
  { id: "timing", label: "Timing", note: "Whether you arrive at the right moment" },
  { id: "fortune", label: "Fortune", note: "Small unearned windfalls" },
  { id: "aura", label: "Aura", note: "Entirely made up, like the rest of this" },
];

/**
 * FNV-1a 32-bit hash of a byte sequence or string.
 *
 * @param {Uint8Array|number[]|string} input
 * @param {number} [stride] read every nth byte; 1 reads all of them
 * @returns {number} unsigned 32-bit hash
 */
export function fnv1a32(input, stride = 1) {
  const step = Number.isInteger(stride) && stride > 0 ? stride : 1;
  let hash = FNV_OFFSET_BASIS;

  if (typeof input === "string") {
    for (let index = 0; index < input.length; index += step) {
      hash ^= input.charCodeAt(index) & 0xff;
      hash = Math.imul(hash, FNV_PRIME);
    }
    return hash >>> 0;
  }

  if (!input || typeof input.length !== "number") return FNV_OFFSET_BASIS >>> 0;
  for (let index = 0; index < input.length; index += step) {
    hash ^= input[index] & 0xff;
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash >>> 0;
}

/**
 * xorshift32 — expands one hash into a repeatable stream of numbers.
 *
 * @param {number} seed
 * @returns {() => number} next unsigned 32-bit value
 */
export function xorshift32(seed) {
  let state = (seed >>> 0) || 1;
  return () => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state;
  };
}

/**
 * Map an unsigned 32-bit value onto an inclusive integer range.
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function toRange(value, min, max) {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) return min;
  if (max <= min) return min;
  const span = max - min + 1;
  return min + ((value >>> 0) % span);
}

/** Badge for a score. */
export function badgeForScore(score) {
  return BADGES.find((badge) => score >= badge.min) ?? BADGES[BADGES.length - 1];
}

/**
 * Produce the full reading for an image.
 *
 * @param {object} input
 * @param {Uint8Array|number[]|string} input.bytes the file's bytes (or any stable string)
 * @param {string} [input.fileName] mixed into the seed so two crops differ
 * @returns {object} reading, or { error }
 */
export function calculateLuckyScore({ bytes, fileName = "" }) {
  const hasBytes =
    (typeof bytes === "string" && bytes.length > 0) ||
    (bytes && typeof bytes.length === "number" && bytes.length > 0);
  if (!hasBytes) {
    return { error: "Choose a photo first — there is nothing to read yet." };
  }

  const imageHash = fnv1a32(bytes, SAMPLE_STRIDE);
  const nameHash = fnv1a32(String(fileName), 1);
  // Combine with a multiply-xor so the file name shifts every derived number.
  const seed = (Math.imul(imageHash, FNV_PRIME) ^ nameHash) >>> 0;
  const next = xorshift32(seed);

  const score = toRange(next(), MIN_SCORE, MAX_SCORE);
  const facets = FACETS.map((facet) => ({
    ...facet,
    value: toRange(next(), MIN_SCORE, MAX_SCORE),
  }));

  const fortune = FORTUNES[toRange(next(), 0, FORTUNES.length - 1)];
  const colour = LUCKY_COLOURS[toRange(next(), 0, LUCKY_COLOURS.length - 1)];
  const day = DAYS[toRange(next(), 0, DAYS.length - 1)];
  const luckyNumber = toRange(next(), 1, 99);
  const badge = badgeForScore(score);

  return {
    score,
    badge: badge.label,
    badgeEmoji: badge.emoji,
    badgeNote: badge.note,
    facets,
    fortune,
    luckyColour: colour,
    luckyDay: day,
    luckyNumber,
    seed,
    /** Short readable fingerprint of the image, so two readings can be compared. */
    fingerprint: seed.toString(16).padStart(8, "0"),
  };
}

/**
 * Average of several readings — the only honest statistic this tool can offer,
 * and it still means nothing.
 *
 * @param {number[]} scores
 * @returns {{ average: number, best: number, worst: number, count: number } | { error: string }}
 */
export function summariseReadings(scores) {
  if (!Array.isArray(scores) || scores.length === 0) {
    return { error: "No readings yet." };
  }
  const valid = scores.filter(
    (value) => Number.isFinite(value) && value >= MIN_SCORE && value <= MAX_SCORE,
  );
  if (valid.length === 0) return { error: "No valid readings yet." };
  const total = valid.reduce((sum, value) => sum + value, 0);
  return {
    average: total / valid.length,
    best: Math.max(...valid),
    worst: Math.min(...valid),
    count: valid.length,
  };
}
