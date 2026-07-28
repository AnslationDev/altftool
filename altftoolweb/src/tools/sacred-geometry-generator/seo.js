const seo = {
  title: "Sacred Geometry Generator — Free SVG & PNG Export",
  h1: "Sacred Geometry Generator",
  metaDescription:
    "Draw the Flower of Life, Sri Yantra, or Metatron's Cube in your browser — adjust complexity, rotation and palette, then export SVG or 1600px PNG.",
  intro:
    "The Sacred Geometry Generator draws the Flower of Life, Sri Yantra, and Metatron's Cube as live SVG, computed from trigonometry in your browser rather than loaded as clip art. The Flower of Life is tiled on a hexagonal lattice using cube coordinates (q, r, s = −q−r) so every circle shares one radius; Metatron's Cube is built from thirteen nodes — a centre plus two six-point rings — joined by straight chords; and the Sri Yantra is assembled from nine interlocking equilateral triangles around a central bindu. Exports are produced on your own device: the SVG is serialised straight from the page with XMLSerializer, and the PNG is rasterised onto a 1600 × 1600 canvas.",
  useCases: [
    "Making a mandala base, tattoo reference, or laser-cut and vinyl template that has to stay crisp at any size",
    "Producing a poster, album, or print motif where the line work needs to scale without softening",
    "Teaching or demonstrating how the Flower of Life, Sri Yantra, and Metatron's Cube are actually constructed",
  ],
  benefits: [
    [
      "Three classical constructions",
      "Flower of Life, Sri Yantra, and Metatron's Cube, each generated from its own geometric rule set rather than redrawn from a fixed image.",
    ],
    [
      "Real control over the result",
      "Complexity 2–6, stroke 1–8 px in half-pixel steps, scale 70–125%, rotation 0–360°, and opacity 35–100%, plus four palettes and a Random button.",
    ],
    [
      "Vector SVG or 1600px PNG",
      "Download exactly what is on screen as an editable SVG for Illustrator, Inkscape, Affinity, or Figma, or as a 1600 × 1600 raster PNG.",
    ],
    [
      "Free, no signup, nothing uploaded",
      "Every shape is computed in the page itself — no account, no watermark, no export limit, and no image sent to a server.",
    ],
  ],
  faqs: [
    [
      "Is the sacred geometry generator free?",
      "Yes — free, no account, no watermark, and no cap on exports. The whole tool is client-side React that renders one inline SVG, so nothing you generate is uploaded or stored anywhere.",
    ],
    [
      "How do I make a Flower of Life pattern?",
      "Select Flower of Life, then set the Complexity slider between 2 and 6 to choose how many rings of circles are drawn. The tool places equal-radius circles on a hexagonal lattice using cube coordinates (q, r, s = −q−r), keeping every position where max(|q|, |r|, |s|) stays within the ring count — that constraint is what produces the sixfold symmetry and the classic overlapping petals, with an outer boundary circle drawn around the lattice.",
    ],
    [
      "Can I download sacred geometry as an SVG?",
      "Yes. The SVG button serialises the live drawing with XMLSerializer and saves it as a true vector file you can open, recolour, or cut in Illustrator, Inkscape, Affinity, or Figma. The PNG button rasterises the same drawing instead, at a fixed 1600 × 1600 pixels.",
    ],
    [
      "How many triangles are in the Sri Yantra?",
      "Nine — four pointing up and five pointing down, interlocking around a central bindu. At the lowest complexity setting this tool draws six of them and adds the remaining three as you raise the slider; complexity 4 also brings in the inner sixteen-petal lotus ring and complexity 5 adds the outer ring, all inside two boundary circles and a 45°-rotated square frame.",
    ],
    [
      "What is Metatron's Cube made of?",
      "Thirteen circles: one at the centre, six on an inner ring, and six more on an outer ring at exactly twice that radius — the Fruit of Life arrangement — connected by straight chords between node centres. At complexity 3 and below only the short chords between near neighbours are drawn; at 4 and above the long chords fill in the full network.",
    ],
    [
      "What resolution is the PNG export?",
      "1600 × 1600 pixels, square. The pattern is drawn to an off-screen canvas at that size and saved with canvas.toBlob, so your Stroke setting scales with the artwork instead of being fixed to screen pixels. If you need anything larger, export the SVG — it is resolution-independent.",
    ],
    [
      "Can I use the patterns I export in my own work?",
      "Yes. The files are generated on your device from geometric formulas rather than pulled from a stock library, and they carry no watermark or attribution prompt. The underlying figures — Flower of Life, Sri Yantra, Metatron's Cube — are traditional constructions, not artwork this tool licenses to you.",
    ],
  ],
  steps: [
    "Pick a pattern — Flower of Life, Sri Yantra, or Metatron's Cube — and one of the four palettes: Solar Gold, Temple Rose, Cosmic Ink, or Lotus Mist.",
    "Tune complexity, stroke width, scale, rotation, and opacity, or press Random to sample a combination and Reset to return to the defaults.",
    "Download the result as SVG for editing and cutting, or as a 1600 × 1600 PNG for direct use.",
  ],
};

export default seo;
