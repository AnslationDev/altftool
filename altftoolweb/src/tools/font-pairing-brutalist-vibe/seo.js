const seo = {
  title: "Brutalist Font Pairing: Grotesk + Monospace",
  metaDescription:
    "Eight heavy grotesk + monospace pairings, the px size that fills a container edge to edge, ch-based column counts and copy-ready CSS with font imports.",
  intro:
    "This tool pairs a heavy grotesk with a monospace in eight brutalist combinations and does the two calculations that style actually needs: the font size at which your headline spans the container edge to edge, and how many monospace columns fit across it. Headline size comes straight from width = characters x size x average advance, so size = container / (characters x advance); the character grid comes from the CSS ch unit, which in a monospaced face is one column wide, typically 0.6em. It outputs ready CSS with the Google Fonts import, the computed size, the tracking value and a max-width expressed in ch.",
  useCases: [
    "You want a poster-style headline that touches both edges of a 1200px container and need the exact px size for your 18-character line rather than nudging a slider",
    "You are building a caption or code column against a monospace grid and want to know how many whole characters fit before the text wraps",
    "You have picked Anton or Unbounded for a hero and want a monospace that belongs next to it, plus a note on where that display face falls apart",
  ],
  benefits: [
    ["Solves for the size, not the slider", "Give it the container width and the headline and it returns the fill size directly, then re-solves it once tracking changes the drawn width."],
    ["Tracking scales with the size", "Display type gets progressively tighter tracking as it grows instead of one flat value copied from the text setting."],
    ["Carries per-face advance values", "Each pairing stores its own average advance — Anton at 0.45em, Unbounded at 0.72em — so a condensed and a wide face do not get the same maths."],
  ],
  faqs: [
    [
      "How does it work out the edge-to-edge headline size?",
      "A run of text is roughly characters x font-size x average advance wide, so the size that fills a container is container width divided by (character count x advance). A 20-character headline in a 1200px container at 0.6em advance lands at 100px. It then recomputes the size once tracking is applied, because tracking adds a gap between every pair of glyphs.",
    ],
    [
      "What tracking does it recommend and why?",
      "Zero at 24px and below, then tightening by 0.0004em for every pixel above that, never going past -0.05em. That is a house heuristic rather than a standard: sidebearings drawn for reading sizes turn into visible gaps at display sizes, so large type needs to be pulled in.",
    ],
    [
      "Why is a monospace column exactly 1ch in CSS?",
      "Because ch is defined as the advance width of the zero glyph, and in a monospaced face every glyph shares that advance — so N characters is exactly N ch. Most monospaces ship a 600/1000 advance, which is why 0.6em is the default here, but faces like Martian Mono sit nearer 0.7em and the field is editable.",
    ],
    [
      "What input ranges does it accept?",
      "Container width 240px to 3840px, monospace size 8px to 40px, either advance value 0.30em to 1.20em, and a headline of 1 to 200 characters. Out-of-range input returns a message instead of a misleading number.",
    ],
  ],
};

export default seo;
