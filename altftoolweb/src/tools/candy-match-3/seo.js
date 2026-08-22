const seo = {
  title: "Candy Match 3: 8x8 Puzzle with Cascade Combos",
  metaDescription:
    "Swap adjacent candies on an 8x8 board: 10 points a candy, +15 past three, times the cascade step. Three levels, classic or timed, best score saved.",
  intro:
    "Candy Match 3 is an 8×8 tile-swapping puzzle where you swap two adjacent candies to line up three or more of the same kind, clearing them so the ones above fall in and often trigger a chain. Scoring is 10 points per cleared candy plus a 15-point bonus for every candy beyond the third, all multiplied by the cascade step — so a five-candy match on the third chain is worth 240 points rather than 80. There are three levels with rising targets and a classic move-limited mode alongside a timed mode, and your best score is kept in your browser.",
  useCases: [
    "You have ten minutes between meetings and want a puzzle you can finish a level of, not one that needs a tutorial and an account",
    "You are colour-blind and most match-3 games are unplayable because every piece is just a coloured blob",
    "You want to beat your own recorded best rather than compete on a leaderboard or wait for lives to refill",
  ],
  benefits: [
    ["Shape as well as colour on every candy", "The six candy types use six distinct icons — circle, square, star, leaf, droplet, hexagon — so pieces stay tellable apart without relying on colour vision."],
    ["Cascades are worth chasing", "The multiplier scales with each consecutive chain step, so setting up a drop that triggers a second and third clear pays several times what the same match would in isolation."],
    ["No dead boards", "The game checks whether any swap can still produce a match and reshuffles into a fresh solvable layout when none can, instead of stranding you on an unplayable grid."],
  ],
  faqs: [
    [
      "How does scoring work?",
      "Ten points per candy cleared, plus 15 points for each candy past the first three, times the cascade number. A plain three-match is 30 points; a five-match is 50 + 30 = 80; and that same five-match occurring as the third link in a chain is multiplied by three for 240.",
    ],
    [
      "What are the level targets?",
      "Level 1 asks for 500 points in 25 moves or 60 seconds, level 2 for 1,000 points in 22 moves or 55 seconds, and level 3 for 1,500 points in 20 moves or 50 seconds — the moves apply in classic mode and the clock in timed mode.",
    ],
    [
      "Why do some swaps snap back?",
      "Because a swap is only allowed if it creates a run of at least three identical candies horizontally or vertically. The board is tested after the swap, and if no match forms the two tiles return to their original positions and the move is not spent.",
    ],
    [
      "Is my high score saved?",
      "Yes, in your browser's local storage along with your sound preference, so it persists between visits on the same browser. There is no account and nothing is uploaded, which also means clearing site data or switching devices resets it.",
    ],
  ],
};

export default seo;
