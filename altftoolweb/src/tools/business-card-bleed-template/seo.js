const seo = {
  title: "Business Card Bleed, Trim & Safe Area Calculator",
  metaDescription:
    "Enter card width, height and bleed per side to get the trim size, the full artwork size with bleed and the safe text inset, in mm or inches.",
  steps: [
    "Enter Card width and Card height — 90 and 54 by default — plus Bleed each side, and set Unit to mm or inches.",
    "The template rebuilds on every keystroke; press Reset to return to a 90 × 54 card with 3 mm bleed.",
    "Read Business card template for the Trim size, Artwork size and Safe text area inset with its layer checklist, then press Copy output.",
  ],
  intro:
    "This tool builds a press-ready business card template as a true-size SVG, drawing the three boxes a printer expects: the bleed box (trim + 2 × bleed), the magenta trim line where the guillotine cuts, and a dashed cyan safe box (trim − 2 × safe margin) that type must stay inside. Crop marks are placed outside the bleed box rather than over the artwork, which is what PDF/X requires, and the file is written with physical units (width=\"101mm\", 1 SVG unit = 1 mm) so it opens at real size in Illustrator, Affinity Designer or Inkscape. It is for anyone laying out a card for an actual print run instead of guessing margins in a screen-pixel document.",
  useCases: [
    "Your printer rejected a card file for \"no bleed\" and you need a guide that shows exactly how far the background has to run past the trim line",
    "You are designing a card for a US client on 3.5 × 2 in stock while working in millimetres, and need the same layout expressed in mm, inches, points and 300 DPI pixels",
    "You want to gang cards up yourself on SRA3 and need to know how many bleed boxes actually tile onto the sheet before committing to a size",
  ],
  benefits: [
    [
      "Real-world card sizes, not a generic rectangle",
      "Presets cover Europe/India/UK 85 × 55 mm, US 3.5 × 2 in, ISO 7810 ID-1 85.6 × 53.98 mm, Japan 91 × 55 mm, Australia/NZ 90 × 55 mm, square 55 × 55 mm and slim 85 × 40 mm.",
    ],
    [
      "Every box in four unit systems at once",
      "Trim, bleed, safe and canvas are each reported in millimetres, inches, PostScript points and pixels at your chosen DPI, so the same template works whoever you hand it to.",
    ],
    [
      "Tells you when the geometry is risky",
      "It warns on zero bleed, on a safe margin under 3 mm, and on any resolution below the 300 DPI normally specified for cards — before the job goes to press.",
    ],
  ],
  faqs: [
    [
      "How much bleed does a business card need?",
      "3 mm per edge is the ISO/European standard and 1/8 inch (3.175 mm) is the North American equivalent; 5 mm is used for thick or textured stock. Bleed is added on every side, so an 85 × 55 mm card with 3 mm bleed produces a 91 × 61 mm artwork box.",
    ],
    [
      "What is the difference between trim, bleed and safe area?",
      "Trim is the finished card size where the blade cuts, bleed is the extra artwork outside it that absorbs cutting drift, and the safe area is the inset where text must stay. This template defaults to a 4 mm safe margin rather than 3 mm because a guillotine cutting a stack of card stock wanders more than it does on a single sheet.",
    ],
    [
      "How many cards fit on one sheet?",
      "The tool computes floor(sheet width ÷ box width) × floor(sheet height ÷ box height) and tries both rotations, keeping the better one. A standard 85 × 55 mm card with 3 mm bleed makes a 91 × 61 mm box, which gangs 9-up on A4 when rotated — versus only 8 upright. A4, A3, SRA3 and US Letter are all available as parent sheets.",
    ],
    [
      "Why are the crop marks drawn outside the bleed?",
      "Because marks printed over live artwork make a file fail PDF/X preflight. Here each mark starts at the bleed edge and runs outward for the crop-mark length — 5 mm by default, the usual imposition setting — and all guides are drawn as 0.2 mm hairlines (about 0.57 pt) so they never fatten the layout.",
    ],
  ],
};

export default seo;
