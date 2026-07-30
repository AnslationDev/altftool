const seo = {
  title: "Candy Crush Online — Free Match-3, No Download",
  h1: "Candy Crush — Free Online Match-3 Puzzle Game",
  metaDescription:
    "Play a free match-3 candy game in your browser — 8×8 board, 6 candy types, cascading combos, 3 levels, classic and timed modes. No download or signup.",
  intro:
    "The Candy Crush game on AltFTool is a match-3 puzzle played on an 8×8 grid of six candy types. Every swap runs a row-and-column scanner that flags any straight run of three or more identical candies, clears them, applies gravity so the candies above drop into the gaps, refills the empty slots from the top, then re-scans — each pass through that loop counts as one cascade step and multiplies the points for that clear. Everything runs on your own device: the board, the scoring and even the sound effects, which are synthesised live with Web Audio oscillators rather than loaded as audio files. Your best score is kept in your browser's localStorage, and the game makes no network requests at all.",
  useCases: [
    "A break that fits in a coffee-length gap — a level is 20-25 moves in Classic mode, or under a minute in Timed mode.",
    "Practising match-3 pattern spotting without lives, cooldown timers between attempts, or in-app purchases.",
    "A puzzle you can open on a work machine with nothing to install, no account, and full keyboard and color-blind support.",
  ],
  benefits: [
    [
      "No lives, no waiting, nothing to buy",
      "Restart a level as many times as you like. There is no energy meter, no timer between attempts and no purchases — the whole game is client-side JavaScript that loads with the page.",
    ],
    [
      "Cascades genuinely pay off",
      "The score multiplier is the cascade number, so the fourth clear in a chain pays at 4×. Setting up a drop that triggers a chain beats taking the first match you spot.",
    ],
    [
      "The board never dead-ends",
      "After every resolution the game tests all 112 adjacent swaps on the 8×8 grid. If none of them would make a match, it re-rolls a board that is both match-free and solvable, and tells you it shuffled.",
    ],
    [
      "Readable by design",
      "Each of the six candies has its own shape as well as its own colour, arrow keys move focus around the grid, and the HUD shows percent-to-target rather than a bare score.",
    ],
  ],
  faqs: [
    [
      "Is this the real Candy Crush Saga?",
      "No. This is an independent match-3 puzzle game built for AltFTool and is not affiliated with, endorsed by or connected to King or Candy Crush Saga. It has its own 8×8 board, three levels and scoring rules — there are no Saga levels, boosters, lives or characters here.",
    ],
    [
      "Can I play Candy Crush online free without downloading anything?",
      "Yes. The game loads as part of the web page and runs entirely in your browser — no download, no install, no account and no sign-up. There is no server involved in play, so the game keeps working even if your connection drops after the page loads.",
    ],
    [
      "How is the score calculated?",
      "Each cleared candy is worth 10 points, plus a 15-point bonus for every candy beyond the third in a single match, and the whole amount is multiplied by the cascade number. So a five-candy match on the first clear scores (50 + 30) × 1 = 80, and if the falling candies trigger a second clear of three, that one scores 30 × 2 = 60.",
    ],
    [
      "How many levels are there and what are the targets?",
      "Three. Level 1 needs 500 points in 25 moves, level 2 needs 1,000 in 22 moves, and level 3 needs 1,500 in 20 moves. In Timed mode you get 60, 55 and 50 seconds instead of a move limit. Your score resets to zero at the start of each level, so every target has to be hit within that level.",
    ],
    [
      "What happens when there are no possible moves left?",
      "The board reshuffles automatically. After each match resolves, the game checks every adjacent swap on the grid; if not one of them would create a run of three, it generates a fresh board that starts with no matches and at least one valid move, and shows a \"No moves left — board shuffled!\" notice. It costs you nothing — no move and no time.",
    ],
    [
      "Can I play it with a keyboard instead of a mouse?",
      "Yes. Arrow keys move focus between tiles, and Enter or Space selects a candy; selecting a second candy next to it performs the swap. With a mouse or touchscreen you can either drag a candy about 18 pixels toward a neighbour, or tap it and then tap the neighbour.",
    ],
    [
      "Is the game playable if I'm colour blind?",
      "Yes. The six candies are distinguished by shape as well as colour — circle, square, star, leaf, droplet and hexagon — so matches can be read without relying on the red, orange, yellow, green, blue and purple palette at all.",
    ],
    [
      "Does it save my high score?",
      "Yes, in your browser's own localStorage, alongside your sound on/off preference. That means the score is tied to that one browser on that one device: it survives a page refresh, but it is not synced anywhere and it disappears if you clear site data or play in a private window.",
    ],
  ],
  steps: [
    "Drag a candy onto the square next to it, or tap the candy and then tap its neighbour, to swap the two. Swaps that don't create a match snap back and don't cost you a move.",
    "Line up three or more of the same candy in a row or column. They clear, the candies above fall into the gaps, new ones refill from the top, and any match that forms in the process clears again at a higher multiplier.",
    "Reach the level's target score before your moves run out — or before the clock runs out, if you switch to Timed mode with the button under the board.",
  ],
};

export default seo;
