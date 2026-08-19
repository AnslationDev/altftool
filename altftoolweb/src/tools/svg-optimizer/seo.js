const seo = {
  title: "SVG Optimizer: Strip Metadata, Round Coordinates",
  metaDescription:
    "Removes comments, metadata blocks, sodipodi and inkscape:* leftovers plus SVG 1.1 default attributes, rounds coordinates, and keeps every referenced id.",
  steps: [
    "Paste your markup into the SVG source box, replacing the loaded sample export with its comment and metadata block.",
    "Set Coordinate precision (0 to 8 decimals, 3 by default) and tick what to remove — comments, editor namespace attributes, spec-default attributes, unreferenced ids.",
    "Read Size saved with the original and optimized byte counts and the comments, elements and attributes removed, then Copy result or Download optimized.svg.",
  ],
  intro:
    "An SVG optimizer rewrites an SVG file to be smaller while drawing exactly the same picture. This one deletes editor leftovers that the SVG 1.1 rendering model ignores — comments, <metadata>, Inkscape's <sodipodi:namedview>, inkscape:* and sketch:* attributes — drops presentation attributes that merely restate their spec default such as fill-opacity=\"1\" and stroke-linejoin=\"miter\", and rounds path coordinates to a precision you choose. It is for designers exporting icons from Figma, Illustrator or Inkscape, and for developers inlining SVG into a bundle where every byte ships to every visitor.",
  useCases: [
    "Clean an icon exported from Illustrator before pasting it into a React component, where the exported comment and metadata block is often larger than the path itself.",
    "Cut a 9-decimal path from a Figma export down to 2 decimals, which typically removes half the file with no visible change on a 24-unit viewBox.",
    "Strip unreferenced id attributes so several inlined SVGs on one page cannot collide on duplicate ids.",
  ],
  benefits: [
    ["Nothing is uploaded", "Parsing, rewriting and downloading all happen in the page, so unreleased artwork never leaves your machine."],
    ["Only spec defaults are dropped", "The default-value table is taken from the SVG 1.1 initial values, so removing an attribute cannot change rendering."],
    ["Referenced ids survive", "Every url(#id), href=\"#id\" and inline <style> #id{...} selector in the file is collected first, so gradients, filters, clip paths, <use> targets and CSS-styled elements keep their ids."],
  ],
  faqs: [
    [
      "How much smaller does an SVG usually get?",
      "Editor exports commonly drop 50-80%. A typical Illustrator or Inkscape icon carries a generator comment, an XML declaration, a DOCTYPE, a metadata block and 6-9 decimal places on every coordinate; removing those and rounding to 3 decimals is where nearly all of the saving comes from. Hand-written SVG that is already tidy may only lose a few percent.",
    ],
    [
      "What precision should I use?",
      "Two or three decimals for almost everything. Rounding to 3 decimals moves any point by at most 0.0005 user units, which on a 24-unit icon viewBox scaled to 24 CSS pixels is 0.0005 of a pixel. Use 0 only for artwork deliberately drawn on a whole-number pixel grid, and raise it above 3 only for maps or charts drawn on a viewBox thousands of units wide.",
    ],
    [
      "Is it safe to remove the XML declaration and DOCTYPE?",
      "Yes for normal web use. An SVG served as image/svg+xml or inlined into HTML needs neither: the declaration only matters when the encoding is not UTF-8, and the SVG 1.1 DTD was never used for validation by browsers — the W3C itself advises against including it. Keep them only if a specific legacy consumer demands them.",
    ],
    [
      "Will this break my gradients or animations?",
      "No, as long as the reference is written in the file. The tool scans the whole source for url(#id), href=\"#id\", xlink:href=\"#id\", SMIL begin/end references and #id CSS selectors inside inline <style> blocks before it removes anything, and keeps every id it finds. Ids referenced only from an external stylesheet or external JavaScript file are the one exception — turn off \"Remove unreferenced ids\" in that case.",
    ],
  ],
};

export default seo;
