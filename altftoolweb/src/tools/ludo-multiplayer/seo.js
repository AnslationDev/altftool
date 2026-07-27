const seo = {
  intro:
    "Ludo Multiplayer is a browser version of the classic four-token race game for two to four players on one device, or one player against an AI opponent with easy, medium and hard settings. It follows the standard rules: a 52-square shared circuit, four tokens each, a 6 to leave the yard, an extra roll after a six, capture on any unstarred square, three sixes in a row forfeiting the turn, and an exact roll needed to bring the last token home after 56 steps. Nothing installs and nothing is uploaded — the board, the AI and your statistics all live in the browser.",
  useCases: [
    "Play a quick 2–4 player game passing one phone or laptop around the table.",
    "Practise against the hard AI, which weighs captures, safety and progress before moving.",
    "Check the dice odds before deciding whether to open a second token or push the leader home.",
  ],
  benefits: [
    ["Standard rules", "52-square circuit, 56 steps per token and an exact final roll, as in the traditional game."],
    ["Play offline", "The whole game runs in the page — no account, no server, no install."],
    ["Real odds shown", "The dice probabilities below the board are calculated, not guessed."],
  ],
  faqs: [
    [
      "What are the chances of rolling a 6 in Ludo?",
      "One in six, or 16.7%, on any single roll. Over four rolls the chance of seeing at least one 6 is 1 − (5/6)⁴ = 51.8%, and it takes six rolls on average to release your first token from the yard.",
    ],
    [
      "How many steps does a Ludo token travel?",
      "56 in this version: 51 squares around the shared 52-square circuit from your own start square, then six more up your private home column. The final square must be reached by an exact roll — overshoot and the token stays put.",
    ],
    [
      "What happens if you roll three sixes in a row?",
      "The whole turn is forfeited and play passes on, which happens about 0.46% of the time — (1/6)³, or once in 216 turns. That rule is why the average progress per turn works out to 4.1 squares rather than the 4.2 a plain extra-roll rule would give.",
    ],
    [
      "Which squares are safe from capture?",
      "The eight starred squares, at circuit positions 0, 8, 13, 21, 26, 34, 39 and 47 — the four player start squares and the four squares eight steps before each of them. A token sitting on one of these cannot be sent back to the yard.",
    ],
  ],
};

export default seo;
