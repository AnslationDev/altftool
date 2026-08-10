const seo = {
  title: "Colourblind Logo Checker: 4 CVD Simulations, Delta-E",
  metaDescription:
    "See a logo under protanopia, deuteranopia, tritanopia and achromatopsia at once, with CIE76 delta-E scores on its own colours — all in your browser.",
  steps: [
    "Upload your artwork through the 'Logo file' input — any image the browser can decode, such as PNG, JPEG, WebP or SVG; its name and pixel size appear beneath.",
    "Drag the 'Severity' slider from 0 to 100% (100% is full dichromacy) and choose which deficiency to score under 'Score the palette for'.",
    "Compare the Original canvas against the four simulations, check the 'Colour pairs that merge' count and the before/after delta-E table, then use 'Copy report'.",
  ],
  intro:
    "Colourblind Logo Checker renders a logo four ways at once — protanopia, deuteranopia, tritanopia and achromatopsia — using the LMS cone-projection method of Viénot, Brettel and Mollon (1999). It then extracts the artwork's own dominant colours and scores every pair with CIE76 delta-E in CIELAB, flagging any pair that drops below the 2.3 just-noticeable-difference threshold once colour vision is reduced. Everything is computed in the browser with the canvas API, so the file is never uploaded.",
  useCases: [
    "Check a two-colour logo before print, where a red and green mark can collapse into the same olive tone.",
    "Test whether a red-to-green gradient in a wordmark still reads as two colours for a deuteranope.",
    "Review an icon set for a dashboard where colour alone signals status.",
    "Show a client, with a side-by-side render, why a proposed palette needs a second differentiator.",
  ],
  benefits: [
    ["Published simulation method", "Uses the Viénot / Brettel / Mollon LMS projection, not a hue-rotation approximation."],
    ["Scored, not just shown", "Reports CIE76 delta-E before and after so \"looks fine\" becomes a number."],
    ["Private by design", "Pixels are read and simulated locally with the canvas API; nothing is sent anywhere."],
  ],
  faqs: [
    [
      "How common is colour blindness?",
      "Red-green colour vision deficiency affects roughly 8% of men and 0.5% of women of Northern European descent, with deuteranomaly the most common form at about 5% of men. Tritan deficiencies are far rarer, around 1 in 10,000, and affect men and women equally.",
    ],
    [
      "What is the difference between protanopia and deuteranopia?",
      "Protanopia is the absence of the long-wavelength (L) cones and deuteranopia the absence of the medium-wavelength (M) cones. Both confuse reds with greens, but protanopia also darkens reds noticeably, so a red mark on a dark background can nearly disappear.",
    ],
    [
      "What delta-E value counts as a visible colour difference?",
      "About 2.3 is the classic just-noticeable-difference threshold for CIE76 delta-E, and a value under roughly 5 means two colours are hard to tell apart side by side. This tool flags any pair whose simulated difference falls below those levels.",
    ],
    [
      "How do I make a logo colourblind safe?",
      "Give it a lightness difference as well as a hue difference: colours that differ in luminance stay distinguishable under every deficiency, and the WCAG 3:1 non-text contrast threshold is a good floor. Add shape, an outline or a monochrome version so the mark never depends on hue alone.",
    ],
  ],
};

export default seo;
