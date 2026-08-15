const seo = {
  title: "Kids Playful Palette Generator With WCAG Text",
  metaDescription:
    "Bright themed palettes for kids’ design, each hue paired with a text-safe sibling walked to 4.5:1 AA or 7:1 AAA contrast against the page.",
  steps: [
    "Pick a Theme — Rainbow, Candy shop, Jungle, Ocean, Crayon box or Birthday party — and set Page ground to Light page or Dark page.",
    "Choose the Contrast target 'AA — 4.5:1 body text' or 'AAA — 7:1 body text', nudge Hue rotation (degrees) within -180 to 180, and press Next variation to step through Variation 0-5.",
    "Every swatch shows its Fill hex with the ratio on page, a Text-safe hex with the lightness shift it needed, and the best label colour; Copy CSS takes the custom properties, Copy result the contrast figures.",
  ],
  intro:
    "The Kids Playful Palette Generator produces bright themed colour sets and then repairs each hue into a text-safe version by walking its lightness one percent at a time until it meets the WCAG 2.x contrast ratio you pick — 4.5:1 for AA or 7:1 for AAA. You get a fill colour for blocks, badges and illustrations, plus a darker or lighter sibling of the same hue that is safe for captions and body copy on the page ground. It suits anyone designing school worksheets, children's apps, nursery branding or family event pages where the colour has to stay cheerful without making words hard to read.",
  useCases: [
    "Pick five party colours for a birthday invitation and get a matching darker tone for the text that sits on top of them.",
    "Check whether a bright yellow can carry black label text on a sticker before the sheet goes to print.",
    "Build a dark-mode theme for a children's reading app where every accent still clears 7:1 against the page.",
    "Hand a developer CSS variables that pair each fill with its accessible text sibling, so nobody guesses at a hover colour later.",
  ],
  benefits: [
    [
      "Bright and readable",
      "Fills stay saturated for illustration while a separate repaired tone carries the type, instead of dulling the whole palette.",
    ],
    [
      "Shows the best label colour",
      "For each fill the tool scores ink, page, black and white and reports the winner with its exact ratio.",
    ],
    [
      "Reproducible output",
      "Theme, mode, hue rotation and variation fully determine the result — the same settings always give the same hex codes.",
    ],
  ],
  faqs: [
    [
      "Why does bright yellow text fail accessibility checks?",
      "Because contrast depends on relative luminance, not on how vivid a colour looks. A saturated yellow has a luminance close to white, so on a white or off-white page it lands near 1.5:1 — far under the 4.5:1 WCAG asks for body text. Darkening the same hue to roughly 28% lightness brings it past 4.5:1 while keeping it recognisably yellow.",
    ],
    [
      "What contrast ratio do I need for children's material?",
      "WCAG 2.x sets 4.5:1 for normal body text and 3:1 for large text (24px regular or 18.66px bold) and for interface components. AAA raises body text to 7:1. Early readers and printed worksheets benefit from aiming at the 7:1 target, since paper, cheap ink and classroom lighting all reduce effective contrast.",
    ],
    [
      "Can I use the bright fill colour as text?",
      "Usually not on a light page. Each colour here is reported with its raw ratio against the ground, and most vivid fills land between 1.5:1 and 3.8:1 — fine for a block of colour or an illustration, not for words. Use the text-safe sibling the tool generates for anything readers actually have to read.",
    ],
    [
      "Does passing a contrast ratio mean the design is accessible?",
      "No. Contrast is one success criterion among many. Font size and weight, line length, spacing, focus states, motion and colour-only meaning all matter too, and children's products often need larger type than the minimum. Treat this as a colour check, and test the finished layout with real users.",
    ],
  ],
};

export default seo;
