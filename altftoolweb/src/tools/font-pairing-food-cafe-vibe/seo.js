const seo = {
  intro:
    "Food And Cafe Font Pairing matches warm display faces with readable body fonts for menus, boards and packaging, and calculates the two print numbers that decide whether a menu works in the room. Minimum body size comes from the legibility convention that character height should be at least 1/200 of the reading distance, scaled up for dim lighting: at 400 mm in a candlelit dining room that lands near 10 pt. Leader-dot counts come from the column width minus the dish name, the price and a 2 mm gap either side.",
  useCases: [
    "Check whether 9 pt body text is readable on a menu handed to guests in a dimly lit restaurant.",
    "Work out how many leader dots sit between the longest dish name and its price in an 80 mm column.",
    "Choose a heading face for a cafe board that still has a body font legible at small sizes on the printed card.",
    "Compare the minimum type size needed for a bright daytime cafe against an evening bar.",
  ],
  benefits: [
    ["Sized for the room", "Minimum type size accounts for both reading distance and how dim the space is."],
    ["Leader dots that actually fit", "Warns when the dish name and price already fill the column before any dots are placed."],
    ["Print and screen together", "Outputs points for the printer and pixels for the website version of the same menu."],
  ],
  faqs: [
    [
      "What font size should a printed menu use?",
      "Around 10 to 11 pt for body text read at arm's length in normal restaurant lighting, rising toward 11 to 12 pt in a very dim room. Below about 9 pt guests start holding the menu at an angle to catch the light.",
    ],
    [
      "Which fonts work best for restaurant menus?",
      "Pair a display serif for course headings with a compact, high-legibility body face: Playfair Display with Karla, Lora with Source Sans 3, or Bitter with Open Sans. Reserve informal faces such as Amatic SC for boards and never set prices in them.",
    ],
    [
      "How do I align prices on a menu?",
      "Either right-align the prices in a fixed column with tabular figures, or run a dotted leader between the dish and the price. For a leader, leave at least 2 mm of clear space on each side so the dots do not touch the text.",
    ],
    [
      "Should menu text be all caps?",
      "Only for short course headings. All caps removes the word-shape cue that helps scanning, so a paragraph-length dish description set in caps is measurably slower to read. If you use caps, add roughly 0.05em of letter-spacing.",
    ],
  ],
};

export default seo;
