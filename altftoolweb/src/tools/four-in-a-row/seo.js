const seo = {
  title: "Four in a Row: 7x6 Disc Drop Game vs a Minimax AI",
  metaDescription:
    "Drop discs on a 7-column, 6-row board and line up four. The AI searches 2, 4 or 6 plies on Easy, Medium and Hard, or play 2 Players locally.",
  steps: [
    "On the Ready to play? card choose a Mode, vs AI or 2 Players, and for vs AI an Easy, Medium or Hard difficulty — a 2, 4 or 6-ply minimax search.",
    "Press Start game, then click a column or aim with the Left and Right arrow keys and drop a disc with Enter or Space into the 7x6 board.",
    "The completed four is highlighted and the round panel shows Rounds — You, AI and Draws, with Play again and Change mode; the header stats track Best streak.",
  ],
  intro:
    "Four in a Row is a browser version of the classic 7-column by 6-row disc-drop game, where discs fall to the lowest empty cell and the first player to line up four horizontally, vertically or diagonally wins. The computer opponent runs a minimax search with alpha-beta pruning at a depth you choose — 2 plies on Easy, 4 on Medium and 6 on Hard — and prefers the centre column when scores tie. There is also a pass-and-play mode for two people on the same screen, with a win/loss tally and a best-streak counter.",
  useCases: [
    "Practising against a stronger engine before a family tournament — start on Easy at 2-ply, then move up to Hard's 6-ply search once you stop losing",
    "Handing a phone or laptop to a friend on a train and playing pass-and-play on one board instead of installing anything",
    "Learning why the centre column matters, by watching the AI keep taking column 4 and seeing your open threats scored against you",
  ],
  benefits: [
    ["Three genuinely different opponents", "Difficulty changes the actual search depth (2, 4 or 6 plies) rather than making the AI drop moves at random."],
    ["It sees your threats coming", "The evaluation scores every four-cell window on the board and weights a live three-in-a-row of yours above one of its own, so it blocks rather than races."],
    ["Winning line shown, streak tracked", "Completed fours are highlighted on the board, and consecutive wins against the AI are recorded as a personal best streak."],
  ],
  faqs: [
    [
      "How big is the board and how do you win?",
      "The board is 7 columns by 6 rows, 42 cells in total, and you win by connecting four of your discs in a row horizontally, vertically or diagonally. Discs drop to the lowest empty cell in the column you pick, so you only ever choose a column, never a square.",
    ],
    [
      "How hard is the AI on each setting?",
      "Easy searches 2 plies ahead, Medium 4 and Hard 6. At 6 plies the engine will reliably spot and block a three-in-a-row and set up its own double threats, so Hard is a real opponent rather than a token one.",
    ],
    [
      "Can two people play on the same device?",
      "Yes — switch from the AI mode to pass-and-play and the two colours alternate on one board with no computer opponent involved. The running tally shows results for both players.",
    ],
    [
      "Why does the computer keep playing the middle column?",
      "The centre column sits in more possible winning lines than any other, so the evaluation adds a bonus for every disc there and the search tries centre columns first. That ordering also makes alpha-beta pruning cut more branches, which is why Hard stays responsive at 6 plies.",
    ],
  ],
};

export default seo;
