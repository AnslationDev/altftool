"use client";

// hooks/useChessGame.js
// Central game-state hook for Chess Multiplayer.
//
// This hook owns ALL game state via a reducer (useReducer) and exposes a clean
// dispatch API. It is deliberately transport-agnostic: to make this a real
// networked multiplayer (two devices, not pass-and-play) you would only replace
// the local dispatch calls with calls to a transport layer (e.g. Firebase
// Realtime Database / Firestore / WebSocket). The reducer shape (`chess`,
// `history`, `clocks`, `status`, `pendingPromotion`, `drawOffer`) maps directly
// onto a serialisable game snapshot that both clients could share, and every
// action below is a pure state transition that can be applied identically on
// both ends.
//
//   Network multiplayer wiring point (illustrative):
//     const send = (action) => transportRef.current.send(action);
//     // call send(...) instead of dispatch(...) for player-initiated moves,
//     // and subscribe to incoming actions to dispatch them locally.
//   The read-only <Board> renderer already takes `chess` as a prop, so a
//   spectator view is just <Board chess={snapshot} spectator /> with no
//   interactive handlers.

import { useReducer, useEffect, useRef, useCallback } from "react";
import {
  initialState,
  legalMoves,
  applyMove,
  allLegalMoves,
  gameStatus,
  toSAN,
  positionKey,
} from "../engine/chess";

const START_CLOCK = { w: 0, b: 0 }; // seconds, set from time control

function computeStatus(chess, positionCounts) {
  const legal = allLegalMoves(chess);
  return gameStatus(chess, positionCounts[positionKey(chess)] || 0);
}

function reducer(state, action) {
  switch (action.type) {
    case "INIT": {
      const chess = initialState();
      // A time control of 0 seconds means "Unlimited" (no clock), not an
      // already-expired clock. Track that explicitly so TICK can skip the
      // countdown/forfeit logic entirely for unlimited games.
      const unlimited = action.timeControl === 0;
      return {
        ...state,
        phase: "playing",
        chess,
        history: [],
        positionCounts: { [positionKey(chess)]: 1 },
        selected: null,
        legalForSelected: [],
        pendingPromotion: null,
        lastMove: null,
        status: computeStatus(chess, { [positionKey(chess)]: 1 }),
        result: null,
        resultReason: null,
        drawOffer: null,
        unlimited,
        timeControl: action.timeControl,
        clocks: { w: action.timeControl, b: action.timeControl },
      };
    }

    case "SELECT": {
      if (state.phase !== "playing") return state;
      const sq = action.sq;
      const piece = state.chess.board[sq];
      // toggle off if same square clicked
      if (state.selected === sq) {
        return { ...state, selected: null, legalForSelected: [] };
      }
      // if clicking a legal destination of the currently selected piece -> move
      if (state.selected != null) {
        const targets = state.legalForSelected.filter((m) => m.to === sq);
        if (targets.length) {
          const promo = targets.find((m) => m.promotion);
          if (promo) return setPendingPromotion(state, promo);
          return applyAndRecord(state, targets[0]);
        }
      }
      // otherwise (re)select own piece
      if (piece && piece.c === state.chess.turn) {
        return {
          ...state,
          selected: sq,
          legalForSelected: legalMoves(state.chess, sq),
        };
      }
      return { ...state, selected: null, legalForSelected: [] };
    }

    case "PROMOTION_PICK": {
      if (!state.pendingPromotion) return state;
      const base = state.pendingPromotion.base;
      const move = { ...base, promotion: action.piece };
      return applyAndRecord({ ...state, pendingPromotion: null }, move);
    }

    case "CANCEL_PROMOTION":
      return { ...state, pendingPromotion: null };

    case "TICK": {
      if (state.phase !== "playing" || state.result || state.unlimited) return state;
      const turn = state.chess.turn;
      const remaining = state.clocks[turn] - action.delta;
      if (remaining <= 0) {
        return {
          ...state,
          clocks: { ...state.clocks, [turn]: 0 },
          result: turn === "w" ? "b" : "w",
          resultReason: "Time forfeit",
        };
      }
      return {
        ...state,
        clocks: { ...state.clocks, [turn]: remaining },
      };
    }

    case "RESIGN": {
      if (state.phase !== "playing") return state;
      const loser = action.color;
      return {
        ...state,
        result: loser === "w" ? "b" : "w",
        resultReason: (loser === "w" ? "White" : "Black") + " resigned",
      };
    }

    case "OFFER_DRAW": {
      if (state.phase !== "playing" || state.drawOffer) return state;
      return { ...state, drawOffer: { from: action.color } };
    }

    case "ACCEPT_DRAW": {
      if (!state.drawOffer) return state;
      return {
        ...state,
        result: "draw",
        resultReason: "Draw by agreement",
        drawOffer: null,
      };
    }

    case "DECLINE_DRAW":
      return { ...state, drawOffer: null };

    default:
      return state;
  }
}

// Apply a fully-specified move to the state, record SAN history, update
// repetition counts, status and last-move highlight.
function setPendingPromotion(state, promo) {
  const base = {
    from: promo.from,
    to: promo.to,
    piece: promo.piece,
    color: promo.color,
    capture: promo.capture,
    enPassant: promo.enPassant,
    castling: promo.castling,
    promotion: null,
  };
  return {
    ...state,
    pendingPromotion: { base },
    selected: null,
    legalForSelected: [],
  };
}

function applyAndRecord(state, move) {
  const legalAll = allLegalMoves(state.chess);
  const san = toSAN(move, legalAll);
  const nextChess = applyMove(state.chess, move);

  const counts = { ...state.positionCounts };
  const key = positionKey(nextChess);
  counts[key] = (counts[key] || 0) + 1;

  const historyEntry = {
    san,
    from: move.from,
    to: move.to,
    color: move.color,
    piece: move.piece,
    captured: move.enPassant
      ? { t: "p", c: move.color === "w" ? "b" : "w" }
      : move.capture
      ? { t: move.capture, c: move.color === "w" ? "b" : "w" }
      : null,
    promotion: move.promotion,
  };

  const status = computeStatus(nextChess, counts);
  const finished = status.checkmate || status.draw;

  return {
    ...state,
    chess: nextChess,
    history: [...state.history, historyEntry],
    positionCounts: counts,
    selected: null,
    legalForSelected: [],
    lastMove: { from: move.from, to: move.to },
    status,
    result: finished
      ? status.checkmate
        ? move.color === "w" ? "w" : "b"
        : "draw"
      : null,
    resultReason: finished
      ? status.checkmate
        ? "Checkmate"
        : status.drawReason
      : null,
    // If the move is a pawn reaching the last rank but no promotion was set
    // (UI path), capture the pending promotion so the modal can resolve it.
    pendingPromotion: move.promotion
      ? null
      : (move.piece === "p" && ((move.color === "w" && move.to >= 56) || (move.color === "b" && move.to <= 7)))
        ? { base: move }
        : null,
  };
}

const initialReducerState = {
  phase: "setup", // setup | playing | finished
  chess: initialState(),
  history: [],
  positionCounts: {},
  selected: null,
  legalForSelected: [],
  pendingPromotion: null,
  lastMove: null,
  status: { inCheck: false, checkmate: false, stalemate: false, draw: false, drawReason: null, winner: null, legalCount: 0 },
  result: null,
  resultReason: null,
  drawOffer: null,
  unlimited: false,
  timeControl: 0,
  clocks: { ...START_CLOCK },
};

export function useChessGame() {
  const [state, dispatch] = useReducer(reducer, initialReducerState);
  const lastTick = useRef(null);

  // Timer loop: ticks only while the game is active. A real-time transport
  // would sync these clocks from the server so both players see identical time.
  useEffect(() => {
    if (state.phase !== "playing" || state.result) {
      lastTick.current = Date.now();
      return undefined;
    }
    const id = setInterval(() => {
      const now = Date.now();
      if (lastTick.current == null) lastTick.current = now;
      const delta = (now - lastTick.current) / 1000;
      lastTick.current = now;
      dispatch({ type: "TICK", delta });
    }, 200);
    return () => clearInterval(id);
  }, [state.phase, state.result]);

  const startGame = useCallback((timeControlSeconds) => {
    lastTick.current = Date.now();
    dispatch({ type: "INIT", timeControl: timeControlSeconds });
  }, []);

  const selectSquare = useCallback((sq) => dispatch({ type: "SELECT", sq }), []);
  const pickPromotion = useCallback((piece) => dispatch({ type: "PROMOTION_PICK", piece }), []);
  const cancelPromotion = useCallback(() => dispatch({ type: "CANCEL_PROMOTION" }), []);
  const resign = useCallback((color) => dispatch({ type: "RESIGN", color }), []);
  const offerDraw = useCallback((color) => dispatch({ type: "OFFER_DRAW", color }), []);
  const acceptDraw = useCallback(() => dispatch({ type: "ACCEPT_DRAW" }), []);
  const declineDraw = useCallback(() => dispatch({ type: "DECLINE_DRAW" }), []);

  return {
    state,
    startGame,
    selectSquare,
    pickPromotion,
    cancelPromotion,
    resign,
    offerDraw,
    acceptDraw,
    declineDraw,
  };
}
