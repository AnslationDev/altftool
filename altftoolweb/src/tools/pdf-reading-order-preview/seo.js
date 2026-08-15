const seo = {
  title: "PDF Reading-Order Preview: Stored vs Visual Text",
  metaDescription:
    "Compares a PDF's stored text sequence with a Y-then-X visual estimate and flags where they disagree — the WCAG 1.3.2 risk. Up to 100 MB and 100 pages.",
  intro:
    "PDF Reading-Order Preview extracts a PDF's text layer in the sequence the file actually stores it, then builds a separate Y-then-X visual estimate — grouping items into lines by vertical position, reading top to bottom and left to right — and shows you where the two disagree. Those divergences are where a screen reader is most likely to read a page out of the order a sighted reader sees, the concern behind WCAG Success Criterion 1.3.2 Meaningful Sequence. It is a manual review aid: it reads coordinates, not the PDF tag tree, and does not predict what any particular assistive technology will do.",
  useCases: [
    "You are checking a two-column report before publishing and need to know whether the text layer jumps between columns mid-page.",
    "A supplier's accessibility statement claims their PDF is screen-reader ready, and you want evidence about the actual stored text sequence before you accept it.",
    "A form PDF reads oddly in a screen reader and you need to locate which blocks are stored out of visual position before sending it back to the designer.",
  ],
  benefits: [
    ["Two orders side by side", "It shows the stored source sequence and the coordinate-derived visual estimate together, so the disagreement itself is the finding."],
    ["Column interleaving is called out", "Repeating horizontal gaps are detected as possible columns and the affected blocks are marked ambiguous rather than silently reordered."],
    ["Honest about rotated and untagged text", "Rotated items are flagged as cases the simple Y-then-X estimate may misread, instead of being folded into a confident answer."],
  ],
  faqs: [
    [
      "Does this tell me whether my PDF is WCAG compliant?",
      "No. It compares stored text order with a visual-order estimate to help you spot likely sequence problems; it does not read the structure tag tree, and reading order is only one part of PDF accessibility. Treat the output as evidence for a manual review against WCAG 1.3.2, not as a compliance verdict.",
    ],
    [
      "How does it decide which text belongs on the same line?",
      "Items are grouped into a line when their vertical positions are within a tolerance derived from the median glyph height — 45% of it, clamped between 2 and 18 points — then sorted left to right within each line and top to bottom across lines.",
    ],
    [
      "How big a PDF can it analyse?",
      "Up to 100 MB and 100 pages, with per-page ceilings of 3,500 text items and 75,000 characters, and overall ceilings of 50,000 items and 750,000 characters. Anything past those bounds is reported as truncated.",
    ],
    [
      "Why does it find no text in my scanned PDF?",
      "A scan is an image with no text layer, so there is no stored sequence to compare. Run OCR to add a text layer first — the approach described in W3C technique PDF7 for scanned documents.",
    ],
  ],
  steps: [
    "Drop a file on the Upload PDF Document zone, click Browse PDF File, or paste one with Ctrl+V — the picker accepts .pdf only, up to 100 MB and 100 pages, otherwise it reports \"Choose a PDF no larger than 100 MB.\" or \"Choose a PDF with 1 to 100 pages.\" Try Demo PDF loads a built-in sample instead.",
    "The Open PDF button reads Analyzing... while the text layer is parsed, then the dashboard shows Accessibility Score, Reading Blocks and Detected Defects. Choose a Visual Overlay View Mode — All Overlays, Reading Numbers Only, Bounding Boxes Only, Direction Flow Arrows Only, Accessibility Heatmap or Color-coded by Tag Type — and press Play Sequence to step through the page block by block.",
    "Open the Issues tab for Detected Accessibility Defects; clicking one jumps to its page and highlights the block, while the Screen Reader Stream lists the same blocks in order and Outline shows each block's tag type. The status bar keeps Score and Defects in view, and the Reset inspection button clears the file.",
  ],
};

export default seo;
