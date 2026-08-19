const seo = {
  title: "AI Logo Prompt Builder + Stroke & Favicon Limits",
  metaDescription:
    "Compose a Midjourney or DALL-E logo prompt from mark type, shape language and palette — with minimum stroke %, element budget, clear space and print px.",
  steps: [
    "Type a 'Brand name' and choose 'Mark type', 'Shape language', 'Palette strategy', 'Style era' and 'Construction grid'.",
    "Enter 'Smallest reproduction size (px)', 'Smallest print height (mm)' and 'Print resolution (dpi)' — these drive the reproduction limits.",
    "Press 'Copy prompt' for the prompt and negative prompt, and check 'Minimum stroke weight', 'Element budget', 'Clear space' and 'Print raster height'.",
  ],
  intro:
    "This generator composes an image-model prompt for a logo from your chosen mark type, shape language, palette strategy and style era, and computes the reproduction limits the mark must survive — minimum stroke weight, element budget, clear space and the print raster size. The limits follow from raster physics (a feature narrower than one device pixel vanishes) and the standard brand-guide convention of clear space equal to half the mark height. It is built for founders and designers who want a usable symbol, not just a pretty picture.",
  useCases: [
    "A founder generating first-round logo concepts in Midjourney or DALL-E who needs the prompt to forbid mockups, shadows and garbled text",
    "A designer checking how many distinguishable shapes a mark can carry if it must still read at 16 px favicon size",
    "A brand team converting a 10 mm print requirement at 300 dpi into the minimum raster height before exporting assets",
  ],
  benefits: [
    ["Constraints, not just adjectives", "Stroke weight and element budget are computed from your smallest reproduction size; clear space follows the standard half-mark-height convention at the reference artboard size."],
    ["Mark-type guidance built in", "Each of the seven mark types comes with when-to-use advice and its known trade-off."],
    ["Model-safe negatives", "The negative prompt always blocks photorealism, 3D bevels and mockups, plus lettering the model would garble for symbol-only mark types (pictorial, abstract, mascot) that shouldn't show text."],
  ],
  faqs: [
    [
      "How do I write a good AI prompt for a logo?",
      "Name the mark type (wordmark, lettermark, pictorial, abstract, combination, emblem or mascot), one shape language, one palette strategy and a flat plain background, then add negatives like 'no mockup, no 3D, no drop shadow'. Vague prompts like 'modern minimal logo' produce generic marks; the structure matters more than the adjectives.",
    ],
    [
      "Why does my AI-generated logo look bad as a small icon?",
      "Because it has too many elements and too-thin strokes. At 32 px you have room for roughly 8 distinguishable shapes (about 4 px per element), and any stroke thinner than 1/32 of the mark's height — about 3.1% — disappears entirely. Generate with the smallest size in mind, not the large hero render.",
    ],
    [
      "Can AI image models generate a logo with the brand name in it?",
      "Not reliably — diffusion models routinely garble lettering, especially at small sizes. The standard workflow is to generate the symbol only, then set the brand name in real type in a vector editor such as Figma, Illustrator or Inkscape and build the lockup manually.",
    ],
    [
      "What resolution does a logo need for print?",
      "At least the physical size times the print resolution: a 10 mm tall mark at 300 dpi needs a raster at least 119 px high (10 / 25.4 x 300, rounded up). In practice you should hand printers vector artwork (SVG, PDF or EPS) so the question never arises; rasters are a fallback only.",
    ],
  ],
};

export default seo;
