const seo = {
  intro:
    "A4 Flyer Bleed Template turns an ISO 216 paper size into a print-ready artboard: trim size, a 3 mm bleed on every edge, a safe area for type, crop marks and fold panel positions. Pixel dimensions come from the definition of the inch — pixels = millimetres ÷ 25.4 × resolution — so an A4 page at 300 ppi resolves to the familiar 2480 × 3508 px trim area inside a 2551 × 3579 px bleed canvas. Made for designers setting up a flyer, leaflet or brochure before artwork starts.",
  useCases: [
    "Set up an A4 flyer canvas at 300 ppi with bleed already added, instead of resizing after the fact.",
    "Get roll tri-fold panel widths for a landscape A4 leaflet with the tuck allowance already deducted.",
    "Check that a DL flyer's headline sits inside the 5 mm safe area before sending files to a printer.",
    "Export an SVG guide layer to drop under artwork in Illustrator, Affinity or Inkscape.",
  ],
  benefits: [
    [
      "Bleed and safe area in one step",
      "Trim, bleed box and live area are calculated together, so nothing is a guess at export time.",
    ],
    [
      "Fold panels with a tuck allowance",
      "Roll and gate folds shorten the innermost panel by 2 mm so the leaflet closes flat.",
    ],
    [
      "Downloadable guide artboard",
      "The SVG carries real millimetre dimensions, so it opens at the correct size in any vector editor.",
    ],
  ],
  faqs: [
    [
      "How much bleed does an A4 flyer need?",
      "3 mm on every edge is the standard for ISO paper sizes, making the artboard 216 × 303 mm for a 210 × 297 mm A4 page. US presses often specify 0.125 inch (about 3.175 mm) instead, so confirm with your printer.",
    ],
    [
      "What size is A4 in pixels at 300 DPI?",
      "2480 × 3508 pixels for the trim area, because 210 mm ÷ 25.4 × 300 = 2480 and 297 mm ÷ 25.4 × 300 = 3508. With 3 mm bleed added the full canvas becomes 2551 × 3579 pixels.",
    ],
    [
      "Why are tri-fold panels not all the same width?",
      "In a roll or letter fold the innermost panel tucks inside the other two, so it is made about 2 mm narrower to stop it buckling at the fold. A Z or accordion fold folds in alternating directions, so its three panels stay equal.",
    ],
    [
      "What is the difference between bleed and safe margin?",
      "Bleed is artwork that extends past the trim line so a slight cutting drift never leaves a white sliver. The safe margin works inward: keep text and logos at least 5 mm inside the trim so the same drift does not clip them.",
    ],
  ],
};

export default seo;
