// utils/game-utils.js
// Pure helpers for display-layer concerns: material counting, captured pieces,
// clock formatting. No framework dependencies.

export const PIECE_VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// From a move history (each entry has `color` and `captured` = {t,c} | null)
// produce the pieces captured BY each colour and the material balance.
export function computeCaptured(history) {
  const by = { w: [], b: [] }; // by.w = pieces White has captured (i.e. black pieces)
  for (const entry of history) {
    if (entry.captured) {
      by[entry.color].push(entry.captured);
    }
  }
  const score = { w: 0, b: 0 };
  score.w = by.w.reduce((a, p) => a + PIECE_VALUE[p.t], 0);
  score.b = by.b.reduce((a, p) => a + PIECE_VALUE[p.t], 0);
  const advantage = score.w - score.b;
  return {
    by,
    score,
    // positive => White is ahead, negative => Black is ahead
    advantage,
    leader: advantage === 0 ? null : advantage > 0 ? "w" : "b",
  };
}

// Build a 2-column array of full-move rows for the scrollable history panel.
export function buildHistoryRows(history) {
  const rows = [];
  for (let i = 0; i < history.length; i += 2) {
    rows.push({
      no: Math.floor(i / 2) + 1,
      white: history[i].san,
      black: history[i + 1] ? history[i + 1].san : null,
    });
  }
  return rows;
}
