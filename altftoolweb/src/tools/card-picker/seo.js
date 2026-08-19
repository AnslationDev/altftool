const seo = {
  title: "Random Card Picker: Draw From a 52-Card Deck",
  metaDescription:
    "Press Pick Card to flip one of 52 cards — four suits, Ace to King, no jokers. Draws with replacement, so every pull is an even 1-in-52 chance.",
  intro:
    "The Random Card Picker draws one card from a standard 52-card deck — 13 ranks across hearts, diamonds, clubs and spades, no jokers — and reveals it with a flip animation. Each press picks a suit and a rank independently at random, so it is a draw with replacement: the same card can come up twice in a row, exactly like reshuffling the full deck before every pull. Useful when you need an impartial card and there is no deck on the table.",
  useCases: [
    "You are running a party game that assigns forfeits or turn order by suit and colour, and nobody brought a deck.",
    "A teacher demonstrating probability wants live draws to show that the chance of a heart stays 1 in 4 on every pull because the card goes back each time.",
    "Two people need a quick tiebreaker — high card wins — and want a draw neither of them controls.",
  ],
  benefits: [
    [
      "A genuinely full deck every time",
      "All 4 suits and all 13 ranks including Ace, Jack, Queen and King are in play on every draw, with no cards quietly excluded.",
    ],
    [
      "Independent draws, stated plainly",
      "Cards are not removed after a pick, so each pull is an even 1-in-52 chance rather than the shifting odds of a depleting deck.",
    ],
    [
      "The reveal reads clearly",
      "The card shows corner rank and suit plus a large centre pip in the correct red or black, and the result is also written out as text like \"Queen of Spades\".",
    ],
  ],
  faqs: [
    [
      "How many cards can it pick from?",
      "52 — four suits (hearts, diamonds, clubs, spades) times 13 ranks (Ace through 10, Jack, Queen, King). Jokers are not included.",
    ],
    [
      "Can the same card be drawn twice in a row?",
      "Yes. Every press draws from the complete deck again rather than from what is left, so repeats are possible and each card has a 1-in-52 chance on every pull.",
    ],
    [
      "What are the odds of drawing a specific suit or a face card?",
      "Any one suit comes up 1 time in 4 (13 of 52 cards), and a face card — Jack, Queen or King — comes up 3 times in 13, about 23%. Because draws are independent, those odds are the same on the first pull and the fiftieth.",
    ],
    [
      "Is the draw actually random?",
      "It uses the browser's built-in random number generator to choose a suit and a rank, which is fine for games, teaching and tiebreakers. It is not a cryptographic source, so do not use it where an adversary has something to gain from predicting the card.",
    ],
  ],
};

export default seo;
