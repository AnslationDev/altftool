const seo = {
  title: "Cyberpunk Palette Generator: WCAG Contrast Tuning",
  metaDescription:
    "Neon-on-dark palette from a seed word: elevation ramp, status colours and glow shadows, each accent lifted until it hits your 4.5:1 or 7:1 target.",
  steps: [
    "Enter a Seed word or phrase, pick a Neon pair, and set Text contrast target to \"AA — 4.5:1 body text\" or \"AAA — 7:1 body text\".",
    "Move the Grit slider between 0 and 100, or press \"Shuffle seed\", and watch the Elevation ramp, status colours and Contrast table re-tune to that target.",
    "Press \"Copy hex codes\", or open Export and use \"Copy snippet\" to take the palette as CSS variables, Tailwind @theme or JSON.",
  ],
  intro:
    "The Cyberpunk Palette Generator builds a neon-on-dark interface palette and then makes it readable. From a seed it produces a tinted near-black base with four elevation steps, a paired neon lead and counter, semantic success, warning, danger and info colours, and glow shadows — then walks each colour's lightness up one point at a time until it meets the WCAG 2.1 target you choose (4.5:1 for AA body text or 7:1 for AAA), reporting exactly how much it had to move. Muted text goes the other way: the tool finds the dimmest value that still passes, so secondary copy stays quiet without dropping below the line.",
  useCases: [
    "Build a dark dashboard where the neon accents still pass an accessibility audit.",
    "Find out which of your neon pair can carry body text and which is fills-only before you write the CSS.",
    "Generate a matching set of status colours — success, warning, danger, info — that all sit at the same contrast bar.",
    "Copy a ready glow shadow instead of guessing blur radii and alpha values.",
  ],
  benefits: [
    [
      "Contrast enforced, not assumed",
      "Every accent is tuned against the actual base colour and the lightness shift is shown, so nothing silently fails.",
    ],
    [
      "A real elevation ramp",
      "Base plus three surfaces at fixed lightness stops give cards, menus and modals a consistent depth order.",
    ],
    [
      "Muted text that still passes",
      "Secondary copy is set to the dimmest value that clears the target — one point darker and it fails.",
    ],
  ],
  faqs: [
    [
      "What contrast ratio does neon text need on a dark background?",
      "WCAG 2.1 asks for 4.5:1 for normal body text, 3:1 for large text (18pt, or 14pt bold, and above) and 3:1 for UI components and graphical objects; AAA raises body text to 7:1. Saturated red and deep violet are the usual failures on near-black and need a lightness lift.",
    ],
    [
      "Why is my neon magenta unreadable even though it looks bright?",
      "Perceived brightness and relative luminance are not the same. Luminance weights green heavily (0.7152) and blue barely at all (0.0722), so a blue-heavy magenta measures far darker than it looks. Raising lightness — which this tool does automatically — fixes the measurement, not just the impression.",
    ],
    [
      "Should a cyberpunk background be pure black?",
      "Usually not. A near-black carrying a small amount of the base hue (around 6% lightness here) gives the elevation steps somewhere to go and avoids the harsh edge of pure black against bright neon. It also makes cards distinguishable without adding borders.",
    ],
    [
      "How do I make a neon glow in CSS?",
      "Layer two box-shadows of the same colour at different blur radii and alphas — a tight one for the core and a wide one for the halo. The tool exports exactly that, using 8-digit hex so the alpha travels with the value.",
    ],
  ],
};

export default seo;
