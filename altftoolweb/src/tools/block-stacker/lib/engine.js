// Pure game logic for Block Stacker. No browser APIs — safe to import anywhere.

export const COLS = 10;
export const ROWS = 20;

export const PIECE_TYPES = ["I", "O", "T", "S", "Z", "J", "L"];

// Fixed vivid palette — game art inside the play area (allowed by design rules).
export const PIECE_COLORS = {
  I: "#22d3ee",
  O: "#facc15",
  T: "#a78bfa",
  S: "#34d399",
  Z: "#fb7185",
  J: "#60a5fa",
  L: "#fb923c",
};

const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

// Points for clearing 1 / 2 / 3 / 4 lines at once (multiplied by level).
export const LINE_SCORES = [0, 100, 300, 500, 800];

// Simple wall-kick offsets tried in order when a rotation collides.
const KICKS = [
  [0, 0],
  [-1, 0],
  [1, 0],
  [-2, 0],
  [2, 0],
  [0, -1],
  [-1, -1],
  [1, -1],
];

export function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export function getShape(type) {
  return SHAPES[type];
}

export function shuffleBag(rng = Math.random) {
  const bag = [...PIECE_TYPES];
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

export function spawnPiece(type) {
  const matrix = SHAPES[type].map((row) => [...row]);
  return {
    type,
    matrix,
    x: Math.floor((COLS - matrix[0].length) / 2),
    y: type === "I" ? -1 : 0,
  };
}

export function rotateMatrix(matrix, dir = 1) {
  const n = matrix.length;
  const out = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      if (dir === 1) out[c][n - 1 - r] = matrix[r][c];
      else out[n - 1 - c][r] = matrix[r][c];
    }
  }
  return out;
}

export function collides(board, matrix, px, py) {
  for (let r = 0; r < matrix.length; r += 1) {
    for (let c = 0; c < matrix[r].length; c += 1) {
      if (!matrix[r][c]) continue;
      const x = px + c;
      const y = py + r;
      if (x < 0 || x >= COLS || y >= ROWS) return true;
      if (y >= 0 && board[y][x]) return true;
    }
  }
  return false;
}

/** Rotate with simple wall kicks. Returns the rotated piece or null if blocked. */
export function tryRotate(board, piece, dir = 1) {
  if (piece.type === "O") return null;
  const matrix = rotateMatrix(piece.matrix, dir);
  for (const [dx, dy] of KICKS) {
    if (!collides(board, matrix, piece.x + dx, piece.y + dy)) {
      return { ...piece, matrix, x: piece.x + dx, y: piece.y + dy };
    }
  }
  return null;
}

/** Lowest y the piece can occupy from its current position (ghost row). */
export function getDropY(board, piece) {
  let y = piece.y;
  while (!collides(board, piece.matrix, piece.x, y + 1)) y += 1;
  return y;
}

/** Merge the piece into a copied board. toppedOut = a filled cell landed above row 0. */
export function lockPiece(board, piece) {
  const next = board.map((row) => [...row]);
  let toppedOut = false;
  const { matrix, x, y, type } = piece;
  for (let r = 0; r < matrix.length; r += 1) {
    for (let c = 0; c < matrix[r].length; c += 1) {
      if (!matrix[r][c]) continue;
      const bx = x + c;
      const by = y + r;
      if (by < 0) {
        toppedOut = true;
        continue;
      }
      if (by < ROWS && bx >= 0 && bx < COLS) next[by][bx] = type;
    }
  }
  return { board: next, toppedOut };
}

export function findFullRows(board) {
  const rows = [];
  for (let r = 0; r < ROWS; r += 1) {
    if (board[r].every((cell) => cell !== null)) rows.push(r);
  }
  return rows;
}

export function clearRows(board, rows) {
  const remove = new Set(rows);
  const kept = board.filter((_, i) => !remove.has(i));
  while (kept.length < ROWS) kept.unshift(Array(COLS).fill(null));
  return kept;
}

export function levelForLines(lines) {
  return Math.floor(lines / 10) + 1;
}

/** Gravity interval in ms — speeds up each level, floored so play stays possible. */
export function dropIntervalMs(level) {
  return Math.max(70, Math.round(900 * Math.pow(0.82, level - 1)));
}
