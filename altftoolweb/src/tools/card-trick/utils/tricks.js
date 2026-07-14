// Pure trick engines. Each function returns the next slice of state for a
// trick step — no React, no side effects — so the page can drive a phase
// machine and the logic stays testable.

import { dealSpread, randomCard, sampleDistinct } from "./deck";

// ---- Pick a Card -----------------------------------------------------------
// Show a fan of face-up cards; player memorises one, cards flip down, then
// the player's chosen card is revealed. Returns the spread to render.
export function startPickTrick(deck, count = 7) {
  return {
    step: "memorize",
    spread: dealSpread(shuffle(deck), count),
    chosenId: null,
  };
}

// ---- Prediction (forced-card mind reading) --------------------------------
// We choose a prediction up front, then "force" it onto whatever slot the
// player picks — the classic magician's force. Returns the prediction card
// plus an initial face-down spread that deliberately excludes it.
export function startPredictTrick(deck, count = 6) {
  const prediction = randomCard(deck);
  // Build a spread that does NOT already contain the prediction, so the
  // reveal feels earned when the forced card appears at the picked slot.
  let spread = sampleDistinct(deck, count, prediction.id);
  if (spread.length < count) {
    // fallback: allow duplicates if deck too small (never happens with 52)
    spread = dealSpread(deck, count);
  }
  return {
    step: "choose",
    prediction,
    spread,
    chosenId: null,
  };
}

// Force the prediction into the chosen slot and return the resolved spread.
export function forceCard(state, chosenId) {
  const idx = state.spread.findIndex((c) => c.id === chosenId);
  if (idx === -1) return state;
  const spread = state.spread.slice();
  spread[idx] = state.prediction;
  return { ...state, spread, chosenId, step: "reveal" };
}

// ---- Memory / recall --------------------------------------------------------
// Show one target card briefly, then hide it among decoys.
export function startMemoryTrick(deck, gridCount = 8) {
  const target = randomCard(deck);
  const decoys = sampleDistinct(deck, gridCount - 1, target.id);
  const grid = shuffle([target, ...decoys]);
  return {
    step: "show",
    target,
    grid,
    attempts: 0,
    solved: false,
  };
}

// Player taps a card in the memory grid.
export function guessMemory(state, cardId) {
  const solved = state.target.id === cardId;
  return {
    ...state,
    attempts: state.attempts + 1,
    solved,
    step: solved ? "win" : "miss",
    chosenId: cardId,
  };
}
