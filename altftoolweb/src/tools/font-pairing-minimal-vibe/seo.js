const seo = {
  title: "Minimal Font Pairings with Type Scale and CSS Output",
  metaDescription:
    "Six minimal Google Fonts pairs with a modular scale, a column width from your target line length, body line height at the WCAG 1.5 minimum, copyable CSS.",
  steps: [
    "Choose a Font pair such as Inter + IBM Plex Sans or Space Grotesk + Inter, then set Body size (px).",
    "Pick a Scale ratio — Major third 1.25, Perfect fourth 1.333 or Golden ratio 1.618 — and drag Target line length (characters).",
    "Check the Live preview and Type scale table, then press Copy CSS for the custom properties and Copy URL for the Google Fonts request.",
  ],
  intro:
    "Minimal Vibe Font Pairing gives six restrained heading and body combinations built from open-licence Google Fonts, then turns each one into a working type system: a modular scale from a ratio you choose, a column width derived from your target line length, and a line height that starts at the WCAG 2.2 minimum of 1.5 for blocks of text. Line length uses the typographic convention that running lowercase Latin text averages half an em per character, so a 66-character measure at 17 px body text lands at roughly 561 px. The output is copyable CSS custom properties rather than a mood board.",
  useCases: [
    "Set the body and heading faces for a product marketing page and get the max-width that keeps paragraphs at 66 characters.",
    "Replace an ad-hoc set of font sizes with a single modular scale so headings and captions stop drifting.",
    "Check whether a 900 px content column is too wide for 16 px body text before the design goes to build.",
    "Hand a developer the exact CSS variables, weights and Google Fonts request for a minimal brand refresh.",
  ],
  benefits: [
    ["Pairs with a reason", "Each combination notes why the two faces work together — shared skeletons, contrasting width, or matched x-height."],
    ["Measure you can build with", "Line length is converted straight into a pixel column width and a rem custom property."],
    ["Accessible defaults", "Body line height never drops below 1.5, the WCAG 2.2 threshold for text blocks."],
  ],
  faqs: [
    [
      "What is the ideal line length for body text?",
      "Between 45 and 75 characters per line, with 66 the classic target for a single-column setting. At 16 px body text that is roughly 360 px to 600 px of column width, because running lowercase text averages about half an em per character.",
    ],
    [
      "What line height should body text use?",
      "At least 1.5 times the font size. WCAG 2.2 success criterion 1.4.12 requires text to stay readable when line height is set to 1.5, and longer measures need a little more — around 1.6 at 75 characters per line.",
    ],
    [
      "Which modular scale ratio should I pick?",
      "1.25 (major third) and 1.333 (perfect fourth) are the safest for interface and marketing pages: they separate heading levels clearly without a huge jump. Ratios above 1.5 create dramatic display type but leave awkward gaps in the middle of the scale.",
    ],
    [
      "Can I pair two sans-serif fonts?",
      "Yes, provided they differ in one clear dimension — weight, width or construction — and share a similar x-height so they sit on the page as one system. Pairing two neutral grotesques of the same weight usually reads as a mistake rather than a decision.",
    ],
  ],
};

export default seo;
