/**
 * Returns an empty grid (2D array) of given rows x cols.
 */
export function createEmptyGrid(rows, cols) {
  return Array.from({ length: rows }, () => new Array(cols).fill(0));
}

/**
 * Returns a small starter pattern so the canvas is not visually empty on load.
 */
export function createSeedGrid(rows, cols) {
  const grid = createEmptyGrid(rows, cols);
  if (rows < 8 || cols < 8) return grid;

  const startRow = Math.max(1, Math.floor(rows / 2) - 4);
  const startCol = Math.max(1, Math.floor(cols / 2) - 6);
  const cells = [
    [0, 1], [1, 2], [2, 0], [2, 1], [2, 2],
    [4, 6], [4, 7], [5, 6], [5, 7],
    [0, 10], [1, 10], [2, 10],
  ];

  for (const [r, c] of cells) {
    const row = startRow + r;
    const col = startCol + c;
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      grid[row][col] = 1;
    }
  }

  return grid;
}

/**
 * Returns a random grid with ~30% live cells.
 */
export function randomGrid(rows, cols) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (Math.random() < 0.28 ? 1 : 0))
  );
}

/**
 * Returns a resized copy of the current grid, preserving cells that still fit.
 */
export function resizeGrid(grid, rows, cols) {
  const nextGrid = createEmptyGrid(rows, cols);
  const oldRows = grid?.length || 0;
  const oldCols = grid?.[0]?.length || 0;
  const copyRows = Math.min(rows, oldRows);
  const copyCols = Math.min(cols, oldCols);

  for (let r = 0; r < copyRows; r++) {
    for (let c = 0; c < copyCols; c++) {
      nextGrid[r][c] = grid[r][c];
    }
  }

  return nextGrid;
}

/**
 * Counts live cells in a grid.
 */
export function getPopulation(grid) {
  if (!grid) return 0;
  return grid.reduce(
    (total, row) => total + row.reduce((rowTotal, cell) => rowTotal + cell, 0),
    0
  );
}

/**
 * Counts live neighbours for a cell. Cells beyond the visible board are dead.
 */
export function countNeighbors(grid, row, col, rows, cols) {
  if (!rows || !cols) return 0;

  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
      count += grid[r][c];
    }
  }
  return count;
}

/**
 * Computes the next generation.
 */
export function nextGeneration(grid, rows, cols) {
  const newGrid = createEmptyGrid(rows, cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const neighbors = countNeighbors(grid, r, c, rows, cols);
      if (grid[r][c] === 1) {
        newGrid[r][c] = neighbors === 2 || neighbors === 3 ? 1 : 0;
      } else {
        newGrid[r][c] = neighbors === 3 ? 1 : 0;
      }
    }
  }
  return newGrid;
}
