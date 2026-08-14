const seo = {
  title: "Color Contrast Checker: WCAG AA & AAA Ratio Test",
  metaDescription:
    "Paste two hex colours to get the exact WCAG contrast ratio, pass/fail at AA 4.5:1, AA large 3:1 and AAA 7:1, a live preview and copyable CSS.",
  intro:
    "The Color Contrast Checker measures the contrast ratio between a text colour and a background colour using the WCAG 2 relative luminance formula, then shows whether the pair passes AA normal (4.5:1), AA large (3:1) and AAA normal (7:1). Pick or paste two hex values and you get the exact ratio, a live preview of real heading and body text in those colours, and a copyable CSS declaration. It is for designers and developers checking a palette before it becomes an accessibility bug report.",
  useCases: [
    "Your brand's light grey body text sits on white and you need to know whether it clears 4.5:1 before the site goes through an accessibility audit.",
    "You are choosing a link colour for a dark navy background and want to test three candidates against the AA threshold in a preview rather than in a spreadsheet.",
    "A client insists on a pale gold heading; you need to show them the measured ratio and which of the three WCAG levels it fails.",
  ],
  benefits: [
    ["Uses the actual WCAG maths", "Channels are linearised with the 0.03928 threshold and weighted 0.2126 red, 0.7152 green, 0.0722 blue, then compared as (L1 + 0.05) / (L2 + 0.05)."],
    ["Three thresholds at a glance", "AA normal, AA large and AAA normal are each judged pass or fail alongside the numeric ratio, so you can see exactly where a colour pair stops working."],
    ["Preview alongside the number", "Heading and paragraph text render in your chosen colours, so you can judge the reading experience as well as the score."],
  ],
  faqs: [
    [
      "What contrast ratio do I need to pass WCAG?",
      "4.5:1 for normal body text at AA, 3:1 for large text at AA, and 7:1 for normal text at AAA. Large text means roughly 18pt, or 14pt when bold.",
    ],
    [
      "How is the contrast ratio calculated?",
      "As (L1 + 0.05) divided by (L2 + 0.05), where L1 is the lighter colour's relative luminance and L2 the darker one's. Each sRGB channel is divided by 255, linearised — divided by 12.92 below 0.03928, otherwise raised to the power 2.4 after the 0.055 offset — and weighted 0.2126, 0.7152 and 0.0722 for red, green and blue.",
    ],
    [
      "Does the order of the two colours matter?",
      "No. The calculation always divides the higher luminance by the lower, so swapping text and background gives the identical ratio. Ratios range from 1:1 for identical colours to 21:1 for pure black on pure white.",
    ],
    [
      "Does passing this check mean my page is accessible?",
      "No — it settles text contrast only. WCAG also covers non-text contrast for icons and UI borders at 3:1, focus visibility, keyboard operation and much else, so treat a pass here as one item cleared rather than a full audit.",
    ],
  ],
};

export default seo;
