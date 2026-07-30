const seo = {
  intro:
    "Snake Water Gun is the three-way playground game — snake beats water, water beats gun, gun beats snake — played here against a computer that picks uniformly at random each round. You choose one of the three, see both picks and who took the round, and the page keeps a running tally of wins, losses, draws, win rate, current streak and best streak. It is the same cycle as rock paper scissors, so every round is a one-in-three win, one-in-three loss, one-in-three draw against a random opponent.",
  useCases: [
    "You and a friend need a fair way to settle who goes first and want a neutral third party rather than one of you calling it.",
    "You are explaining probability to a child and want to show, over thirty visible rounds, that the win rate drifts toward a third rather than landing there every time.",
    "You want a two-second break between tasks that ends in a definite result instead of an open-ended game you have to stop yourself playing.",
  ],
  benefits: [
    ["Streaks tracked alongside the score", "Current and best streak are kept next to wins and losses, so a hot run is visible rather than something you have to remember."],
    ["Win rate updates every round", "The percentage is recalculated from your full session, which makes it easy to see it settling near a third over a long run."],
    ["No pattern to exploit", "The computer draws a fresh uniform random pick each round with no memory of your history, so there is nothing to read and no rubber-banding."],
  ],
  faqs: [
    [
      "What are the rules of Snake Water Gun?",
      "Snake beats water, water beats gun, and gun beats snake; identical picks are a draw. The logic is the same closed cycle as rock paper scissors, just with the familiar names from the Indian playground version, saanp paani bandook.",
    ],
    [
      "Does the computer cheat or see my choice first?",
      "No. The computer's pick is drawn uniformly at random from the three options and does not depend on what you selected, so each of snake, water and gun has an equal one-in-three chance every round.",
    ],
    [
      "What is a good win rate?",
      "Anything close to 33% is exactly what the maths predicts, since wins, losses and draws each carry a one-in-three probability against a random opponent. A session sitting well above or below that is short-run variance, not skill or a losing streak.",
    ],
    [
      "Is there a strategy that beats it?",
      "No strategy raises your long-run win rate above a third here, because the opponent is a fresh random draw with no memory of your previous moves. Against a human opponent pattern-reading matters; against uniform randomness it cannot.",
    ],
  ],
};

export default seo;
