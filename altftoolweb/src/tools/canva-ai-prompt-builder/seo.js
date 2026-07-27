const seo = {
  intro:
    "The Canva AI Prompt Builder writes a structured design brief that pins down the four things generative design tools get wrong without instruction: exact canvas size, aspect ratio, brand palette and type, and how much copy actually fits. Canvas sizes are real Canva presets (Instagram post 1080 x 1080, YouTube thumbnail 1280 x 720, A4 poster 2480 x 3508 at 300 DPI), aspect ratios are reduced with the greatest common divisor, and the character budget is derived from a 16 px minimum rendered text size at the smallest width the design is normally viewed at. It is for marketers and small-business owners who want on-brand output rather than a lucky first draft.",
  useCases: [
    "Briefing a set of Instagram posts where the headline must stay readable at the roughly 470 px width a feed post is actually rendered at",
    "Getting three genuinely different layout options for a launch announcement instead of three colour swaps of the same idea",
    "Preparing an A4 poster brief that already states 210 x 297 mm at 300 DPI, CMYK and 3 mm bleed so the file is press-ready",
  ],
  benefits: [
    [
      "Real preset dimensions",
      "Every format carries its actual Canva pixel size and reduced aspect ratio, so nothing gets cropped on export.",
    ],
    [
      "Legibility-checked copy",
      "Headline and supporting-line limits come from a 16 px minimum readable size, not from guesswork about brevity.",
    ],
    [
      "Brand slots that hold",
      "Palette and type are stated as constraints with a dominant colour, which is what stops output drifting off brand between options.",
    ],
  ],
  faqs: [
    [
      "What size should an Instagram post be in Canva?",
      "1080 x 1080 pixels for a square feed post and 1080 x 1920 for a Story or Reel cover. A square post is rendered around 470 px wide in the feed, so text set smaller than roughly 37 px on the 1080 px canvas falls below the 16 px readable floor once it is displayed.",
    ],
    [
      "How long should a headline be on a social graphic?",
      "It depends on the canvas and how small it is viewed. On a YouTube thumbnail seen at about 210 px wide in a results grid, the readable budget is around 22 characters across two lines; on an A4 poster read at arm's length it is closer to 85. This tool calculates the number for whichever format you pick.",
    ],
    [
      "How do I write a good prompt for Canva AI?",
      "State the canvas size and format first, then the subject and audience, then the brand palette and fonts as hard constraints, then the exact copy you want set, then a named visual direction, and finally what to leave out. Ambiguity is what produces generic output, so an explicit 'do not' list matters as much as the brief itself.",
    ],
    [
      "What resolution should a Canva design be for printing?",
      "300 DPI. At 300 DPI an A4 page is 2480 x 3508 pixels and a US business card is 1050 x 600 pixels. Export as PDF Print with CMYK and 3 mm bleed, and keep all text roughly 7% in from every edge so nothing is lost when the sheet is trimmed.",
    ],
  ],
};

export default seo;
