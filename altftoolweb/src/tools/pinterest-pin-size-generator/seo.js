const seo = {
  title: "Pinterest Pin Sizes: 1000×1500, 1000×1000, 1080×1920",
  metaDescription:
    "Get canvas dimensions for standard 2:3 (1000×1500), square and idea/story pins, with scaled exports, safe-area size and ready-to-paste CSS.",
  steps: [
    "Pick a Pin type — Standard 2:3 pin 1000×1500, Square pin 1000×1000, or Idea/story pin 1080×1920 — then set the Export scale and Safe inset px.",
    "Read the Pin dimensions panel: the scaled canvas width × height, the safe area remaining after the inset, and .pin-artboard / .pin-safe-area CSS rules.",
    "Click Copy output to grab the preset, dimensions and CSS block in one paste-ready snippet.",
  ],
  intro:
    "This generator resizes artwork to Pinterest's pin canvases — 1000x1500 standard, 1000x1000 square, 1000x2100 long and 1080x1920 idea pin — and tells you how much of the frame is cropped before you export. It also applies Pinterest's feed rule: pins are shown in full up to about 1:2.1 height-to-width, and anything taller is cut off. All resizing runs on canvas in your browser, so the image is never uploaded.",
  useCases: [
    "Convert a 4:3 product photograph into the recommended 2:3 pin shape and see exactly which 44% of the image gets cropped away.",
    "Check whether a tall infographic at 1000x2600 will be truncated in the home feed, and what height keeps it fully visible.",
    "Repurpose a 1080x1920 Reel frame as an idea pin without letterboxing, then export a matching 1000x1500 static pin for the same campaign.",
    "Batch a set of board covers to a consistent 1000x1000 square so the board grid stops looking ragged.",
  ],
  benefits: [
    ["Feed truncation check", "Warns when a pin is taller than the roughly 1:2.1 point where the feed stops showing the whole image."],
    ["Crop shown before export", "The preview frame is the real pin shape, with the cropped percentage stated as a number."],
    ["Local canvas export", "PNG, JPEG or WebP written in the browser with an adjustable encoder quality — no upload, no watermark."],
  ],
  faqs: [
    [
      "What is the best Pinterest pin size?",
      "1000 x 1500 pixels, a 2:3 ratio. That is the shape Pinterest recommends and the tallest one guaranteed to display in full across the home feed, search and board views on both mobile and desktop.",
    ],
    [
      "How tall can a Pinterest pin be before it gets cut off?",
      "Roughly 1:2.1 height-to-width — about 1000 x 2100 pixels. Past that the feed shows the top portion and hides the rest behind a tap, so a 1000 x 2600 infographic would only reveal around 81% of itself in the scroll.",
    ],
    [
      "What is the maximum file size for a pin image?",
      "Pinterest accepts still images up to 20 MB. If a PNG export goes over, switch to JPEG at 80-90% quality; a photographic 1000 x 1500 pin usually lands well under 1 MB at that setting with no visible difference.",
    ],
    [
      "What size should an idea pin be?",
      "1080 x 1920 pixels at 9:16, the same full-screen shape as Reels and Stories. Keep headlines and logos away from the top and bottom of the frame because the profile row, caption and action buttons overlay those areas.",
    ],
  ],
};

export default seo;
