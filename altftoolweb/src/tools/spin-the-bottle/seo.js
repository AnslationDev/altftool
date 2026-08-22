const seo = {
  title: "Spin the Bottle Online: Random Name Picker",
  metaDescription:
    "Add or paste player names, spin one of five bottle designs, and land on a random name - equal slices, with the last 20 picks kept with timestamps.",
  steps: [
    "Type a name or paste a comma/newline-separated list into \"Add name or paste list...\" - at least 2 players, and repeated names are rejected.",
    "Pick one of five \"Bottle Design\" options (Classic, Gold, Rose, Purple, Cyan) and optionally tick \"Sound effects\", which start off.",
    "Press \"Spin the Bottle\"; after a 2-3.5 second spin the winner is announced and added to the History list of the last 20 picks with timestamps.",
  ],
  intro:
    "Spin the Bottle puts your group's names around a circle and spins a bottle that lands on one of them at random, using a fresh random angle every spin so each player's slice has an equal chance. Add players one at a time or paste a whole list, pick one of five bottle looks, and spin — the result is announced on screen and the last 20 picks are kept with timestamps. It works as a party game and equally as a neutral way to pick who goes first, who answers next, or whose turn it is to fetch the drinks.",
  useCases: [
    "You are hosting a party game night and want the classic bottle spin without an actual bottle, on a phone propped in the middle of the table.",
    "A team of eight is deciding who presents first in a stand-up and wants a visibly random pick that nobody can argue with.",
    "Teachers picking a student to answer, where the running history of the last 20 picks shows at a glance who has already had a turn.",
  ],
  benefits: [
    [
      "Equal slices, genuinely random landing",
      "The circle is divided into 360°/n equal slices and the bottle stops at an independently random angle, so no name is favoured however many players you add.",
    ],
    [
      "Bulk add and duplicate protection",
      "Paste a list of names in one go and any repeat of a name already on the wheel is rejected, matched without regard to capitalisation.",
    ],
    [
      "Keeps a visible record of picks",
      "The last 20 results are listed with the time they happened, which settles the inevitable 'you already went' argument.",
    ],
  ],
  faqs: [
    [
      "How many players do I need?",
      "At least two — the spin button stays disabled below that. There is no upper limit, though names are truncated to six characters on the wheel face, so very large groups are easier to read in the player list than around the circle.",
    ],
    [
      "Is the spin actually random or does it follow a pattern?",
      "It is random. Each spin adds between 3 and 7 full rotations plus a random angle from 0 to 359 degrees, and the winner is whichever equal slice that final angle lands in, so the previous result has no bearing on the next one.",
    ],
    [
      "Can the same person be picked twice in a row?",
      "Yes. Every spin is independent, so with five players there is a 1-in-5 chance of a repeat each time. Nobody is removed from the wheel after being chosen — remove them manually if you want a no-repeat round.",
    ],
    [
      "How long does the animation take?",
      "Between 2 and 3.5 seconds, chosen at random per spin so the stop is not predictable from the timing. Sound effects are off by default and can be switched on with the sound toggle.",
    ],
  ],
};

export default seo;
