
// Game Constants
export const GAME_CONFIG = {
    DEFAULT_GRID_SIZE: 3, // 3x3 boxes (4x4 dots)
    PLAYERS: {
        P1: 1, // Player
        P2: 2  // Opponent (AI or Player 2)
    },
    COLORS: {
        P1: '#3b82f6', // Blue
        P2: '#ef4444', // Red
        NEUTRAL: '#e5e7eb',
        HOVER: '#93c5fd'
    },
    DIFFICULTY: {
        EASY: 'easy',
        MEDIUM: 'medium',
        HARD: 'hard'
    }
};

export class DotsAndBoxesLogic {
    constructor(gridSize = GAME_CONFIG.DEFAULT_GRID_SIZE) {
        this.gridSize = gridSize;
        this.reset();
    }

    reset() {
        // Grid size N means N x N boxes, so (N+1) x (N+1) dots
        const dots = this.gridSize + 1;

        // Horizontal lines: (N+1) rows x N columns
        // hLines[row][col]
        this.hLines = Array(dots).fill(0).map(() => Array(this.gridSize).fill(false));

        // Vertical lines: N rows x (N+1) columns
        // vLines[row][col]
        this.vLines = Array(this.gridSize).fill(0).map(() => Array(dots).fill(false));

        // Boxes: N rows x N columns
        // boxes[row][col] = 0 (none), 1 (P1), 2 (P2)
        this.boxes = Array(this.gridSize).fill(0).map(() => Array(this.gridSize).fill(0));

        this.currentPlayer = GAME_CONFIG.PLAYERS.P1;
        this.scores = { [GAME_CONFIG.PLAYERS.P1]: 0, [GAME_CONFIG.PLAYERS.P2]: 0 };
        this.winner = null;
        this.history = [];
    }

    // Check if a line is already taken
    isLineTaken(type, row, col) {
        if (type === 'h') return this.hLines[row][col];
        if (type === 'v') return this.vLines[row][col];
        return false;
    }

    // Make a move
    // type: 'h' (horizontal) or 'v' (vertical)
    // row, col: coordinates of the line
    makeMove(type, row, col) {
        if (this.winner || this.isLineTaken(type, row, col)) return false;

        // Record move
        if (type === 'h') this.hLines[row][col] = true;
        else this.vLines[row][col] = true;

        // Check for completed boxes
        const completedBoxes = this.checkCompletedBoxes(type, row, col);

        let extraTurn = false;
        if (completedBoxes.length > 0) {
            completedBoxes.forEach(({r, c}) => {
                this.boxes[r][c] = this.currentPlayer;
                this.scores[this.currentPlayer]++;
            });
            extraTurn = true;
        }

        // Add to history (deep copy state if needed for undo, simplified here)
        // this.history.push({ type, row, col, player: this.currentPlayer, boxes: completedBoxes });

        // Check Win Condition
        if (this.scores[1] + this.scores[2] === this.gridSize * this.gridSize) {
            if (this.scores[1] > this.scores[2]) this.winner = 1;
            else if (this.scores[2] > this.scores[1]) this.winner = 2;
            else this.winner = 'draw';
        }

        // Switch turn if no box completed
        if (!extraTurn) {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        }

        return {
            success: true,
            extraTurn,
            completedBoxes
        };
    }

    checkCompletedBoxes(type, r, c) {
        const completed = [];

        // Helper to check if a specific box is complete
        const isBoxComplete = (br, bc) => {
            if (br < 0 || bc < 0 || br >= this.gridSize || bc >= this.gridSize) return false;
            // A box at (br, bc) needs:
            // Top: hLines[br][bc]
            // Bottom: hLines[br+1][bc]
            // Left: vLines[br][bc]
            // Right: vLines[br][bc+1]
            return this.hLines[br][bc] && this.hLines[br+1][bc] &&
                   this.vLines[br][bc] && this.vLines[br][bc+1];
        };

        if (type === 'h') {
            // Horizontal line at r, c can complete box above (r-1, c) or below (r, c)
            if (isBoxComplete(r - 1, c)) completed.push({r: r - 1, c});
            if (isBoxComplete(r, c)) completed.push({r, c});
        } else {
            // Vertical line at r, c can complete box left (r, c-1) or right (r, c)
            if (isBoxComplete(r, c - 1)) completed.push({r, c: c - 1});
            if (isBoxComplete(r, c)) completed.push({r, c});
        }

        return completed;
    }

    getAvailableMoves() {
        const moves = [];
        // Horizontal
        for(let r=0; r <= this.gridSize; r++) {
            for(let c=0; c < this.gridSize; c++) {
                if(!this.hLines[r][c]) moves.push({type: 'h', r, c});
            }
        }
        // Vertical
        for(let r=0; r < this.gridSize; r++) {
            for(let c=0; c <= this.gridSize; c++) {
                if(!this.vLines[r][c]) moves.push({type: 'v', r, c});
            }
        }
        return moves;
    }

    // AI Logic
    getAIMove(difficulty) {
        const moves = this.getAvailableMoves();
        if (moves.length === 0) return null;

        // Helper: Check if a move completes a box
        const checkMoveCompletesBox = (move) => {
            // Temporarily make move
            if (move.type === 'h') this.hLines[move.r][move.c] = true;
            else this.vLines[move.r][move.c] = true;

            const boxes = this.checkCompletedBoxes(move.type, move.r, move.c);

            // Revert
            if (move.type === 'h') this.hLines[move.r][move.c] = false;
            else this.vLines[move.r][move.c] = false;

            return boxes.length > 0;
        };

        // Helper: Check if a move GIVES a box to opponent (i.e., makes a box have 3 lines)
        const checkMoveGivesBox = (move) => {
             // Temporarily make move
             if (move.type === 'h') this.hLines[move.r][move.c] = true;
             else this.vLines[move.r][move.c] = true;

             // Check adjacent boxes. If any adjacent box now has 3 lines, it's bad.
             let givesBox = false;

             // Box count helper
             const countLines = (br, bc) => {
                if (br < 0 || bc < 0 || br >= this.gridSize || bc >= this.gridSize) return 0;
                let count = 0;
                if (this.hLines[br][bc]) count++;
                if (this.hLines[br+1][bc]) count++;
                if (this.vLines[br][bc]) count++;
                if (this.vLines[br][bc+1]) count++;
                return count;
             };

             if (move.type === 'h') {
                 if (countLines(move.r - 1, move.c) === 3) givesBox = true;
                 if (countLines(move.r, move.c) === 3) givesBox = true;
             } else {
                 if (countLines(move.r, move.c - 1) === 3) givesBox = true;
                 if (countLines(move.r, move.c) === 3) givesBox = true;
             }

             // Revert
             if (move.type === 'h') this.hLines[move.r][move.c] = false;
             else this.vLines[move.r][move.c] = false;

             return givesBox;
        };

        // 1. Always take a box if available (All difficulties)
        const scoringMoves = moves.filter(m => checkMoveCompletesBox(m));
        if (scoringMoves.length > 0) {
            // If multiple, pick random
            return scoringMoves[Math.floor(Math.random() * scoringMoves.length)];
        }

        // 2. If Easy, just random
        if (difficulty === GAME_CONFIG.DIFFICULTY.EASY) {
             return moves[Math.floor(Math.random() * moves.length)];
        }

        // 3. Medium/Hard: Avoid giving boxes
        const safeMoves = moves.filter(m => !checkMoveGivesBox(m));

        if (safeMoves.length > 0) {
            return safeMoves[Math.floor(Math.random() * safeMoves.length)];
        }

        // 4. If no safe moves, we are forced to give a box.
        // Hard mode could try to minimize damage (give smallest chain), but for now random bad move is fine.
        return moves[Math.floor(Math.random() * moves.length)];
    }
}
