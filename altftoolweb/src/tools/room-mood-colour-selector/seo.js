const seo = {
  intro:
    "This selector builds a room palette from two inputs that actually decide how paint looks: the mood you are after and the direction the room's main window faces. It returns a 60-30-10 scheme — dominant wall, secondary, accent, plus a trim tone — and reports the Light Reflectance Value of each colour, computed as sRGB relative luminance (0.2126 red, 0.7152 green, 0.0722 blue after linearisation) on a 0-100 scale. It also checks the contrast between wall, trim and accent against the 3:1 ratio a shape needs to read clearly, and warns when a colour is too dark for a room that only gets cool indirect light.",
  useCases: [
    "Find a wall colour for a north-facing bedroom that will not turn grey in the afternoon.",
    "Choose an accent that will actually stand out against the wall instead of disappearing into it.",
    "Check whether a deep, dramatic colour will leave a room needing far more artificial light.",
  ],
  benefits: [
    ["Light direction matters", "Warms and lifts the palette for a room with cool indirect light, and lets a sunny room take deeper colour."],
    ["LRV on every colour", "Tells you how much light each shade gives back, the number decorators use to judge a paint chip."],
    ["Accent that reads", "The accent's lightness is tuned until it clears 3:1 against the wall, so it never merges into the background."],
  ],
  faqs: [
    [
      "What colour should I paint a north-facing room?",
      "In the northern hemisphere a north-facing room gets cool, indirect light all day, so warm-leaning colours with an LRV above about 60 keep it from reading grey. Cool greys and deep blues are the ones that most often disappoint in that light. In the southern hemisphere it is the south-facing rooms that get this treatment.",
    ],
    [
      "What is LRV in paint?",
      "Light Reflectance Value is the percentage of visible light a colour reflects, from 0 for pure black to 100 for pure white. It is the same relative luminance calculation used for screen contrast: saturated red measures about 21 and saturated green about 72. A wall below LRV 40 will noticeably darken a room and needs more lamps to compensate.",
    ],
    [
      "What is the 60-30-10 rule in interior design?",
      "It splits a scheme by how much of the room each colour covers: about 60% for the dominant colour (usually the walls), 30% for a secondary (large furniture, curtains, a rug) and 10% for an accent (cushions, art, one painted element). Keeping the proportions makes even a bold accent feel deliberate rather than loud.",
    ],
    [
      "Should I trust a paint colour from a screen?",
      "No — treat it as a starting point. Screens differ in calibration, and paint changes character with the light in your room, the sheen of the finish and the colours already there. Buy a sample pot, paint a large patch or a board, and look at it in morning, afternoon and lamplight before ordering.",
    ],
  ],
};

export default seo;
