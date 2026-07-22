
import { PIECES } from './Constants';
import { ChessEngine } from './ChessEngine';

// Simple Piece Values
const PIECE_VALUES = {
    [PIECES.PAWN]: 10,
    [PIECES.KNIGHT]: 30,
    [PIECES.BISHOP]: 30,
    [PIECES.ROOK]: 50,
    [PIECES.QUEEN]: 90,
    [PIECES.KING]: 900
};

// Returns { r, c, score }
export function getBestMove(engine, depth = 2) {
    // Clone engine to simulate
    // NOTE: Simulating strictly by cloning the full engine is slow in JS.
    // For a highly optimized engine we'd move/undo.
    // Given the constraints and React environment, cloning the *board* state is likely safer/easier for MVP
    // but the Engine class methods rely on 'this.board'.
    // We will assume the Engine has a way to clone itself or we use a fresh engine.

    // Better approach for this structure:
    // AI receives the Current Engine State. It needs to simulate.
    // We will add a helper 'clone()' to ChessEngine or manually copy.

    const possibleMoves = getAllMoves(engine, engine.getTurn());
    if (possibleMoves.length === 0) return null;

    let bestMove = null;
    let bestValue = -Infinity;
    const isMaximizing = true; // AI is always maximizing its own score relative to the start node
    const aiColor = engine.getTurn();

    // Randomize order to add variety if scores are equal
    possibleMoves.sort(() => Math.random() - 0.5);

    for (const move of possibleMoves) {
        // Clone engine state
        const simulatedEngine = cloneEngine(engine);
        simulatedEngine.move(move.from, move.to);

        const value = minimax(simulatedEngine, depth - 1, -Infinity, Infinity, !isMaximizing, aiColor);

        if (value > bestValue) {
            bestValue = value;
            bestMove = move;
        }
    }

    return bestMove;
}

function minimax(engine, depth, alpha, beta, isMaximizing, aiColor) {
    if (depth === 0 || engine.getWinner()) {
        return evaluateBoard(engine.getBoard(), aiColor);
    }

    const currentTurn = engine.getTurn();
    const possibleMoves = getAllMoves(engine, currentTurn);

    if (possibleMoves.length === 0) {
        return evaluateBoard(engine.getBoard(), aiColor); // checkmate or stalemate handled by engine.winner check usually, but safely fallback
    }

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of possibleMoves) {
            const simulatedEngine = cloneEngine(engine);
            simulatedEngine.move(move.from, move.to);
            const evalScore = minimax(simulatedEngine, depth - 1, alpha, beta, false, aiColor);
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of possibleMoves) {
            const simulatedEngine = cloneEngine(engine);
            simulatedEngine.move(move.from, move.to);
            const evalScore = minimax(simulatedEngine, depth - 1, alpha, beta, true, aiColor);
            minEval = Math.min(minEval, evalScore);
            beta = Math.min(beta, evalScore);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

function evaluateBoard(board, aiColor) {
    let score = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p) {
                const val = PIECE_VALUES[p.type] || 0;
                if (p.color === aiColor) score += val;
                else score -= val;
            }
        }
    }
    return score;
}

function getAllMoves(engine, color) {
    const moves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = engine.board[r][c];
            if (p && p.color === color) {
                const valid = engine.getValidMoves({ r, c });
                valid.forEach(to => {
                    moves.push({ from: { r, c }, to });
                });
            }
        }
    }
    return moves;
}

// Helper to deep copy the engine state for simulation
// This assumes ChessEngine has all state in properties we copy here
function cloneEngine(source) {
    const newEngine = new ChessEngine();
    newEngine.board = JSON.parse(JSON.stringify(source.board));
    newEngine.turn = source.turn;
    newEngine.castling = JSON.parse(JSON.stringify(source.castling));
    newEngine.enPassantTarget = source.enPassantTarget ? { ...source.enPassantTarget } : null;
    newEngine.winner = source.winner;
    return newEngine;
}
