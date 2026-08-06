/**
 * Text to ASCII art — renders a line of text as large banner letters.
 *
 * The renderer works from a hand-drawn 5 x 7 bitmap font (the same proportions
 * as the classic Hitachi HD44780 character LCD glyph cell, which is why 5 x 7
 * letters stay readable at this size). Every glyph is stored as seven strings
 * of five characters: "#" for an inked pixel and "." for an empty one.
 *
 * Because the font is a bitmap rather than a fixed set of pre-drawn banners,
 * one glyph set produces every style: change the ink character for a different
 * texture, keep only the boundary pixels for an outline, or overlay an offset
 * copy for a drop shadow.
 */

/** Glyph cell size. Every character occupies exactly this box. */
export const GLYPH_WIDTH = 5;
export const GLYPH_HEIGHT = 7;

const BLANK = ["", "", "", "", "", "", ""].map(() => ".....");

/** 5 x 7 bitmap font. Keys are upper-case; lower-case input is upper-cased. */
export const FONT = {
  " ": BLANK,
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".###."],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  J: ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#...#", "#...#", "#...#", "#...#"],
  N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#...#", "#.#.#", "##.##", "#...#"],
  X: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  0: [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  1: ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  2: [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  3: ["#####", "...#.", "..#..", "...#.", "....#", "#...#", ".###."],
  4: ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  5: ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  6: ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."],
  7: ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  8: [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  9: [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
  ".": [".....", ".....", ".....", ".....", ".....", ".##..", ".##.."],
  ",": [".....", ".....", ".....", ".....", ".##..", ".##..", ".#..."],
  "!": ["..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."],
  "?": [".###.", "#...#", "....#", "...#.", "..#..", ".....", "..#.."],
  "'": ["..#..", "..#..", ".....", ".....", ".....", ".....", "....."],
  '"': [".#.#.", ".#.#.", ".....", ".....", ".....", ".....", "....."],
  "-": [".....", ".....", ".....", "#####", ".....", ".....", "....."],
  "+": [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
  "=": [".....", ".....", "#####", ".....", "#####", ".....", "....."],
  ":": [".....", ".##..", ".##..", ".....", ".##..", ".##..", "....."],
  ";": [".....", ".##..", ".##..", ".....", ".##..", ".##..", ".#..."],
  "/": ["....#", "...#.", "...#.", "..#..", ".#...", ".#...", "#...."],
  "\\": ["#....", ".#...", ".#...", "..#..", "...#.", "...#.", "....#"],
  "(": ["...#.", "..#..", ".#...", ".#...", ".#...", "..#..", "...#."],
  ")": [".#...", "..#..", "...#.", "...#.", "...#.", "..#..", ".#..."],
  "[": ["..###", "..#..", "..#..", "..#..", "..#..", "..#..", "..###"],
  "]": ["###..", "..#..", "..#..", "..#..", "..#..", "..#..", "###.."],
  "<": ["...#.", "..#..", ".#...", "#....", ".#...", "..#..", "...#."],
  ">": [".#...", "..#..", "...#.", "....#", "...#.", "..#..", ".#..."],
  "#": [".#.#.", ".#.#.", "#####", ".#.#.", "#####", ".#.#.", ".#.#."],
  $: ["..#..", ".####", "#.#..", ".###.", "..#.#", "####.", "..#.."],
  "%": ["##..#", "##..#", "...#.", "..#..", ".#...", "#..##", "#..##"],
  "&": [".##..", "#..#.", "#..#.", ".##..", "#.#.#", "#..#.", ".##.#"],
  "@": [".###.", "#...#", "#.###", "#.#.#", "#.###", "#....", ".###."],
  "*": [".....", "#.#.#", ".###.", "#####", ".###.", "#.#.#", "....."],
  _: [".....", ".....", ".....", ".....", ".....", ".....", "#####"],
};

/** Ink textures the user can pick. */
export const INK_STYLES = [
  { value: "hash", label: "Hash  #", char: "#" },
  { value: "block", label: "Solid block  █", char: "█" },
  { value: "shade", label: "Medium shade  ▓", char: "▓" },
  { value: "star", label: "Star  *", char: "*" },
  { value: "at", label: "At  @", char: "@" },
  { value: "dollar", label: "Dollar  $", char: "$" },
  { value: "o", label: "Letter  O", char: "O" },
  { value: "custom", label: "Custom character", char: null },
];

export const RENDER_STYLES = [
  { value: "solid", label: "Solid" },
  { value: "outline", label: "Outline" },
  { value: "shadow", label: "Drop shadow" },
];

/** Guard rails so the output stays something a browser can render. */
export const MAX_INPUT_CHARS = 200;
export const MAX_LINE_WIDTH = 400;

/** Characters this font knows about. */
export function supportedCharacters() {
  return Object.keys(FONT).filter((k) => k !== " ");
}

const isFilled = (glyph, x, y) =>
  y >= 0 && y < GLYPH_HEIGHT && x >= 0 && x < GLYPH_WIDTH && glyph[y][x] === "#";

/**
 * Keep only the boundary pixels of a glyph: a pixel stays if it is inked and at
 * least one of its four neighbours is not.
 */
export function outlineGlyph(glyph) {
  const out = [];
  for (let y = 0; y < GLYPH_HEIGHT; y += 1) {
    let row = "";
    for (let x = 0; x < GLYPH_WIDTH; x += 1) {
      if (!isFilled(glyph, x, y)) {
        row += ".";
        continue;
      }
      const surrounded =
        isFilled(glyph, x - 1, y) &&
        isFilled(glyph, x + 1, y) &&
        isFilled(glyph, x, y - 1) &&
        isFilled(glyph, x, y + 1);
      row += surrounded ? "." : "#";
    }
    out.push(row);
  }
  return out;
}

/** Split a string into lines that fit `maxChars` glyph columns, breaking on spaces. */
export function wrapText(text, maxChars) {
  const limit = Number.isFinite(maxChars) && maxChars >= 1 ? Math.floor(maxChars) : 1;
  const lines = [];
  for (const paragraph of String(text).split("\n")) {
    if (paragraph.trim() === "") {
      lines.push("");
      continue;
    }
    let current = "";
    for (const word of paragraph.split(/\s+/)) {
      if (word === "") continue;
      if (current === "") {
        current = word;
      } else if (current.length + 1 + word.length <= limit) {
        current += ` ${word}`;
      } else {
        lines.push(current);
        current = word;
      }
      // A single word longer than the limit is hard-split.
      while (current.length > limit) {
        lines.push(current.slice(0, limit));
        current = current.slice(limit);
      }
    }
    if (current !== "") lines.push(current);
  }
  return lines.length > 0 ? lines : [""];
}

/** Render one line of text into an array of GLYPH_HEIGHT bitmap rows. */
function renderLineBitmap(line, letterSpacing, style) {
  const rows = Array.from({ length: GLYPH_HEIGHT }, () => "");
  const gap = ".".repeat(letterSpacing);
  const chars = [...line.toUpperCase()];
  const unsupported = new Set();

  chars.forEach((ch, index) => {
    let glyph = FONT[ch];
    if (!glyph) {
      unsupported.add(ch);
      glyph = FONT["?"];
    }
    if (style === "outline") glyph = outlineGlyph(glyph);
    for (let y = 0; y < GLYPH_HEIGHT; y += 1) {
      rows[y] += glyph[y];
      if (index < chars.length - 1) rows[y] += gap;
    }
  });

  return { rows, unsupported: [...unsupported] };
}

/** Overlay a copy of the bitmap shifted one cell down-right, marked as shadow. */
function addShadow(rows) {
  const width = rows[0] ? rows[0].length : 0;
  const height = rows.length;
  const grid = Array.from({ length: height + 1 }, () =>
    Array.from({ length: width + 1 }, () => "."),
  );
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (rows[y][x] === "#") grid[y + 1][x + 1] = "s";
    }
  }
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (rows[y][x] === "#") grid[y][x] = "#";
    }
  }
  return grid.map((row) => row.join(""));
}

/**
 * Turn text into ASCII banner art.
 *
 * @param {object} input
 * @param {string} input.text           Text to render.
 * @param {string} input.inkChar        Character used for an inked pixel.
 * @param {string} input.blankChar      Character used for an empty pixel.
 * @param {string} input.shadowChar     Character used for the drop shadow.
 * @param {number} input.letterSpacing  Blank columns between letters (0-4).
 * @param {number} input.lineSpacing    Blank rows between banner lines (0-3).
 * @param {number} input.maxCharsPerLine Wrap the text at this many characters.
 * @param {string} input.style          "solid", "outline" or "shadow".
 * @param {boolean} input.trimRight     Strip trailing blank cells from each row.
 */
export function textToAsciiArt({
  text = "",
  inkChar = "#",
  blankChar = " ",
  shadowChar = ".",
  letterSpacing = 1,
  lineSpacing = 1,
  maxCharsPerLine = 12,
  style = "solid",
  trimRight = true,
} = {}) {
  const source = String(text ?? "");
  if (source.trim() === "") return { error: "Type some text to turn into ASCII art." };
  if (source.length > MAX_INPUT_CHARS) {
    return { error: `Keep it under ${MAX_INPUT_CHARS} characters — that was ${source.length}.` };
  }

  const ink = String(inkChar ?? "#").slice(0, 1) || "#";
  const blank = String(blankChar ?? " ").slice(0, 1) || " ";
  const shadow = String(shadowChar ?? ".").slice(0, 1) || ".";

  if (ink === blank) {
    return {
      error: "Ink and background characters must be different, or the art will be invisible.",
    };
  }

  const spacing = Number.isFinite(letterSpacing)
    ? Math.min(4, Math.max(0, Math.floor(letterSpacing)))
    : 1;
  const lineGap = Number.isFinite(lineSpacing)
    ? Math.min(3, Math.max(0, Math.floor(lineSpacing)))
    : 1;

  const perLine = Number.isFinite(maxCharsPerLine)
    ? Math.min(60, Math.max(1, Math.floor(maxCharsPerLine)))
    : 12;

  const projectedWidth = perLine * (GLYPH_WIDTH + spacing);
  if (projectedWidth > MAX_LINE_WIDTH) {
    return {
      error: `${perLine} characters per line would be ${projectedWidth} columns wide — reduce the wrap width or the letter spacing.`,
    };
  }

  const textLines = wrapText(source, perLine);
  const unsupported = new Set();
  const blocks = [];

  for (const line of textLines) {
    if (line === "") {
      blocks.push(Array.from({ length: GLYPH_HEIGHT }, () => ""));
      continue;
    }
    const rendered = renderLineBitmap(line, spacing, style);
    rendered.unsupported.forEach((c) => unsupported.add(c));
    blocks.push(style === "shadow" ? addShadow(rendered.rows) : rendered.rows);
  }

  const bitmapRows = [];
  blocks.forEach((block, i) => {
    block.forEach((row) => bitmapRows.push(row));
    if (i < blocks.length - 1) {
      for (let g = 0; g < lineGap; g += 1) bitmapRows.push("");
    }
  });

  const rawWidth = bitmapRows.reduce((max, row) => Math.max(max, row.length), 0);

  const artLines = bitmapRows.map((row) => {
    const padded = row.padEnd(rawWidth, ".");
    let out = "";
    for (const cell of padded) {
      out += cell === "#" ? ink : cell === "s" ? shadow : blank;
    }
    return trimRight ? out.replace(/\s+$/, "") : out;
  });

  // Computed from the trimmed lines so it matches what's actually shown/copied,
  // not the pre-trim bitmap width (narrow glyphs can leave a blank rightmost
  // column that trimRight strips away).
  const width = artLines.reduce((max, line) => Math.max(max, line.length), 0);

  return {
    art: artLines.join("\n"),
    lines: artLines,
    width,
    height: artLines.length,
    textLines,
    characters: source.length,
    unsupported: [...unsupported],
    glyphSize: `${GLYPH_WIDTH} × ${GLYPH_HEIGHT}`,
  };
}
