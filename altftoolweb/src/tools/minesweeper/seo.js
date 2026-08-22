const seo = {
  title: "Classic Minesweeper: Beginner to Expert 16x30",
  metaDescription:
    "Classic Minesweeper with safe first click, chording and flag mode. Beginner 9x9/10 mines to Expert 16x30/99, with per-difficulty best times.",
  steps: [
    "Pick a board with the Beginner, Intermediate or Expert difficulty pills (9x9 with 10 mines, 16x16 with 40, or 16x30 with 99), then tap any tile — mines are placed only after your first tap, so it is always safe.",
    "Tap to reveal tiles; right-click, long-press or switch on \"Flag mode\" to plant flags, and tap a satisfied number to chord-clear its remaining neighbours. Keyboard: arrows or WASD move, Space or Enter reveals, F flags, P pauses.",
    "Clear every safe tile to win — the Mines, Time and Best counters track the game, and the \"Board cleared in Xs!\" banner with its \"Play again\" button records a new best time per difficulty.",
  ],
  intro:
    "This is classic Minesweeper at the three standard board sizes: Beginner 9x9 with 10 mines, Intermediate 16x16 with 40, and Expert 16x30 with 99. Mines are placed only after your first click, so the opening move can never explode, and zero-tiles flood-fill outward the way the original does. It supports right-click and long-press flagging, chording on satisfied numbers, full keyboard play, and it keeps your best time per difficulty.",
  useCases: [
    "You want the exact Windows board you remember — 16 by 30 with 99 mines — rather than a redesigned puzzle with power-ups.",
    "You are chasing a personal best on Beginner and want the timer and best-time record kept per difficulty so the runs are comparable.",
    "You are on a phone and need flag mode as a toggle, because long-pressing every tile to flag it gets tiring on a 16x16 board.",
  ],
  benefits: [
    ["First click is always safe", "Mines are dealt after you click, excluding that tile, so no game is lost on move one to bad luck."],
    ["Chording built in", "Tap a number whose mine count is already matched by adjacent flags and it clears the remaining neighbours in one action — the speed technique the classic relies on."],
    ["Playable without a mouse", "Arrows or WASD move the cursor, Space or Enter reveals, F flags and P pauses, so the whole game works from the keyboard."],
  ],
  faqs: [
    [
      "How many mines are on each difficulty?",
      "Beginner is 9x9 with 10 mines, Intermediate is 16x16 with 40, and Expert is 16 rows by 30 columns with 99. Those are the standard counts, giving mine densities of roughly 12%, 16% and 21%.",
    ],
    [
      "What do the numbers on the tiles mean?",
      "A number is the count of mines in the eight tiles touching it, diagonals included, so a 1 has exactly one mine among its neighbours. A revealed blank has zero adjacent mines, which is why the board opens up in a cascade around it.",
    ],
    [
      "What is chording and how do I do it?",
      "Chording clears every unflagged neighbour of a number whose adjacent-mine count is already matched by flags — tap a 2 that has two flags beside it and the rest of its neighbours open at once. It does nothing if the flag count does not equal the number, so a wrong flag will not fire it.",
    ],
    [
      "How do I win?",
      "Reveal every tile that is not a mine; you do not have to flag anything. When the last safe tile is uncovered the remaining mines are flagged automatically and your time is compared against your stored best for that difficulty.",
    ],
  ],
};

export default seo;
