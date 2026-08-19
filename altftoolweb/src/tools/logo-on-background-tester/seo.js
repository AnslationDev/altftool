const seo = {
  title: "Logo Contrast Tester: 3:1 WCAG Check & Scrim Fix",
  metaDescription:
    "Measure a logo colour on light, dark, grey and custom surfaces against WCAG 1.4.11's 3:1 bar, and get the black or white scrim opacity that fixes it.",
  steps: [
    "Enter the Logo colour (hex) or use the swatch picker, choose a Target contrast, and tick Include my surface in the test to add your own hex.",
    "Load a PNG, JPEG or WebP under \"Optional: test against a photo\" so the mark is scored against that image's luminance histogram.",
    "Read Worst contrast across the surfaces with the pass count and the solved scrim opacity for each failing surface, then press Copy result.",
  ],
  intro:
    "The Logo On Background Tester computes the WCAG 2.1 contrast ratio between a logo colour and a set of light, dark, mid-grey and custom surfaces, then reports which ones miss the 3:1 threshold that WCAG SC 1.4.11 sets for graphical objects. For every failing surface it solves for the exact black or white scrim opacity that lifts the mark back over the target, and if you load a photograph it builds a luminance histogram and tells you what percentage of that image's pixels the logo would disappear against. Everything is computed locally from the relative-luminance formula; no image is uploaded.",
  useCases: [
    "Check whether a mid-tone brand colour survives on both a white press kit page and a dark app header before locking the palette.",
    "Find the scrim opacity to put behind a logo on a hero photo so the mark clears 3:1 without dimming the whole image.",
    "Decide whether you need a second, lighter colourway of the logo for dark mode instead of reusing the primary one.",
    "Show a client the measured ratio for a proposed partner-badge colour rather than arguing about whether it looks readable.",
  ],
  benefits: [
    ["Real WCAG formula", "Uses the linearised sRGB relative-luminance definition and the (L1+0.05)/(L2+0.05) ratio, not an eyeballed guess."],
    ["Solves for the fix", "Bisects the scrim alpha to the smallest opacity that reaches your target instead of leaving you to trial and error."],
    ["Scores whole photographs", "Builds a luminance histogram of the image and reports the share of pixels that fail, plus the worst case."],
  ],
  faqs: [
    [
      "What contrast ratio does a logo need?",
      "3:1 is the working target. WCAG 2.1 SC 1.4.11 Non-text Contrast requires 3:1 for graphical objects a user needs to perceive, and that is the sensible bar for a logo on a surface. Body text next to it needs 4.5:1 under SC 1.4.3.",
    ],
    [
      "Do logos have to meet WCAG contrast requirements?",
      "Not strictly. WCAG SC 1.4.3 explicitly exempts logotypes: text that is part of a logo or brand name has no minimum contrast requirement. Legibility still matters commercially, which is why 3:1 is a good self-imposed floor even where conformance does not demand it.",
    ],
    [
      "How is the contrast ratio calculated?",
      "Each sRGB channel is divided by 255, linearised (c/12.92 below 0.03928, otherwise ((c+0.055)/1.055) raised to 2.4), then combined as 0.2126R + 0.7152G + 0.0722B to give relative luminance L. The ratio is (lighter L + 0.05) divided by (darker L + 0.05), which ranges from 1:1 to 21:1.",
    ],
    [
      "How dark does a scrim need to be behind a logo on a photo?",
      "It depends on both colours, which is why this tool solves for it. The scrim is composited over the background in sRGB, the resulting luminance is recomputed, and the smallest opacity that reaches your target ratio is found by bisection. A white logo on a light grey backdrop, for example, typically needs a black scrim in the 25 to 30 percent range to clear 3:1.",
    ],
  ],
};

export default seo;
