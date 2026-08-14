const seo = {
  title: "Color Name Finder: Nearest CSS Name by CIEDE2000",
  metaDescription:
    "Enter a hex value for the closest CSS colour keywords ranked by CIEDE2000 in Lab, a plain-English description, and contrast against black and white.",
  steps: [
    "Type a hex value such as #14B8A6 into the 'Hex colour' box.",
    "Set Matches (1 to 20) to choose how many CSS colour keywords are ranked by CIEDE2000 distance in Lab space.",
    "Read the Best description and Basic term above the swatch, the RGB values and the white and black contrast ratios, then each match with its hex and its ΔE; press Copy result.",
  ],
  intro:
    "Colour Name Finder identifies the closest human-readable name for any hex value by converting it to CIE L*a*b* and ranking every CSS colour keyword with the CIEDE2000 difference formula. Because CIEDE2000 weights lightness, chroma and hue the way the eye does, the top match is the one a person would actually call the colour — not just the one with the smallest RGB gap. It also returns a plain-English description such as 'deep vivid teal', the nearest basic colour term, and the WCAG contrast ratio against black and white.",
  useCases: [
    "Name an unlabelled hex value pulled from a screenshot so you can describe it in a brand document.",
    "Check whether a brand colour is close enough to a CSS keyword to use the keyword in quick prototypes.",
    "Find a plain-language label for a palette swatch when writing alt text or design documentation.",
    "See at a glance whether black or white text will have better contrast on a background colour.",
  ],
  benefits: [
    [
      "Perceptual matching",
      "CIEDE2000 in Lab space ranks names the way the eye judges difference, not by raw RGB distance.",
    ],
    [
      "Description, not just a keyword",
      "Lightness, saturation and hue combine into readable labels like 'pale pink' or 'deep brown'.",
    ],
    [
      "Contrast built in",
      "WCAG relative-luminance contrast against black and white is shown alongside the name.",
    ],
  ],
  faqs: [
    [
      "How many named colours are there in CSS?",
      "CSS Color Module Level 4 defines 148 colour keywords, though several are duplicates: grey and gray spellings, aqua and cyan, and fuchsia and magenta all resolve to the same values, leaving about 139 distinct colours.",
    ],
    [
      "What is Delta E and what counts as a close match?",
      "Delta E is the perceptual distance between two colours. Using CIEDE2000, a value below roughly 1.0 is imperceptible to most viewers, 1 to 2 is a very close match visible only side by side, and above 5 the colours read as clearly different.",
    ],
    [
      "Why is the nearest name not the one with the closest RGB numbers?",
      "RGB distance treats a step in dark blue the same as a step in bright yellow, but the eye does not. Converting to CIE L*a*b* and applying CIEDE2000 corrects for that, so the ranking matches what people actually see.",
    ],
    [
      "Can I use a CSS colour name instead of a hex value in production?",
      "Yes for prototypes and quick styling, since keywords map to fixed sRGB values. For brand work use the exact hex or a design token, because a keyword that is a few Delta E away will drift your brand colour on every screen it renders on.",
    ],
  ],
};

export default seo;
