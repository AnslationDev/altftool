const seo = {
  intro:
    "The Heritage India Palette Generator assembles six-role palettes from a library of historical Indian dyes, pigments and mineral colours — indigo from Indigofera tinctoria, madder root, lac resin, turmeric, red and yellow ochre, malachite green, lampblack and gold leaf — assigned to the roles a layout needs and labelled with the material each colour came from. Every palette is then measured twice: WCAG 2.x contrast for the text and motif pairings, and a greyscale separation check for the single-ink reproduction that block printing, screen printing and letterpress reduce artwork to. It is built for designers working on craft brands, museum and exhibition material, festival identities and packaging that has to look traditional without becoming unreadable.",
  useCases: [
    "Choose a coherent Ajrakh or Kalamkari set for a craft packaging range and see where each colour historically came from.",
    "Check whether a motif in madder red and catechu brown will still separate when the artwork is block-printed in one ink.",
    "Get a screen-adapted version of a turmeric yellow that keeps its hue but reaches 4.5:1 against the ground.",
    "Cite the pigment source in an exhibition caption or a brand story without inventing provenance.",
  ],
  benefits: [
    [
      "Provenance with every colour",
      "Each swatch names the dye, mineral or resin it derives from and where it appears in Indian craft.",
    ],
    [
      "Block-print reality check",
      "Luminance separation is measured so you know which pairs merge once the artwork drops to a single ink.",
    ],
    [
      "Screen-safe siblings",
      "Where a pigment is too mid-toned for body text, a lightness-adjusted version of the same hue is generated until it clears 4.5:1.",
    ],
  ],
  faqs: [
    [
      "What are traditional Indian colours made from?",
      "Historically from plants, insects, minerals and earth: indigo from fermented Indigofera tinctoria leaves, red from Rubia cordifolia madder root or Kerria lacca resin, yellow from turmeric or ochre clay, green from ground malachite, blue from lapis lazuli, black from lamp soot and metallic gold from beaten leaf. The exact shade depended on the mordant, the water and the number of dye baths, which is why no two lots matched.",
    ],
    [
      "Are these the exact colours used in Ajrakh or Madhubani?",
      "No, and no digital value could be. They are careful screen interpretations chosen as design references. A natural dye shifts with the mordant, the cloth, the water chemistry and the sun, so use these as a starting point and match against a physical swatch or a Pantone reference before anything goes to production.",
    ],
    [
      "Why do heritage palettes fail modern contrast checks?",
      "Because natural dyes cluster in the mid-tones. Madder, catechu, ochre and turmeric all land in a similar luminance band, which reads as rich and harmonious on cloth but leaves too little difference for body text on a screen. Keep text in the darkest ink or the lightest ground, and use the adjusted tones for anything that has to be read.",
    ],
    [
      "How do I check a design will work as a block print?",
      "Reduce it to a single ink and look at relative luminance alone. If two colours in the motif are within roughly ten luminance points of each other they will merge into one shape, no matter how different their hues look in colour. The greyscale table here flags exactly those pairs before you cut a block.",
    ],
  ],
};

export default seo;
