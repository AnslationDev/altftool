// Pure minesweeper board logic. No browser APIs in this module.

export const DIFFICULTIES = {
  beginner: {
    key: "beginner",
    label: "Beginner",
    rows: 9,
    cols: 9,
    mines: 10,
    minCell: 34,
    textClass: "text-base sm:text-lg",
  },
  intermediate: {
    key: "intermediate",
    label: "Intermediate",
    rows: 16,
    cols: 16,
    mines: 40,
    minCell: 20,
    textClass: "text-xs sm:text-sm",
  },
  expert: {
    key: "expert",
    label: "Expert",
    rows: 16,
    cols: 30,
    mines: 99,
    minCell: 24,
    textClass: "text-xs sm:text-sm",
  },
};

export const DIFFICULTY_ORDER = ["beginner", "intermediate", "expert"];

// Classic number palette (game art — the board defines its own light surface).
export const NUMBER_COLORS = [
  "",
  "#1d4ed8", // 1 blue
  "#15803d", // 2 green
  "#dc2626", // 3 red
  "#1e3a8a", // 4 navy
  "#9f1239", // 5 maroon
  "#0f766e", // 6 teal
  "#111827", // 7 near-black
  "#64748b", // 8 steel
];

export function createBoard(rows, cols) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      wrong: false,
      adjacent: 0,
    })),
  );
}

export function forEachNeighbor(rows, cols, r, c, fn) {
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) fn(nr, nc);
    }
  }
}

/**
 * Place `mineCount` mines everywhere except the first-clicked cell, so the
 * opening move can never explode, then compute adjacency counts.
 */
export function placeMines(board, mineCount, safeR, safeC) {
  const rows = board.length;
  const cols = board[0].length;
  const next = board.map((row) => row.map((cell) => ({ ...cell })));

  const candidates = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (r === safeR && c === safeC) continue;
      candidates.push([r, c]);
    }
  }
  const count = Math.min(mineCount, candidates.length);
  // Partial Fisher-Yates: the first `count` entries become the mine positions.
  for (let i = 0; i < count; i += 1) {
    const j = i + Math.floor(Math.random() * (candidates.length - i));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    const [r, c] = candidates[i];
    next[r][c].mine = true;
  }

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      let n = 0;
      forEachNeighbor(rows, cols, r, c, (nr, nc) => {
        if (next[nr][nc].mine) n += 1;
      });
      next[r][c].adjacent = n;
    }
  }
  return next;
}

/**
 * Reveal every target cell, flood-filling outward from zero cells. Flagged and
 * already-revealed cells are skipped. Untouched rows/cells keep their identity.
 * Returns { board, hitMine, exploded, revealedCount } where `exploded` is the
 * flat index (r * cols + c) of the first mine revealed, or null.
 */
export function revealCells(board, targets) {
  const rows = board.length;
  const cols = board[0].length;
  const toReveal = new Set();
  let hitMine = false;
  let exploded = null;

  const stack = targets.slice();
  while (stack.length > 0) {
    const [r, c] = stack.pop();
    const key = r * cols + c;
    if (toReveal.has(key)) continue;
    const cell = board[r][c];
    if (cell.revealed || cell.flagged) continue;
    toReveal.add(key);
    if (cell.mine) {
      hitMine = true;
      if (exploded === null) exploded = key;
      continue;
    }
    if (cell.adjacent === 0) {
      forEachNeighbor(rows, cols, r, c, (nr, nc) => stack.push([nr, nc]));
    }
  }

  if (toReveal.size === 0) {
    return { board, hitMine: false, exploded: null, revealedCount: 0 };
  }

  const next = board.map((row, r) => {
    let changed = false;
    const newRow = row.map((cell, c) => {
      if (toReveal.has(r * cols + c)) {
        changed = true;
        return { ...cell, revealed: true };
      }
      return cell;
    });
    return changed ? newRow : row;
  });
  return { board: next, hitMine, exploded, revealedCount: toReveal.size };
}

export function toggleFlagAt(board, r, c) {
  return board.map((row, ri) => {
    if (ri !== r) return row;
    return row.map((cell, ci) =>
      ci === c ? { ...cell, flagged: !cell.flagged } : cell,
    );
  });
}

/** After a loss: uncover every unflagged mine and mark misplaced flags. */
export function finalizeLoss(board) {
  return board.map((row) =>
    row.map((cell) => {
      if (cell.mine && !cell.flagged && !cell.revealed) {
        return { ...cell, revealed: true };
      }
      if (!cell.mine && cell.flagged) {
        return { ...cell, wrong: true };
      }
      return cell;
    }),
  );
}

/** After a win: auto-flag any remaining mines for a tidy final board. */
export function flagAllMines(board) {
  return board.map((row) =>
    row.map((cell) =>
      cell.mine && !cell.flagged ? { ...cell, flagged: true } : cell,
    ),
  );
}

export function countFlags(board) {
  let n = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell.flagged) n += 1;
    }
  }
  return n;
}

export function isWin(board, mineCount) {
  let revealedSafe = 0;
  let total = 0;
  for (const row of board) {
    for (const cell of row) {
      total += 1;
      if (cell.revealed && !cell.mine) revealedSafe += 1;
    }
  }
  return revealedSafe === total - mineCount;
}
