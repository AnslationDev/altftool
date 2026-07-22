import { CANDY_COUNT } from "./candies";

export const ROWS = 8;
export const COLS = 8;

let _id = 0;
export function nextId() {
  return ++_id;
}

export function createCell(type) {
  return { id: nextId(), type };
}

// Build a board with NO pre-existing matches.
export function createBoard(rows, cols, types = CANDY_COUNT) {
  let board;
  let attempts = 0;
  do {
    board = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push(createCell(Math.floor(Math.random() * types)));
      }
      board.push(row);
    }
    attempts++;
  } while (findMatches(board).size > 0 && attempts < 60);
  return board;
}

// Return a Set of "r,c" keys for every cell that is part of a horizontal or
// vertical run of 3+ identical candies.
export function findMatches(board) {
  const rows = board.length;
  const cols = board[0].length;
  const matched = new Set();

  // horizontal runs
  for (let r = 0; r < rows; r++) {
    let run = 1;
    for (let c = 1; c <= cols; c++) {
      const cur = c < cols ? board[r][c] : null;
      const prev = board[r][c - 1];
      if (cur && prev && cur.type === prev.type) {
        run++;
      } else {
        if (run >= 3) for (let k = c - run; k < c; k++) matched.add(`${r},${k}`);
        run = 1;
      }
    }
  }

  // vertical runs
  for (let c = 0; c < cols; c++) {
    let run = 1;
    for (let r = 1; r <= rows; r++) {
      const cur = r < rows ? board[r][c] : null;
      const prev = board[r - 1][c];
      if (cur && prev && cur.type === prev.type) {
        run++;
      } else {
        if (run >= 3) for (let k = r - run; k < r; k++) matched.add(`${k},${c}`);
        run = 1;
      }
    }
  }

  return matched;
}

export function cloneBoard(board) {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function swapCells(board, a, b) {
  const nb = cloneBoard(board);
  const tmp = nb[a.r][a.c];
  nb[a.r][a.c] = nb[b.r][b.c];
  nb[b.r][b.c] = tmp;
  return nb;
}

export function clearCells(board, matched) {
  const nb = cloneBoard(board);
  for (const key of matched) {
    const [r, c] = key.split(",").map(Number);
    nb[r][c] = null;
  }
  return nb;
}

// Drop candies down into empty cells (gravity).
export function applyGravity(board) {
  const rows = board.length;
  const cols = board[0].length;
  const nb = cloneBoard(board);
  for (let c = 0; c < cols; c++) {
    const stack = [];
    for (let r = rows - 1; r >= 0; r--) {
      if (nb[r][c]) stack.push(nb[r][c]);
    }
    for (let r = rows - 1; r >= 0; r--) {
      nb[r][c] = stack.length ? stack.shift() : null;
    }
  }
  return nb;
}

// Fill empty cells (top of each column) with fresh candies.
export function refill(board, types = CANDY_COUNT) {
  const nb = cloneBoard(board);
  for (let r = 0; r < nb.length; r++) {
    for (let c = 0; c < nb[0].length; c++) {
      if (!nb[r][c]) nb[r][c] = createCell(Math.floor(Math.random() * types));
    }
  }
  return nb;
}

// Is there at least one swap that would create a match?
export function hasPossibleMoves(board) {
  const rows = board.length;
  const cols = board[0].length;
  const trySwap = (a, b) => findMatches(swapCells(board, a, b)).size > 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c + 1 < cols && trySwap({ r, c }, { r, c: c + 1 })) return true;
      if (r + 1 < rows && trySwap({ r, c }, { r: r + 1, c })) return true;
    }
  }
  return false;
}

// Re-roll a fresh solvable, match-free board (used for deadlock shuffle).
export function shuffleBoard(rows, cols, types = CANDY_COUNT) {
  let board;
  let attempts = 0;
  do {
    board = createBoard(rows, cols, types);
    attempts++;
  } while ((findMatches(board).size > 0 || !hasPossibleMoves(board)) && attempts < 60);
  return board;
}
