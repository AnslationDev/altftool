/**
 * Ludo — the rules and the odds, as pure functions.
 *
 * Board model (the standard 15×15 Ludo board this game uses):
 *   • The shared circuit is 52 squares. Each player enters it at their own
 *     start square, so a token's "steps" count is measured from that square.
 *   • Steps 0–50 are on the circuit; the absolute square is
 *     (startSquare + steps) mod 52.
 *   • Steps 51–56 are the six squares of that player's own home column.
 *     A token is finished at exactly step 56, so the final move must be rolled
 *     exactly — overshooting is not allowed.
 *   • A token leaves the yard only on a 6, landing on its start square.
 *   • Landing on an opponent on an unprotected square sends it back to the
 *     yard. The eight starred squares are safe.
 *   • A 6 earns another roll, but three sixes in a row forfeits the whole turn.
 *
 * Pure module: no React, no DOM, no clock reads, no randomness — the dice value
 * is always passed in.
 */

/** Squares on the shared circuit. */
export const TOTAL_CELLS = 52;

/** Tokens each player owns. */
export const TOKENS_PER_PLAYER = 4;

/** Squares in a player's private home column. */
export const HOME_STRETCH_SIZE = 6;

/** Last step index on the shared circuit before the home column. */
export const LAST_CIRCUIT_STEP = TOTAL_CELLS - 2; // 50

/** A token is finished at exactly this step: 51 circuit squares + 6 home. */
export const MAX_PATH_STEPS = LAST_CIRCUIT_STEP + HOME_STRETCH_SIZE; // 56

/** A token still in the yard is recorded as step −1. */
export const IN_YARD = -1;

/** Dice faces. */
export const DICE_MIN = 1;
export const DICE_MAX = 6;

/** Only a 6 releases a token from the yard. */
export const ENTRY_ROLL = 6;

/** Three sixes in a row and the turn is forfeited. */
export const MAX_CONSECUTIVE_SIXES = 3;

/** Start square of each player on the shared circuit. */
export const START_SQUARES = [0, 13, 26, 39];

/** The eight starred squares where a token cannot be captured. */
export const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

const isInt = (value) => Number.isInteger(value);

/** Is this circuit square one of the starred safe squares? */
export function isSafeSquare(square) {
  return SAFE_SQUARES.includes(((square % TOTAL_CELLS) + TOTAL_CELLS) % TOTAL_CELLS);
}

/**
 * Absolute circuit square for a token, or null once it has entered the home
 * column (where squares are private and cannot be shared).
 *
 * @param {number} startSquare the player's entry square
 * @param {number} steps 0–56, or −1 in the yard
 * @returns {number | null}
 */
export function absoluteSquare(startSquare, steps) {
  if (!isInt(startSquare) || !isInt(steps)) return null;
  if (steps < 0 || steps > LAST_CIRCUIT_STEP) return null;
  return (startSquare + steps) % TOTAL_CELLS;
}

/**
 * Every legal move for one player given a dice value.
 *
 * @param {object} input
 * @param {number[]} input.tokens step index per token (−1 = yard, 56 = finished)
 * @param {number} input.diceValue 1–6
 * @param {number} input.startSquare that player's entry square
 * @param {Array<{ playerIndex: number, startSquare: number, tokens: number[] }>} [input.opponents]
 * @returns {{ moves: Array<object>, forced: boolean } | { error: string }}
 */
export function legalMoves({ tokens, diceValue, startSquare, opponents = [] }) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return { error: "Provide the player's token positions." };
  }
  if (!isInt(diceValue) || diceValue < DICE_MIN || diceValue > DICE_MAX) {
    return { error: `The dice value must be a whole number from ${DICE_MIN} to ${DICE_MAX}.` };
  }
  if (!isInt(startSquare) || startSquare < 0 || startSquare >= TOTAL_CELLS) {
    return { error: `The start square must be between 0 and ${TOTAL_CELLS - 1}.` };
  }

  const moves = [];
  tokens.forEach((steps, index) => {
    if (!isInt(steps) || steps > MAX_PATH_STEPS || steps < IN_YARD) return;
    if (steps === MAX_PATH_STEPS) return; // already home

    if (steps === IN_YARD) {
      if (diceValue !== ENTRY_ROLL) return;
      const square = absoluteSquare(startSquare, 0);
      moves.push({
        tokenIndex: index,
        from: IN_YARD,
        to: 0,
        square,
        type: "enter",
        captures: findCaptures(square, opponents),
      });
      return;
    }

    const target = steps + diceValue;
    // The last move must land exactly on step 56.
    if (target > MAX_PATH_STEPS) return;
    const square = absoluteSquare(startSquare, target);
    moves.push({
      tokenIndex: index,
      from: steps,
      to: target,
      square,
      type: target === MAX_PATH_STEPS ? "finish" : target > LAST_CIRCUIT_STEP ? "home-column" : "advance",
      captures: square === null ? [] : findCaptures(square, opponents),
    });
  });

  return { moves, forced: moves.length === 1 };
}

/**
 * Opponent tokens that a landing would send back to the yard.
 * Nothing is captured on a starred safe square.
 *
 * @param {number | null} square absolute circuit square being landed on
 * @param {Array<{ playerIndex: number, startSquare: number, tokens: number[] }>} opponents
 * @returns {Array<{ playerIndex: number, tokenIndex: number }>}
 */
export function findCaptures(square, opponents = []) {
  if (square === null || !isInt(square) || isSafeSquare(square)) return [];
  const captured = [];
  for (const opponent of opponents) {
    (opponent.tokens ?? []).forEach((steps, tokenIndex) => {
      if (absoluteSquare(opponent.startSquare, steps) === square) {
        captured.push({ playerIndex: opponent.playerIndex, tokenIndex });
      }
    });
  }
  return captured;
}

/**
 * Apply a move and report what happened. Returns new arrays; nothing is
 * mutated.
 *
 * @param {object} input
 * @param {number[]} input.tokens
 * @param {object} input.move one entry from legalMoves
 * @returns {{ tokens: number[], finished: number, extraTurn: boolean, captured: number } | { error: string }}
 */
export function applyMove({ tokens, move, diceValue }) {
  if (!Array.isArray(tokens) || !move || !isInt(move.tokenIndex)) {
    return { error: "Provide the token positions and the move to apply." };
  }
  if (move.tokenIndex < 0 || move.tokenIndex >= tokens.length) {
    return { error: "That token does not exist." };
  }
  const next = [...tokens];
  next[move.tokenIndex] = move.to;
  const captured = (move.captures ?? []).length;
  return {
    tokens: next,
    finished: next.filter((steps) => steps === MAX_PATH_STEPS).length,
    // A six, a capture or getting a token home all earn another roll.
    extraTurn: diceValue === ENTRY_ROLL || captured > 0 || move.type === "finish",
    captured,
  };
}

/** True once all of a player's tokens have reached step 56. */
export function hasWon(tokens) {
  return (
    Array.isArray(tokens) &&
    tokens.length > 0 &&
    tokens.every((steps) => steps === MAX_PATH_STEPS)
  );
}

/* ------------------------------------------------------------------- odds */

/**
 * Probability of rolling at least one 6 in n rolls: 1 − (5/6)^n.
 *
 * @param {number} rolls
 * @returns {{ probability: number, percent: number } | { error: string }}
 */
export function chanceOfSix(rolls) {
  if (!isInt(rolls) || rolls < 0) return { error: "Enter a whole number of rolls, zero or more." };
  if (rolls > 1000) return { error: "Keep it under 1,000 rolls — the answer is already 100%." };
  const probability = 1 - Math.pow(5 / 6, rolls);
  return { probability, percent: probability * 100 };
}

/** Expected rolls to get a token out of the yard: 1 / (1/6) = 6. */
export const EXPECTED_ROLLS_TO_ENTER = DICE_MAX;

/** Probability of three sixes in a row, which forfeits the turn: (1/6)³. */
export const CHANCE_OF_FORFEIT = Math.pow(1 / DICE_MAX, MAX_CONSECUTIVE_SIXES);

/**
 * Expected squares moved per turn, allowing for the extra roll after a 6 and
 * the forfeit on three sixes.
 *
 *   E = (5/6)·3  +  (1/6)(5/6)·9  +  (1/6)²(5/6)·15  +  (1/6)³·0
 *
 * where 3 is the mean of a non-six face and each bracket adds the sixes
 * already rolled. Works out to 4.0972 squares per turn.
 *
 * @returns {number}
 */
export function expectedSquaresPerTurn() {
  const pNonSix = (DICE_MAX - 1) / DICE_MAX;
  const meanNonSix = (1 + 2 + 3 + 4 + 5) / 5;
  const pSix = 1 / DICE_MAX;
  let expected = 0;
  for (let sixes = 0; sixes < MAX_CONSECUTIVE_SIXES; sixes += 1) {
    expected += Math.pow(pSix, sixes) * pNonSix * (sixes * DICE_MAX + meanNonSix);
  }
  return expected; // the three-six branch contributes zero
}

/**
 * Rough number of turns to walk one token the full 56 steps, ignoring captures
 * and the exact-roll finish.
 *
 * @returns {number}
 */
export function expectedTurnsPerToken() {
  return MAX_PATH_STEPS / expectedSquaresPerTurn();
}

/** The odds table shown next to the board. */
export function buildOddsTable(maxRolls = 6) {
  const rows = [];
  for (let rolls = 1; rolls <= maxRolls; rolls += 1) {
    const result = chanceOfSix(rolls);
    if (result.error) break;
    rows.push({ rolls, percent: result.percent });
  }
  return rows;
}
