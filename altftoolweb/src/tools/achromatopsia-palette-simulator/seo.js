const seo = {
  title: "Achromatopsia Simulator: Palette in True",
  metaDescription:
    "Convert swatches to greyscale by WCAG luminance, CSS grayscale() or Rec. 601, and score every pair against the 3:1 and 4.5:1 contrast thresholds.",
  steps: [
    "Give each swatch a Name and a Hex value, using Add colour for up to 12 swatches.",
    "Choose a Greyscale model — WCAG relative luminance, CSS grayscale() filter, or Rec. 601 luma.",
    "Read Pairs that collapse with the Worst pair in greyscale and the counts Pairs below 3:1 and Pairs below 4.5:1, then use Copy report.",
  ],
  intro:
    "Achromatopsia Palette Simulator converts a palette to true greyscale and scores every pair of colours with the WCAG 2.x contrast formula, (L1 + 0.05) / (L2 + 0.05), so you can see which swatches survive on their luminance alone. Three conversions are offered — WCAG relative luminance on linearised sRGB, the CSS grayscale() filter matrix, and Rec. 601 luma — because they produce visibly different greys from the same colour. It is for designers checking that a chart, status badge or state colour still communicates when hue carries no information at all.",
  useCases: [
    "Check that success, warning and error states are still told apart on a monochrome receipt or an e-ink display.",
    "Prove that a multi-series chart is readable when printed on a black-and-white office printer.",
    "Find the two brand colours that render as the same grey before they are used side by side in an icon set.",
    "Compare how a CSS grayscale() filter differs from a true luminance conversion on the same swatch.",
  ],
  benefits: [
    ["Real luminance maths", "Uses the sRGB transfer function from IEC 61966-2-1, not a naive channel average."],
    ["Every pair scored", "Ranks all colour pairs worst first against the 3:1 and 4.5:1 WCAG thresholds."],
    ["Three honest models", "Shows where the CSS filter and Rec. 601 luma disagree with true relative luminance."],
  ],
  faqs: [
    [
      "What is achromatopsia?",
      "Achromatopsia is the complete absence of colour vision, in which only lightness differences are perceived. Complete rod monochromacy is rare — roughly 1 in 30,000 people — but the same flattening happens to everyone on a greyscale print, an e-ink screen or a display washed out by sunlight.",
    ],
    [
      "Does converting to greyscale change the WCAG contrast ratio?",
      "No. The WCAG contrast formula is built on relative luminance and ignores hue completely, so a pair that reaches 4.5:1 in colour reaches the same ratio in greyscale. What disappears is any distinction that was carried by hue at similar lightness, such as a red and a green of the same luminance.",
    ],
    [
      "How do I convert sRGB to greyscale correctly?",
      "Linearise each channel with the sRGB transfer function, combine them as 0.2126 R + 0.7152 G + 0.0722 B, then re-encode. Applying those weights directly to the gamma-encoded values — which is what CSS grayscale() does — gives a different, usually darker, result for saturated colours.",
    ],
    [
      "What contrast ratio do I need between two colours?",
      "WCAG 2.1 requires 4.5:1 for body text (SC 1.4.3), 3:1 for large text and for user interface components and graphical objects (SC 1.4.11), and 7:1 for enhanced AAA text. Two swatches below roughly 1.5:1 read as the same tone and should never be the only way a state is signalled.",
    ],
  ],
};

export default seo;
