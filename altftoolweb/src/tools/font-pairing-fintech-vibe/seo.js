const seo = {
  title: "Fintech Font Pairing: Tabular Money Column Widths",
  metaDescription:
    "Pick display, body and figure faces, then get the exact px and ch width a money column needs — Indian lakh or international grouping — plus the CSS.",
  steps: [
    "Choose a Font pair, then set Grouping to International (1,234,567), Indian lakh/crore (12,34,567) or No separators.",
    "Enter Integer digits, Decimals and Font px for the largest amount you will show, and tick Show currency symbol if the column carries one.",
    "Read Column width in px, Width ch and Prop jitter saved, then press Copy CSS for the tabular-nums slashed-zero rule with its min-width.",
  ],
  intro:
    "Fintech Font Pairing combines display, body and figure faces for payments, lending and trading interfaces, then calculates the width a money column needs when set with tabular figures. The width comes from the digit count, the number of grouping separators — Indian lakh/crore grouping produces a different count from international thousands grouping — the decimal point and the currency symbol, all measured in ems and converted to pixels. It also shows how far a right-aligned column can drift if you leave figures proportional instead of tabular.",
  useCases: [
    "Fix the width of an amount column in a statement table so rows stop shifting when a value gains a digit.",
    "Compare how much space Indian lakh/crore grouping needs against international thousands grouping for the same amount.",
    "Choose a monospaced face for account numbers and reference IDs that sits comfortably next to the body font.",
    "Give a developer the exact CSS for tabular, slashed-zero figures with a min-width custom property.",
  ],
  benefits: [
    ["Column widths you can commit to", "Tabular figures make width fully predictable, and the calculation includes separators and the currency symbol."],
    ["Both grouping systems", "Indian and international separator counts are computed from the digit count, not assumed."],
    ["Shows the cost of getting it wrong", "Quantifies how far a proportional-figure column can jump between values."],
  ],
  faqs: [
    [
      "What is the best font for a fintech app?",
      "Any UI face with true tabular figures and a distinguishable zero — Inter, IBM Plex Sans, Roboto and Source Sans 3 all qualify. The decisive feature is not the shape of the letters but whether the digits share an advance width and whether 0 can be told apart from O.",
    ],
    [
      "What does font-variant-numeric: tabular-nums do?",
      "It switches the font to figures that all have the same advance width, so numbers line up in columns and a value never changes the width of its cell. Pair it with slashed-zero in finance interfaces where a zero could be misread as a capital O.",
    ],
    [
      "How wide should a currency column be?",
      "Size it for the largest amount you will ever display. With a 0.6em digit width, nine integer digits plus two decimals in Indian grouping — ₹12,34,56,789.00 — needs about 8.5em, which is roughly 136 px at 16 px figures.",
    ],
    [
      "Do Indian and international number formats need different column widths?",
      "Yes. Indian grouping inserts a separator after the first three digits and then every two, so a nine-digit amount takes three separators against two for international grouping. That is one extra glyph of width per row.",
    ],
  ],
};

export default seo;
