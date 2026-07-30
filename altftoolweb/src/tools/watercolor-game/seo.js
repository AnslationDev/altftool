const seo = {
  intro:
    "Watercolor is a colour-mixing puzzle in which you blend six pigments — Crimson, Cobalt, Amber, Emerald, Violet and Ivory — to match a target shade across five hand-named levels, from Sunrise Blush to Royal Plum. Each stroke you add is averaged into the mix in RGB, you get only four or five strokes per level, and your score comes from how close the blended colour lands to the target measured as straight-line distance in RGB space. It is a short, calm game for anyone who enjoys colour: five levels, an undo button, and an average score at the end.",
  useCases: [
    "You want a five-minute break that is quiet rather than twitchy — no timer, no lives, just judging whether one more stroke of Amber pushes the mix past the target.",
    "You are learning colour theory and want to feel how averaging pigments actually behaves: two strokes of Cobalt to one of Crimson lands somewhere quite different from one and one.",
    "You are playing with a child and want a game about looking carefully instead of reacting fast, with an undo button so a wrong stroke is not a lost round.",
  ],
  benefits: [
    ["Scored on real colour distance", "Accuracy is the Euclidean distance between your mix and the target RGB, so a near-miss reads as a near-miss instead of a blunt right-or-wrong."],
    ["A stroke budget that forces a plan", "Four or five strokes per level means ratios matter — you have to decide how many of each pigment before you start, not blend until it looks right."],
    ["Undo without penalty", "You can take back the last stroke any time before you submit, so experimenting with a ratio costs nothing."],
  ],
  faqs: [
    [
      "How many levels are there?",
      "Five: Sunrise Blush, Twilight Mist, Sea Foam, Golden Meadow and Royal Plum. Each has its own target colour and a stroke budget of four or five, and your per-level scores are averaged into a final figure when you finish the fifth.",
    ],
    [
      "How does the mixing work?",
      "Each stroke contributes its pigment's RGB values and the mix is the arithmetic mean of every stroke on the canvas. So two Crimson and one Cobalt gives you two-thirds Crimson by weight — adding more of a colour shifts the average toward it rather than layering on top.",
    ],
    [
      "How is my score calculated?",
      "From the RGB distance between your mix and the target: under 20 scores a full 100, and the score tapers through bands at 45, 80 and 130 down toward zero for a wide miss. Scoring 70 or above triggers the celebration effect.",
    ],
    [
      "Is my progress saved?",
      "No — the game runs entirely in the page and reloading starts you back at level one with no scores. There is no account, no save file and nothing sent anywhere, so play it as a single sitting of five levels.",
    ],
  ],
};

export default seo;
