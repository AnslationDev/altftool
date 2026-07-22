// Pure puzzle logic: grid generation and straight-line path helpers.
// No browser APIs — everything here is safe to run anywhere.

const DIRECTIONS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const PLACEMENT_ATTEMPTS = 220;

export function keyOf(r, c) {
  return `${r}-${c}`;
}

function randomInt(maxExclusive) {
  return Math.floor(Math.random() * maxExclusive);
}

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Try random spots/directions for one word; overlaps on matching letters are allowed. */
function tryPlaceWord(grid, word, size) {
  const span = word.length - 1;
  for (let attempt = 0; attempt < PLACEMENT_ATTEMPTS; attempt += 1) {
    const [dr, dc] = DIRECTIONS[randomInt(DIRECTIONS.length)];
    const rowMin = dr === -1 ? span : 0;
    const rowMax = dr === 1 ? size - 1 - span : size - 1;
    const colMin = dc === -1 ? span : 0;
    const colMax = dc === 1 ? size - 1 - span : size - 1;
    if (rowMax < rowMin || colMax < colMin) return null;

    const r0 = rowMin + randomInt(rowMax - rowMin + 1);
    const c0 = colMin + randomInt(colMax - colMin + 1);
    const cells = [];
    let fits = true;
    for (let i = 0; i < word.length; i += 1) {
      const r = r0 + dr * i;
      const c = c0 + dc * i;
      const existing = grid[r][c];
      if (existing && existing !== word[i]) {
        fits = false;
        break;
      }
      cells.push({ r, c });
    }
    if (fits) return cells;
  }
  return null;
}

/**
 * Build a puzzle: place up to `wordCount` theme words on a size x size grid in
 * any of 8 directions, then fill the gaps with random letters (biased toward
 * letters used by the hidden words so matches are not obvious).
 * Returns { grid: string[][], words: [{ word, cells }] }.
 */
export function generatePuzzle(pool, size, wordCount) {
  const grid = Array.from({ length: size }, () => Array(size).fill(""));
  const candidates = shuffle(pool.filter((w) => w.length >= 3 && w.length <= size));
  const placed = [];

  for (const word of candidates) {
    if (placed.length >= wordCount) break;
    const cells = tryPlaceWord(grid, word, size);
    if (!cells) continue;
    cells.forEach(({ r, c }, i) => {
      grid[r][c] = word[i];
    });
    placed.push({ word, cells });
  }

  const bias = placed.map((entry) => entry.word).join("") || ALPHABET;
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!grid[r][c]) {
        grid[r][c] =
          Math.random() < 0.35 ? bias[randomInt(bias.length)] : ALPHABET[randomInt(ALPHABET.length)];
      }
    }
  }

  placed.sort((a, b) => a.word.localeCompare(b.word));
  return { grid, words: placed };
}

/**
 * Straight-line path from `start` toward `end`, snapped to the nearest of the
 * 8 compass directions. Used for live drag highlighting. Cells that would fall
 * off the board are clipped.
 */
export function snappedPath(start, end, size) {
  const dr = end.r - start.r;
  const dc = end.c - start.c;
  const len = Math.max(Math.abs(dr), Math.abs(dc));
  if (len === 0) return [{ ...start }];

  const stepR = Math.max(-1, Math.min(1, Math.round(dr / len)));
  const stepC = Math.max(-1, Math.min(1, Math.round(dc / len)));
  const cells = [];
  for (let i = 0; i <= len; i += 1) {
    const r = start.r + stepR * i;
    const c = start.c + stepC * i;
    if (r < 0 || c < 0 || r >= size || c >= size) break;
    cells.push({ r, c });
  }
  return cells;
}

/**
 * Exact straight line between two cells for keyboard selection, or null when
 * the cells are not on the same row, column, or 45-degree diagonal.
 */
export function alignedPath(start, end, size) {
  const dr = end.r - start.r;
  const dc = end.c - start.c;
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
  return snappedPath(start, end, size);
}
