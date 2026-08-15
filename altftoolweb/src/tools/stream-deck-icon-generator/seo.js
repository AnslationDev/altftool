const seo = {
  title: "Stream Deck Icon Generator: 72, 144 and 288 px Keys",
  metaDescription:
    "Design square key icons with glyph, label, HSL colour and corner radius. Check label contrast against WCAG 3:1 and export SVG or PNG in your browser.",
  steps: [
    "Type a 'Key label' and optional 'Glyph (1-3 characters, blank = initials)', then pick the export size — 72 px native, 144 px 2x or 288 px 4x — plus style and layout.",
    "Tune the Hue, Saturation, Lightness and 'Corner radius' sliders; the 'Label contrast' ratio recomputes live against the WCAG AA large-text threshold of 3:1.",
    "Click PNG or SVG to download a file named after your label and size, like mute-mic-144.png, or 'Copy result' for the raw SVG markup.",
  ],
  intro:
    "This generator builds square key icons for a Stream Deck or any other control surface: a coloured tile with a glyph, an optional label, an adjustable corner radius, and export at 72, 144 or 288 px. Colours are set in HSL and the label colour is chosen by measuring WCAG 2.x contrast — relative luminance L = 0.2126R + 0.7152G + 0.0722B, ratio = (L1 + 0.05) / (L2 + 0.05) — against the AA large-text threshold of 3:1. Everything renders in the browser and downloads as SVG or PNG, with no upload.",
  useCases: [
    "Build a full set of scene-switch keys in one hue so the whole row reads as a group at a glance.",
    "Replace a mismatched pile of downloaded icons with one consistent style and corner radius.",
    "Check that a pale yellow key still has readable label text before you commit to it.",
    "Export a 288 px master you can down-sample for other decks and streaming overlays.",
  ],
  benefits: [
    ["Contrast measured, not guessed", "The label colour is picked by WCAG luminance maths and the ratio is shown."],
    ["Consistent by construction", "Radius, size, glyph scale and label scale all derive from one set of numbers."],
    ["Runs locally", "SVG and PNG are generated in your browser; nothing is uploaded anywhere."],
  ],
  faqs: [
    [
      "What size should a Stream Deck icon be?",
      "The native key bitmap is 72 x 72 px, so exporting at 144 px gives you a 2x asset that stays sharp when the software scales it, and 288 px is a 4x master. Always export square — a non-square image gets cropped or letterboxed on the key.",
    ],
    [
      "PNG or SVG for key icons?",
      "Export PNG for the deck software itself, which expects a raster key image, and keep the SVG as your editable source. The SVG re-exports at any size without quality loss, which matters the first time you need a bigger version.",
    ],
    [
      "How many characters fit on a key label?",
      "About 9 characters stay comfortably readable on a physical 72 px key and 12 is the practical ceiling. Past that, use a glyph or initials as the main mark and keep the label to one short word.",
    ],
    [
      "How do I make a deck that is easy to read at a glance?",
      "Assign one hue per function group — audio on one colour, scenes on another, alerts on a third — and keep radius, glyph weight and label size identical across the set. Contrast between the label and the tile should be at least 3:1, which is the WCAG AA threshold for large text.",
    ],
  ],
};

export default seo;
