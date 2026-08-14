const seo = {
  title: "Editorial Font Pairing: Type Scale, Measure, CSS",
  metaDescription:
    "Pick a magazine Google Font pairing and get a modular scale, the characters-per-line measure against the 45-75 guideline, and copy-ready CSS.",
  steps: [
    "Choose a pairing in '1. Pick a pairing' — Masthead classic, Long-read serif, Fashion feature, News desk, Culture section or Essay.",
    "Under '2. Set the page' set Body size (px), Scale ratio (minor third to golden ratio), Content width (px), Columns, Gutter between columns (px) and Headline step on the scale.",
    "Read Measure (characters per line) against the 45-75 guideline, then press Copy CSS for the Google Fonts import, custom properties and h1-h4 rules.",
  ],
  intro:
    "Editorial Vibe Font Pairing turns a magazine-style Google Font combination into concrete numbers: a modular type scale, an estimated line length in characters, and a leading value for each size. Sizes come from the musical-interval scale system described in Bringhurst's The Elements of Typographic Style — each step multiplies the previous size by the chosen ratio — and the measure is checked against the 45–75 characters-per-line guideline for continuous text. It is for designers, editors and front-end developers who need a defensible starting point rather than a mood board.",
  useCases: [
    "Set the headline, standfirst and body sizes for a long-form article template before handing the design to a developer.",
    "Work out how wide a text column should be so the body copy lands near 66 characters per line at 18px.",
    "Compare a Didone headline against a slab or old-style serif on the same layout to see which survives at your headline size.",
    "Generate the @import line, CSS custom properties and heading rules for a blog theme in one copy.",
  ],
  benefits: [
    ["Measure is calculated, not guessed", "Column width, body size and average glyph width give a character count you can act on."],
    ["Leading follows the line length", "Recommended line-height rises with a wider measure and tightens as display sizes grow."],
    ["Copy-ready output", "Google Fonts URL, custom properties and h1–h4 rules are generated from the same numbers you see on screen."],
  ],
  faqs: [
    [
      "What is the ideal line length for body text?",
      "Aim for 45 to 75 characters per line, with about 66 as the classic target for a single column of continuous text — the guideline set out in Bringhurst's The Elements of Typographic Style. Below 45 the eye changes lines too often; above 75 it struggles to find the start of the next line.",
    ],
    [
      "How do I calculate a modular type scale?",
      "Multiply the body size by the ratio once per step: size = base × ratio^step. At an 18px base on a major third (1.25), step 1 is 22.5px, step 2 is 28.1px and step 4 is 43.9px. Common ratios are the minor third (1.2), major third (1.25), perfect fourth (1.333) and golden ratio (1.618).",
    ],
    [
      "Should headings use the same line-height as body text?",
      "No — larger type needs proportionally tighter leading. Body copy typically sits between 1.4 and 1.6, while a headline at 40px or more usually looks right somewhere near 1.1 to 1.25. This tool tightens the recommendation as the pixel size grows and loosens body leading as the measure widens.",
    ],
    [
      "Can I use these Google Fonts commercially?",
      "The families listed here are published on Google Fonts under open licences, most commonly the SIL Open Font License 1.1, which permits commercial use, embedding and modification. Licences can change per family and per version, so confirm the licence shown on the family's Google Fonts page before shipping a paid product.",
    ],
  ],
};

export default seo;
