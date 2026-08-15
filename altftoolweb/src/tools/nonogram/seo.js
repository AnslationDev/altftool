const seo = {
  title: "Nonogram Puzzle: 5x5, 10x10 and 15x15 Picture",
  metaDescription:
    "Solve generated nonograms at 5x5, 10x10 or 15x15 in easy, medium or hard. Clues dim as you satisfy them and best times are kept per grid size.",
  intro:
    "Nonogram is a picture-logic puzzle where the numbers beside each row and above each column give the lengths of the filled runs in that line, in order, with at least one empty square between runs — fill the grid so every clue is satisfied and a picture appears. This version generates fresh 5x5, 10x10 and 15x15 boards at three difficulties, dims each clue as you satisfy it, and keeps a separate best time for every grid size. A Fill mode paints squares and a Mark mode (or right-click) flags the ones that must stay empty, which is how experienced solvers make progress on a stubborn line.",
  useCases: [
    "You want a ten-minute logic puzzle on a commute that does not need an account, a streak, or a daily reset telling you to come back tomorrow.",
    "You are learning nonograms and want to start on 5x5 easy boards where a single row often solves outright, before touching a 15x15.",
    "You already solve these on paper and want to beat your own recorded time on a 15x15 rather than compete with strangers.",
  ],
  benefits: [
    [
      "Clues dim as you satisfy them",
      "A completed row or column visibly settles, so you can see at a glance which lines still hold information you have not used.",
    ],
    [
      "Marking is a first-class mode",
      "Squares you have deduced must be empty get their own state, not just a mental note — which is what makes larger grids solvable by logic instead of guessing.",
    ],
    [
      "Best times per grid size",
      "5x5, 10x10 and 15x15 records are stored separately, so a fast small board never buries your real 15x15 personal best.",
    ],
  ],
  faqs: [
    [
      "How do you solve a nonogram?",
      "Each number is the length of one unbroken run of filled squares in that row or column, listed in order, with at least one blank between consecutive runs. Start with lines where the clue numbers plus the mandatory gaps nearly fill the line — a clue of 5 in a 5-wide row fills it completely — then use those certainties to constrain the crossing lines, marking squares you have proved empty as you go.",
    ],
    [
      "What grid sizes and difficulties are available?",
      "Three sizes — 5x5, 10x10 and 15x15 — each at easy, medium or hard. Difficulty changes how densely the hidden picture is filled: easy boards are around two-thirds filled, hard boards closer to 44%, and sparser pictures give longer clue lists with more short runs to place.",
    ],
    [
      "What is the difference between fill mode and mark mode?",
      "Fill mode paints squares you believe are part of the picture; mark mode flags squares you have deduced must stay empty. Marks are your working, not part of the solution — a board is won when every row and column clue is satisfied by the filled squares, whatever you have or have not marked. You can right-click, or hold Alt, to mark without switching modes.",
    ],
    [
      "Does every nonogram here have a single solution?",
      "Not necessarily. Boards are generated from a random hidden picture, and any arrangement that satisfies every row and column clue is accepted as a win — which occasionally means a grid has more than one valid answer. The Check button compares your fills against the original hidden picture and counts the differences as mistakes.",
    ],
  ],
};

export default seo;
