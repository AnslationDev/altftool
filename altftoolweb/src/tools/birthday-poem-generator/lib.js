/**
 * Birthday poem composer.
 *
 * Pure: no React, no DOM, no Date.now(). Same (inputs, seed) always produce
 * the same poem. Wording banks below are hand-written, pre-rhymed content
 * (not algorithmically generated), selected by tone and relationship.
 */

export const MAX_VARIANTS = 3;
export const MAX_NAME_LENGTH = 40;
export const MAX_MEMORY_LENGTH = 120;
export const MIN_AGE = 1;
export const MAX_AGE = 120;

/* ------------------------------------------------------------------ *
 * Options
 * ------------------------------------------------------------------ */

export const RELATIONSHIPS = [
  { id: "friend", label: "Friend", group: "personal", relWord: "friend" },
  { id: "sibling", label: "Sibling", group: "personal", relWord: "sibling" },
  { id: "partner", label: "Partner or spouse", group: "personal", relWord: "partner" },
  { id: "parent", label: "Parent", group: "family", relWord: "parent" },
  { id: "child", label: "Son or daughter", group: "family", relWord: "child" },
  { id: "colleague", label: "Colleague", group: "formal", relWord: "colleague" },
];

export const TONES = [
  { id: "heartfelt", label: "Heartfelt" },
  { id: "funny", label: "Funny" },
  { id: "classic", label: "Classic / formal" },
  { id: "playful", label: "Playful / kid-friendly" },
];

export const LENGTHS = [
  { id: "full", label: "Full poem (6 lines)" },
  { id: "short", label: "Short caption (2 lines)" },
];

/* ------------------------------------------------------------------ *
 * Wording banks. Tokens: {name} {age} {relWord}
 * ------------------------------------------------------------------ */

const OPENINGS = {
  heartfelt: [
    ["Another year has come around so fast,", "filled with moments built to last."],
    ["Today the world feels bright and new,", "because it's the day we celebrate you."],
    ["May this year bring all your dreams in sight,", "and fill your days with warmth and light."],
  ],
  funny: [
    ["You're not getting older, just more advanced in years,", "so blow out the candles before the smoke alarm hears."],
    ["Cake first, diet later — that's the golden rule,", "birthdays don't count calories, that would be cruel."],
    ["You've survived another trip around the sun,", "which honestly deserves a medal and a bun."],
  ],
  classic: [
    ["On this special day we pause to say,", "we wish you joy in every way."],
    ["May the year ahead be kind and true,", "and bring good fortune close to you."],
    ["May health and happiness be your way,", "today, this year, and every day."],
  ],
  playful: [
    ["Hip hip hooray, it's your special day,", "time for cake and games and play!"],
    ["Balloons are up and candles bright,", "let's make a wish and have a great night!"],
    ["Happy Birthday, shout it loud and clear,", "a whole new fun-filled year is here!"],
  ],
};

const MEMORY_LINE = {
  heartfelt: "I still smile thinking of {memory} — it means so much to me.",
  funny: "Remember {memory}? Still one of our best stories yet.",
  classic: "We fondly recall {memory}, a cherished memory indeed.",
  playful: "Remember {memory}? That was so much fun!",
};

const NO_MEMORY_LINE = {
  heartfelt: "Every memory with you feels like a gift.",
  funny: "No stories needed — you're entertaining enough on your own.",
  classic: "Every year with you adds another fond memory.",
  playful: "Here's to making more fun memories this year!",
};

const CLOSINGS = {
  personal: [
    ["So here's to you on this big day,", "may laughter and joy come your way."],
    ["Stay just as wonderful as you are,", "shining bright like your own star."],
    ["Here's to you, {relWord}, through and through,", "another great year begins with you."],
  ],
  family: [
    ["With all my love, I wish you cheer,", "the best of everything this year."],
    ["Thankful to call you my {relWord} so dear,", "happy birthday, sincere and clear."],
    ["Blessings and love from our family to you,", "may your birthday wishes all come true."],
  ],
  formal: [
    ["Wishing you success in all you pursue,", "happy birthday from the whole crew."],
    ["May this year bring growth and reward,", "happy birthday, with high regard."],
    ["Thank you for all you bring to our team,", "happy birthday — go chase your dream."],
  ],
};

const SHORT_LINES = {
  heartfelt: [
    "Wishing you all the joy this new year brings.",
    "So grateful to celebrate another year of you.",
    "May this year be as wonderful as you are.",
  ],
  funny: [
    "Warning: aging like fine wine, still classy though.",
    "Level up! New age, same great energy.",
    "Cake now, adulting later.",
  ],
  classic: [
    "Wishing you continued success and happiness.",
    "May this year bring prosperity and good health.",
    "With warm regards on your special day.",
  ],
  playful: [
    "Hip hip hooray, it's party time today!",
    "Balloons, cake, and lots of fun — happy birthday!",
    "Make a wish and blow the candles out!",
  ],
};

/* ------------------------------------------------------------------ *
 * Compose
 * ------------------------------------------------------------------ */

/** mulberry32 — deterministic 32-bit PRNG. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rotate(list, offset, step) {
  if (!Array.isArray(list) || list.length === 0) return null;
  return list[(offset + step) % list.length];
}

function clean(value, maxLength) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function fill(template, tokens) {
  return String(template).replace(/\{(\w+)\}/g, (whole, key) =>
    Object.prototype.hasOwnProperty.call(tokens, key) ? tokens[key] : whole,
  );
}

/**
 * Build birthday poem drafts.
 *
 * @returns {{variants:Array<{id:number,lines:string[],text:string,chars:number,
 *            words:number}>, relationship:string, tone:string, length:string}
 *            |{error:string}}
 */
export function buildBirthdayPoem({
  name = "",
  age = "",
  relationship = "friend",
  tone = "heartfelt",
  memory = "",
  length = "full",
  seed = 1,
  count = 3,
} = {}) {
  const relEntry = RELATIONSHIPS.find((item) => item.id === relationship) ?? RELATIONSHIPS[0];
  const toneId = TONES.some((item) => item.id === tone) ? tone : "heartfelt";
  const lenId = LENGTHS.some((item) => item.id === length) ? length : "full";

  const person = clean(name, MAX_NAME_LENGTH);
  if (!person) return { error: "Add the name of the person you're writing for." };

  // Age is decorative, not safety- or fact-critical, so an out-of-range or
  // non-numeric value is simply treated as "not supplied" instead of
  // blocking the whole poem.
  const ageNum = Number(age);
  const hasAge = Number.isFinite(ageNum) && ageNum >= MIN_AGE && ageNum <= MAX_AGE;
  const ageValue = hasAge ? Math.round(ageNum) : null;

  const memoryText = clean(memory, MAX_MEMORY_LENGTH);
  const wanted = Math.max(1, Math.min(MAX_VARIANTS, Math.round(Number(count) || 1)));
  const rng = mulberry32(Math.abs(Math.round(Number(seed) || 0)) + 1);
  const openOffset = Math.floor(rng() * 997);
  const closeOffset = Math.floor(rng() * 997);
  const shortOffset = Math.floor(rng() * 997);

  const tokens = {
    name: person,
    age: ageValue == null ? "" : String(ageValue),
    relWord: relEntry.relWord,
  };
  const greeting = hasAge
    ? fill("Happy Birthday, {name} — {age} looks good on you!", tokens)
    : fill("Happy Birthday, {name}!", tokens);

  const variants = [];
  for (let step = 0; step < wanted; step += 1) {
    let lines;
    if (lenId === "short") {
      const caption = fill(rotate(SHORT_LINES[toneId], shortOffset, step) ?? "", tokens);
      lines = [greeting, caption];
    } else {
      const opening = (rotate(OPENINGS[toneId], openOffset, step) ?? []).map((line) => fill(line, tokens));
      const memoryLine = fill(
        memoryText ? MEMORY_LINE[toneId] : NO_MEMORY_LINE[toneId],
        { ...tokens, memory: memoryText },
      );
      const closing = (rotate(CLOSINGS[relEntry.group], closeOffset, step) ?? []).map((line) =>
        fill(line, tokens),
      );
      lines = [greeting, ...opening, memoryLine, ...closing];
    }

    const text = lines.join("\n");
    const trimmed = text.trim();
    variants.push({
      id: step + 1,
      lines,
      text,
      chars: [...text].length,
      words: trimmed ? trimmed.split(/\s+/).length : 0,
    });
  }

  return {
    variants,
    relationship: relEntry.label,
    tone: toneId,
    length: lenId,
  };
}
