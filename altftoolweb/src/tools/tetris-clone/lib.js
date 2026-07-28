/**
 * Tetris engine — pure game logic, no React and no DOM.
 *
 * Follows the Tetris Guideline behaviours that players expect:
 *  - a 10 x 20 visible matrix with two hidden rows above it for spawning;
 *  - SRS (Super Rotation System) piece shapes, spawn orientations and wall kicks;
 *  - a 7-bag randomiser, so each set of seven pieces contains one of each;
 *  - guideline line-clear scoring: 100 / 300 / 500 / 800 points times the level,
 *    1 point per cell soft-dropped and 2 points per cell hard-dropped;
 *  - one level per ten cleared lines, with the guideline gravity curve
 *    (0.8 - (level - 1) * 0.007) ^ (level - 1) seconds per row.
 *
 * Randomness is seeded and threaded through the state, so the same seed and the
 * same sequence of actions always produce the same game.
 */

export const COLS = 10;
/** Rows the player can see. */
export const VISIBLE_ROWS = 20;
/** Hidden rows above the playfield where pieces spawn. */
export const HIDDEN_ROWS = 2;
export const ROWS = VISIBLE_ROWS + HIDDEN_ROWS;

export const PIECE_TYPES = ["I", "J", "L", "O", "S", "T", "Z"];

/**
 * SRS shapes. Each piece has four rotation states; a state is a list of
 * [x, y] cells inside the piece's own bounding box, y growing downwards.
 */
export const SHAPES = {
  I: [
    [[0, 1], [1, 1], [2, 1], [3, 1]],
    [[2, 0], [2, 1], [2, 2], [2, 3]],
    [[0, 2], [1, 2], [2, 2], [3, 2]],
    [[1, 0], [1, 1], [1, 2], [1, 3]],
  ],
  J: [
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 2]],
    [[1, 0], [1, 1], [0, 2], [1, 2]],
  ],
  L: [
    [[2, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 1], [1, 1], [2, 1], [0, 2]],
    [[0, 0], [1, 0], [1, 1], [1, 2]],
  ],
  O: [
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [0, 1], [1, 1]],
  ],
  S: [
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[1, 0], [1, 1], [2, 1], [2, 2]],
    [[1, 1], [2, 1], [0, 2], [1, 2]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
  ],
  T: [
    [[1, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [1, 2]],
    [[1, 0], [0, 1], [1, 1], [1, 2]],
  ],
  Z: [
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[2, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [1, 2], [2, 2]],
    [[1, 0], [0, 1], [1, 1], [0, 2]],
  ],
};

/** Column where each piece's bounding box starts on spawn (guideline: columns 4-5 filled). */
export const SPAWN_X = { I: 3, J: 3, L: 3, O: 4, S: 3, T: 3, Z: 3 };

/**
 * SRS wall kicks, written with y growing downwards (the published tables use
 * y upwards, so every dy here is the negative of the published value).
 * Key is "<from><to>".
 */
export const KICKS_JLSTZ = {
  "01": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  "10": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  "12": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  "21": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  "23": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  "32": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "30": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "03": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
};

export const KICKS_I = {
  "01": [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  "10": [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  "12": [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
  "21": [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  "23": [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  "32": [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  "30": [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  "03": [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
};

/** Guideline line-clear scores, before multiplying by the level. */
export const LINE_SCORES = [0, 100, 300, 500, 800];
/** Points per cell for a soft drop and a hard drop (guideline). */
export const SOFT_DROP_POINT = 1;
export const HARD_DROP_POINT = 2;
/** Lines needed to advance one level. */
export const LINES_PER_LEVEL = 10;
/** Fastest gravity the loop will run, in milliseconds (one frame at 60 fps). */
export const MIN_GRAVITY_MS = 17;

/**
 * Guideline gravity: (0.8 - (level - 1) * 0.007) ^ (level - 1) seconds per row.
 * @param {number} level 1-based level.
 * @returns {number} milliseconds between automatic one-row drops.
 */
export function gravityMs(level) {
  const lvl = Number.isFinite(level) && level >= 1 ? Math.floor(level) : 1;
  const base = 0.8 - (lvl - 1) * 0.007;
  if (base <= 0) return MIN_GRAVITY_MS;
  const seconds = Math.pow(base, lvl - 1);
  return Math.max(MIN_GRAVITY_MS, Math.round(seconds * 1000));
}

/** Level from the number of lines cleared. */
export function levelFromLines(lines) {
  const n = Number.isFinite(lines) && lines > 0 ? Math.floor(lines) : 0;
  return Math.floor(n / LINES_PER_LEVEL) + 1;
}

/* ------------------------------------------------------------------ *
 * Seeded randomness (mulberry32) — kept pure by threading the state.  *
 * ------------------------------------------------------------------ */

/** @returns {{ value: number, state: number }} value in [0, 1). */
export function nextRandom(state) {
  let t = (state + 0x6d2b79f5) >>> 0;
  let x = t;
  x = Math.imul(x ^ (x >>> 15), x | 1);
  x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
  const value = ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  return { value, state: t };
}

/** Fisher-Yates shuffle of one 7-bag using the seeded generator. */
export function shuffleBag(rngState) {
  const bag = [...PIECE_TYPES];
  let state = rngState;
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const r = nextRandom(state);
    state = r.state;
    const j = Math.floor(r.value * (i + 1));
    const tmp = bag[i];
    bag[i] = bag[j];
    bag[j] = tmp;
  }
  return { bag, rngState: state };
}

/** Top up the preview queue so it always holds at least `min` pieces. */
export function fillQueue(queue, rngState, min = 5) {
  let next = [...queue];
  let state = rngState;
  while (next.length < min) {
    const drawn = shuffleBag(state);
    state = drawn.rngState;
    next = next.concat(drawn.bag);
  }
  return { queue: next, rngState: state };
}

/* ------------------------------------------------------------------ *
 * Board helpers                                                       *
 * ------------------------------------------------------------------ */

export function createBoard() {
  return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null));
}

/** Absolute cells occupied by a piece at a given position. */
export function pieceCells(type, rotation, x, y) {
  const states = SHAPES[type];
  if (!states) return [];
  return states[((rotation % 4) + 4) % 4].map(([cx, cy]) => [x + cx, y + cy]);
}

/** True when the piece fits: inside the walls, above the floor, on empty cells. */
export function canPlace(board, type, rotation, x, y) {
  for (const [cx, cy] of pieceCells(type, rotation, x, y)) {
    if (cx < 0 || cx >= COLS || cy >= ROWS) return false;
    if (cy < 0) continue; // above the matrix is allowed while spawning
    if (board[cy][cx] !== null) return false;
  }
  return true;
}

/** Lowest y the active piece can fall to without colliding. */
export function dropY(board, piece) {
  let y = piece.y;
  while (canPlace(board, piece.type, piece.rotation, piece.x, y + 1)) y += 1;
  return y;
}

/** Stamp a piece into a copy of the board. */
export function lockPiece(board, piece) {
  const next = board.map((row) => [...row]);
  for (const [cx, cy] of pieceCells(piece.type, piece.rotation, piece.x, piece.y)) {
    if (cy >= 0 && cy < ROWS && cx >= 0 && cx < COLS) next[cy][cx] = piece.type;
  }
  return next;
}

/** Remove full rows, pushing empty rows in at the top. */
export function clearLines(board) {
  const kept = board.filter((row) => row.some((cell) => cell === null));
  const cleared = ROWS - kept.length;
  const blanks = Array.from({ length: cleared }, () =>
    Array.from({ length: COLS }, () => null),
  );
  return { board: blanks.concat(kept), cleared };
}

/** Highest stack height in rows, useful as a difficulty readout. */
export function stackHeight(board) {
  for (let y = 0; y < ROWS; y += 1) {
    if (board[y].some((cell) => cell !== null)) return ROWS - y;
  }
  return 0;
}

/* ------------------------------------------------------------------ *
 * Game state                                                          *
 * ------------------------------------------------------------------ */

function spawn(state) {
  const filled = fillQueue(state.queue, state.rngState);
  const [type, ...rest] = filled.queue;
  const piece = { type, rotation: 0, x: SPAWN_X[type], y: 0 };
  const alive = canPlace(state.board, piece.type, piece.rotation, piece.x, piece.y);
  return {
    ...state,
    queue: rest,
    rngState: filled.rngState,
    active: piece,
    canHold: true,
    status: alive ? "running" : "over",
  };
}

/**
 * Fresh game.
 * @param {number} seed Any integer; the same seed replays the same piece order.
 * @param {number} startLevel 1-15, sets the opening gravity.
 */
export function createGame(seed = 1, startLevel = 1) {
  const safeSeed = Number.isFinite(seed) ? Math.floor(Math.abs(seed)) % 2147483647 : 1;
  const lvl = Number.isFinite(startLevel) ? Math.min(15, Math.max(1, Math.floor(startLevel))) : 1;
  const base = {
    board: createBoard(),
    queue: [],
    rngState: safeSeed,
    active: null,
    hold: null,
    canHold: true,
    score: 0,
    lines: 0,
    startLevel: lvl,
    level: lvl,
    status: "running",
    lastClear: 0,
    pieces: 0,
  };
  return spawn(base);
}

function afterLock(state) {
  const locked = lockPiece(state.board, state.active);
  const { board, cleared } = clearLines(locked);
  const lines = state.lines + cleared;
  const level = Math.max(state.startLevel, levelFromLines(lines));
  const score = state.score + LINE_SCORES[cleared] * state.level;
  const next = {
    ...state,
    board,
    lines,
    level,
    score,
    lastClear: cleared,
    pieces: state.pieces + 1,
    active: null,
  };
  return spawn(next);
}

/**
 * Apply one action to the game state. Pure: returns a new state object.
 *
 * Actions: "left", "right", "rotate-cw", "rotate-ccw", "soft-drop",
 *          "hard-drop", "hold", "gravity", "pause", "resume".
 */
export function step(state, action) {
  if (!state || !state.active) return state;
  if (action === "pause") {
    return state.status === "running" ? { ...state, status: "paused" } : state;
  }
  if (action === "resume") {
    return state.status === "paused" ? { ...state, status: "running" } : state;
  }
  if (state.status !== "running") return state;

  const p = state.active;

  if (action === "left" || action === "right") {
    const dx = action === "left" ? -1 : 1;
    if (canPlace(state.board, p.type, p.rotation, p.x + dx, p.y)) {
      return { ...state, active: { ...p, x: p.x + dx } };
    }
    return state;
  }

  if (action === "rotate-cw" || action === "rotate-ccw") {
    const from = p.rotation;
    const to = action === "rotate-cw" ? (from + 1) % 4 : (from + 3) % 4;
    if (p.type === "O") return state; // O never needs a kick and never changes shape
    const table = p.type === "I" ? KICKS_I : KICKS_JLSTZ;
    const kicks = table[`${from}${to}`] || [[0, 0]];
    for (const [dx, dy] of kicks) {
      if (canPlace(state.board, p.type, to, p.x + dx, p.y + dy)) {
        return { ...state, active: { ...p, rotation: to, x: p.x + dx, y: p.y + dy } };
      }
    }
    return state;
  }

  if (action === "gravity" || action === "soft-drop") {
    if (canPlace(state.board, p.type, p.rotation, p.x, p.y + 1)) {
      const gained = action === "soft-drop" ? SOFT_DROP_POINT : 0;
      return { ...state, active: { ...p, y: p.y + 1 }, score: state.score + gained };
    }
    return afterLock(state);
  }

  if (action === "hard-drop") {
    const target = dropY(state.board, p);
    const distance = target - p.y;
    const dropped = {
      ...state,
      active: { ...p, y: target },
      score: state.score + distance * HARD_DROP_POINT,
    };
    return afterLock(dropped);
  }

  if (action === "hold") {
    if (!state.canHold) return state;
    if (state.hold === null) {
      const filled = fillQueue(state.queue, state.rngState);
      const [type, ...rest] = filled.queue;
      const piece = { type, rotation: 0, x: SPAWN_X[type], y: 0 };
      const alive = canPlace(state.board, piece.type, piece.rotation, piece.x, piece.y);
      return {
        ...state,
        hold: p.type,
        queue: rest,
        rngState: filled.rngState,
        active: piece,
        canHold: false,
        status: alive ? "running" : "over",
      };
    }
    const swapped = { type: state.hold, rotation: 0, x: SPAWN_X[state.hold], y: 0 };
    const alive = canPlace(state.board, swapped.type, swapped.rotation, swapped.x, swapped.y);
    return {
      ...state,
      hold: p.type,
      active: swapped,
      canHold: false,
      status: alive ? "running" : "over",
    };
  }

  return state;
}

/**
 * Board ready to draw: the locked cells plus the ghost outline plus the active
 * piece, trimmed to the visible rows.
 * @returns {Array<Array<{type: string|null, ghost: boolean}>>}
 */
export function renderGrid(state) {
  const cells = state.board.map((row) => row.map((type) => ({ type, ghost: false })));
  const p = state.active;
  if (p) {
    const gy = dropY(state.board, p);
    for (const [cx, cy] of pieceCells(p.type, p.rotation, p.x, gy)) {
      if (cy >= 0 && cy < ROWS && cx >= 0 && cx < COLS && cells[cy][cx].type === null) {
        cells[cy][cx] = { type: p.type, ghost: true };
      }
    }
    for (const [cx, cy] of pieceCells(p.type, p.rotation, p.x, p.y)) {
      if (cy >= 0 && cy < ROWS && cx >= 0 && cx < COLS) {
        cells[cy][cx] = { type: p.type, ghost: false };
      }
    }
  }
  return cells.slice(HIDDEN_ROWS);
}

/**
 * A piece drawn centred on its own small grid, for the next/hold panels.
 * The shape is trimmed to its bounding box first so every preview sits in the
 * middle of the box instead of hugging the top-left corner.
 */
export function previewGrid(type, size = 4) {
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => null));
  if (!type || !SHAPES[type]) return grid;
  const cells = SHAPES[type][0];
  const xs = cells.map(([x]) => x);
  const ys = cells.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const width = Math.max(...xs) - minX + 1;
  const height = Math.max(...ys) - minY + 1;
  const offX = Math.floor((size - width) / 2);
  const offY = Math.floor((size - height) / 2);
  for (const [cx, cy] of cells) {
    const x = cx - minX + offX;
    const y = cy - minY + offY;
    if (y >= 0 && y < size && x >= 0 && x < size) grid[y][x] = type;
  }
  return grid;
}
