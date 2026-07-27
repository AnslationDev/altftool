const seo = {
  intro:
    "The Print Bleed Calculator turns a finished trim size into every box a press-ready document needs: artboard, bleed, trim, safe area and slug, given in millimetres, inches, PostScript points and pixels at your chosen resolution. It applies the rules directly — document size = trim + 2 × bleed, safe area = trim − 2 × safe margin, and pixels = inches × DPI, with 1 inch fixed at exactly 25.4 mm. Presets cover the ISO 3 mm and US 1/8 inch bleed standards and the common A-series, DL, Letter and business-card trim sizes.",
  useCases: [
    "Set up an InDesign or Illustrator document for an A4 flyer and know the artboard should be 216 × 303 mm, not 210 × 297 mm.",
    "Convert a printer's inch-based spec into millimetres for a European press without doing the arithmetic twice.",
    "Check the pixel dimensions a raster file needs at 300 DPI before starting artwork in Photoshop or Affinity Photo.",
    "Work out how far in from the artboard edge to place the trim and safe guides on a job with a slug area for crop marks.",
  ],
  benefits: [
    ["Every unit at once", "Millimetres, inches, points and pixels for each box, so the same setup works in any application."],
    ["Standards built in", "3 mm ISO and 1/8 inch US bleed presets, plus ISO 216 and North American trim sizes."],
    ["Catches the classic errors", "Warns about zero bleed, a safe margin narrower than the bleed, and resolutions below the 150 DPI print floor."],
  ],
  faqs: [
    [
      "How much bleed do I need for printing?",
      "3 mm on every edge is the standard for European and ISO commercial print; North American printers usually specify 1/8 inch, which is 3.175 mm. Large-format and packaging work sometimes asks for 5 mm. Bleed is added to all four sides, so a 210 × 297 mm A4 flyer becomes a 216 × 303 mm document at 3 mm bleed.",
    ],
    [
      "What is the difference between bleed, trim and safe area?",
      "Trim is the finished size after cutting. Bleed is artwork extended past the trim so a cut that drifts by a fraction of a millimetre cannot leave a white edge. The safe area is an inset inside the trim — usually 3 to 5 mm — where text and logos must stay so the same drift cannot clip them.",
    ],
    [
      "What size is A4 in pixels at 300 DPI?",
      "A4 is 210 × 297 mm, which is 8.268 × 11.693 inches, so at 300 DPI the trim size is 2480 × 3508 pixels. Add 3 mm bleed on each side and the document you actually build becomes 216 × 303 mm, or 2551 × 3579 pixels at the same resolution.",
    ],
    [
      "Do I need bleed if my design has a white background?",
      "Not strictly — if nothing is meant to reach the edge, there is nothing to bleed. But most printers still want the file supplied at the bleed size with crop marks so the imposition and cutting are consistent, and adding bleed costs nothing. Check the specification the printer supplies before deciding.",
    ],
  ],
};

export default seo;
