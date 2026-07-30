const seo = {
  intro:
    "This trainer sets you 18 hand-built tactical positions, three each of forks, pins, skewers, discovered attacks, checkmates and endgames, and asks you to find the one winning move from a real FEN position. You get three attempts per puzzle, a hint that highlights the key square, and a written explanation of why the move works once you solve it or run out of tries. A local scoreboard tracks solved count, current and best streak and total points, awarding 10 for easy, 20 for medium and 30 for hard.",
  useCases: [
    "You keep losing pieces to knight forks in your online games and want to drill the pattern until you spot Nc7+ before your opponent plays it",
    "You are coaching a beginner and need positions where the tactic is isolated, with an explanation of why the defending king cannot simply capture",
    "You want a short daily warm-up before playing, filtered to just the endgame and checkmate positions you are weakest on",
  ],
  benefits: [
    ["Every puzzle explains itself", "Solving reveals a written reason — which two pieces the fork hits, which piece defends the sacrifice — instead of just a green tick."],
    ["Filter by motif and difficulty", "Pick a single tactic such as skewers or discovered attacks, and narrow to easy, medium or hard, so you can drill one weakness at a time."],
    ["Progress persists on your device", "Solved count, attempts, streak, best streak and score are stored in your browser's local storage, so there is no account and no sync."],
  ],
  faqs: [
    [
      "How many puzzles are there, and what tactics do they cover?",
      "Eighteen positions across six motifs: forks, pins, skewers, discovered attacks, checkmates and endgames, with three of each. They are split evenly by difficulty too, six easy, six medium and six hard.",
    ],
    [
      "What happens if I play the wrong move?",
      "You get three attempts. The first two wrong moves just reset your selection so you can try again; on the third the puzzle is marked failed, your streak drops to zero, and the solution becomes available to play through.",
    ],
    [
      "How is the score calculated?",
      "Solving a puzzle adds 10 points for easy, 20 for medium and 30 for hard, and increments your streak. Failed puzzles count towards attempts but add no points and reset the current streak, while your best streak is kept.",
    ],
    [
      "What is the difference between a pin and a skewer?",
      "It is which piece stands in front. In a pin, a less valuable piece is stuck in front of a more valuable one — often the king — and cannot move; in a skewer the valuable piece is attacked first and, when it moves away, the piece behind it is captured. Both are line tactics played by rooks, bishops and queens.",
    ],
  ],
};

export default seo;
