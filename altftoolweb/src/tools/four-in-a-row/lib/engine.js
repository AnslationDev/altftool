// Pure game logic for the four-in-a-row board: board helpers, win detection,
// and a minimax + alpha-beta AI with a center-preference heuristic.
// No browser APIs — safe to import anywhere.

export const COLS = 7;
export const ROWS = 6;

const WIN_SCORE = 1000000;

// Center-first move ordering: improves alpha-beta pruning and doubles as the
// AI's center preference when scores tie.
const ORDERED_COLS = [3, 2, 4, 1, 5, 0, 6];

const DIRECTIONS = [
  [0, 1], // horizontal
  [1, 0], // vertical
  [1, 1], // diagonal down-right
  [1, -1], // diagonal down-left
];

export function createBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

/** Lowest empty row in a column, or -1 when the column is full. */
export function landingRow(board, col) {
  for (let r = ROWS - 1; r >= 0; r -= 1) {
    if (board[r][col] === 0) return r;
  }
  return -1;
}

export function isFull(board) {
  for (let c = 0; c < COLS; c += 1) {
    if (board[0][c] === 0) return false;
  }
  return true;
}

/**
 * If the disc just placed at (row, col) completes a run of 4+, returns the
 * full winning line as an array of [row, col] pairs; otherwise null.
 */
export function findWinFrom(board, row, col, player) {
  for (const [dr, dc] of DIRECTIONS) {
    const line = [[row, col]];
    for (const sign of [1, -1]) {
      let r = row + dr * sign;
      let c = col + dc * sign;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        line.push([r, c]);
        r += dr * sign;
        c += dc * sign;
      }
    }
    if (line.length >= 4) return line;
  }
  return null;
}

function scoreWindow(a, b, c, d, player, opponent) {
  let mine = 0;
  let theirs = 0;
  for (const v of [a, b, c, d]) {
    if (v === player) mine += 1;
    else if (v === opponent) theirs += 1;
  }
  if (mine > 0 && theirs > 0) return 0; // blocked window
  if (mine === 3) return 120;
  if (mine === 2) return 12;
  if (theirs === 3) return -140; // weight live opponent threats slightly higher
  if (theirs === 2) return -12;
  return 0;
}

function scorePosition(board, player) {
  const opponent = player === 1 ? 2 : 1;
  let score = 0;

  // Center-column preference.
  for (let r = 0; r < ROWS; r += 1) {
    if (board[r][3] === player) score += 6;
    else if (board[r][3] === opponent) score -= 6;
  }

  // Horizontal windows.
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c <= COLS - 4; c += 1) {
      score += scoreWindow(board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3], player, opponent);
    }
  }
  // Vertical windows.
  for (let c = 0; c < COLS; c += 1) {
    for (let r = 0; r <= ROWS - 4; r += 1) {
      score += scoreWindow(board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c], player, opponent);
    }
  }
  // Diagonal down-right windows.
  for (let r = 0; r <= ROWS - 4; r += 1) {
    for (let c = 0; c <= COLS - 4; c += 1) {
      score += scoreWindow(board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3], player, opponent);
    }
  }
  // Diagonal up-right windows.
  for (let r = 3; r < ROWS; r += 1) {
    for (let c = 0; c <= COLS - 4; c += 1) {
      score += scoreWindow(board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3], player, opponent);
    }
  }
  return score;
}

function minimax(board, depth, alpha, beta, maximizing, aiPlayer, humanPlayer) {
  if (isFull(board)) return 0;
  if (depth === 0) return scorePosition(board, aiPlayer);

  const player = maximizing ? aiPlayer : humanPlayer;
  let best = maximizing ? -Infinity : Infinity;

  for (const col of ORDERED_COLS) {
    const row = landingRow(board, col);
    if (row < 0) continue;
    board[row][col] = player;
    let score;
    if (findWinFrom(board, row, col, player)) {
      // Reward faster wins / delay losses via the depth bonus.
      score = maximizing ? WIN_SCORE + depth : -WIN_SCORE - depth;
    } else {
      score = minimax(board, depth - 1, alpha, beta, !maximizing, aiPlayer, humanPlayer);
    }
    board[row][col] = 0;

    if (maximizing) {
      if (score > best) best = score;
      if (best > alpha) alpha = best;
    } else {
      if (score < best) best = score;
      if (best < beta) beta = best;
    }
    if (alpha >= beta) break;
  }
  return best;
}

/**
 * Picks the AI's column using minimax with alpha-beta pruning.
 * Only strict improvements replace the current best: with a tightened root
 * alpha, scores <= alpha may be cut-off bounds rather than exact values, so
 * ties are unreliable. Strict improvement keeps the search exact where it
 * matters and breaks ties toward the center via the move ordering.
 * Returns -1 only when the board is full.
 */
export function bestMove(sourceBoard, aiPlayer, depth) {
  const board = sourceBoard.map((cells) => cells.slice());
  const humanPlayer = aiPlayer === 1 ? 2 : 1;
  let bestScore = -Infinity;
  let bestCol = -1;
  let alpha = -Infinity;

  for (const col of ORDERED_COLS) {
    const row = landingRow(board, col);
    if (row < 0) continue;
    board[row][col] = aiPlayer;
    let score;
    if (findWinFrom(board, row, col, aiPlayer)) {
      score = WIN_SCORE + depth;
    } else {
      score = minimax(board, Math.max(0, depth - 1), alpha, Infinity, false, aiPlayer, humanPlayer);
    }
    board[row][col] = 0;

    if (score > bestScore) {
      bestScore = score;
      bestCol = col;
    }
    if (bestScore > alpha) alpha = bestScore;
  }

  return bestCol;
}
