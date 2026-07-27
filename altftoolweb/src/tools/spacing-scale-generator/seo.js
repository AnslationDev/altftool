const seo = {
  intro:
    "The Spacing Scale Generator builds a spacing token set from one base step, either linear (the base repeated) or modular (the base multiplied by a typographic ratio such as 1.25 or 1.5), then snaps every value to a 1, 2, 4 or 8 pixel alignment grid. Each step is output in pixels and in rem against a configurable root font size, named with t-shirt, numeric or hundreds tokens, and exported as CSS custom properties, a Tailwind v4 theme block or JSON design tokens. It also flags the two failure modes of modular scales: steps that collapse onto the same value after snapping, and steps pushed so far off the grid that the ratio no longer holds.",
  useCases: [
    "Generate a 4px-grid spacing set for a new design system and paste the custom properties straight into a stylesheet.",
    "Convert an existing pixel scale to rem so component padding grows when a reader raises their browser font size.",
    "Check whether a 1.125 ratio produces distinct steps on an 8px grid, or whether adjacent tokens collapse together.",
    "Hand engineering a JSON token file that matches the spacing the design file already uses.",
  ],
  benefits: [
    ["Grid-aware", "Snaps each step to your alignment grid and reports which values had to move to get there."],
    ["rem by default", "Emits rem against a configurable root so spacing respects the reader's font-size preference."],
    ["Three export formats", "CSS custom properties, a Tailwind v4 @theme block and JSON tokens from the same scale."],
  ],
  faqs: [
    [
      "Should a spacing scale be linear or modular?",
      "Linear (4, 8, 12, 16, 20) is easier to reason about and works well inside components where increments need to feel even. Modular (16, 24, 36, 54) grows faster and separates section-level rhythm from component padding more clearly. Many systems use a linear scale at the small end and a modular one above it.",
    ],
    [
      "Why should spacing be in rem instead of px?",
      "A rem is relative to the root font size, which the reader can change in browser settings. Spacing in rem grows with the text, so a layout stays proportional at 20px root instead of leaving cramped padding around larger type. 1rem equals 16px by default in every mainstream browser.",
    ],
    [
      "What is a 4pt or 8pt grid?",
      "A rule that every spacing value is a multiple of 4 or 8 pixels. Material Design uses an 8dp layout grid with 4dp for the inside of smaller components. The point is predictability: snapped values line up across components and avoid fractional pixels that render inconsistently.",
    ],
    [
      "Why do two steps in my modular scale end up the same size?",
      "Because the ratio moved the raw value less than half a grid unit. A 1.067 ratio on a 16px base gives 17.07 and 18.21, and both round to 16 on an 8px grid. Either lower the grid, raise the ratio, or remove a step - the generator flags every collision explicitly.",
    ],
  ],
};

export default seo;
