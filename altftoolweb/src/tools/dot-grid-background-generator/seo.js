const seo = {
  title: "Dot Grid Background CSS Generator with Live Preview",
  metaDescription:
    "Set dot spacing, radius and opacity, preview the pattern live, and copy a two-line CSS radial-gradient background that needs no image file.",
  steps: [
    "Set the cell size in Spacing px, the dot radius in Dot px and the ink strength in Opacity (defaults 24 / 2 / 0.22).",
    "Watch the preview swatch repeat your dot as a radial-gradient tile at the chosen background-size while you adjust the numbers.",
    "Click Copy CSS to copy the generated background-image radial-gradient and background-size declaration; Reset restores the 24 px default grid.",
  ],
  intro:
    "Dot Grid Background Generator builds dot, isometric, square line, graph-paper and cross-mark grids and reports exactly how much of the surface the ink covers. Coverage has a closed form for each lattice — π r² ÷ cell² for a dot grid, 1 − ((cell − width) ÷ cell)² for a two-family line grid — so you can see before you ship whether a background will interfere with body text. Output comes as CSS gradients using color-mix, or as a repeating SVG tile with fill-opacity that opens correctly in vector editors.",
  useCases: [
    "Add a subtle 24 px dot grid behind a hero section that stays under 0.1% average alpha.",
    "Generate an isometric dot lattice for a technical illustration board.",
    "Produce graph paper with a heavier line every five cells for a printable worksheet.",
    "Check whether a 25 px cell breaks alignment with an 8 point spacing scale before committing to it.",
  ],
  benefits: [
    [
      "Coverage is calculated",
      "Ink coverage and average alpha come from the lattice geometry, not from eyeballing a screenshot.",
    ],
    [
      "Two export formats",
      "CSS gradients need no network request; the SVG tile drops straight into a design file.",
    ],
    [
      "Base-unit check",
      "The tool flags a cell size that is not a multiple of 8 px, which is where grid drift usually starts.",
    ],
  ],
  faqs: [
    [
      "What cell size should a dot grid background use?",
      "Pick a multiple of your spacing scale — 8, 16, 24 or 32 px if you are on an 8 point system — so the grid lines up with the rest of the layout. 24 px with a 1 px radius dot is a common, unobtrusive default.",
    ],
    [
      "How do I make a dot grid in pure CSS?",
      "Use a radial-gradient with a hard stop and set background-size to the cell: background-image: radial-gradient(circle at center, <colour> 1px, transparent 1.5px); background-size: 24px 24px. Two offset gradients with different background-position give you an isometric lattice.",
    ],
    [
      "Will a grid background hurt text contrast?",
      "It can. WCAG contrast is measured against the colour a pixel actually renders, so ink sitting behind text lowers the effective ratio. Keep the average alpha of the pattern under roughly 2% behind body copy, and check the darkest point of the pattern rather than the page colour.",
    ],
    [
      "Should I export CSS or SVG?",
      "CSS if the grid only exists on the web — it costs no extra request and scales with the element. SVG if the grid needs to travel into Figma, Illustrator or a print file, or if you want the exact same tile in several tools.",
    ],
  ],
};

export default seo;
