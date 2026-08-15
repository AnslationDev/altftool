const seo = {
  title: "Card Trick: Prediction, Memory & 52-Card Free",
  metaDescription:
    "Four modes on one 52-card deck: Free Play with a Fisher-Yates shuffle, Pick a Card, a forced-card Prediction, and an eight-card Memory round.",
  intro:
    "Card Trick is an interactive 52-card deck with four modes: Free Play (shuffle, draw 1, draw 5, random card), Pick a Card, Prediction, and a Memory round. Pick a Card fans out seven cards to memorise and then reveals your choice; Prediction picks its card first and uses the classic magician's force to place it in whichever of six face-down slots you tap; Memory flashes one card, hides it among eight, and tracks how many attempts you needed. The deck is shuffled with a Fisher-Yates algorithm, and your best Memory score, card theme and sound setting are remembered on your device.",
  useCases: [
    "You want to perform a quick trick for someone across a table with nothing but a phone — run Prediction, let them tap a slot, and the card you named first is the one that turns over.",
    "Waiting somewhere with a few minutes to kill and wanting a short memory drill that gets harder as you stop looking at the pips and start reading the whole card.",
    "You need a deck for a card game but do not have one: Free Play shuffles all 52 and deals from the top, showing how many cards are left.",
  ],
  benefits: [
    [
      "An honest shuffle underneath",
      "Free Play uses a Fisher-Yates shuffle over the full 52 cards and deals off the top, so the deck depletes exactly like a physical one.",
    ],
    [
      "Three different trick engines, not one repeated",
      "Memorise-and-reveal, a forced-card prediction and a recall grid each run their own logic rather than reskinning the same draw.",
    ],
    [
      "Remembers how you like to play",
      "Card theme (Classic, Neon or Minimal), the sound toggle and your best Memory score persist between visits without an account.",
    ],
  ],
  faqs: [
    [
      "How does the prediction trick actually work?",
      "The prediction card is chosen before you pick, and it is deliberately kept out of the six-card spread; when you tap a slot, that slot is replaced by the prediction. This is the digital version of a magician's force — the outcome is fixed and your choice selects the position, not the card.",
    ],
    [
      "How many cards are in the memory grid?",
      "Eight — one target card plus seven decoys, all distinct, shuffled into a grid after the target is shown briefly. Your attempt count is tracked and the best result is saved as a high score on your device.",
    ],
    [
      "Is the deck really shuffled randomly?",
      "Yes, with a Fisher-Yates shuffle over all 52 cards, which gives every ordering an equal chance. It draws on the browser's random number generator, which is right for games but is not a cryptographic source.",
    ],
    [
      "Can I use this as a plain deck of cards?",
      "Yes — Free Play mode lets you shuffle, draw one or five at a time, pull a random card and reset to a fresh 52, with the remaining count shown as you go.",
    ],
  ],
};

export default seo;
