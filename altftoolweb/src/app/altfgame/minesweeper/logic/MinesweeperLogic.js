// logic/MinesweeperLogic.js

export const createEmptyGrid = (rows, cols) =>
    Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => ({
            row: r,
            col: c,
            isMine: false,
            isOpen: false,
            isFlagged: false,
            count: 0,
        }))
    );

// ------------------ MINE PLACEMENT (3x3 SAFE ZONE) ------------------
export const plantMines = (grid, rows, cols, mines, safeR, safeC) => {
    const newGrid = structuredClone(grid);
    const maxMines = rows * cols - 9;
    const totalMines = Math.min(mines, maxMines);

    let placed = 0;
    while (placed < totalMines) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);

        const inSafeZone = Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1;
        if (!newGrid[r][c].isMine && !inSafeZone) {
            newGrid[r][c].isMine = true;
            placed++;
        }
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!newGrid[r][c].isMine) {
                newGrid[r][c].count = countNeighbors(newGrid, r, c);
            }
        }
    }

    return newGrid;
};

const countNeighbors = (grid, r, c) => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            if (grid[r + i]?.[c + j]?.isMine) count++;
        }
    }
    return count;
};

// ------------------ REVEAL CELL ------------------
export const revealCell = (grid, r, c) => {
    if (grid[r][c].isOpen || grid[r][c].isFlagged) {
        return { grid, revealed: 0, hitMine: false };
    }

    const newGrid = structuredClone(grid);
    const stack = [[r, c]];
    let revealed = 0;

    if (newGrid[r][c].isMine) {
        newGrid.forEach(row =>
            row.forEach(cell => {
                if (cell.isMine) cell.isOpen = true;
            })
        );
        return { grid: newGrid, revealed: 0, hitMine: true };
    }

    while (stack.length) {
        const [x, y] = stack.pop();
        const cell = newGrid[x][y];

        if (cell.isOpen || cell.isFlagged) continue;

        cell.isOpen = true;
        revealed++;

        if (cell.count === 0) {
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (newGrid[x + dx]?.[y + dy]) {
                        stack.push([x + dx, y + dy]);
                    }
                }
            }
        }
    }

    return { grid: newGrid, revealed, hitMine: false };
};

// ------------------ CHORD (DOUBLE CLICK) ------------------
export const chordCell = (grid, r, c) => {
    const cell = grid[r][c];
    if (!cell.isOpen || cell.count === 0) {
        return { grid, revealed: 0, hitMine: false };
    }

    let flags = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (grid[r + i]?.[c + j]?.isFlagged) flags++;
        }
    }

    if (flags !== cell.count) {
        return { grid, revealed: 0, hitMine: false };
    }

    let newGrid = structuredClone(grid);
    let totalRevealed = 0;

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (newGrid[r + i]?.[c + j] && !newGrid[r + i][c + j].isFlagged) {
                const res = revealCell(newGrid, r + i, c + j);
                newGrid = res.grid;
                if (res.hitMine) {
                    return { grid: newGrid, revealed: 0, hitMine: true };
                }
                totalRevealed += res.revealed;
            }
        }
    }

    return { grid: newGrid, revealed: totalRevealed, hitMine: false };
};

// ------------------ FLAG ------------------
export const toggleFlag = (grid, r, c) => {
    if (grid[r][c].isOpen) return { grid, delta: 0 };
    const newGrid = structuredClone(grid);
    newGrid[r][c].isFlagged = !newGrid[r][c].isFlagged;
    return { grid: newGrid, delta: newGrid[r][c].isFlagged ? 1 : -1 };
};
