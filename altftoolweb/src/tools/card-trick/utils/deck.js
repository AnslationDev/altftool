// Standard 52-card deck data + pure deck operations.
// Every card carries a stable nanoid `id` so framer-motion can animate it
// across shuffles/draws without re-mounting.

import { nanoid } from "nanoid";

export const SUITS = [
  { key: "S", symbol: "♠", name: "Spades", color: "red" },
  { key: "H", symbol: "♥", name: "Hearts", color: "red" },
  { key: "D", symbol: "♦", name: "Diamonds", color: "red" },
  { key: "C", symbol: "♣", name: "Clubs", color: "black" },
];

export const RANKS = [
  { value: 1, label: "A" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
  { value: 8, label: "8" },
  { value: 9, label: "9" },
  { value: 10, label: "10" },
  { value: 11, label: "J" },
  { value: 12, label: "Q" },
  { value: 13, label: "K" },
];

// Visual themes for the cards/deck. These are inherent to playing cards
// (face/back artwork), not UI theme parts, so local colours are fine.
// `faceTextRed` is a per-theme red chosen to clear the WCAG AA 4.5:1 contrast
// minimum against that theme's own `face` gradient (both stops), since a
// single hardcoded red cannot satisfy every theme's background at once —
// see components/Card.jsx.
export const CARD_THEMES = {
  classic: {
    id: "classic",
    name: "Classic",
    face: "linear-gradient(160deg, #ffffff 0%, #f5f7fa 100%)",
    faceText: "#0f172a",
    faceTextRed: "#be123c",
    pip: "rgba(15,23,42,0.06)",
    back: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    backAccent: "#14b8a6",
  },
  neon: {
    id: "neon",
    name: "Neon",
    face: "linear-gradient(160deg, #0b1020 0%, #131a2e 100%)",
    faceText: "#e2e8f0",
    faceTextRed: "#fb7185",
    pip: "rgba(34,211,238,0.10)",
    back: "linear-gradient(135deg, #0e7490 0%, #1e1b4b 100%)",
    backAccent: "#22d3ee",
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    face: "linear-gradient(160deg, #fbfdff 0%, #eef2f7 100%)",
    faceText: "#334155",
    faceTextRed: "#be123c",
    pip: "rgba(51,65,85,0.05)",
    back: "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)",
    backAccent: "#14b8a6",
  },
};

export const THEME_KEYS = Object.keys(CARD_THEMES);

export function buildDeck() {
  const cards = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        id: nanoid(),
        suit: suit.key,
        suitSymbol: suit.symbol,
        suitName: suit.name,
        color: suit.color,
        rank: rank.value,
        rankLabel: rank.label,
        name: `${rank.label}${suit.symbol}`,
      });
    }
  }
  return cards;
}

// Fisher–Yates shuffle — returns a new array, never mutates input.
export function shuffle(deck) {
  const a = deck.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Draw `n` cards from the top of the deck.
export function drawCards(deck, n) {
  const count = Math.max(0, Math.min(n, deck.length));
  return { remaining: deck.slice(count), drawn: deck.slice(0, count) };
}

// Pick a random card (or null if empty).
export function randomCard(deck) {
  if (!deck.length) return null;
  return deck[Math.floor(Math.random() * deck.length)];
}

// Pull `count` cards off the top of the deck as a spread.
export function dealSpread(deck, count) {
  return deck.slice(0, Math.max(0, Math.min(count, deck.length)));
}

// A handful of distinct random cards (used for memory decoys).
export function sampleDistinct(deck, count, excludeId) {
  const pool = deck.filter((c) => c.id !== excludeId);
  const a = shuffle(pool);
  return a.slice(0, Math.max(0, Math.min(count, a.length)));
}
