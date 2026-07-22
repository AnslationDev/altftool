export const SIZES = [5, 10, 15];

export const DIFFICULTIES = [
  { id: "easy", label: "Easy", density: 0.66 },
  { id: "medium", label: "Medium", density: 0.55 },
  { id: "hard", label: "Hard", density: 0.44 },
];

export const EMPTY = 0;
export const FILLED = 1;
export const MARKED = 2;

export function createEmptyGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(EMPTY));
}

/**
 * Random target picture at the requested density. Rejects degenerate boards
 * (too sparse or fully filled) and falls back to a deterministic pattern so
 * the function always terminates with a usable puzzle.
 */
export function generateTarget(size, density) {
  const total = size * size;
  const minFilled = Math.max(size, Math.floor(total * 0.3));
  const maxFilled = total - size;

  for (let attempt = 0; attempt < 32; attempt++) {
    const grid = [];
    let filled = 0;
    for (let r = 0; r < size; r++) {
      const row = [];
      for (let c = 0; c < size; c++) {
        const value = Math.random() < density ? 1 : 0;
        row.push(value);
        filled += value;
      }
      grid.push(row);
    }
    if (filled >= minFilled && filled <= maxFilled) return grid;
  }

  const fallback = createEmptyGrid(size);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r + c) % 3 !== 0) fallback[r][c] = 1;
    }
  }
  return fallback;
}

/** Lengths of consecutive runs of value 1 in a line. Empty line -> []. */
export function lineRuns(line) {
  const runs = [];
  let count = 0;
  for (const value of line) {
    if (value === FILLED) {
      count += 1;
    } else if (count > 0) {
      runs.push(count);
      count = 0;
    }
  }
  if (count > 0) runs.push(count);
  return runs;
}

export function getColumn(grid, c) {
  return grid.map((row) => row[c]);
}

export function computeClues(target) {
  const size = target.length;
  const rows = target.map((row) => lineRuns(row));
  const cols = [];
  for (let c = 0; c < size; c++) {
    cols.push(lineRuns(getColumn(target, c)));
  }
  return { rows, cols };
}

export function runsEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
