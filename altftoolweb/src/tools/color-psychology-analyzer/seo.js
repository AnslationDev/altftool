const seo = {
  title: "Color Psychology Analyzer + WCAG Contrast Check",
  metaDescription:
    "Enter one hex colour for its hue family, emotional and market-by-market readings, and its measured WCAG 2.1 contrast against white and black.",
  intro:
    "A colour psychology analyser takes one hex value and reports three things about it: the emotional associations its hue family carries, how that hue is read in different markets, and its measured WCAG 2.1 contrast ratio against white and black. The hue is classified from its HSL angle on the standard twelve-part wheel, and contrast is computed with the official relative-luminance formula (0.2126R + 0.7152G + 0.0722B on linearised sRGB). It is built for brand designers and product teams choosing a palette that has to work emotionally and pass accessibility review.",
  useCases: [
    "Sanity-check a proposed brand colour before a rebrand ships into markets where the hue reads differently — green headwear imagery in China, purple in Thailand",
    "Decide whether white or black text belongs on a button colour, using the measured ratio rather than eyeballing it",
    "Build a secondary palette from complementary, analogous, triadic or split-complementary hue rotations of an approved primary",
  ],
  benefits: [
    ["Psychology and maths together", "Emotional associations sit next to the WCAG ratio, so a colour is not approved on feel alone."],
    ["Cross-market readings", "Each hue family lists how it is understood in several regions, including where it signals mourning."],
    ["Exact WCAG 2.1 figures", "Relative luminance and contrast use the published formula, so the numbers match any audit tool."],
  ],
  faqs: [
    [
      "What contrast ratio does text need to pass WCAG?",
      "4.5:1 for normal body text and 3:1 for large text — 18.66px bold or 24px and above — under WCAG 2.1 AA (SC 1.4.3). AAA raises those to 7:1 and 4.5:1. Non-text elements such as icons, focus rings and input borders need 3:1 under SC 1.4.11. The scale runs from 1:1 (identical colours) to 21:1 (pure black on pure white).",
    ],
    [
      "Which colour is safest for a global brand?",
      "Blue, on balance. It has fewer widespread negative or taboo readings than most hues across major markets — though it is a traditional mourning colour in China and South Korea — which is part of why it dominates banking, insurance and enterprise software. The trade-off is that it is so common it rarely differentiates, and it suppresses appetite cues — which is why almost no food brand uses it as a primary.",
    ],
    [
      "Does colour psychology actually change behaviour?",
      "The reliable effect is appropriateness, not the colour itself: research on colour and marketing consistently finds that what matters is whether the colour fits the brand's personality, not whether it is 'a trustworthy blue'. Treat the associations here as prior expectations your audience brings, then test the actual design.",
    ],
    [
      "Why does my yellow fail contrast on white?",
      "Because yellow sits at very high relative luminance — a saturated yellow such as #FFD700 measures about 1.4:1 against white, far under the 4.5:1 body-text minimum. Yellow works as a background with dark text on it, or as a highlight, but not as text on a light page. Darken it toward amber or place it on a dark surface instead.",
    ],
  ],
};

export default seo;
