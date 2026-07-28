/**
 * Name to Fingerspelling Graphic — ASL manual alphabet data and strip builder.
 *
 * Scope: the one-handed American Sign Language (ASL) manual alphabet, 26 letters.
 * ASL fingerspelling is produced with the dominant hand only. Two-handed systems
 * (British Sign Language, and the two-handed Indian Sign Language alphabet) use
 * an entirely different set of shapes and are not represented here.
 *
 * Each letter carries the finger states used to draw a schematic diagram plus a
 * written description, which is the authoritative part — a flat diagram cannot
 * show depth, wrist rotation or the small differences between M/N/T.
 *
 * Pure module: no React, no DOM, no Date.now().
 */

/** Finger states used by the schematic. */
export const FINGER_STATES = ["extended", "bent", "curled", "closed"];

/** Thumb positions used by the schematic. */
export const THUMB_STATES = ["side", "out", "across", "tucked", "between", "circle"];

/**
 * Drawn finger length in viewBox units for each state.
 * The diagram uses a 100 x 120 viewBox with the knuckle line at y = 72.
 */
export const FINGER_LENGTH = { extended: 52, bent: 30, curled: 18, closed: 10 };

/** Knuckle line: every finger rectangle ends here. */
export const KNUCKLE_Y = 72;

/** Base x position of each finger when the hand is closed (fingers touching). */
const FINGER_BASE_X = { index: 28, middle: 39, ring: 50, pinky: 61 };

/** Extra sideways spread applied per finger when a letter separates them (V, W). */
const SPREAD_OFFSET = { index: -4, middle: -1, ring: 2, pinky: 5 };

const FINGER_WIDTH = 10;

/** Thumb rectangles: x, y, width, height, corner radius and rotation in degrees. */
const THUMB_SHAPE = {
  side: { x: 14, y: 50, w: 9, h: 28, rx: 4, rotate: 0 },
  out: { x: 0, y: 66, w: 28, h: 9, rx: 4, rotate: 0 },
  across: { x: 26, y: 74, w: 42, h: 9, rx: 4, rotate: 0 },
  tucked: { x: 32, y: 80, w: 26, h: 8, rx: 4, rotate: 0 },
  between: { x: 34, y: 60, w: 9, h: 20, rx: 4, rotate: 0 },
  circle: { x: 16, y: 54, w: 10, h: 22, rx: 5, rotate: 22 },
};

/** Palm block of the schematic. */
export const PALM_SHAPE = { x: 24, y: 70, w: 48, h: 42, rx: 12 };

/**
 * The 26 ASL manual alphabet handshapes.
 * `palm` records which way the palm faces the person you are signing to.
 * `motion` is null for the 24 static letters; J and Z are the two that move.
 */
export const ASL_ALPHABET = {
  A: {
    fingers: { index: "closed", middle: "closed", ring: "closed", pinky: "closed" },
    thumb: "side",
    palm: "forward",
    motion: null,
    description: "Closed fist with the thumb resting straight up alongside the index finger, not tucked inside.",
  },
  B: {
    fingers: { index: "extended", middle: "extended", ring: "extended", pinky: "extended" },
    thumb: "across",
    palm: "forward",
    motion: null,
    description: "Four fingers straight up and held together, thumb folded flat across the palm.",
  },
  C: {
    fingers: { index: "bent", middle: "bent", ring: "bent", pinky: "bent" },
    thumb: "out",
    palm: "side",
    motion: null,
    description: "Whole hand curved into the shape of a letter C, fingers and thumb apart, palm turned to the side.",
  },
  D: {
    fingers: { index: "extended", middle: "curled", ring: "curled", pinky: "curled" },
    thumb: "circle",
    palm: "forward",
    motion: null,
    description: "Index finger straight up; middle, ring and little finger curl down to meet the thumb in a small circle.",
  },
  E: {
    fingers: { index: "curled", middle: "curled", ring: "curled", pinky: "curled" },
    thumb: "tucked",
    palm: "forward",
    motion: null,
    description: "All four fingertips curl down to rest on the thumb, which is tucked in beneath them.",
  },
  F: {
    fingers: { index: "curled", middle: "extended", ring: "extended", pinky: "extended" },
    thumb: "circle",
    palm: "forward",
    motion: null,
    description: "Thumb and index fingertip touch to form a circle; middle, ring and little finger stay straight up.",
  },
  G: {
    fingers: { index: "extended", middle: "closed", ring: "closed", pinky: "closed" },
    thumb: "side",
    palm: "inward",
    motion: null,
    description: "Index finger and thumb held parallel and pointing sideways, the rest of the hand closed. Palm faces you.",
  },
  H: {
    fingers: { index: "extended", middle: "extended", ring: "closed", pinky: "closed" },
    thumb: "across",
    palm: "inward",
    motion: null,
    description: "Index and middle finger together, pointing sideways; ring and little finger closed. Palm faces you.",
  },
  I: {
    fingers: { index: "closed", middle: "closed", ring: "closed", pinky: "extended" },
    thumb: "across",
    palm: "forward",
    motion: null,
    description: "Little finger straight up from a closed fist, thumb across the folded fingers.",
  },
  J: {
    fingers: { index: "closed", middle: "closed", ring: "closed", pinky: "extended" },
    thumb: "across",
    palm: "forward",
    motion: "Draw the hook of a J in the air with the little finger.",
    description: "Start in the I shape, then trace the curve of a J downward and around with the little finger.",
  },
  K: {
    fingers: { index: "extended", middle: "extended", ring: "closed", pinky: "closed" },
    thumb: "between",
    palm: "forward",
    motion: null,
    spread: true,
    description: "Index and middle finger up in a V, with the thumb pressed between them at the base.",
  },
  L: {
    fingers: { index: "extended", middle: "closed", ring: "closed", pinky: "closed" },
    thumb: "out",
    palm: "forward",
    motion: null,
    description: "Index finger straight up and thumb straight out to the side, forming a right-angled L.",
  },
  M: {
    fingers: { index: "bent", middle: "bent", ring: "bent", pinky: "closed" },
    thumb: "tucked",
    palm: "forward",
    motion: null,
    description: "Thumb tucked under three fingers — index, middle and ring fold over it. Three fingers over the thumb means M.",
  },
  N: {
    fingers: { index: "bent", middle: "bent", ring: "closed", pinky: "closed" },
    thumb: "tucked",
    palm: "forward",
    motion: null,
    description: "Thumb tucked under two fingers — index and middle fold over it. Two fingers over the thumb means N.",
  },
  O: {
    fingers: { index: "curled", middle: "curled", ring: "curled", pinky: "curled" },
    thumb: "circle",
    palm: "side",
    motion: null,
    description: "Fingers and thumb curve round until the tips meet, leaving a clear round hole shaped like an O.",
  },
  P: {
    fingers: { index: "extended", middle: "extended", ring: "closed", pinky: "closed" },
    thumb: "between",
    palm: "down",
    motion: null,
    spread: true,
    description: "The K handshape rotated so the fingers point downward, palm facing down.",
  },
  Q: {
    fingers: { index: "extended", middle: "closed", ring: "closed", pinky: "closed" },
    thumb: "out",
    palm: "down",
    motion: null,
    description: "The G handshape rotated so index finger and thumb point downward.",
  },
  R: {
    fingers: { index: "extended", middle: "extended", ring: "closed", pinky: "closed" },
    thumb: "across",
    palm: "forward",
    motion: null,
    description: "Index and middle finger crossed over one another and held up; ring and little finger closed.",
  },
  S: {
    fingers: { index: "closed", middle: "closed", ring: "closed", pinky: "closed" },
    thumb: "across",
    palm: "forward",
    motion: null,
    description: "Closed fist with the thumb wrapped across the front of the folded fingers.",
  },
  T: {
    fingers: { index: "bent", middle: "closed", ring: "closed", pinky: "closed" },
    thumb: "between",
    palm: "forward",
    motion: null,
    description: "Fist with the thumb poking up between the index and middle finger. One finger over the thumb means T.",
  },
  U: {
    fingers: { index: "extended", middle: "extended", ring: "closed", pinky: "closed" },
    thumb: "across",
    palm: "forward",
    motion: null,
    description: "Index and middle finger straight up and held tightly together, thumb across the closed fingers.",
  },
  V: {
    fingers: { index: "extended", middle: "extended", ring: "closed", pinky: "closed" },
    thumb: "across",
    palm: "forward",
    motion: null,
    spread: true,
    description: "Index and middle finger straight up and spread apart in a V. The only difference from U is the gap.",
  },
  W: {
    fingers: { index: "extended", middle: "extended", ring: "extended", pinky: "closed" },
    thumb: "across",
    palm: "forward",
    motion: null,
    spread: true,
    description: "Index, middle and ring finger up and spread; thumb holds the little finger down.",
  },
  X: {
    fingers: { index: "curled", middle: "closed", ring: "closed", pinky: "closed" },
    thumb: "across",
    palm: "forward",
    motion: null,
    description: "Index finger bent into a hook from a closed fist, like a crooked finger beckoning.",
  },
  Y: {
    fingers: { index: "closed", middle: "closed", ring: "closed", pinky: "extended" },
    thumb: "out",
    palm: "forward",
    motion: null,
    description: "Thumb and little finger extended in opposite directions, the three middle fingers folded down.",
  },
  Z: {
    fingers: { index: "extended", middle: "closed", ring: "closed", pinky: "closed" },
    thumb: "across",
    palm: "forward",
    motion: "Draw a Z in the air with the index finger: across, diagonally down, across again.",
    description: "Index finger extended and used to trace the three strokes of a Z in the air.",
  },
};

/** Which way the palm faces, in plain words. */
export const PALM_LABELS = {
  forward: "Palm faces the person reading",
  inward: "Palm faces you",
  side: "Palm turned to the side",
  down: "Palm faces down",
};

/**
 * Practice-pace presets in letters per second. These are pacing choices for a
 * practice strip, not measured norms — real fingerspelling speed varies widely.
 */
export const PACE_PRESETS = [
  { id: "beginner", label: "Beginner", lettersPerSecond: 1 },
  { id: "steady", label: "Steady", lettersPerSecond: 2 },
  { id: "fluent", label: "Fluent", lettersPerSecond: 4 },
];

/** Longest name the strip will lay out, so a print sheet stays usable. */
export const MAX_NAME_LENGTH = 40;

/** Strip letters of their diacritics so José becomes JOSE. */
function stripDiacritics(text) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * Clean a typed name into the characters the manual alphabet can show.
 * Letters are uppercased; spaces and hyphens are kept as visible separators.
 */
export function normaliseName(raw) {
  if (typeof raw !== "string") return "";
  return stripDiacritics(raw)
    .toUpperCase()
    .replace(/[^A-Z \-']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Geometry for one schematic handshape.
 * Returns plain numbers only — the component just renders rectangles.
 */
export function handGeometry(letter) {
  const spec = ASL_ALPHABET[letter];
  if (!spec) return { error: `The ASL manual alphabet has no shape for "${letter}".` };

  const fingers = ["index", "middle", "ring", "pinky"].map((key) => {
    const state = spec.fingers[key];
    const height = FINGER_LENGTH[state] ?? FINGER_LENGTH.closed;
    const offset = spec.spread && state === "extended" ? SPREAD_OFFSET[key] : 0;
    return {
      key,
      state,
      x: FINGER_BASE_X[key] + offset,
      y: KNUCKLE_Y - height,
      w: FINGER_WIDTH,
      h: height,
      rx: FINGER_WIDTH / 2,
    };
  });

  const thumbShape = THUMB_SHAPE[spec.thumb] ?? THUMB_SHAPE.side;

  return {
    letter,
    palm: PALM_SHAPE,
    fingers,
    thumb: {
      ...thumbShape,
      state: spec.thumb,
      originX: thumbShape.x + thumbShape.w / 2,
      originY: thumbShape.y + thumbShape.h / 2,
    },
    hasMotion: Boolean(spec.motion),
  };
}

/**
 * Build the full strip for a name.
 * Returns { error } when nothing can be spelled.
 */
export function buildFingerspelling({ name } = {}) {
  const cleaned = normaliseName(name);
  if (!cleaned) {
    return { error: "Type a name using the letters A to Z." };
  }
  if (cleaned.length > MAX_NAME_LENGTH) {
    return { error: `Keep the name to ${MAX_NAME_LENGTH} characters or fewer so the strip still prints cleanly.` };
  }
  if (!/[A-Z]/.test(cleaned)) {
    return { error: "That name has no letters the manual alphabet can show." };
  }

  const dropped = new Set();
  if (typeof name === "string") {
    stripDiacritics(name)
      .toUpperCase()
      .split("")
      .forEach((char) => {
        if (!/[A-Z \-']/.test(char) && char.trim() !== "") dropped.add(char);
      });
  }

  const items = cleaned.split("").map((char, position) => {
    if (char === " ") return { key: `sep-${position}`, char, kind: "space" };
    if (char === "-" || char === "'") return { key: `sep-${position}`, char, kind: "break" };
    const spec = ASL_ALPHABET[char];
    return {
      key: `${char}-${position}`,
      char,
      kind: "letter",
      description: spec.description,
      motion: spec.motion,
      palm: spec.palm,
      palmLabel: PALM_LABELS[spec.palm],
      geometry: handGeometry(char),
    };
  });

  const letters = items.filter((item) => item.kind === "letter");
  const words = cleaned.split(" ").filter(Boolean);
  const movingLetters = letters.filter((item) => item.motion).map((item) => item.char);

  return {
    cleaned,
    items,
    letterCount: letters.length,
    wordCount: words.length,
    uniqueLetters: Array.from(new Set(letters.map((item) => item.char))).sort(),
    movingLetters: Array.from(new Set(movingLetters)),
    droppedCharacters: Array.from(dropped),
  };
}

/**
 * How long the strip takes to fingerspell at a chosen pace.
 * Guards a zero or negative pace instead of returning Infinity.
 */
export function estimateSpellingTime({ letterCount = 0, lettersPerSecond = 1 } = {}) {
  const count = Number(letterCount);
  const pace = Number(lettersPerSecond);
  if (!Number.isFinite(count) || count < 0) {
    return { error: "Letter count must be zero or more." };
  }
  if (!Number.isFinite(pace) || pace <= 0) {
    return { error: "Pace must be greater than zero letters per second." };
  }
  const seconds = count / pace;
  return {
    seconds,
    rounded: Math.round(seconds * 10) / 10,
    label: `${Math.round(seconds * 10) / 10} s at ${pace} letter${pace === 1 ? "" : "s"} per second`,
  };
}

/** Plain-text version of the strip, for copying into notes or a lesson plan. */
export function describeStrip(result) {
  if (!result || result.error || !Array.isArray(result.items)) return "";
  const lines = result.items.map((item) => {
    if (item.kind === "space") return "  (pause between words)";
    if (item.kind === "break") return `  (${item.char === "-" ? "hyphen" : "apostrophe"} — hold a brief pause)`;
    return `${item.char}: ${item.description}${item.motion ? ` Movement: ${item.motion}` : ""}`;
  });
  return [`Fingerspelling: ${result.cleaned} (ASL one-handed manual alphabet)`, "", ...lines].join("\n");
}
