const seo = {
  title: "WhatsApp Catalog Image Maker: 1:1, Under 5MB",
  metaDescription:
    "Builds square catalogue tiles at 500-1600 px and sizes burned-in type above the 11 pt floor for a 177 pt grid tile. Exports PNG, checked under 5 MB.",
  steps: [
    "Type the Product name (up to 80 characters), a Price label and Badge text, then choose a Badge position, Theme and Export size (square) of 500, 800, 1024 or 1600 px.",
    "Compare the two preview canvases — the full tile and the same tile shrunk to its real catalogue grid width in points — then press Download PNG.",
    "The file saves as <product-name>-catalog-<size>.png and the checks underneath mark \"Square 1:1 tile\", \"At least 500 px per side\" and \"Under the 5 MB file limit\" as pass or fail, beside rows for the grid-legible font floor, corner-safe inset and WCAG contrast.",
  ],
  intro:
    "WhatsApp Business Catalog Image Maker produces square product tiles that meet WhatsApp's catalogue rules — at least 500x500 pixels, 1:1, under 5 MB — and sizes any burned-in text so it survives the catalogue grid. Because two tiles share a phone screen roughly 390 points wide, each tile is only about 177 points across, so a label has to be large enough in the export to land at 11 points or more on screen; the tool works that floor out for you and also insets content past the rounded-corner crop. Aimed at small sellers building a catalogue by hand rather than through a design agency.",
  useCases: [
    "Give a whole catalogue a consistent look by fixing one theme and changing only the product name and price.",
    "Check that a long product name still reads in the two-column grid instead of disappearing into a blur.",
    "Add a 'free delivery' or 'new' badge that clears the rounded-corner crop on every device.",
    "Confirm an exported tile is square, above 500 px and under the 5 MB upload limit before adding it to Commerce Manager.",
  ],
  benefits: [
    ["Grid legibility is calculated", "Minimum type size is derived from the real catalogue tile width, not guessed from the full-size artwork."],
    ["Corner crop handled", "Content is inset by the exact rounded-corner geometry, so badges never get sliced off."],
    ["Upload rules checked", "Square aspect, minimum dimension and the 5 MB cap are verified against the file you exported."],
  ],
  faqs: [
    [
      "What size should WhatsApp Business catalogue images be?",
      "Square, at least 500x500 pixels. 1024x1024 is the practical target: it stays sharp on a 3x phone screen and is still far below the 5 MB per-image limit. Upload as JPG or PNG.",
    ],
    [
      "Why does the text on my catalogue image look unreadable?",
      "The catalogue shows two tiles per row, so on a 390-point-wide phone each tile is only around 177 points across. A 1024 px image is displayed at roughly one sixth of its size, meaning text under about 64 px in the export falls below a readable 11 points on screen.",
    ],
    [
      "Should I put the price on the product image?",
      "Only as a secondary cue. WhatsApp shows the price you enter in the item fields separately, and burning it into the image means re-exporting every tile when the price changes. Keep the on-image price large and simple if you use one.",
    ],
    [
      "Why did WhatsApp reject my catalogue item?",
      "Most rejections come from the commerce policy rather than the image size — restricted products, misleading claims or missing details. Fix the listing content, then confirm the image is square, above 500 px and under 5 MB before resubmitting.",
    ],
  ],
};

export default seo;
