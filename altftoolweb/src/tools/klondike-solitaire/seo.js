const seo = {
  title: "Klondike Solitaire: Draw 1 or Draw 3 with Undo",
  metaDescription:
    "Play standard Klondike — 7 tableau piles, a 24-card stock, 4 foundations — with unlimited undo, highlighted legal moves and traditional +10 scoring.",
  intro:
    "Klondike Solitaire is the classic single-player card game — 28 cards dealt into seven tableau piles, the remaining 24 held in the stock, and four foundations to build up from Ace to King in each suit. This version plays the standard rules with either Draw 1 or Draw 3, keeps a full undo history so you can walk back every move, and scores you the traditional way: +5 to move from waste to tableau, +10 to reach a foundation, +5 for each card you flip face-up, and −15 for pulling a card back off a foundation. A timer, move counter and personal best are tracked alongside the score.",
  useCases: [
    "You want a quick game on a phone during a commute and need one that works with taps rather than dragging — select a card, and every legal destination lights up before you commit.",
    "You are learning why Draw 3 is harder than Draw 1 and want to play the same rules both ways, using undo to rewind a stock cycle and see what a different order would have opened up.",
    "You have every card face-up with the stock exhausted and just want the game finished — auto-complete plays the remaining cards to the foundations lowest rank first, so it can never dead-end.",
  ],
  benefits: [
    ["Unlimited undo", "Every move pushes the whole game state onto a history stack, so you can step back as far as you like, not just one move."],
    ["Legal moves highlighted", "Pick up a card and the foundations and tableau piles that will actually accept it are marked, which removes guesswork on small screens."],
    ["Full keyboard play", "Space or D draws, U undoes, A auto-completes, P pauses and Esc clears the selection, so a game can be finished without a mouse."],
  ],
  faqs: [
    [
      "What is the difference between Draw 1 and Draw 3 in Klondike?",
      "Draw 1 turns one card from the stock at a time, so you eventually see all 24 stock cards; Draw 3 turns three at once and only the top one is playable, so two-thirds of the stock is hidden on each pass. Draw 3 is the harder setting and is what most scored Klondike variants use. Here, switching modes deals a fresh game.",
    ],
    [
      "How is the score calculated?",
      "Moving a card from the waste to a tableau pile is +5, moving any card to a foundation is +10, turning a face-down tableau card face-up is +5, and taking a card back off a foundation is −15. Recycling the waste back into the stock costs 100 points in Draw 1 and nothing in Draw 3, and the score never falls below zero.",
    ],
    [
      "When can I use auto-complete?",
      "Auto-complete unlocks once the stock and waste are both empty and every remaining tableau card is face-up — at that point the game is guaranteed solvable. It repeatedly plays the lowest-ranked exposed card that fits a foundation, which is why it can never strand a card.",
    ],
    [
      "What are the rules for stacking cards in Klondike?",
      "Tableau piles build downward in alternating colours — a black 7 goes on a red 8 — and only a King can start an empty pile. Foundations build upward in a single suit starting with the Ace, and the game is won when all four foundations hold 13 cards.",
    ],
  ],
};

export default seo;
