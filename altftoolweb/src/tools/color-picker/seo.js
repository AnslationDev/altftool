const seo = {
  intro:
    "This color picker lets you choose a colour by swatch, hex field, or hue, saturation, lightness and RGB sliders, and returns it as HEX, RGB, RGBA, HSL and CMYK simultaneously. Alongside the codes it generates four palettes from the same hue — complementary, analogous, triadic and a five-step monochromatic ramp — and checks the colour's contrast against white and against near-black to the WCAG AA threshold of 4.5:1. Your last ten colours stay in a history strip so you can step back to one you liked.",
  useCases: [
    "You are choosing a button colour and need to know, while you are still dragging the lightness slider, whether white label text will pass AA on it.",
    "You need light and dark variants of one brand colour for hover and active states, and want a monochromatic ramp rather than guessing hex values.",
    "You have an approximate colour in mind, want to nudge the hue by a few degrees, and need the CMYK reading for the print version of the same asset.",
  ],
  benefits: [
    ["Contrast checked while you pick", "White and near-black text are both scored against the current colour and marked pass or fail at 4.5:1, so unreadable choices surface at the moment you make them."],
    ["Four palettes from one hue", "Complementary, analogous, triadic and a monochromatic set are generated live by rotating hue and stepping lightness — no separate palette tool needed."],
    ["Steer by whichever channel suits", "Hue, saturation and lightness sliders sit next to RGB inputs and a hex field, and all of them stay in sync with the same colour."],
  ],
  faqs: [
    [
      "Which formats does it output?",
      "Five: HEX, rgb(), rgba() with your alpha value, hsl() and cmyk(). Each has its own copy button, and the alpha slider runs from 0 to 100 percent in 1 percent steps.",
    ],
    [
      "How does it build the monochromatic palette?",
      "By holding hue and saturation fixed and shifting lightness by plus and minus 15 and plus and minus 30 percentage points around your colour, giving five tones. Complementary rotates the hue 180 degrees, analogous uses plus and minus 30, and triadic uses 120 and 240.",
    ],
    [
      "What does the PASS AA badge mean?",
      "That the colour reaches at least 4.5:1 contrast against that text colour, the WCAG AA minimum for normal body text. Contrast is measured against pure white and against a near-black (#111827) rather than absolute black, since that is closer to the text colour real interfaces use.",
    ],
    [
      "Does it remember colours I tried earlier?",
      "Yes, the ten most recent colours are kept in a history strip for the session and clicking one restores it. Nothing is uploaded — the history lives only in the page you have open.",
    ],
  ],
};

export default seo;
