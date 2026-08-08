const seo = {
  title: "Colorblind Palette Checker: OKLab Pairs + Contrast",
  metaDescription:
    "Screens up to 12 hex colors through protanopia, deuteranopia and tritanopia matrices, ranks the closest OKLab pairs and checks text contrast ratios.",
  steps: [
    "Enter each 'Hex value' as an exact opaque #RRGGBB, add an 'Optional label', and set its 'Intended role' — 'Add color' takes the palette up to 12.",
    "Press 'Screen palette' to re-render every color through the protanopia, deuteranopia and tritanopia matrices and score all pairs in OKLab.",
    "Read the 'Very close cues' count and 'Role contrast checks', the WCAG ratio for each text-on-background pairing, and the bounded replacement hex offered for colors that collapse.",
  ],
  intro:
    "The Colorblind-Safe Palette Fixer screens up to 12 hex colors by re-rendering each one through the Machado-Oliveira-Fernandes severity-1 matrices for protanopia, deuteranopia and tritanopia, then measuring how far apart every pair stays in OKLab under each of those views. Designers and data-visualisation authors get a ranked list of the pairs that collapse into each other, the WCAG contrast ratio for every text-on-background combination, and a bounded alternative hex for the colors that are too close. It flags where a palette leans on hue alone; it does not diagnose color vision or certify conformance.",
  useCases: [
    "You built a six-series line chart and want to know which two series a deuteranopic reader will read as the same line before you ship the dashboard.",
    "Your status system uses red for error and green for success, and you need evidence of how close those two swatches sit under a protanopia simulation to justify adding icons.",
    "A brand palette arrives as a list of hex codes with roles attached, and you need to check every text-on-background pairing against the 4.5:1 normal-text ratio in one pass.",
  ],
  benefits: [
    [
      "Every pair, every view",
      "Scores all pairwise combinations across normal, protan, deutan and tritan views and reports the single worst distance, not just the normal-vision one.",
    ],
    [
      "Suggestions that keep your contrast",
      "A replacement hex is only offered if it raises pair separation by at least 1.5 units and no relevant text-background ratio drops below its current value.",
    ],
    [
      "Roles drive the contrast checks",
      "Marking a color as text or background pairs it only against its opposite role, so you get the ratios that matter instead of an N-by-N grid of noise.",
    ],
  ],
  faqs: [
    [
      "what color distance counts as too close for colorblind users",
      "The screening bands are set at an OKLab distance below 5 for very close and below 12 for close, with anything at 12 or above marked separated. These are editorial screening cues chosen for this tool, not standardised accessibility thresholds, so treat a very-close flag as a prompt to add a second cue such as shape, pattern or a direct label.",
    ],
    [
      "which colorblindness types does the simulation cover",
      "Three dichromatic types: protanopia, deuteranopia and tritanopia, each using the fixed severity-1 endpoint matrix from the Machado, Oliveira and Fernandes model applied in linear-light sRGB. Anomalous trichromacy such as deuteranomaly is not simulated separately, and the tritan endpoint is an approximation in the original paper.",
    ],
    [
      "what contrast ratio do I need to pass",
      "WCAG 2 asks for at least 4.5:1 for normal body text and 3:1 for large text against its background, and the tool marks each role-based pair against both. Passing those ratios on a swatch pair is not the same as page-level conformance, since real text also depends on font size, weight and any overlay behind it.",
    ],
    [
      "how many colors can I check at once",
      "Twelve per review, entered as exact opaque #RRGGBB values with no alpha channel, and at least two must be valid before analysis runs. Twelve colors produce 66 pairwise comparisons, each scored under all four viewing modes.",
    ],
  ],
};

export default seo;
