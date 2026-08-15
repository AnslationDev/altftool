const seo = {
  title: "Wedding Font Pairing: x-Height in mm and 300 dpi",
  metaDescription:
    "Eight script, caps and serif pairings for invitations, checked as printed x-height in millimetres against the 1.4 mm legibility mark, plus dpi artboards.",
  intro:
    "Wedding Font Pairing matches a calligraphic script for names with a caps face for accent lines and a text serif or sans for the details, then checks the result in millimetres rather than points. It converts each point size to a physical x-height (1 pt = 1/72 inch = 0.3528 mm), compares it against the 1.4 mm x-height the European Commission's labelling readability guideline treats as comfortably legible, estimates characters per line inside your margins and gives the artboard size in pixels at 300, 350 or 600 dpi.",
  useCases: [
    "Check whether 8 pt details text on an A6 invitation will actually be readable by older guests.",
    "Set up a 5 × 7 inch save-the-date artboard at 300 dpi with the correct pixel dimensions before opening your design app.",
    "Compare a fine copperplate script against a monoline one when you know the printer needs a minimum stroke width.",
    "Work out the smallest point size a chosen serif can hold on an RSVP card without dropping below the legibility benchmark.",
  ],
  benefits: [
    ["Millimetres, not guesswork", "Point sizes are converted to real x-heights so you know how tall the letters print."],
    ["Three roles per pairing", "Every combination names a script for the couple, a caps face for accent lines and a text face for details."],
    ["Press-ready canvas sizes", "Card dimensions convert straight to pixel artboards at 300, 350 or 600 dpi."],
  ],
  faqs: [
    [
      "What font size should wedding invitation text be?",
      "Details and RSVP text are usually set between 9 and 12 pt, and names between 30 and 60 pt. What matters more than the point size is the x-height: aim for at least 1.4 mm on the details block, which is roughly 9 pt in a large x-height serif like Libre Baskerville but nearer 11 pt in Cormorant Garamond.",
    ],
    [
      "How do I convert points to millimetres?",
      "One point is exactly 1/72 of an inch, and one inch is 25.4 mm, so 1 pt = 0.3528 mm. A 10 pt line therefore occupies a 3.53 mm em — but the lowercase letters only fill the x-height, typically 44–53% of that for a text face and as little as 32% for a formal script.",
    ],
    [
      "What resolution should invitation artwork be?",
      "300 dpi is the standard for digital and offset printing; some presses ask for 350 dpi, and 600 dpi is used for line art and foil separations. An A6 card (105 × 148 mm) at 300 dpi is 1240 × 1748 pixels before bleed.",
    ],
    [
      "Can a script font be used for the whole invitation?",
      "It is best avoided. Formal scripts have small x-heights, thin strokes and heavily connected letters, so a full paragraph in one is slow to read and can break up in letterpress or foil. Use the script for names and a short accent line, and set every date, time, address and RSVP instruction in the text face.",
    ],
  ],
};

export default seo;
