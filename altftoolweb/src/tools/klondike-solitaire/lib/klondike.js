// Pure Klondike solitaire rules and state transitions. Every mutating helper
// returns a brand-new state object so previous states can be kept for undo.

export const SUITS = ["spades", "hearts", "diamonds", "clubs"];

export const SUIT_GLYPHS = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
};

export const RANK_LABELS = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export function isRed(suit) {
  return suit === "hearts" || suit === "diamonds";
}

export function cardLabel(card) {
  return `${RANK_LABELS[card.rank]} of ${card.suit}`;
}

function makeDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank += 1) {
      deck.push({ id: `${suit}-${rank}`, suit, rank, faceUp: false });
    }
  }
  return deck;
}

function shuffle(deck) {
  const cards = [...deck];
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export function deal(drawMode) {
  const deck = shuffle(makeDeck());
  const tableau = [];
  let cursor = 0;
  for (let pileIndex = 0; pileIndex < 7; pileIndex += 1) {
    const size = pileIndex + 1;
    const pile = deck
      .slice(cursor, cursor + size)
      .map((card, i) => ({ ...card, faceUp: i === size - 1 }));
    cursor += size;
    tableau.push(pile);
  }
  return {
    stock: deck.slice(cursor).map((card) => ({ ...card, faceUp: false })),
    waste: [],
    foundations: [[], [], [], []],
    tableau,
    score: 0,
    moves: 0,
    drawMode,
  };
}

function cloneState(state) {
  return {
    ...state,
    stock: [...state.stock],
    waste: [...state.waste],
    foundations: state.foundations.map((pile) => [...pile]),
    tableau: state.tableau.map((pile) => [...pile]),
  };
}

export function canDropOnFoundation(card, pile) {
  if (!card) return false;
  if (pile.length === 0) return card.rank === 1;
  const top = pile[pile.length - 1];
  return top.suit === card.suit && card.rank === top.rank + 1;
}

export function canDropOnTableau(card, pile) {
  if (!card) return false;
  if (pile.length === 0) return card.rank === 13;
  const top = pile[pile.length - 1];
  return top.faceUp && isRed(top.suit) !== isRed(card.suit) && card.rank === top.rank - 1;
}

/**
 * Cards that would move for a selection. Selections:
 *   { type: "waste" } — top waste card
 *   { type: "foundation", index } — top card of a foundation
 *   { type: "tableau", index, cardIndex } — a face-up card plus its run
 */
export function getMovableCards(state, sel) {
  if (!sel) return [];
  if (sel.type === "waste") {
    return state.waste.length ? [state.waste[state.waste.length - 1]] : [];
  }
  if (sel.type === "foundation") {
    const pile = state.foundations[sel.index];
    return pile.length ? [pile[pile.length - 1]] : [];
  }
  const pile = state.tableau[sel.index];
  const card = pile ? pile[sel.cardIndex] : undefined;
  if (!card || !card.faceUp) return [];
  return pile.slice(sel.cardIndex);
}

/**
 * Standard scoring: waste->tableau +5, waste/tableau->foundation +10,
 * tableau flip +5, foundation->tableau -15. Score never drops below zero.
 * Returns { next, flipped, toFoundation } or null when the move is illegal.
 */
export function applyMove(state, sel, dest) {
  const cards = getMovableCards(state, sel);
  if (!cards.length) return null;

  if (dest.type === "foundation") {
    if (sel.type === "foundation") return null;
    if (cards.length !== 1) return null;
    if (!canDropOnFoundation(cards[0], state.foundations[dest.index])) return null;
  } else if (dest.type === "tableau") {
    if (sel.type === "tableau" && sel.index === dest.index) return null;
    if (!canDropOnTableau(cards[0], state.tableau[dest.index])) return null;
  } else {
    return null;
  }

  const next = cloneState(state);
  let delta = 0;
  let flipped = false;

  if (sel.type === "waste") {
    next.waste.pop();
    delta += dest.type === "foundation" ? 10 : 5;
  } else if (sel.type === "foundation") {
    next.foundations[sel.index].pop();
    delta -= 15;
  } else {
    const pile = next.tableau[sel.index];
    pile.splice(sel.cardIndex, pile.length - sel.cardIndex);
    const uncovered = pile[pile.length - 1];
    if (uncovered && !uncovered.faceUp) {
      pile[pile.length - 1] = { ...uncovered, faceUp: true };
      delta += 5;
      flipped = true;
    }
    if (dest.type === "foundation") delta += 10;
  }

  if (dest.type === "foundation") {
    next.foundations[dest.index].push({ ...cards[0], faceUp: true });
  } else {
    next.tableau[dest.index].push(...cards.map((card) => ({ ...card, faceUp: true })));
  }

  next.score = Math.max(0, next.score + delta);
  next.moves += 1;
  return { next, flipped, toFoundation: dest.type === "foundation" };
}

/**
 * Draw `drawMode` cards from stock to waste, or recycle the waste back into
 * the stock when the stock is empty (-100 in draw-1, free in draw-3).
 */
export function drawFromStock(state) {
  if (state.stock.length === 0 && state.waste.length === 0) return null;
  const next = cloneState(state);
  if (next.stock.length === 0) {
    next.stock = next.waste.reverse().map((card) => ({ ...card, faceUp: false }));
    next.waste = [];
    if (next.drawMode === 1) next.score = Math.max(0, next.score - 100);
  } else {
    const count = Math.min(next.drawMode, next.stock.length);
    for (let i = 0; i < count; i += 1) {
      next.waste.push({ ...next.stock.pop(), faceUp: true });
    }
  }
  next.moves += 1;
  return next;
}

export function findFoundationTarget(state, card) {
  return state.foundations.findIndex((pile) => canDropOnFoundation(card, pile));
}

/** Legal drop spots for the current selection, for highlighting. */
export function legalDestinations(state, sel) {
  const foundations = [false, false, false, false];
  const tableau = [false, false, false, false, false, false, false];
  const cards = getMovableCards(state, sel);
  if (!cards.length) return { foundations, tableau };
  if (cards.length === 1 && sel.type !== "foundation") {
    state.foundations.forEach((pile, i) => {
      if (canDropOnFoundation(cards[0], pile)) foundations[i] = true;
    });
  }
  state.tableau.forEach((pile, i) => {
    if (sel.type === "tableau" && sel.index === i) return;
    if (canDropOnTableau(cards[0], pile)) tableau[i] = true;
  });
  return { foundations, tableau };
}

export function isWon(state) {
  return state.foundations.every((pile) => pile.length === 13);
}

export function canAutoComplete(state) {
  if (isWon(state)) return false;
  if (state.stock.length > 0 || state.waste.length > 0) return false;
  return state.tableau.every((pile) => pile.every((card) => card.faceUp));
}

/**
 * Next auto-complete step: the exposed tableau card with the lowest rank that
 * fits a foundation. Picking the lowest rank first can never dead-end once
 * every card is face-up and the stock and waste are empty.
 */
export function findAutoMove(state) {
  let best = null;
  state.tableau.forEach((pile, index) => {
    if (!pile.length) return;
    const top = pile[pile.length - 1];
    const target = findFoundationTarget(state, top);
    if (target === -1) return;
    if (!best || top.rank < best.rank) {
      best = {
        rank: top.rank,
        sel: { type: "tableau", index, cardIndex: pile.length - 1 },
        dest: { type: "foundation", index: target },
      };
    }
  });
  return best;
}

/** Run auto-complete to the end in one step (used for reduced motion). */
export function runAllAutoMoves(state) {
  let current = state;
  let move = findAutoMove(current);
  while (move) {
    const result = applyMove(current, move.sel, move.dest);
    if (!result) break;
    current = result.next;
    move = findAutoMove(current);
  }
  return current;
}
