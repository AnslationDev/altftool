const seo = {
  title: "OG Image Text Fit Checker: Wrap, Crop and Legibility",
  metaDescription:
    "Wrap a share-card headline with real Helvetica advance widths: widest line, block height, the largest size that still fits, and the centre-crop safe area.",
  steps: [
    "Type the Headline and any \"Sub-headline or kicker\", then hit a preset chip — Open Graph / Facebook, X summary_large_image, LinkedIn share, Slack unfurl or WhatsApp / iMessage bubble — to set Card width, Card height and Feed render width at once.",
    "Tune \"Headline size (px)\", Headline weight (Regular / medium or Bold / semibold), Horizontal and Vertical padding, \"Line height (multiplier)\" and \"Maximum lines allowed\" until the wrap and the crop-safe overlay on the preview look right.",
    "Read \"Headline in the feed\" in rendered pixels against the 12 px legibility floor and 16 px comfortable mark, check the \"Line by line\" table of Line, Text and Width, then press Copy report.",
  ],
  intro:
    "OG Image Text Fit Checker predicts where a share-card headline will wrap and how tall it renders once a feed shrinks the card, using published Helvetica advance widths (units per 1000 em) rather than a rough characters-per-line guess. It reports the widest line, the total text block height, the largest headline size that still fits your line limit, and whether the copy stays inside the region that survives every common centre-crop. Aimed at anyone writing or templating Open Graph cards who wants to catch a three-line overflow before it ships.",
  useCases: [
    "Check a 1200 x 630 card headline before wiring it into a dynamic OG image endpoint.",
    "Find the largest headline size that still keeps a long product name on two lines.",
    "Verify a card still reads at the roughly 300 px width a WhatsApp or iMessage bubble gives it.",
    "Keep key words inside the square-crop safe area for surfaces that show a 1:1 thumbnail.",
  ],
  benefits: [
    ["Metric-based wrapping", "Uses real per-character advance widths instead of an average character count, so the line breaks match the render."],
    ["Feed-size legibility", "Converts your design-time font size into the pixel size a reader actually sees in the timeline."],
    ["Crop-safe area", "Shows the intersection of the 1.91:1, 2:1, 1.5:1 and 1:1 centre-crops so nothing important gets cut."],
  ],
  faqs: [
    [
      "What size should an Open Graph image be?",
      "1200 x 630 pixels is the standard, giving the 1.91:1 ratio Facebook, LinkedIn and most link unfurlers expect. X's summary_large_image card accepts the same file; keep it under about 5 MB and use PNG for text-heavy cards so type stays crisp.",
    ],
    [
      "How big should the text be on a social share image?",
      "Work backwards from the rendered size. A card designed at 1200 px wide is often shown around 300-550 px in a feed, so a 64 px headline lands at roughly 16-29 px on screen. Keep the headline at or above 12 px rendered, and target 16 px or more for comfort.",
    ],
    [
      "Why does my share card text get cut off?",
      "Different surfaces centre-crop the same file to different aspect ratios — 1.91:1, 2:1 and sometimes a 1:1 square thumbnail. On a 1200 x 630 card the square crop is only the middle 630 x 630 pixels, so anything outside that band can disappear.",
    ],
    [
      "How many characters fit on one line of an OG image?",
      "It depends on the letters, not just the count: a capital W is 944 units per 1000 em in Helvetica while a lowercase l is 222, more than four times narrower. Measuring the actual string is the only reliable way, which is what this tool does.",
    ],
  ],
};

export default seo;
