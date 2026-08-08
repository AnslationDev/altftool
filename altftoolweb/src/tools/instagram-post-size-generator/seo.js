const seo = {
  title: "Instagram Post Size Generator: 1080px Batch Export",
  metaDescription:
    "Fit one image to 1080×1080, 1080×1350, 1080×566 and 1080×1920, see how much each ratio crops away, then export them all in your browser.",
  steps: [
    "Choose Your artwork with the file picker (it accepts any image/*), set How should it fit? to 'Fill the frame (crop the overflow)' or 'Fit the whole image (add bars)', and pick JPEG (photos) or PNG (flat colour, text) as the Export format.",
    "Drag the 'Crop anchor — horizontal' and 'Crop anchor — vertical' sliders across 0–100% and tick the canvases you need: Feed square 1080 × 1080, Feed portrait 1080 × 1350, Feed landscape 1080 × 566, Story or Reel 1080 × 1920 or Profile picture 320 × 320.",
    "Press Export all to save every ticked size — files land as instagram-portrait-1080x1350.jpg and the like — or use the Download button on a single row; Copy result takes the crop-loss plan as text.",
  ],
  intro:
    "Instagram Post Size Generator fits one piece of artwork to every Instagram canvas — 1080 × 1080 square, 1080 × 1350 portrait, 1080 × 566 landscape and the 1080 × 1920 story frame — and exports them in a batch. Before you export it shows the number that actually matters: how much of the original image each ratio crops away at your chosen anchor point, and whether the source has enough pixels or is being enlarged. Fitting uses the standard cover and contain scaling rules, and everything runs in the browser so the image is never uploaded.",
  useCases: [
    "Take one 2000 × 1500 product photo and get square, portrait, landscape and story crops in a single pass.",
    "Discover before publishing that the 4:5 portrait crop is discarding 40% of a wide landscape shot, and slide the anchor to save the subject.",
    "Check whether a 600 × 600 logo has enough resolution for a 1080 × 1080 post — it does not, and the tool says so rather than quietly upscaling.",
    "Export a 9:16 story frame with the top and bottom interface allowance marked, so headline text does not sit under the app chrome.",
  ],
  benefits: [
    [
      "Crop cost shown before export",
      "Each ratio reports the percentage of the original area it discards, so you choose the anchor deliberately instead of discovering the crop later.",
    ],
    [
      "Upscaling is flagged, not hidden",
      "A resolution figure under 100% means there are fewer source pixels than the canvas needs, which is why the export looks soft.",
    ],
    [
      "Nothing leaves your device",
      "The file is read and drawn locally, so unreleased campaign artwork stays on your machine.",
    ],
  ],
  faqs: [
    [
      "What is the best image size for an Instagram post?",
      "1080 × 1080 for a square and 1080 × 1350 for a portrait post. Instagram serves feed images at up to 1080 pixels wide, so exporting larger gains nothing. Portrait at 4:5 is the tallest ratio the feed accepts and takes up the most screen height, which is why it is the usual choice for reach.",
    ],
    [
      "What size is an Instagram story or Reel?",
      "1080 × 1920 pixels, a 9:16 ratio matching a full phone screen. Meta's own Stories creative guidance keeps roughly 250 pixels clear at the top and bottom for interface elements. Reels put more interface at the bottom than Stories do, so keep captions higher and check the result in the app before publishing.",
    ],
    [
      "Should I use fill or fit for Instagram?",
      "Use fill for photographs, where losing the edges is acceptable and a full-bleed frame looks better. Use fit when the whole composition matters — a chart, a poster, a logo lockup — and accept the bars. Fill is the default here because feed posts with bars look like mistakes.",
    ],
    [
      "Why does my image look blurry after uploading to Instagram?",
      "Almost always because the source was narrower than the canvas and had to be enlarged. A 600-pixel-wide source in a 1080-pixel canvas has only 56% of the pixels it needs. Instagram also recompresses uploads, which makes an already-soft image worse, so start at 1080 pixels wide and never below the 320-pixel minimum.",
    ],
  ],
};

export default seo;
