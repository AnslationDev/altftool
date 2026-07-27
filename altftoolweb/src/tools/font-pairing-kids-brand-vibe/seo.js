const seo = {
  intro:
    "Kids Brand Font Pairing matches playful rounded display faces with body fonts that stay readable, and calculates the smallest body size that still works at the distance the material is actually read from. It applies the signage legibility ratio — character height of at least 1/200 of the viewing distance, tightened to 1/150 for readers under eight — then divides by each body face's x-height to convert that into a font size. Useful for children's packaging, worksheets, learning apps and classroom posters.",
  useCases: [
    "Check whether 18 px body text is large enough for a six-year-old reading a learning app on a tablet at arm's length.",
    "Size the type on a classroom poster that has to be read from three metres away.",
    "Pick a heading face for a toy brand that stays friendly without making paragraphs hard to decode.",
    "Get the letter, word and line spacing values that suit beginner readers, ready to paste into CSS.",
  ],
  benefits: [
    ["Sizes with a reason", "The minimum comes from viewing distance and reading age, not from a house style guess."],
    ["x-height aware", "Two fonts at the same nominal size read very differently; the calculation uses each face's x-height ratio."],
    ["Beginner-reader spacing", "Automatically opens letter, word and line spacing for readers under eight, where decoding is still letter by letter."],
  ],
  faqs: [
    [
      "What font size should children's material use?",
      "It depends on distance more than age band. Using the 1/150 ratio for early readers, a tablet held at 400 mm needs an x-height of about 2.7 mm — roughly 20 px in a font with a 0.49 x-height ratio. A poster read from three metres needs around 150 px.",
    ],
    [
      "Which fonts are best for children learning to read?",
      "Faces with unambiguous letterforms and no mirrored shapes: Nunito, Quicksand at weight 500 or more, Rubik, Poppins, Open Sans and Comic Neue all work. Avoid a single-storey versus double-storey mismatch between the reading material and what the child is taught to write.",
    ],
    [
      "Should children's text use extra letter spacing?",
      "For readers under about eight, yes. Opening letter-spacing to roughly 0.02em, word-spacing to 0.16em and line height to 1.7 helps while word recognition is still developing. Once reading is fluent, standard spacing with a line height of 1.5 is fine.",
    ],
    [
      "Can I use a display font like Luckiest Guy for body copy?",
      "No. Faces like Luckiest Guy, Chewy and Bubblegum Sans come in one weight and are drawn for large sizes, so a paragraph set in them becomes a decoding exercise. Keep them for logos, titles and short callouts, and set everything else in the paired body font.",
    ],
  ],
};

export default seo;
