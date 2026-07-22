export const COLORS = {
    WHITE: 'w',
    BLACK: 'b'
};

export const PIECES = {
    PAWN: 'p',
    KNIGHT: 'n',
    BISHOP: 'b',
    ROOK: 'r',
    QUEEN: 'q',
    KING: 'k'
};

// Standard FEN representation or simple 2D array
// Using 2D array of objects { type: 'p', color: 'w' } or null
export const INITIAL_BOARD = [
    [
        { type: PIECES.ROOK, color: COLORS.BLACK },
        { type: PIECES.KNIGHT, color: COLORS.BLACK },
        { type: PIECES.BISHOP, color: COLORS.BLACK },
        { type: PIECES.QUEEN, color: COLORS.BLACK },
        { type: PIECES.KING, color: COLORS.BLACK },
        { type: PIECES.BISHOP, color: COLORS.BLACK },
        { type: PIECES.KNIGHT, color: COLORS.BLACK },
        { type: PIECES.ROOK, color: COLORS.BLACK }
    ],
    Array(8).fill({ type: PIECES.PAWN, color: COLORS.BLACK }),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill({ type: PIECES.PAWN, color: COLORS.WHITE }),
    [
        { type: PIECES.ROOK, color: COLORS.WHITE },
        { type: PIECES.KNIGHT, color: COLORS.WHITE },
        { type: PIECES.BISHOP, color: COLORS.WHITE },
        { type: PIECES.QUEEN, color: COLORS.WHITE },
        { type: PIECES.KING, color: COLORS.WHITE },
        { type: PIECES.BISHOP, color: COLORS.WHITE },
        { type: PIECES.KNIGHT, color: COLORS.WHITE },
        { type: PIECES.ROOK, color: COLORS.WHITE }
    ]
];
