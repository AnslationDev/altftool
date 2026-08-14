const seo = {
  title: "Rubik’s Cube Algorithm Trainer — PLL, OLL, F2L Drill",
  intro:
    "The Rubik's Cube Algorithm Trainer is a reference and drill for standard cube algorithms grouped into Beginner, F2L, OLL and PLL, each shown in Singmaster notation and played back move by move on a live cube net. Selecting an algorithm applies its turns to a solved cube in the standard colour scheme — white top, yellow bottom, green front, blue back, orange left, red right — so you can watch what a sequence like White Corners (R U R' U') actually does to the stickers, one turn at a time. Practice mode hides the notation and asks you to type it from memory, tracking attempts and correct recalls per algorithm so you can see which ones have really stuck.",
  useCases: [
    "You have learned the beginner method and are moving to CFOP, and want to drill the PLL set — Aa, Ab, T, Ua, Ub, H, Z, E, Ja, Jb — a few at a time.",
    "You keep mixing up Sune (R U R' U R U2 R') and Anti-Sune (R U2 R' U' R U' R') and want to see side by side what each one leaves on the top face.",
    "You are away from your cube on a commute and want to rehearse F2L insertions by typing them out rather than turning plastic.",
  ],
  benefits: [
    [
      "Shows the effect, not just the letters",
      "Each algorithm is applied to a solved cube and animated one turn at a time, so you see which pieces move rather than memorising a string blind.",
    ],
    [
      "Recall drill, not recognition",
      "Practice mode makes you reproduce the notation from memory and checks it exactly, which is the skill you need at the cube.",
    ],
    [
      "Per-algorithm progress",
      "Attempts and correct recalls are stored for each of the 34 algorithms, so your weak cases are visible instead of guessed at.",
    ],
  ],
  faqs: [
    [
      "What do the letters in Rubik's Cube notation mean?",
      "Each letter is a face — U up, D down, F front, B back, L left, R right — and a bare letter means a quarter turn clockwise looking at that face. An apostrophe means anticlockwise (R') and a 2 means a half turn (R2), so R U R' U' is four quarter turns. The trainer applies exactly this notation to the cube net.",
    ],
    [
      "How many algorithms do you need to solve a Rubik's Cube?",
      "The beginner layer-by-layer method needs only a handful — this trainer's Beginner set has 6 (the first-layer cross is solved intuitively and has no single algorithm to drill). Full CFOP needs 57 OLL cases and 21 PLL cases, so most solvers learn the 21 PLLs first and use the beginner two-look OLL until they are ready for the rest.",
    ],
    [
      "What is the difference between OLL, PLL and F2L?",
      "F2L solves the first two layers by pairing a corner with its edge and inserting them, OLL then orients the last layer so the top face is one colour, and PLL permutes those already-oriented pieces into their correct positions. The trainer separates all three, plus a beginner group, so you practise the stage you are working on.",
    ],
    [
      "What is the standard Rubik's Cube colour scheme?",
      "White opposite yellow, green opposite blue and orange opposite red, arranged so that with white up and green front, red is on the right — the Western scheme this trainer's cube uses. Getting the scheme right matters because algorithms are described relative to the face you are holding, not the colour.",
    ],
  ],
};

export default seo;
