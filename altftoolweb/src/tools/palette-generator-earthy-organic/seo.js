const seo = {
  intro:
    "The Earthy Organic Palette Generator builds a natural palette from the hue positions of real mineral pigments — yellow ochre, raw and burnt sienna, terracotta, green earth and raw umber — rather than from arbitrary browns. It returns seven roles from limestone through to umber, a six-step ramp of the lead pigment, and three numbers worth checking before you commit: the warm share of the palette, the mean saturation and the lightness spread. It also previews the palette on unbleached kraft board and picks the label ink that clears the WCAG 4.5:1 minimum on each fill.",
  useCases: [
    "Set the palette for a wellness or food brand where every colour should look like it came out of the ground.",
    "Check which ink to print on a terracotta label so the copy stays readable on uncoated stock.",
    "Switch a clay-led scheme to a moss-led one without losing the neutral base and umber text colour.",
    "Diagnose a palette that looks flat — the lightness spread reading tells you it lacks a truly pale or truly dark member.",
  ],
  benefits: [
    [
      "Pigment-anchored hues",
      "Each colour is drawn from the hue window of a named earth pigment, so the set holds together the way a paint box does.",
    ],
    [
      "Warm/cool balance measured",
      "The share of the palette sitting in the warm 0-70° band is reported against a 55% target, which is what keeps it reading natural.",
    ],
    [
      "Packaging-aware",
      "A kraft-board reference and a best-ink pick per fill turn the palette into something you can actually print.",
    ],
  ],
  faqs: [
    [
      "What are earth tones exactly?",
      "Colours in the hue range of natural iron-oxide and clay pigments: ochres and siennas around 14-46°, umbers in the same range but very dark and low in saturation, and green earth around 96-124°. They are characterised by moderate saturation — roughly 15-55% — rather than by being simply brown.",
    ],
    [
      "Why do earthy palettes look muddy when I mix them myself?",
      "Usually because every colour sits at a similar lightness. An earth palette needs a genuine pale (a limestone or sand near 90% lightness) and a genuine dark (an umber near 18%) so the mid-tones have somewhere to sit; the lightness-spread reading here flags it when that range collapses.",
    ],
    [
      "What colour text works on kraft packaging?",
      "A very dark ink almost always wins: kraft board sits around 60% lightness, so a deep umber or near-black clears 4.5:1 comfortably while a mid-brown does not. White can work on darker fills, which is why the tool tests both directions and reports the ratio.",
    ],
    [
      "Should a natural brand palette be entirely warm?",
      "No — a single cool note stops the palette turning orange. Green earth is the traditional answer: it is a genuinely cool hue but low enough in saturation to sit beside the ochres without fighting them. Keeping the warm share above about 55% preserves the natural feel.",
    ],
  ],
};

export default seo;
