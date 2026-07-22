// Level layouts for the brick breaker game. Each builder returns a 2D array
// sized rows x COLS where 0 = empty and 1..3 = brick durability tier.
// Layouts are deterministic so the same level always looks the same.

export const COLS = 10;
export const MAX_TIER = 3;

function emptyGrid(rows) {
  return Array.from({ length: rows }, () => new Array(COLS).fill(0));
}

const builders = [
  // Level 1 — Warm-up wall: four solid rows with a tougher cap row.
  () => {
    const g = emptyGrid(4);
    for (let r = 0; r < 4; r += 1) {
      for (let c = 0; c < COLS; c += 1) g[r][c] = r === 0 ? 2 : 1;
    }
    return g;
  },
  // Level 2 — Checkerboard: five rows with alternating gaps.
  () => {
    const g = emptyGrid(5);
    for (let r = 0; r < 5; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        if ((r + c) % 2 === 0) g[r][c] = r < 2 ? 2 : 1;
      }
    }
    return g;
  },
  // Level 3 — Pyramid: six rows narrowing toward an armored peak.
  () => {
    const g = emptyGrid(6);
    for (let r = 0; r < 6; r += 1) {
      const inset = Math.max(0, 4 - r);
      for (let c = inset; c < COLS - inset; c += 1) {
        g[r][c] = r <= 1 ? 3 : r <= 3 ? 2 : 1;
      }
    }
    return g;
  },
  // Level 4 — Diagonal lanes: seven rows of slanted stripes with gaps.
  () => {
    const g = emptyGrid(7);
    for (let r = 0; r < 7; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        if ((r + c) % 3 === 2) continue;
        const base = (r + c) % 3 === 0 ? 2 : 1;
        g[r][c] = r < 2 ? Math.min(MAX_TIER, base + 1) : base;
      }
    }
    return g;
  },
  // Level 5 — Diamond: eight rows forming a gem with a hardened core.
  () => {
    const g = emptyGrid(8);
    for (let r = 0; r < 8; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const dist = Math.abs(r - 3.5) + Math.abs(c - 4.5);
        if (dist > 5) continue;
        g[r][c] = dist <= 2.5 ? 3 : dist <= 4 ? 2 : 1;
      }
    }
    return g;
  },
  // Level 6 — Fortress: eight rows of armored walls around a filled keep.
  () => {
    const g = emptyGrid(8);
    for (let r = 0; r < 8; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        if (r === 0 || r === 7 || c === 0 || c === COLS - 1) g[r][c] = 3;
        else if (r === 1 || r === 6 || c === 1 || c === COLS - 2) g[r][c] = 2;
        else if ((r + c) % 2 === 0) g[r][c] = 1;
      }
    }
    return g;
  },
];

export const LEVEL_COUNT = builders.length;

export function buildLevel(level) {
  const index = Math.min(Math.max(level, 1), LEVEL_COUNT) - 1;
  return builders[index]();
}
