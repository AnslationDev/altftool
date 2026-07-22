import { COLORS, PIECES, INITIAL_BOARD } from './Constants';

export class ChessEngine {
    constructor() {
        this.board = JSON.parse(JSON.stringify(INITIAL_BOARD));
        this.turn = COLORS.WHITE;
        this.history = [];
        this.halfMoveClock = 0; // For 50-move rule
        this.fullMoveNumber = 1;
        this.castling = {
            [COLORS.WHITE]: { k: true, q: true },
            [COLORS.BLACK]: { k: true, q: true }
        };
        this.enPassantTarget = null; // Square like {r: 2, c: 3}
        this.winner = null; // 'w', 'b', or 'draw'
    }

    // --- PUBLIC API ---

    getBoard() {
        return this.board;
    }

    getTurn() {
        return this.turn;
    }

    getWinner() {
        return this.winner;
    }

    isInCheck() {
        return this._isKingInCheck(this.turn);
    }

    move(from, to) {
        if (this.winner) return false;

        const piece = this.board[from.r][from.c];
        if (!piece || piece.color !== this.turn) return false;

        // Strict validation: Verify the move is in the list of valid moves
        const validMoves = this.getValidMoves(from);
        const isValid = validMoves.some(m => m.r === to.r && m.c === to.c);

        if (!isValid) return false;

        this._executeMove(from, to, piece);
        this._endTurn();
        return true;
    }

    /**
     * CORE VALIDATION PIPELINE
     * 1. Generate pseudo-legal moves (physics only)
     * 2. Filter moves that would leave King in check
     * 3. Add valid castling moves
     */
    getValidMoves(square) {
        const piece = this.board[square.r][square.c];
        if (!piece) return [];

        // 1. Get pseudo-legal moves (physics only, ignoring check)
        const pseudoMoves = this._getPseudoLegalMoves(square, piece, false);

        // 2. Filter: Simulate each move and reject if King ends up in check
        const legalMoves = pseudoMoves.filter(to => {
            return this._isMoveSafe(square, to, piece);
        });

        // 3. Add Castling (Strict rules applied inside _getCastlingMoves)
        if (piece.type === PIECES.KING && !this._isKingInCheck(piece.color)) {
            const castlingMoves = this._getCastlingMoves(square, piece);
            legalMoves.push(...castlingMoves);
        }

        return legalMoves;
    }

    // --- LOGIC ---

    // Simulates a move to check if it leaves the King in check
    _isMoveSafe(from, to, piece) {
        // 1. Snapshot affected state
        const targetSquare = this.board[to.r][to.c];
        const sourceSquare = this.board[from.r][from.c]; // Should be 'piece'

        // Handle En Passant capture simulation
        let enPassantCaptured = null;
        let enPassantRow = -1;
        if (piece.type === PIECES.PAWN && to.c !== from.c && !targetSquare) {
            // En Passant detected (diagonal move to empty square)
            enPassantRow = from.r; // Captured pawn is on the same rank as start
            enPassantCaptured = this.board[enPassantRow][to.c];
            this.board[enPassantRow][to.c] = null;
        }

        // 2. Execute move
        this.board[to.r][to.c] = piece;
        this.board[from.r][from.c] = null;

        // 3. Check King safety
        const safe = !this._isKingInCheck(piece.color);

        // 4. Restore state
        this.board[from.r][from.c] = sourceSquare;
        this.board[to.r][to.c] = targetSquare;
        if (enPassantCaptured) {
            this.board[enPassantRow][to.c] = enPassantCaptured;
        }

        return safe;
    }

    _executeMove(from, to, piece) {
        const target = this.board[to.r][to.c];
        const isPawn = piece.type === PIECES.PAWN;

        // History
        this.history.push({
            from, to, piece: { ...piece }, captured: target
        });

        // Move
        this.board[to.r][to.c] = piece;
        this.board[from.r][from.c] = null;

        // Updates
        if (piece.type === PIECES.KING) {
            this.castling[piece.color] = { k: false, q: false };
        }
        if (piece.type === PIECES.ROOK) {
            if (from.c === 0 && from.r === (piece.color === COLORS.WHITE ? 7 : 0)) this.castling[piece.color].q = false;
            if (from.c === 7 && from.r === (piece.color === COLORS.WHITE ? 7 : 0)) this.castling[piece.color].k = false;
        }

        // Castling Move (Rook)
        if (piece.type === PIECES.KING && Math.abs(to.c - from.c) === 2) {
            if (to.c === 6) { // Kingside
                this.board[to.r][5] = this.board[to.r][7];
                this.board[to.r][7] = null;
            } else if (to.c === 2) { // Queenside
                this.board[to.r][3] = this.board[to.r][0];
                this.board[to.r][0] = null;
            }
        }

        // En Passant Capture
        if (isPawn && to.c !== from.c && !target) {
            this.board[from.r][to.c] = null;
        }

        // Set En Passant Target
        if (isPawn && Math.abs(to.r - from.r) === 2) {
            this.enPassantTarget = { r: (from.r + to.r) / 2, c: from.c };
        } else {
            this.enPassantTarget = null;
        }

        // Promotion (Auto Queen)
        if (isPawn && (to.r === 0 || to.r === 7)) {
            piece.type = PIECES.QUEEN;
        }
    }

    _endTurn() {
        this.turn = this.turn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        if (this._isCheckmate(this.turn)) {
            this.winner = this.turn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        } else if (this._isStalemate(this.turn)) {
            this.winner = 'draw';
        }
    }

    // mode: false = move generation, true = attack generation (pawns hit diagonals even if empty)
    _getPseudoLegalMoves(square, piece, forAttack = false) {
        const moves = [];
        const { r, c } = square;
        const direction = piece.color === COLORS.WHITE ? -1 : 1;

        if (piece.type === PIECES.PAWN) {
            if (forAttack) {
                // Pawns attack diagonals always (occupancy doesn't matter for control)
                [[r + direction, c - 1], [r + direction, c + 1]].forEach(([nr, nc]) => {
                    if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
                        moves.push({ r: nr, c: nc });
                    }
                });
            } else {
                // Movement (Forward 1)
                if (!this.board[r + direction][c]) {
                    moves.push({ r: r + direction, c });
                    // Movement (Forward 2)
                    if ((piece.color === COLORS.WHITE && r === 6) || (piece.color === COLORS.BLACK && r === 1)) {
                        if (!this.board[r + direction * 2][c]) {
                            moves.push({ r: r + direction * 2, c });
                        }
                    }
                }
                // Capture (Diagonal)
                [[r + direction, c - 1], [r + direction, c + 1]].forEach(([nr, nc]) => {
                    if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
                        const target = this.board[nr][nc];
                        // Normal capture or En Passant
                        if ((target && target.color !== piece.color) ||
                            (this.enPassantTarget && this.enPassantTarget.r === nr && this.enPassantTarget.c === nc)) {
                            moves.push({ r: nr, c: nc });
                        }
                    }
                });
            }
        }

        else if (piece.type === PIECES.KNIGHT) {
            const offsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
            offsets.forEach(([dr, dc]) => {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
                    if (forAttack || !this.board[nr][nc] || this.board[nr][nc].color !== piece.color) {
                        moves.push({ r: nr, c: nc });
                    }
                }
            });
        }

        else if (piece.type === PIECES.KING) {
            const offsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
            offsets.forEach(([dr, dc]) => {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
                    if (forAttack || !this.board[nr][nc] || this.board[nr][nc].color !== piece.color) {
                        moves.push({ r: nr, c: nc });
                    }
                }
            });
        }

        else {
            // Sliders (Bishop, Rook, Queen)
            const directions = [];
            if (piece.type === PIECES.BISHOP || piece.type === PIECES.QUEEN) directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
            if (piece.type === PIECES.ROOK || piece.type === PIECES.QUEEN) directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);

            directions.forEach(([dr, dc]) => {
                let nr = r + dr, nc = c + dc;
                while (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
                    const target = this.board[nr][nc];
                    if (forAttack) {
                        moves.push({ r: nr, c: nc });
                        if (target) break; // Blocked by any piece (friend or foe)
                    } else {
                        if (target) {
                            if (target.color !== piece.color) moves.push({ r: nr, c: nc });
                            break; // Blocked
                        }
                        moves.push({ r: nr, c: nc });
                    }
                    nr += dr;
                    nc += dc;
                }
            });
        }

        return moves;
    }

    _getCastlingMoves(square, piece) {
        const moves = [];
        const row = square.r;

        // Cannot castle if King is in check
        // (Caller already checks this, but safety first)
        // if (this._isKingInCheck(piece.color)) return [];

        if (this.castling[piece.color].k) {
            // Kingside: e1->g1 (needs f1, g1 empty)
            if (!this.board[row][5] && !this.board[row][6]) {
                // Squares e1, f1, g1 must not be attacked
                if (!this._isSquareAttacked(row, 4, piece.color) &&
                    !this._isSquareAttacked(row, 5, piece.color) &&
                    !this._isSquareAttacked(row, 6, piece.color)) {
                    moves.push({ r: row, c: 6 });
                }
            }
        }
        if (this.castling[piece.color].q) {
            // Queenside: e1->c1 (needs d1, c1, b1 empty)
            if (!this.board[row][1] && !this.board[row][2] && !this.board[row][3]) {
                // Squares e1, d1, c1 must not be attacked
                // Note: b1 (row, 1) can be attacked! (Only King path matters)
                if (!this._isSquareAttacked(row, 4, piece.color) &&
                    !this._isSquareAttacked(row, 3, piece.color) &&
                    !this._isSquareAttacked(row, 2, piece.color)) {
                    moves.push({ r: row, c: 2 });
                }
            }
        }
        return moves;
    }

    _isKingInCheck(color) {
        let kingPos;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (p && p.color === color && p.type === PIECES.KING) {
                    kingPos = { r, c };
                    break;
                }
            }
        }
        if (!kingPos) return true; // Should not happen
        return this._isSquareAttacked(kingPos.r, kingPos.c, color);
    }

    _isSquareAttacked(r, c, color) {
        const enemyColor = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const p = this.board[i][j];
                if (p && p.color === enemyColor) {
                    // Check if this enemy piece attacks (r, c)
                    // We use forAttack=true to get control squares (e.g. Pawn diagonals)
                    const moves = this._getPseudoLegalMoves({ r: i, c: j }, p, true);
                    if (moves.some(m => m.r === r && m.c === c)) return true;
                }
            }
        }
        return false;
    }

    _isCheckmate(color) {
        if (!this._isKingInCheck(color)) return false;
        return this._hasNoLegalMoves(color);
    }

    _isStalemate(color) {
        if (this._isKingInCheck(color)) return false;
        return this._hasNoLegalMoves(color);
    }

    _hasNoLegalMoves(color) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (p && p.color === color) {
                    if (this.getValidMoves({ r, c }).length > 0) return false;
                }
            }
        }
        return true;
    }
}
