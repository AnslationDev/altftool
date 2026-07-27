const seo = {
  intro:
    "The Y2K Palette Generator builds a late-1990s / early-2000s colour system from a seed word: bubblegum magenta, cyber lilac, ice aqua and acid lime accents, a five-step brushed-chrome ramp, and three ready gradients including a holographic sweep. Hues are drawn from fixed windows that define the look (318-338° for bubblegum, 262-282° for lilac, 182-196° for aqua, 206-224° at 7-16% saturation for chrome), and every text pairing is measured with the WCAG 2.1 contrast formula so you know which colours can carry copy and which are decoration. Same seed, same palette — share the word and a teammate gets the identical set.",
  useCases: [
    "Pick a chrome-and-pink palette for a nostalgic landing page, then export it straight as CSS custom properties.",
    "Generate a holographic gradient for a poster or album cover without hand-tuning four stops.",
    "Check before you build whether that neon aqua can hold body copy on white — usually it cannot, and the table says so.",
    "Lock a seed word into a brief so designer and developer generate the same colours independently.",
  ],
  benefits: [
    [
      "Deterministic from a seed",
      "The palette is a pure function of the seed, base and intensity — no re-rolling to find the one you liked.",
    ],
    [
      "Chrome as a real ramp",
      "Five fixed lightness stops on one near-neutral hue give the metallic sweep instead of a single grey.",
    ],
    [
      "Contrast told honestly",
      "Each pairing is labelled body text, large text and UI only, or decoration only against the 4.5:1 and 3:1 thresholds.",
    ],
  ],
  faqs: [
    [
      "What colours make up a Y2K palette?",
      "The recurring set is bubblegum magenta, lilac or periwinkle, icy aqua, acid lime and a brushed-chrome grey, usually on a very light lilac-white or a deep violet base. The metallic grey is what separates Y2K from plain 90s neon.",
    ],
    [
      "How do I make a chrome gradient in CSS?",
      "Use one near-neutral blue-grey hue at low saturation and vary only the lightness across several stops — for example light, mid, light again, then dark, at 135 degrees. The alternating light and dark bands read as reflected metal; the tool exports this as a ready linear-gradient.",
    ],
    [
      "Is neon pink accessible for text?",
      "Rarely on white. WCAG 2.1 asks for 4.5:1 for body text and 3:1 for large or bold text and UI shapes, and saturated pink on a light background usually lands near 3:1. Keep neon for headlines, borders and fills, and use the dark ink or a dark chrome step for paragraphs.",
    ],
    [
      "Will the same seed always give the same palette?",
      "Yes. The seed is hashed into a mulberry32 PRNG, so a given seed, base and intensity always produce identical hex values — nothing depends on the time or on a random call at page load.",
    ],
  ],
};

export default seo;
