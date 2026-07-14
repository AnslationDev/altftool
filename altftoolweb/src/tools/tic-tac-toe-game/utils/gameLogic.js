export const PLAYERS = {
  X: { label: "Player X", mark: "X" },
  O: { label: "Player O", mark: "O" },
};

export const EMPTY_BOARD = Array.from({ length: 9 }, () => null);

export const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function getGameResult(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { type: "win", winner: board[a], line };
    }
  }

  if (board.every(Boolean)) return { type: "draw", winner: null, line: [] };
  return { type: "active", winner: null, line: [] };
}

function findWinningMove(board, player) {
  return board.findIndex((cell, index) => {
    if (cell) return false;
    const nextBoard = board.map((value, cellIndex) => (cellIndex === index ? player : value));
    return getGameResult(nextBoard).winner === player;
  });
}

export function getComputerMove(board, difficulty) {
  const openCells = board.map((cell, index) => (cell ? null : index)).filter((index) => index !== null);
  if (!openCells.length) return null;

  if (difficulty === "medium") {
    const winningMove = findWinningMove(board, "O");
    if (winningMove !== -1) return winningMove;

    const blockingMove = findWinningMove(board, "X");
    if (blockingMove !== -1) return blockingMove;

    if (!board[4]) return 4;
  }

  return openCells[Math.floor(Math.random() * openCells.length)];
}
