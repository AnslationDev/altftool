const seo = {
  title: "Modular Scale Generator: CSS, Tailwind, JSON",
  metaDescription:
    "Build spacing from base × ratio^n — minor third to golden ratio — snap to a 4 or 8 pt grid, and export rem tokens as CSS, Tailwind, SCSS or JSON.",
  steps: [
    "Set Base spacing (px) — 16 by default, or tap a Base 4px, 8px, 12px or 16px chip — and pick a Scale ratio such as Minor third 6:5 or Golden ratio φ ≈ 1.618.",
    "Choose Steps above the base and Steps below the base, set Snap to grid to a 4 pt or 8 pt grid, then name the tokens with T-shirt, Numeric or Sequential and a Token prefix.",
    "The scale table lists every token with its px, rem and step-up percentage; choose CSS custom properties, Tailwind @theme, SCSS map or JSON design tokens and press Copy tokens.",
  ],
  intro:
    "Modular Spacing Scale Generator builds a spacing system from a single base value and a fixed ratio, using value(n) = base × ratio^n so every step sits in the same proportion to its neighbour. Ratios are the classic musical intervals — minor third 6:5, major third 5:4, perfect fourth 4:3, perfect fifth 3:2 and the golden ratio — and the output can be snapped to a 2, 4 or 8 point grid so components still align. Exports as CSS custom properties, a Tailwind @theme block, an SCSS map or W3C-style JSON design tokens, all in rem.",
  useCases: [
    "Replace an ad-hoc set of margin values with a documented scale before starting a design system.",
    "Generate 8-point-grid spacing tokens that a developer can paste straight into a Tailwind theme.",
    "Compare a minor third against a perfect fourth to see which gives enough separation without too many steps.",
    "Produce matching rem values from a non-default root font size.",
  ],
  benefits: [
    ["Proportional by construction", "Every step is the same multiple of the one before, so spacing stays consistent as layouts grow."],
    ["Grid snapping with a warning", "Snap to 4 or 8 points and the tool tells you when two steps have collapsed onto the same value."],
    ["Four export formats", "CSS, Tailwind, SCSS and JSON tokens from the same scale, with your own prefix and naming scheme."],
  ],
  faqs: [
    [
      "What is a modular scale?",
      "A sequence built by repeatedly multiplying a base value by a fixed ratio, so value(n) = base × ratio^n. With a base of 16 px and a ratio of 1.5, the steps are 16, 24, 36, 54 and 81 px going up, and 10.67 px going down. Because the proportion between neighbours never changes, the spacing reads as deliberate rather than arbitrary.",
    ],
    [
      "Should spacing use a 4 point or 8 point grid?",
      "An 8 point grid keeps the token list short and lines components up reliably, which is why several large design systems use it; a 4 point grid gives finer control for small components like badges and input padding. A common compromise is 8 points for layout spacing and 4 points for spacing inside a component.",
    ],
    [
      "Which ratio should I use for spacing?",
      "A minor third (1.2) or major third (1.25) suits most interfaces — large enough that adjacent steps look different, small enough that you get useful values across the range. A perfect fifth (1.5) or golden ratio (1.618) grows very fast and needs few steps, which works better for type scales and editorial layouts than for UI spacing.",
    ],
    [
      "Why export spacing in rem rather than px?",
      "rem is relative to the root font size, so a reader who increases their browser text size gets proportionally larger spacing too and the layout keeps its rhythm. With fixed pixel spacing, larger text crowds against unchanged margins. Dividing each pixel value by the 16 px default root gives the rem figure.",
    ],
  ],
};

export default seo;
