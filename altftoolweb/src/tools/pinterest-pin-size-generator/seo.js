const seo = {
  title: "Pinterest Pin Sizes 1000×1500 1000×1000 1080×1920",
  metaDescription:
    "Get canvas dimensions for standard 2:3 (1000×1500), square and idea/story pins, with scaled exports, safe-area size and ready-to-paste CSS.",
  steps: [
    "Pick a Pin type — Standard 2:3 pin 1000×1500, Square pin 1000×1000, or Idea/story pin 1080×1920 — then set the Export scale and Safe inset px.",
    "Read the Pin dimensions panel: the scaled canvas width × height, the safe area remaining after the inset, and .pin-artboard / .pin-safe-area CSS rules.",
    "Click Copy output to grab the preset, dimensions and CSS block in one paste-ready snippet.",
  ],
  intro:
    "This generator turns Pinterest's three pin canvases — Standard 2:3 at 1000×1500, Square at 1000×1000 and Idea/story at 1080×1920 — into exact numbers for your design file. Pick a Pin type, set an Export scale for 2x or 3x output, and enter a Safe inset in pixels: the Pin dimensions panel returns the scaled canvas size, the safe area left inside that inset, and ready-to-paste .pin-artboard and .pin-safe-area CSS rules. It works entirely from those three inputs — it does not resize, crop or upload images.",
  useCases: [
    "Set up a Figma or Photoshop artboard for a standard pin at retina scale: choose Standard 2:3, type 2 into Export scale and read off the 2000×3000 canvas before you draw anything.",
    "Keep headlines clear of the edges by giving a 1000×1500 pin a 64px safe inset and designing text inside the 872×1372 safe area the panel reports.",
    "Build a pin template in code by pasting the generated .pin-artboard aspect-ratio rule and .pin-safe-area inset straight into your stylesheet.",
    "Brief a designer with one click: Copy output grabs the preset name, canvas, safe area and CSS block as a single plain-text snippet for the ticket.",
  ],
  benefits: [
    ["Three real Pinterest presets", "Standard 2:3 (1000×1500), Square (1000×1000) and Idea/story (1080×1920) are built into the Pin type menu, so you never mistype a canvas size."],
    ["Scale and safe area computed together", "Export scale multiplies the canvas while Safe inset px is subtracted from every edge of the scaled result, clamped so the safe area never goes negative."],
    ["CSS included in every result", "Each output ends with a .pin-artboard width, height and aspect-ratio rule plus a .pin-safe-area inset rule, ready for Copy output."],
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
