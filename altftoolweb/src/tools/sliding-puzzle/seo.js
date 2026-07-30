const seo = {
  intro:
    "The Sliding Puzzle is the classic 15 puzzle: numbered tiles in a grid with one empty cell, which you slide into order with the blank finishing bottom-right. It offers 3x3, 4x4 and 5x5 boards, and every shuffle is run through the inversion-parity check and corrected if needed, so you are never dealt one of the arrangements that cannot be solved. Moves and time are counted, and your lowest move count for each board size is kept separately.",
  useCases: [
    "You have ten minutes to fill and want a puzzle with no account, no timer pressure and no ads between attempts — pick 4x4 and put the fifteen tiles back in order.",
    "You solved a 4x4 once and want to know whether you can beat your own move count rather than just finish, so the best-moves record per size is the target.",
    "A parent wants a screen activity for a child that is genuinely spatial reasoning, and starts them on the 3x3 eight-tile board before stepping up.",
  ],
  benefits: [
    ["Every deal is guaranteed solvable", "Shuffles are checked with the standard inversion-parity rule and repaired if they fail it, so no attempt is wasted on an impossible board — and it never hands you an already-solved one."],
    ["Whole rows slide in one tap", "Tapping any tile in the blank's row or column shifts the entire segment toward the gap, so a three-tile run takes one tap rather than three."],
    ["Keyboard play, properly", "Arrow keys or WASD move the blank and Space starts and pauses, with the keys only captured while a game is actually running so the page still scrolls otherwise."],
  ],
  faqs: [
    [
      "Are all sliding puzzle arrangements solvable?",
      "No — exactly half are. For an odd-width board the arrangement is solvable when the inversion count is even; for an even width like 4x4 it is solvable when inversions plus the blank's row counted from the bottom is odd. This puzzle applies that test to every shuffle and fixes any deal that fails it.",
    ],
    [
      "How many possible positions does the 15 puzzle have?",
      "16! = 20,922,789,888,000 arrangements in total, of which exactly half — 10,461,394,944,000 — are reachable from the solved state. The 3x3 version has 9!/2 = 181,440 reachable positions.",
    ],
    [
      "What is the fewest moves any 15 puzzle can be solved in?",
      "The hardest possible 4x4 position needs 80 single-tile moves, a result established by exhaustive search; for the 3x3 board the worst case is 31 moves. A typical random deal takes far fewer, which is why the move counter is worth racing against.",
    ],
    [
      "How do you solve a sliding puzzle?",
      "Work top-down and left-to-right: finish the top row completely, then the next row, and once only two rows remain solve them column by column. The last two tiles of each row usually need a short three-move cycle to rotate them into place rather than being pushed in directly.",
    ],
  ],
};

export default seo;
