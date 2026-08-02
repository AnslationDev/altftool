/**
 * Sign Language Alphabet Poster Maker — data and layout logic.
 *
 * Scope: the one-handed American Sign Language (ASL) manual alphabet (26 letters)
 * and the ASL number handshapes 0-9. Both are produced with the dominant hand
 * alone. Two-handed manual alphabets — British Sign Language, Auslan, and the
 * two-handed Indian Sign Language alphabet — use a different system entirely and
 * are deliberately not included rather than approximated.
 *
 * Handshapes are stored as a compact code so the poster can draw a schematic:
 *   fingers: four characters, in the order index, middle, ring, little
 *     e = extended, b = bent at the knuckle, c = curled to the palm, x = closed
 *   thumb: s = alongside the fist, o = out to the side, a = across the fingers,
 *          t = tucked under the fingers, b = between two fingers,
 *          r = curved round to touch a fingertip
 *
 * Pure module: no React, no DOM, no Date.now().
 */

/** Drawn finger length, in viewBox units, for each finger state. */
export const FINGER_LENGTH = { e: 50, b: 29, c: 17, x: 10 };

/** The knuckle line in the 100 x 120 viewBox: every finger rectangle ends here. */
export const KNUCKLE_Y = 72;

/** Palm block of the schematic. */
export const PALM_SHAPE = { x: 24, y: 70, w: 48, h: 42, rx: 12 };

const FINGER_KEYS = ["index", "middle", "ring", "pinky"];
const FINGER_BASE_X = { index: 28, middle: 39, ring: 50, pinky: 61 };
const SPREAD_OFFSET = { index: -4, middle: -1, ring: 2, pinky: 5 };
const FINGER_WIDTH = 10;

const THUMB_SHAPE = {
  s: { x: 14, y: 50, w: 9, h: 28, rx: 4, rotate: 0 },
  o: { x: 0, y: 66, w: 28, h: 9, rx: 4, rotate: 0 },
  a: { x: 26, y: 74, w: 42, h: 9, rx: 4, rotate: 0 },
  t: { x: 32, y: 80, w: 26, h: 8, rx: 4, rotate: 0 },
  b: { x: 34, y: 60, w: 9, h: 20, rx: 4, rotate: 0 },
  r: { x: 16, y: 54, w: 10, h: 22, rx: 5, rotate: 22 },
};

/** Shape families used to group the poster and to explain look-alikes. */
export const SHAPE_GROUPS = {
  fist: "Fist shapes",
  fingers: "Extended-finger shapes",
  round: "Curved and round shapes",
  moving: "Shapes that move",
};

/** The 26 ASL manual alphabet letters. */
export const ASL_LETTERS = [
  { char: "A", fingers: "xxxx", thumb: "s", group: "fist", label: "Fist, thumb up the side", description: "Closed fist with the thumb resting straight up alongside the index finger, not tucked in.", confusedWith: ["S", "T"] },
  { char: "B", fingers: "eeee", thumb: "a", group: "fingers", label: "Flat hand, thumb across", description: "Four fingers straight up and held together, thumb folded flat across the palm.", confusedWith: ["4"] },
  { char: "C", fingers: "bbbb", thumb: "o", group: "round", label: "Open C curve", description: "The whole hand curves into the shape of a letter C with a clear gap between fingers and thumb.", confusedWith: ["O"] },
  { char: "D", fingers: "eccc", thumb: "r", group: "fingers", label: "Index up, others meet thumb", description: "Index finger straight up while the other three curl down to touch the thumb in a small circle.", confusedWith: ["1", "F"] },
  { char: "E", fingers: "cccc", thumb: "t", group: "round", label: "Curled tips on thumb", description: "All four fingertips curl down onto the thumb, which is tucked in beneath them.", confusedWith: ["S", "O"] },
  { char: "F", fingers: "ceee", thumb: "r", group: "round", label: "Thumb-and-index circle", description: "Thumb and index fingertip touch to form a circle; middle, ring and little finger stay straight up.", confusedWith: ["9"] },
  { char: "G", fingers: "exxx", thumb: "s", group: "fingers", label: "Index and thumb parallel", description: "Index finger and thumb held parallel and pointing sideways, the rest of the hand closed.", confusedWith: ["Q"] },
  { char: "H", fingers: "eexx", thumb: "a", group: "fingers", label: "Two fingers sideways", description: "Index and middle finger together, pointing sideways rather than up.", confusedWith: ["U", "R"] },
  { char: "I", fingers: "xxxe", thumb: "a", group: "fist", label: "Little finger up", description: "Little finger straight up from a closed fist, thumb across the folded fingers.", confusedWith: ["J", "Y"] },
  { char: "J", fingers: "xxxe", thumb: "a", group: "moving", label: "I, then trace a J", motion: "Trace the hook of a J downward and around with the little finger.", description: "Start in the I shape, then draw the curve of a J in the air with the little finger.", confusedWith: ["I"] },
  { char: "K", fingers: "eexx", thumb: "b", spread: true, group: "fingers", label: "V with thumb between", description: "Index and middle finger up in a V with the thumb pressed between them at the base.", confusedWith: ["P", "V"] },
  { char: "L", fingers: "exxx", thumb: "o", group: "fingers", label: "Right-angled L", description: "Index finger straight up and thumb straight out to the side, forming a right angle.", confusedWith: ["Q"] },
  { char: "M", fingers: "bbbx", thumb: "t", group: "fist", label: "Three fingers over thumb", description: "Thumb tucked under three folded fingers — index, middle and ring lie over it.", confusedWith: ["N", "T"] },
  { char: "N", fingers: "bbxx", thumb: "t", group: "fist", label: "Two fingers over thumb", description: "Thumb tucked under two folded fingers — index and middle lie over it.", confusedWith: ["M", "T"] },
  { char: "O", fingers: "cccc", thumb: "r", group: "round", label: "Closed O ring", description: "Fingers and thumb curve until the tips meet, leaving a clear round hole.", confusedWith: ["C", "0"] },
  { char: "P", fingers: "eexx", thumb: "b", spread: true, group: "fingers", label: "K pointed down", description: "The K handshape rotated so the fingers point downward and the palm faces down.", confusedWith: ["K"] },
  { char: "Q", fingers: "exxx", thumb: "o", group: "fingers", label: "G pointed down", description: "The G handshape rotated so index finger and thumb point downward.", confusedWith: ["G", "L"] },
  { char: "R", fingers: "eexx", thumb: "a", group: "fingers", label: "Crossed fingers", description: "Index and middle finger crossed over one another and held up.", confusedWith: ["U", "V", "H"] },
  { char: "S", fingers: "xxxx", thumb: "a", group: "fist", label: "Fist, thumb across front", description: "Closed fist with the thumb wrapped across the front of the folded fingers.", confusedWith: ["A", "T", "E"] },
  { char: "T", fingers: "bxxx", thumb: "b", group: "fist", label: "One finger over thumb", description: "Fist with the thumb poking up between the index and middle finger.", confusedWith: ["A", "M", "N"] },
  { char: "U", fingers: "eexx", thumb: "a", group: "fingers", label: "Two fingers together, up", description: "Index and middle finger straight up and held tightly together.", confusedWith: ["V", "R", "H"] },
  { char: "V", fingers: "eexx", thumb: "a", spread: true, group: "fingers", label: "Two fingers apart, up", description: "Index and middle finger straight up and spread apart. The gap is the only difference from U.", confusedWith: ["U", "R", "2"] },
  { char: "W", fingers: "eeex", thumb: "a", spread: true, group: "fingers", label: "Three fingers spread", description: "Index, middle and ring finger up and spread, with the thumb holding the little finger down.", confusedWith: ["6"] },
  { char: "X", fingers: "cxxx", thumb: "a", group: "fist", label: "Hooked index", description: "Index finger bent into a hook from a closed fist, like a crooked beckoning finger.", confusedWith: [] },
  { char: "Y", fingers: "xxxe", thumb: "o", group: "fist", label: "Thumb and little finger out", description: "Thumb and little finger extended in opposite directions, the three middle fingers folded down.", confusedWith: ["I"] },
  { char: "Z", fingers: "exxx", thumb: "a", group: "moving", label: "Index draws a Z", motion: "Draw a Z in the air: across, diagonally down, then across again.", description: "Index finger extended and used to trace the three strokes of a Z.", confusedWith: ["1"] },
];

/**
 * ASL number handshapes 0-9.
 * 6, 7, 8 and 9 follow one pattern: little, ring, middle and index finger in turn
 * touches the thumb while the remaining fingers stay up.
 */
export const ASL_NUMBERS = [
  { char: "0", fingers: "cccc", thumb: "r", group: "round", label: "O ring", description: "Fingers and thumb form a closed round shape — the same handshape as the letter O.", confusedWith: ["O"] },
  { char: "1", fingers: "exxx", thumb: "a", group: "fingers", label: "Index up", description: "Index finger straight up from a closed fist.", confusedWith: ["D", "Z"] },
  { char: "2", fingers: "eexx", thumb: "a", spread: true, group: "fingers", label: "V shape", description: "Index and middle finger up and spread — the same handshape as the letter V.", confusedWith: ["V"] },
  { char: "3", fingers: "eexx", thumb: "o", group: "fingers", label: "Thumb, index, middle", description: "Thumb, index and middle finger extended; ring and little finger folded down.", confusedWith: ["6"] },
  { char: "4", fingers: "eeee", thumb: "a", spread: true, group: "fingers", label: "Four fingers up", description: "Four fingers up and slightly spread with the thumb across the palm.", confusedWith: ["B"] },
  { char: "5", fingers: "eeee", thumb: "o", spread: true, group: "fingers", label: "Open hand", description: "All five digits extended and spread wide.", confusedWith: ["4"] },
  { char: "6", fingers: "eeec", thumb: "r", group: "round", label: "Little finger to thumb", description: "Little finger touches the thumb while index, middle and ring stay up.", confusedWith: ["W"] },
  { char: "7", fingers: "eece", thumb: "r", group: "round", label: "Ring finger to thumb", description: "Ring finger touches the thumb while the others stay up.", confusedWith: ["8"] },
  { char: "8", fingers: "ecee", thumb: "r", group: "round", label: "Middle finger to thumb", description: "Middle finger touches the thumb while the others stay up.", confusedWith: ["7"] },
  { char: "9", fingers: "ceee", thumb: "r", group: "round", label: "Index finger to thumb", description: "Index finger touches the thumb — the same handshape as the letter F.", confusedWith: ["F"] },
];

/** Poster content sets. */
export const POSTER_SETS = [
  { id: "letters", label: "Letters A-Z", count: 26 },
  { id: "numbers", label: "Numbers 0-9", count: 10 },
  { id: "letters-numbers", label: "Letters and numbers", count: 36 },
];

/** Column choices that stay legible on A4 or Letter paper. */
export const COLUMN_CHOICES = [3, 4, 5, 6];

/**
 * Rows that fit on one printed portrait page at each column count, with and
 * without description text under each cell. These are print-layout estimates for
 * A4/Letter at default margins, not exact page maths.
 */
const ROWS_PER_PAGE = {
  3: { plain: 5, described: 4 },
  4: { plain: 6, described: 5 },
  5: { plain: 7, described: 5 },
  6: { plain: 8, described: 6 },
};

/** Decode one handshape code into drawable rectangles. */
export function handGeometry(entry) {
  if (!entry || typeof entry.fingers !== "string" || entry.fingers.length !== 4) {
    return { error: "That handshape code could not be read." };
  }
  const fingers = FINGER_KEYS.map((key, position) => {
    const state = entry.fingers[position];
    const height = FINGER_LENGTH[state] ?? FINGER_LENGTH.x;
    const offset = entry.spread && state === "e" ? SPREAD_OFFSET[key] : 0;
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
  const thumbShape = THUMB_SHAPE[entry.thumb] ?? THUMB_SHAPE.s;
  return {
    char: entry.char,
    palm: PALM_SHAPE,
    fingers,
    thumb: {
      ...thumbShape,
      originX: thumbShape.x + thumbShape.w / 2,
      originY: thumbShape.y + thumbShape.h / 2,
    },
  };
}

function cellsForSet(setId) {
  if (setId === "letters") return ASL_LETTERS;
  if (setId === "numbers") return ASL_NUMBERS;
  if (setId === "letters-numbers") return ASL_LETTERS.concat(ASL_NUMBERS);
  return null;
}

/**
 * Estimate how many printed pages the poster needs.
 * Guards a zero or negative column count instead of dividing by zero.
 */
export function estimateSheets({ count = 0, columns = 4, described = false } = {}) {
  const total = Number(count);
  const cols = Number(columns);
  if (!Number.isFinite(total) || total < 0) return { error: "Cell count must be zero or more." };
  if (!Number.isFinite(cols) || cols < 1) return { error: "A poster needs at least one column." };
  const table = ROWS_PER_PAGE[cols] ?? ROWS_PER_PAGE[4];
  const rowsPerPage = described ? table.described : table.plain;
  const rows = Math.ceil(total / cols);
  return {
    rows,
    rowsPerPage,
    pages: total === 0 ? 0 : Math.ceil(rows / rowsPerPage),
  };
}

/** Build the poster: cells, layout numbers and a look-alike summary. */
export function buildPoster({
  setId = "letters",
  columns = 4,
  described = true,
  quizMode = false,
} = {}) {
  const source = cellsForSet(setId);
  if (!source) return { error: "Choose one of the listed poster sets." };

  const cols = Number(columns);
  if (!Number.isFinite(cols) || cols < 1) {
    return { error: "A poster needs at least one column." };
  }
  if (!COLUMN_CHOICES.includes(cols)) {
    return { error: `Pick a column count from ${COLUMN_CHOICES.join(", ")} so the cells stay legible in print.` };
  }

  const cells = source.map((entry) => ({
    char: entry.char,
    label: entry.label,
    description: entry.description,
    motion: entry.motion || null,
    group: entry.group,
    groupLabel: SHAPE_GROUPS[entry.group],
    confusedWith: entry.confusedWith || [],
    geometry: handGeometry(entry),
    hideLabel: Boolean(quizMode),
  }));

  const layout = estimateSheets({ count: cells.length, columns: cols, described });

  const lookAlikes = [];
  const seen = new Set();
  cells.forEach((cell) => {
    cell.confusedWith.forEach((other) => {
      const key = [cell.char, other].sort().join("-");
      if (seen.has(key)) return;
      seen.add(key);
      lookAlikes.push({ pair: `${cell.char} / ${other}`, note: cell.description });
    });
  });

  const groupCounts = Object.keys(SHAPE_GROUPS).map((id) => ({
    id,
    label: SHAPE_GROUPS[id],
    count: cells.filter((cell) => cell.group === id).length,
  })).filter((entry) => entry.count > 0);

  return {
    setId,
    columns: cols,
    described,
    quizMode: Boolean(quizMode),
    cells,
    count: cells.length,
    rows: layout.rows,
    pages: layout.pages,
    movingCount: cells.filter((cell) => cell.motion).length,
    lookAlikeCount: lookAlikes.length,
    lookAlikes,
    groupCounts,
  };
}

/** Plain-text version of the poster, for a handout or lesson plan. */
export function describePoster(poster) {
  if (!poster || poster.error || !Array.isArray(poster.cells)) return "";
  const header = `ASL manual alphabet poster — ${poster.count} handshapes, ${poster.columns} columns`;
  const lines = poster.cells.map((cell) => `${cell.char}: ${cell.label}. ${cell.description}`);
  return [header, "", ...lines].join("\n");
}
