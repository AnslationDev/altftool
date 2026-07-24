export const SAFE_WORDS = Object.freeze([
  "acorn",
  "amber",
  "apricot",
  "arrow",
  "atlas",
  "badger",
  "bamboo",
  "beacon",
  "birch",
  "bison",
  "bluebird",
  "breeze",
  "brook",
  "cactus",
  "canyon",
  "cedar",
  "cherry",
  "cobalt",
  "comet",
  "coral",
  "cosmos",
  "cricket",
  "dawn",
  "dolphin",
  "ember",
  "falcon",
  "fern",
  "fjord",
  "flamingo",
  "forest",
  "fossil",
  "foxglove",
  "galaxy",
  "garden",
  "ginger",
  "glacier",
  "harbor",
  "hazel",
  "heron",
  "honey",
  "indigo",
  "island",
  "jasmine",
  "juniper",
  "kiwi",
  "lagoon",
  "lantern",
  "lemon",
  "lilac",
  "lotus",
  "mango",
  "maple",
  "marble",
  "meadow",
  "meteor",
  "mint",
  "moon",
  "mosaic",
  "nebula",
  "oasis",
  "ocean",
  "olive",
  "orchid",
  "otter",
  "pebble",
  "pepper",
  "pine",
  "plum",
  "prairie",
  "quartz",
  "raven",
  "reef",
  "river",
  "robin",
  "saffron",
  "sage",
  "sequoia",
  "silver",
  "sparrow",
  "spruce",
  "starling",
  "sunrise",
  "thistle",
  "tiger",
  "topaz",
  "tulip",
  "valley",
  "violet",
  "walnut",
  "willow",
  "wren",
  "zephyr",
]);

function assertGenerator(randomUint32) {
  if (typeof randomUint32 !== "function") {
    throw new TypeError("A secure random number source is required.");
  }
}

export function uniformIndex(size, randomUint32) {
  assertGenerator(randomUint32);
  if (!Number.isInteger(size) || size < 2 || size > 0x100000000) {
    throw new RangeError("The choice pool must contain between 2 and 2^32 items.");
  }

  const range = 0x100000000;
  const limit = range - (range % size);
  let value;

  do {
    value = Number(randomUint32()) >>> 0;
  } while (value >= limit);

  return value % size;
}

export function browserRandomUint32() {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Secure browser randomness is unavailable.");
  }
  const value = new Uint32Array(1);
  globalThis.crypto.getRandomValues(value);
  return value[0];
}

export function estimateEntropyBits({
  wordPoolSize = SAFE_WORDS.length,
  wordCount = 5,
  digitCount = 3,
} = {}) {
  return wordCount * Math.log2(wordPoolSize) + digitCount * Math.log2(10);
}

export function generateFamilySafeWord({
  words = SAFE_WORDS,
  wordCount = 5,
  digitCount = 3,
  randomUint32 = browserRandomUint32,
} = {}) {
  assertGenerator(randomUint32);
  const uniqueWords = [...new Set(words.map((word) => String(word).trim().toLowerCase()))].filter(
    Boolean,
  );

  if (uniqueWords.length < 32) {
    throw new RangeError("Use at least 32 unique words.");
  }
  if (!Number.isInteger(wordCount) || wordCount < 3 || wordCount > 8) {
    throw new RangeError("Choose between 3 and 8 words.");
  }
  if (!Number.isInteger(digitCount) || digitCount < 0 || digitCount > 6) {
    throw new RangeError("Choose between 0 and 6 digits.");
  }

  const selected = [];
  for (let index = 0; index < wordCount; index += 1) {
    selected.push(uniqueWords[uniformIndex(uniqueWords.length, randomUint32)]);
  }

  let digits = "";
  for (let index = 0; index < digitCount; index += 1) {
    digits += String(uniformIndex(10, randomUint32));
  }

  const phrase = digits ? `${selected.join("-")}-${digits}` : selected.join("-");
  return {
    phrase,
    words: selected,
    digits,
    entropyBits: estimateEntropyBits({
      wordPoolSize: uniqueWords.length,
      wordCount,
      digitCount,
    }),
  };
}

export function buildFamilyProtocol(phrase) {
  const normalized = String(phrase || "").trim();
  return [
    "Agree that nobody reveals the phrase unless another family member asks for it.",
    "If a caller claims there is an emergency, hang up and call the person back on a saved number.",
    `Ask for the complete phrase${normalized ? ` (${normalized.split("-").length} parts)` : ""}; do not offer hints.`,
    "Treat a wrong, partial, delayed, or avoided answer as a reason to verify through another channel.",
    "Replace the phrase after it is exposed, shared in a group chat, or used during a real incident.",
  ];
}
