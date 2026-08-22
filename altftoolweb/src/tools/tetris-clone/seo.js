const seo = {
  title: "Tetris Clone with SRS & 7-Bag Randomiser",
  metaDescription:
    "Playable browser Tetris: SRS wall kicks, 7-bag randomiser, hold, ghost piece and guideline scoring, plus a piece seed to replay identical runs.",
  steps: [
    "Set a numeric Piece seed and pick a Starting level from Level 1 — 1000 ms per row down to Level 15, then press New game to deal the seeded 7-bag piece order onto the 10 × 20 playfield.",
    "Play with the arrow keys, Z/X or Up to rotate, Space to hard drop and C or Shift to hold — or the on-screen ←, ⟳, →, ↓, Drop and Hold pad on touch — and press P or Escape to pause.",
    "Watch Score, Lines, Level, Pieces, Stack height and Drop every in the side panel, then press Copy result to copy your score, lines, level, pieces and seed for the run.",
  ],
  intro:
    "This is a playable Tetris clone that runs entirely in the browser: seven tetrominoes fall onto a 10-column by 20-row matrix and you clear rows by filling them completely. It implements the behaviours competitive players expect — the Super Rotation System with wall kicks, a 7-bag randomiser that deals one of each piece every seven drops, a hold slot and a ghost outline. Scoring follows the Tetris Guideline: 100, 300, 500 and 800 points times the level for one, two, three and four rows.",
  useCases: [
    "Practise T-spins and wall kicks against a fixed seed so the same piece order comes up every run.",
    "Play a quick round in a browser tab with no install, no account and no network request.",
    "Start at level 10 to train at 64 ms per row instead of the one-second level-1 gravity.",
  ],
  benefits: [
    ["Real SRS rotation", "Full Super Rotation System kick tables, so pieces twist into gaps the way they should."],
    ["Seeded piece order", "Enter a seed and the 7-bag randomiser deals the identical sequence every time."],
    ["Keyboard and touch", "Arrow keys, Z/X, space and C on desktop; a six-button pad with 44 px targets on a phone."],
  ],
  faqs: [
    [
      "How is the score calculated in Tetris?",
      "Clearing one row scores 100 points times the current level, two rows 300, three rows 500 and four rows at once — a Tetris — 800. A soft drop adds 1 point per cell and a hard drop 2 points per cell. Clearing four rows at level 5 is therefore worth 4,000 points, ten times the 400 you would get clearing them one at a time.",
    ],
    [
      "How fast do the pieces fall at each level?",
      "The guideline formula is (0.8 − (level − 1) × 0.007) seconds raised to the power of (level − 1). That is 1,000 ms per row at level 1, 793 ms at level 2, 64 ms at level 10 and under one frame at level 15. The level goes up every 10 cleared lines.",
    ],
    [
      "What is the 7-bag randomiser?",
      "The game shuffles all seven tetrominoes into a bag and deals them one at a time, then shuffles a new bag. It guarantees you never wait more than 12 pieces for an I-piece and never receive the same piece three times in a row — unlike a plain random pick, which can do both.",
    ],
    [
      "What is the ghost piece for?",
      "The faded outline at the bottom of the well shows exactly where the current piece will land if you hard-drop it now. It removes the guesswork on column alignment, which matters most at high levels where you have well under a second to place each piece.",
    ],
  ],
};

export default seo;
