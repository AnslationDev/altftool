const COLUMN_RANGES = [
  { letter: "B", min: 1, max: 15 },
  { letter: "I", min: 16, max: 30 },
  { letter: "N", min: 31, max: 45 },
  { letter: "G", min: 46, max: 60 },
  { letter: "O", min: 61, max: 75 },
];

const COLUMN_LETTERS = COLUMN_RANGES.map((c) => c.letter);

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateColumnNumbers(min, max, count) {
  const pool = [];
  for (let n = min; n <= max; n++) pool.push(n);
  return shuffleArray(pool).slice(0, count);
}

export function generateBoard() {
  const columns = COLUMN_RANGES.map((range) =>
    generateColumnNumbers(range.min, range.max, 5)
  );

  const board = [];
  for (let row = 0; row < 5; row++) {
    const rowData = [];
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col === 2) {
        rowData.push({ number: 0, letter: "N", isFree: true });
      } else {
        rowData.push({
          number: columns[col][row],
          letter: COLUMN_LETTERS[col],
          isFree: false,
        });
      }
    }
    board.push(rowData);
  }

  return board;
}

export function getAllPoolNumbers() {
  const numbers = [];
  for (let n = 1; n <= 75; n++) numbers.push(n);
  return shuffleArray(numbers);
}

export function getLetterForNumber(number) {
  if (number >= 1 && number <= 15) return "B";
  if (number >= 16 && number <= 30) return "I";
  if (number >= 31 && number <= 45) return "N";
  if (number >= 46 && number <= 60) return "G";
  if (number >= 61 && number <= 75) return "O";
  return "";
}

export function isNumberOnBoard(board, number) {
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (board[row][col].number === number && !board[row][col].isFree) {
        return { row, col };
      }
    }
  }
  return null;
}

export function checkWin(markedCells) {
  const lines = [];

  for (let row = 0; row < 5; row++) {
    lines.push({ type: "row", index: row, cells: Array.from({ length: 5 }, (_, c) => [row, c]) });
  }

  for (let col = 0; col < 5; col++) {
    lines.push({ type: "col", index: col, cells: Array.from({ length: 5 }, (_, r) => [r, col]) });
  }

  lines.push({ type: "diag", index: 0, cells: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]] });
  lines.push({ type: "diag", index: 1, cells: [[0, 4], [1, 3], [2, 2], [3, 1], [4, 0]] });

  lines.push({
    type: "corners",
    index: 0,
    cells: [[0, 0], [0, 4], [4, 0], [4, 4]],
  });

  lines.push({
    type: "fullhouse",
    index: 0,
    cells: Array.from({ length: 5 }, (_, r) =>
      Array.from({ length: 5 }, (_, c) => [r, c])
    ).flat(),
  });

  const winPatterns = [];

  for (const line of lines) {
    const allMarked = line.cells.every(
      ([r, c]) => markedCells.has(`${r}-${c}`)
    );
    if (allMarked) {
      winPatterns.push(line);
    }
  }

  return winPatterns;
}

export function getWinPatternLabel(pattern) {
  if (!pattern) return "";
  const labels = {
    row: `Row ${pattern.index + 1}`,
    col: `Column ${COLUMN_LETTERS[pattern.index]}`,
    diag: pattern.index === 0 ? "Diagonal (top-left to bottom-right)" : "Diagonal (top-right to bottom-left)",
    corners: "Four Corners",
    fullhouse: "Full House",
  };
  return labels[pattern.type] || "Bingo!";
}

export function initMarkedCells(board) {
  const marked = new Set();
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (board[row][col].isFree) {
        marked.add(`${row}-${col}`);
      }
    }
  }
  return marked;
}
