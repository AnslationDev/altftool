const seo = {
  intro:
    "This calculator returns the minimum capital-letter height text needs in order to stay legible at a given viewing distance, in millimetres, inches, points and screen pixels. It works from visual angle rather than a rule of thumb: cap height = 2 × distance × tan(angle ÷ 2), using the character heights human-factors standards call for — roughly 20 to 22 minutes of arc for comfortable reading, about 16 arcminutes as the floor, and near 30 arcminutes for signage read at a glance. Useful for wayfinding, exhibition graphics, posters, packaging and presentation slides.",
  useCases: [
    "Sizing a wayfinding sign in a lobby where the furthest reader stands 12 metres away",
    "Checking that the smallest text on a conference slide is readable from the back row of a 20 metre room",
    "Specifying cap height for an exhibition wall graphic before sending artwork to a large-format printer",
  ],
  benefits: [
    ["Standards-based, not folklore", "Sizes come from the visual angle recommendations in ISO 9241-303 and ANSI/HFES 100."],
    ["Cap height and point size", "Converts between the two using the real cap-height-to-em ratio of your typeface class."],
    ["Works on screen too", "Turns the physical requirement into a pixel size for a slide or artboard of known dimensions."],
  ],
  faqs: [
    [
      "How big should text be to read from 10 feet away?",
      "About 1 inch (26 mm) of capital height, which is where the familiar sign-maker rule of 1 inch per 10 feet comes from — it corresponds to a visual angle of roughly 30 arcminutes. For sustained reading rather than a glance you can go smaller, down to about 0.7 inch (18 mm) at that distance.",
    ],
    [
      "What is the minimum readable text size?",
      "Around 16 minutes of arc of character height is the accepted floor for accurate reading by someone with normal vision. Below that, reading speed and accuracy fall off quickly, so standards put the recommended range higher, at about 20 to 22 arcminutes.",
    ],
    [
      "Is cap height the same as font size?",
      "No. Font size is the em box; cap height is the height of an uppercase letter inside it, and it is typically 0.66 to 0.72 of the em. Helvetica sits at about 0.716 em and Times at about 0.662, so the same 100 pt setting produces visibly different letter heights.",
    ],
    [
      "What font size should presentation slides use?",
      "Work backwards from the back row. For a 1.5 m tall projection viewed from 8 m, the 22-arcminute comfortable target needs about 51 mm of cap height, which works out at roughly 52 px of font size on a 1080-pixel-tall slide. As a safety net, keep the smallest text on any slide above 24 pt.",
    ],
  ],
};

export default seo;
