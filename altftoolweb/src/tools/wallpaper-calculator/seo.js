const seo = {
  intro:
    "The Wallpaper Calculator tells you how many rolls to buy for a room by working in drops, the way decorators actually do it: drops needed = wall run / roll width, drops per roll = roll length / drop length rounded down, rolls = drops needed / drops per roll rounded up. It handles the three trade pattern-match types — free, straight and half-drop offset — because a pattern repeat forces each drop to be cut to a whole number of repeats and can add several rolls to the same room. Use it before you order, when a discontinued batch means a second order is not an option.",
  useCases: [
    "Papering a 4 m x 3 m bedroom with 2.4 m ceilings and needing to know whether 7 or 9 rolls covers it once the pattern repeat is included.",
    "Comparing a plain free-match paper against a 64 cm straight-match design to see how much the pattern costs in extra rolls.",
    "Checking a feature wall with a full-height patio door, so the opening width comes out of the wall run before the drops are counted.",
  ],
  benefits: [
    ["Rounds the way rolls actually cut", "Drops per roll are rounded down and rolls are rounded up, so you never end up one drop short."],
    ["Pattern repeat handled properly", "Straight match rounds each drop up to a whole repeat; half-drop match adds the customary extra half repeat first."],
    ["Shows the waste", "Reports offcut left on each roll, spare drops and total waste percentage, so you can see what the pattern is costing you."],
  ],
  faqs: [
    [
      "How many rolls of wallpaper do I need for a 4 m by 3 m room?",
      "With 2.4 m ceilings, a free-match paper and a standard 10.05 m x 53 cm roll: the perimeter is 14 m, so 14 / 0.53 = 27 drops; each drop is 2.5 m including trim, so 10.05 / 2.5 = 4 drops per roll; 27 / 4 rounds up to 7 rolls.",
    ],
    [
      "How big is a standard roll of wallpaper?",
      "The European standard roll is 10.05 m long and 53 cm wide, which is 5.33 square metres of paper. Wide Euro rolls are 70 cm, and an American single roll is 27 inches wide by about 4.6 m long.",
    ],
    [
      "Does pattern repeat change how many rolls I need?",
      "Yes, often by two or three rolls. On a straight match every drop is cut to a whole number of repeats, so a 2.5 m drop with a 64 cm repeat becomes 2.56 m — that drops the yield from 4 drops per roll to 3, taking a 14 m room from 7 rolls to 9.",
    ],
    [
      "Should I deduct doors and windows?",
      "Only full-height openings such as patio doors are worth deducting from the wall run; decorators paper past standard windows and doors and trim, because the offcut rarely fits anywhere else. Add one spare roll if the paper is a limited batch.",
    ],
  ],
};

export default seo;
