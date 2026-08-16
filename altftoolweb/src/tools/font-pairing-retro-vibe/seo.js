const seo = {
  title: "Retro Font Pairing: 70s & 80s Fonts, WCAG Check",
  metaDescription:
    "Eight seventies and eighties Google Font pairs with period palettes scored live against WCAG 2.1 contrast. Shift lightness in HSL and copy the CSS.",
  steps: [
    "Pick one of the eight era pairings under '1. Pick an era', then tune 'Heading size (px)', 'Body size (px)' and the text/accent lightness-shift sliders (-40 to +40).",
    "Watch 'Body text contrast' recompute as a live WCAG 2.1 ratio, with every palette combination listed alongside its verdict.",
    "Preview with 'Load the real fonts' (fetched from fonts.googleapis.com), then click 'Copy CSS' to take the palette and font stacks, or 'Copy result' for the summary.",
  ],
  intro:
    "Retro Vibe Font Pairing combines a seventies or eighties display face from Google Fonts with a readable text face, and ships each pair with a period palette that is scored live against the WCAG 2.1 contrast formula. Every colour is stored as HSL so you can shift text and accent lightness and watch the contrast ratio move, with the 4.5:1 AA threshold for normal text and 3:1 for large text applied automatically by size. Useful when a nostalgic palette needs to survive an accessibility review.",
  useCases: [
    "Build a synthwave landing page and confirm the neon accent still clears 4.5:1 against the dark violet background.",
    "Pick a seventies slab-and-sans pairing for an album or event microsite and export the palette as CSS custom properties.",
    "Darken a mustard accent by a few lightness points until the button label passes AA instead of guessing.",
    "Check whether an inline display face like Monoton is being set large enough to keep its counters open.",
  ],
  benefits: [
    ["Contrast scored, not assumed", "Five colour combinations per palette are checked with the real WCAG relative-luminance formula."],
    ["HSL sliders, hex output", "Palettes live in HSL so lightness is one control, and you still copy hex values for your design tool."],
    ["Notes on how each face behaves", "Every pairing says where the display face breaks down — minimum sizes, tracking, caps-only limits."],
  ],
  faqs: [
    [
      "What fonts were used in the 1970s and 1980s?",
      "Seventies graphics leaned on rounded geometric display faces and heavy slabs; the eighties moved to inline neon scripts, squared technical sans and bitmap arcade faces. On Google Fonts the closest open equivalents are Righteous, Alfa Slab One and Pacifico for the seventies, and Monoton, Orbitron and Press Start 2P for the eighties.",
    ],
    [
      "What contrast ratio does text need to pass accessibility checks?",
      "WCAG 2.1 level AA needs 4.5:1 for normal text and 3:1 for large text — large meaning at least 18 point (24px) regular or 14 point bold (18.66px). Level AAA raises those to 7:1 and 4.5:1. User-interface components and meaningful graphics need 3:1 under SC 1.4.11.",
    ],
    [
      "Why does my retro palette fail contrast even though it looks fine?",
      "Because the eye judges hue and saturation while the formula judges luminance only. Mustard, coral and teal all sit near the middle of the luminance range, so two vivid retro colours can look strongly different and still be within 2:1 of each other. Change lightness rather than saturation to fix it.",
    ],
    [
      "Are these fonts free for commercial work?",
      "The families listed here are published on Google Fonts under open licences, most commonly the SIL Open Font License 1.1, which allows commercial use, web embedding and modification. Licences can differ per family, so check the licence tab on each family's Google Fonts page before shipping a paid product.",
    ],
  ],
};

export default seo;
