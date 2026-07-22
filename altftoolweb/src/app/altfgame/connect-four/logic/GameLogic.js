
export const ROWS = 6;
export const COLS = 7;
export const PLAYER_1 = "R"; // Red
export const PLAYER_2 = "Y"; // Yellow

export const createBoard = () => {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
};

export const findLowestEmptyRow = (board, col) => {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r][col]) {
      return r;
    }
  }
  return -1;
};

export const checkWinner = (board) => {
  // Check Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const val = board[r][c];
      if (val && val === board[r][c + 1] && val === board[r][c + 2] && val === board[r][c + 3]) {
        return { winner: val, line: [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]] };
      }
    }
  }

  // Check Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      const val = board[r][c];
      if (val && val === board[r + 1][c] && val === board[r + 2][c] && val === board[r + 3][c]) {
        return { winner: val, line: [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]] };
      }
    }
  }

  // Check Diagonal (Top-Left to Bottom-Right)
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const val = board[r][c];
      if (val && val === board[r + 1][c + 1] && val === board[r + 2][c + 2] && val === board[r + 3][c + 3]) {
        return { winner: val, line: [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]] };
      }
    }
  }

  // Check Diagonal (Bottom-Left to Top-Right)
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const val = board[r][c];
      if (val && val === board[r - 1][c + 1] && val === board[r - 2][c + 2] && val === board[r - 3][c + 3]) {
        return { winner: val, line: [[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]] };
      }
    }
  }

  return null;
};

export const checkDraw = (board) => {
  return board.every(row => row.every(cell => cell !== null));
};
