const seo = {
  title: "Color Match Game — 10 Rounds, Shades Get Closer",
  metaDescription:
    "Ten rounds, four swatches each: pick the exact match as the decoys close in. Correct answers pay 10 plus 2 per streak, so a perfect game scores 190.",
  steps: [
    "The Round tile opens at 1/10 and a target swatch appears under \"Match this color:\" with its hex code printed across it.",
    "Tap whichever of the four colour tiles matches the target: the true swatch is outlined green with a tick, a wrong pick is outlined red with a cross, and the next round loads on its own with the decoys sitting closer to the target.",
    "Score and Streak update after every pick — 10 points plus 2 for each answer already banked in the run — and after round 10 the \"Game Over!\" card gives your Final Score and Best Streak, with \"Play Again\" to restart.",
  ],
  intro:
    "The Color Match Game is a ten-round perception test: each round shows a target swatch and four candidate colours, and you pick the one that matches it exactly. The distractors are filtered by Euclidean distance in RGB space, and that minimum distance shrinks as the rounds go on — so by round ten the wrong answers sit much closer to the target than they did at the start. A correct pick scores 10 points plus 2 for each answer in your current run, so an unbroken streak is worth far more than ten lucky guesses.",
  useCases: [
    "You want a 60-second break that is not another endless scroller, and you would rather train your eye than your thumbs.",
    "You are a designer curious whether you can still separate two teals that differ by a few RGB points once the game tightens up.",
    "You want to settle who in the room has the better eye for colour, with a score that rewards consistency rather than one lucky round.",
  ],
  benefits: [
    ["Difficulty rises by measurement, not vibes", "Distractors must clear a minimum RGB distance from the target, and that threshold falls with each round, so the shades genuinely converge."],
    ["Streaks are worth points", "Each correct answer pays 10 plus twice your current streak, so a clean run scores 190 while the same ten correct answers scattered among mistakes score far less."],
    ["Shows you the answer you missed", "A wrong pick outlines your choice in red and the true target in green, so you can see exactly which pair fooled you."],
  ],
  faqs: [
    [
      "How many rounds are there?",
      "Ten, with four colour options in each. After the tenth round you get a final score and your best streak, and you can restart immediately.",
    ],
    [
      "How is the score calculated?",
      "10 points for a correct answer plus 2 for every consecutive correct answer already banked, so the first is worth 10 and the tenth in an unbroken run is worth 28. A perfect game totals 190; one wrong answer resets the streak bonus to zero.",
    ],
    [
      "Does it really get harder each round?",
      "Yes. A candidate colour is only allowed as a distractor if its straight-line distance from the target in RGB space clears a threshold, and that threshold drops from roughly 86 in the first round to about 50 in the last, so late-round decoys are visibly nearer the target.",
    ],
    [
      "Is this a colour blindness test?",
      "No. It measures how well you tell apart specific colour pairs in one session and is meant as a game, not a screening tool. Genuine colour vision testing uses standardised plates or an arrangement test administered by an optometrist.",
    ],
  ],
};

export default seo;
