const seo = {
  title: "Word Search Puzzles Online: 4 Themes, 3 Grid Sizes",
  metaDescription:
    "Play a freshly generated word search — Animals, Countries, Fruits & Food or Technology — on 8×8, 12×12 or 15×15 grids with a timer and saved best times.",
  steps: [
    "Pick a theme — Animals, Countries, Fruits & Food or Technology — and a grid size: 8 × 8 (6 words), 12 × 12 (10 words) or 15 × 15 (14 words).",
    "Press Start puzzle, then drag across letters (mouse or touch) or use the arrow keys with Enter to select words in any of the eight directions.",
    "Find every hidden word to stop the timer — your best time per grid size is saved in the browser — then hit Play again for a new random grid.",
  ],
  intro:
    "Word Search hides themed words in a letter grid in all eight directions — across, down, both diagonals and each of those backwards — and you find them by dragging across the letters or selecting them with the keyboard. Pick a theme (Animals, Countries, Fruits & Food or Technology) and a grid of 8x8, 12x12 or 15x15, and a fresh puzzle is generated with 6, 10 or 14 words placed at random. A timer runs while you play and your best time is kept per grid size.",
  useCases: [
    "You have ten minutes before a meeting and want a short puzzle with a definite end, so you take the 8x8 grid with its 6 words rather than starting something open-ended",
    "You are handing a tablet to a child and want a themed grid — animals or fruit — that reinforces spelling without needing a printed puzzle book",
    "You have already beaten your 12x12 time and want to push it down, so you replay the same size and watch the timer against the stored best",
  ],
  benefits: [
    ["A new grid every single time", "Words are placed by random search rather than pulled from a fixed set of puzzles, so replaying the same theme and size never repeats the layout."],
    ["Selection that forgives a sloppy drag", "The highlighted path snaps to the nearest of the eight compass directions as you drag, and keyboard selection accepts any exact row, column or 45-degree line."],
    ["Separate best times per grid size", "8x8, 12x12 and 15x15 each keep their own record, so a fast small-grid run does not hide your progress on the big one."],
  ],
  faqs: [
    [
      "Can words appear backwards or diagonally?",
      "Yes — all eight directions are used: left-to-right, right-to-left, top-to-bottom, bottom-to-top and all four diagonals. Words are also allowed to cross each other where the shared letter matches, which is what makes a dense grid harder to read.",
    ],
    [
      "How many words are in each puzzle?",
      "Six on the 8x8 grid, ten on 12x12 and fourteen on 15x15. A word only qualifies for a grid if it is at least 3 letters and no longer than the grid is wide, so the 8x8 draws from the shorter entries in the theme and the 15x15 can use the longest ones.",
    ],
    [
      "Why do the filler letters look like they spell things?",
      "That is deliberate. Empty cells are filled with a letter drawn from the hidden words about 35% of the time and from the full alphabet otherwise, so the decoy letters share the same distribution as the answers instead of standing out as random noise.",
    ],
    [
      "Is my best time saved if I close the tab?",
      "Yes — best times are stored in the browser for each of the three grid sizes and survive a reload. They live on that device and browser profile only, so clearing site data or switching browsers starts the records fresh.",
    ],
  ],
};

export default seo;
