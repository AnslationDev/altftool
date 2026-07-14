// engine/chess.js
// Pure, framework-agnostic chess engine.
// Board is a flat array of 64 squares. Index = rank * 8 + file.
//   rank 0 => rank "1" (white back rank side), file 0 => file "a".
//   a1 = 0, h1 = 7, a8 = 56, h8 = 63.
// Each square is null or { t: 'p'|'n'|'b'|'r'|'q'|'k', c: 'w'|'b' }.
// This module is intentionally free of any React / DOM dependency so it can be
// unit-tested in isolation and reused by a future network transport layer.

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
export const WHITE = "w";
export const BLACK = "b";

export const fileOf = (sq) => sq % 8;
export const rankOf = (sq) => Math.floor(sq / 8);
export const squareIndex = (file, rank) => rank * 8 + file;
export const inBounds = (file, rank) => file >= 0 && file < 8 && rank >= 0 && rank < 8;
export const squareName = (sq) => FILES[fileOf(sq)] + (rankOf(sq) + 1);
export const nameToIndex = (name) => {
  const file = FILES.indexOf(name[0]);
  const rank = parseInt(name[1], 10) - 1;
  return squareIndex(file, rank);
};

const cloneBoard = (board) =>
  board.map((p) => (p ? { t: p.t, c: p.c } : null));

const cloneState = (state) => ({
  board: cloneBoard(state.board),
  turn: state.turn,
  castling: { ...state.castling },
  enPassant: state.enPassant,
  halfmove: state.halfmove,
  fullmove: state.fullmove,
});

export function initialState() {
  const board = new Array(64).fill(null);
  const back = ["r", "n", "b", "q", "k", "b", "n", "r"];
  for (let f = 0; f < 8; f++) {
    board[squareIndex(f, 0)] = { t: back[f], c: WHITE };
    board[squareIndex(f, 1)] = { t: "p", c: WHITE };
    board[squareIndex(f, 6)] = { t: "p", c: BLACK };
    board[squareIndex(f, 7)] = { t: back[f], c: BLACK };
  }
  return {
    board,
    turn: WHITE,
    castling: { wK: true, wQ: true, bK: true, bQ: true },
    enPassant: null,
    halfmove: 0,
    fullmove: 1,
  };
}

// ---- Attack detection -------------------------------------------------------

const KNIGHT_DELTAS = [
  [1, 2], [2, 1], [2, -1], [1, -2],
  [-1, -2], [-2, -1], [-2, 1], [-1, 2],
];
const KING_DELTAS = [
  [1, 0], [1, 1], [0, 1], [-1, 1],
  [-1, 0], [-1, -1], [0, -1], [1, -1],
];
const BISHOP_DIRS = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const ROOK_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// Is `sq` attacked by any piece of color `byColor`?
export function isSquareAttacked(state, sq, byColor) {
  const bf = fileOf(sq);
  const br = rankOf(sq);
  const board = state.board;

  // Pawn attacks: a pawn attacks diagonally forward. A white pawn sits one rank
  // below the attacked square and a black pawn one rank above.
  if (byColor === WHITE) {
    for (const df of [-1, 1]) {
      const f = bf + df;
      const r = br - 1;
      if (inBounds(f, r)) {
        const p = board[squareIndex(f, r)];
        if (p && p.c === WHITE && p.t === "p") return true;
      }
    }
  } else {
    for (const df of [-1, 1]) {
      const f = bf + df;
      const r = br + 1;
      if (inBounds(f, r)) {
        const p = board[squareIndex(f, r)];
        if (p && p.c === BLACK && p.t === "p") return true;
      }
    }
  }

  // Knight attacks
  for (const [df, dr] of KNIGHT_DELTAS) {
    const f = bf + df;
    const r = br + dr;
    if (inBounds(f, r)) {
      const p = board[squareIndex(f, r)];
      if (p && p.c === byColor && p.t === "n") return true;
    }
  }

  // King attacks
  for (const [df, dr] of KING_DELTAS) {
    const f = bf + df;
    const r = br + dr;
    if (inBounds(f, r)) {
      const p = board[squareIndex(f, r)];
      if (p && p.c === byColor && p.t === "k") return true;
    }
  }

  // Sliding pieces (bishop/queen on diagonals, rook/queen on ranks/files)
  for (const [df, dr] of BISHOP_DIRS) {
    let f = bf + df;
    let r = br + dr;
    while (inBounds(f, r)) {
      const p = board[squareIndex(f, r)];
      if (p) {
        if (p.c === byColor && (p.t === "b" || p.t === "q")) return true;
        break;
      }
      f += df;
      r += dr;
    }
  }
  for (const [df, dr] of ROOK_DIRS) {
    let f = bf + df;
    let r = br + dr;
    while (inBounds(f, r)) {
      const p = board[squareIndex(f, r)];
      if (p) {
        if (p.c === byColor && (p.t === "r" || p.t === "q")) return true;
        break;
      }
      f += df;
      r += dr;
    }
  }

  return false;
}

export function findKing(board, color) {
  for (let sq = 0; sq < 64; sq++) {
    const p = board[sq];
    if (p && p.t === "k" && p.c === color) return sq;
  }
  return -1;
}

const kingAttacked = (state, color) => {
  const ksq = findKing(state.board, color);
  if (ksq < 0) return false;
  return isSquareAttacked(state, ksq, color === WHITE ? BLACK : WHITE);
};

// ---- Pseudo-legal move generation ------------------------------------------

function addPawnMove(moves, move) {
  // Promotion handling: a pawn reaching the last rank generates 4 moves.
  const promoRank = move.color === WHITE ? 7 : 0;
  if (rankOf(move.to) === promoRank) {
    for (const promo of ["q", "r", "b", "n"]) {
      moves.push({ ...move, promotion: promo });
    }
  } else {
    moves.push(move);
  }
}

function generatePseudoMoves(state, sq) {
  const piece = state.board[sq];
  if (!piece) return [];
  const moves = [];
  const board = state.board;
  const f = fileOf(sq);
  const r = rankOf(sq);
  const me = piece.c;
  const opp = me === WHITE ? BLACK : WHITE;

  const push = (to, extra = {}) => {
    const captured = board[to];
    if (captured && captured.c === me) return; // can't capture own piece
    moves.push({
      from: sq,
      to,
      piece: piece.t,
      color: me,
      capture: captured ? captured.t : null,
      promotion: null,
      enPassant: false,
      castling: null,
      ...extra,
    });
  };

  switch (piece.t) {
    case "p": {
      const dir = me === WHITE ? 1 : -1;
      const startRank = me === WHITE ? 1 : 6;
      const oneR = r + dir;
      // single push
      if (inBounds(f, oneR) && !board[squareIndex(f, oneR)]) {
        addPawnMove(moves, {
          from: sq, to: squareIndex(f, oneR), piece: "p", color: me,
          capture: null, promotion: null, enPassant: false, castling: null,
        });
        // double push
        const twoR = r + dir * 2;
        if (r === startRank && !board[squareIndex(f, twoR)]) {
          moves.push({
            from: sq, to: squareIndex(f, twoR), piece: "p", color: me,
            capture: null, promotion: null, enPassant: false, castling: null,
            doublePush: true,
          });
        }
      }
      // captures
      for (const df of [-1, 1]) {
        const cf = f + df;
        const cr = r + dir;
        if (!inBounds(cf, cr)) continue;
        const to = squareIndex(cf, cr);
        const target = board[to];
        if (target && target.c === opp) {
          addPawnMove(moves, {
            from: sq, to, piece: "p", color: me,
            capture: target.t, promotion: null, enPassant: false, castling: null,
          });
        } else if (state.enPassant === to) {
          addPawnMove(moves, {
            from: sq, to, piece: "p", color: me,
            capture: "p", promotion: null, enPassant: true, castling: null,
          });
        }
      }
      break;
    }
    case "n": {
      for (const [df, dr] of KNIGHT_DELTAS) {
        const nf = f + df;
        const nr = r + dr;
        if (inBounds(nf, nr)) push(squareIndex(nf, nr));
      }
      break;
    }
    case "k": {
      for (const [df, dr] of KING_DELTAS) {
        const nf = f + df;
        const nr = r + dr;
        if (inBounds(nf, nr)) push(squareIndex(nf, nr));
      }
      // castling
      if (me === WHITE) {
        if (state.castling.wK && !board[squareIndex(5, 0)] && !board[squareIndex(6, 0)] &&
            board[squareIndex(7, 0)] && board[squareIndex(7, 0)].t === "r" && board[squareIndex(7, 0)].c === WHITE) {
          if (!isSquareAttacked(state, sq, opp) && !isSquareAttacked(state, squareIndex(5, 0), opp) &&
              !isSquareAttacked(state, squareIndex(6, 0), opp)) {
            moves.push({ from: sq, to: squareIndex(6, 0), piece: "k", color: me, capture: null, promotion: null, enPassant: false, castling: "K" });
          }
        }
        if (state.castling.wQ && !board[squareIndex(3, 0)] && !board[squareIndex(2, 0)] && !board[squareIndex(1, 0)] &&
            board[squareIndex(0, 0)] && board[squareIndex(0, 0)].t === "r" && board[squareIndex(0, 0)].c === WHITE) {
          if (!isSquareAttacked(state, sq, opp) && !isSquareAttacked(state, squareIndex(3, 0), opp) &&
              !isSquareAttacked(state, squareIndex(2, 0), opp)) {
            moves.push({ from: sq, to: squareIndex(2, 0), piece: "k", color: me, capture: null, promotion: null, enPassant: false, castling: "Q" });
          }
        }
      } else {
        if (state.castling.bK && !board[squareIndex(5, 7)] && !board[squareIndex(6, 7)] &&
            board[squareIndex(7, 7)] && board[squareIndex(7, 7)].t === "r" && board[squareIndex(7, 7)].c === BLACK) {
          if (!isSquareAttacked(state, sq, opp) && !isSquareAttacked(state, squareIndex(5, 7), opp) &&
              !isSquareAttacked(state, squareIndex(6, 7), opp)) {
            moves.push({ from: sq, to: squareIndex(6, 7), piece: "k", color: me, capture: null, promotion: null, enPassant: false, castling: "k" });
          }
        }
        if (state.castling.bQ && !board[squareIndex(3, 7)] && !board[squareIndex(2, 7)] && !board[squareIndex(1, 7)] &&
            board[squareIndex(0, 7)] && board[squareIndex(0, 7)].t === "r" && board[squareIndex(0, 7)].c === BLACK) {
          if (!isSquareAttacked(state, sq, opp) && !isSquareAttacked(state, squareIndex(3, 7), opp) &&
              !isSquareAttacked(state, squareIndex(2, 7), opp)) {
            moves.push({ from: sq, to: squareIndex(2, 7), piece: "k", color: me, capture: null, promotion: null, enPassant: false, castling: "q" });
          }
        }
      }
      break;
    }
    case "b": {
      for (const [df, dr] of BISHOP_DIRS) {
        let nf = f + df, nr = r + dr;
        while (inBounds(nf, nr)) {
          const to = squareIndex(nf, nr);
          const target = board[to];
          if (!target) { push(to); }
          else { if (target.c === opp) push(to); break; }
          nf += df; nr += dr;
        }
      }
      break;
    }
    case "r": {
      for (const [df, dr] of ROOK_DIRS) {
        let nf = f + df, nr = r + dr;
        while (inBounds(nf, nr)) {
          const to = squareIndex(nf, nr);
          const target = board[to];
          if (!target) { push(to); }
          else { if (target.c === opp) push(to); break; }
          nf += df; nr += dr;
        }
      }
      break;
    }
    case "q": {
      for (const [df, dr] of [...BISHOP_DIRS, ...ROOK_DIRS]) {
        let nf = f + df, nr = r + dr;
        while (inBounds(nf, nr)) {
          const to = squareIndex(nf, nr);
          const target = board[to];
          if (!target) { push(to); }
          else { if (target.c === opp) push(to); break; }
          nf += df; nr += dr;
        }
      }
      break;
    }
    default:
      break;
  }
  return moves;
}

// ---- Apply move -------------------------------------------------------------

export function applyMove(state, move) {
  const next = cloneState(state);
  const board = next.board;
  const piece = board[move.from];
  const color = piece.c;
  const opp = color === WHITE ? BLACK : WHITE;

  board[move.to] = { t: move.promotion || piece.t, c: color };
  board[move.from] = null;

  // en passant capture
  if (move.enPassant) {
    const capSq = squareIndex(fileOf(move.to), rankOf(move.from));
    board[capSq] = null;
  }

  // castling rook movement
  if (move.castling) {
    if (move.castling === "K") { board[squareIndex(5, 0)] = board[squareIndex(7, 0)]; board[squareIndex(7, 0)] = null; }
    else if (move.castling === "Q") { board[squareIndex(3, 0)] = board[squareIndex(0, 0)]; board[squareIndex(0, 0)] = null; }
    else if (move.castling === "k") { board[squareIndex(5, 7)] = board[squareIndex(7, 7)]; board[squareIndex(7, 7)] = null; }
    else if (move.castling === "q") { board[squareIndex(3, 7)] = board[squareIndex(0, 7)]; board[squareIndex(0, 7)] = null; }
  }

  // update castling rights
  const touch = (sq) => {
    if (sq === squareIndex(0, 0) || sq === squareIndex(4, 0)) next.castling.wQ = false;
    if (sq === squareIndex(7, 0) || sq === squareIndex(4, 0)) next.castling.wK = false;
    if (sq === squareIndex(0, 7) || sq === squareIndex(4, 7)) next.castling.bQ = false;
    if (sq === squareIndex(7, 7) || sq === squareIndex(4, 7)) next.castling.bK = false;
  };
  touch(move.from);
  touch(move.to);

  // en passant target square
  if (move.doublePush) {
    next.enPassant = squareIndex(fileOf(move.to), (rankOf(move.from) + rankOf(move.to)) / 2);
  } else {
    next.enPassant = null;
  }

  // halfmove clock (50-move rule)
  if (piece.t === "p" || move.capture) next.halfmove = 0;
  else next.halfmove += 1;

  if (color === BLACK) next.fullmove += 1;
  next.turn = opp;

  return next;
}

// ---- Legal move API ---------------------------------------------------------

// Returns the list of fully legal moves for the piece on `sq`.
export function legalMoves(state, sq) {
  const piece = state.board[sq];
  if (!piece || piece.c !== state.turn) return [];
  const pseudo = generatePseudoMoves(state, sq);
  const legal = [];
  for (const m of pseudo) {
    const after = applyMove(state, m);
    if (!kingAttacked(after, piece.c)) legal.push(m);
  }
  return legal;
}

// All legal moves for the side to move.
export function allLegalMoves(state) {
  const moves = [];
  for (let sq = 0; sq < 64; sq++) {
    const p = state.board[sq];
    if (p && p.c === state.turn) {
      moves.push(...legalMoves(state, sq));
    }
  }
  return moves;
}

// ---- Status / termination ---------------------------------------------------

function insufficientMaterial(board) {
  const minors = { w: [], b: [] };
  let pawnsOrMajors = false;
  for (let sq = 0; sq < 64; sq++) {
    const p = board[sq];
    if (!p) continue;
    if (p.t === "p" || p.t === "r" || p.t === "q") pawnsOrMajors = true;
    if (p.t === "n" || p.t === "b") minors[p.c].push({ t: p.t, sq });
  }
  if (pawnsOrMajors) return false;
  const total = minors.w.length + minors.b.length;
  if (total <= 1) return true; // K vs K, K + minor vs K
  if (total === 2) {
    // K+B vs K+B with bishops on the same colour square is a draw.
    const all = [...minors.w, ...minors.b];
    if (all.every((m) => m.t === "b")) {
      const c0 = (fileOf(all[0].sq) + rankOf(all[0].sq)) % 2;
      const c1 = (fileOf(all[1].sq) + rankOf(all[1].sq)) % 2;
      if (c0 === c1) return true;
    }
  }
  return false;
}

// positionKey identifies a board position for threefold-repetition.
export function positionKey(state) {
  let s = "";
  for (let sq = 0; sq < 64; sq++) {
    const p = state.board[sq];
    s += p ? (p.c === WHITE ? p.t.toUpperCase() : p.t) : ".";
  }
  s += "|" + state.turn;
  s += "|" + (state.castling.wK ? "K" : "") + (state.castling.wQ ? "Q" : "") +
       (state.castling.bK ? "k" : "") + (state.castling.bQ ? "q" : "");
  s += "|" + (state.enPassant == null ? "-" : squareName(state.enPassant));
  return s;
}

// gameStatus: analyse the current state.
// Returns { inCheck, checkmate, stalemate, draw, drawReason, winner, legalCount }
export function gameStatus(state, repetitionCount = 1) {
  const moves = allLegalMoves(state);
  const inCheck = kingAttacked(state, state.turn);
  const checkmate = inCheck && moves.length === 0;
  const stalemate = !inCheck && moves.length === 0;

  let draw = false;
  let drawReason = null;
  if (stalemate) { draw = true; drawReason = "Stalemate"; }
  else if (insufficientMaterial(state.board)) { draw = true; drawReason = "Insufficient material"; }
  else if (state.halfmove >= 100) { draw = true; drawReason = "50-move rule"; }
  else if (repetitionCount >= 3) { draw = true; drawReason = "Threefold repetition"; }

  const winner = checkmate ? (state.turn === WHITE ? BLACK : WHITE) : null;
  return { inCheck, checkmate, stalemate, draw, drawReason, winner, legalCount: moves.length };
}

// ---- SAN (algebraic notation) ----------------------------------------------

const PIECE_LETTER = { n: "N", b: "B", r: "R", q: "Q", k: "K" };

// Build SAN for a move given the list of all legal moves in the position
// (so we can produce correct disambiguation).
export function toSAN(move, legalAll) {
  if (move.castling === "K") return "O-O";
  if (move.castling === "Q") return "O-O-O";
  if (move.castling === "k") return "O-O";
  if (move.castling === "q") return "O-O-O";

  let san = "";
  if (move.piece === "p") {
    if (move.capture) san += FILES[fileOf(move.from)] + "x";
    san += squareName(move.to);
    if (move.promotion) san += "=" + PIECE_LETTER[move.promotion];
  } else {
    san += PIECE_LETTER[move.piece];
    // disambiguation
    const sameType = legalAll.filter(
      (m) => m.piece === move.piece && m.to === move.to && m.from !== move.from
    );
    if (sameType.length > 0) {
      const sameFile = sameType.some((m) => fileOf(m.from) === fileOf(move.from));
      const sameRank = sameType.some((m) => rankOf(m.from) === rankOf(move.from));
      if (!sameFile) san += FILES[fileOf(move.from)];
      else if (!sameRank) san += rankOf(move.from) + 1;
      else san += squareName(move.from);
    }
    if (move.capture) san += "x";
    san += squareName(move.to);
  }
  return san;
}

export const PIECE_GLYPH = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
};
