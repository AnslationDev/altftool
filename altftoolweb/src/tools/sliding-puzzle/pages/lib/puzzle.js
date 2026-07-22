/**
 * Pure board logic for the sliding number puzzle.
 * Boards are flat arrays of length size*size; 0 is the blank cell.
 */

export function createSolvedBoard(size) {
  const total = size * size;
  const board = new Array(total);
  for (let i = 0; i < total - 1; i += 1) board[i] = i + 1;
  board[total - 1] = 0;
  return board;
}

export function isSolved(board) {
  for (let i = 0; i < board.length - 1; i += 1) {
    if (board[i] !== i + 1) return false;
  }
  return board[board.length - 1] === 0;
}

function countInversions(board) {
  const tiles = board.filter((value) => value !== 0);
  let inversions = 0;
  for (let i = 0; i < tiles.length; i += 1) {
    for (let j = i + 1; j < tiles.length; j += 1) {
      if (tiles[i] > tiles[j]) inversions += 1;
    }
  }
  return inversions;
}

/**
 * Standard 15-puzzle solvability parity check.
 * Odd width: solvable iff inversion count is even.
 * Even width: solvable iff inversions + blank row (counted from the bottom,
 * 1-indexed) is odd.
 */
export function isSolvable(board, size) {
  const inversions = countInversions(board);
  if (size % 2 === 1) return inversions % 2 === 0;
  const blankRowFromBottom = size - Math.floor(board.indexOf(0) / size);
  return (inversions + blankRowFromBottom) % 2 === 1;
}

/**
 * Fisher-Yates shuffle followed by a parity fix: swapping two adjacent
 * non-blank tiles flips the inversion parity without moving the blank,
 * turning any unsolvable deal into a solvable one. Never returns a board
 * that is already solved.
 */
export function shuffleBoard(size, random = Math.random) {
  const total = size * size;
  let board;
  do {
    board = createSolvedBoard(size);
    for (let i = total - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [board[i], board[j]] = [board[j], board[i]];
    }
    if (!isSolvable(board, size)) {
      let a = 0;
      if (board[a] === 0) a = 1;
      let b = a + 1;
      if (board[b] === 0) b += 1;
      [board[a], board[b]] = [board[b], board[a]];
    }
  } while (isSolved(board));
  return board;
}

/**
 * Click/tap move: the chosen tile must share a row or column with the blank.
 * The whole segment between the tile and the blank shifts one cell toward
 * the blank (a single adjacent tile is just the segment of length one).
 * Returns { board, shifted } or null when the move is illegal.
 */
export function slideTiles(board, size, tileIndex) {
  const blank = board.indexOf(0);
  if (tileIndex === blank || tileIndex < 0 || tileIndex >= board.length) return null;
  const tileRow = Math.floor(tileIndex / size);
  const tileCol = tileIndex % size;
  const blankRow = Math.floor(blank / size);
  const blankCol = blank % size;
  if (tileRow !== blankRow && tileCol !== blankCol) return null;

  const next = board.slice();
  let shifted = 0;
  if (tileRow === blankRow) {
    const step = tileCol < blankCol ? 1 : -1;
    for (let col = blankCol; col !== tileCol; col -= step) {
      next[tileRow * size + col] = next[tileRow * size + col - step];
      shifted += 1;
    }
  } else {
    const step = tileRow < blankRow ? 1 : -1;
    for (let row = blankRow; row !== tileRow; row -= step) {
      next[row * size + tileCol] = next[(row - step) * size + tileCol];
      shifted += 1;
    }
  }
  next[tileIndex] = 0;
  return { board: next, shifted };
}

/**
 * Keyboard move: shift the blank one cell by (deltaRow, deltaCol).
 * Returns the next board or null when the blank would leave the grid.
 */
export function moveBlank(board, size, deltaRow, deltaCol) {
  const blank = board.indexOf(0);
  const row = Math.floor(blank / size) + deltaRow;
  const col = (blank % size) + deltaCol;
  if (row < 0 || row >= size || col < 0 || col >= size) return null;
  const target = row * size + col;
  const next = board.slice();
  next[blank] = next[target];
  next[target] = 0;
  return next;
}
