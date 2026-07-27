const seo = {
  intro:
    "The Medical Clean Palette Generator builds a low-noise interface palette for health software — surfaces, text, borders and a five-part clinical status set — and then audits it twice: WCAG 2.x contrast for every text and control pairing, and colour separation between the status colours under simulated red-green colour vision deficiency. The simulation uses the Viénot, Brettel and Mollon (1999) dichromat matrices on linear RGB, and separation is measured as CIE76 colour difference in CIELAB. It is built for teams designing EMR screens, lab result views, triage dashboards and patient apps, where a status chip being misread is a safety problem, not a style problem.",
  useCases: [
    "Check whether your critical-red and within-range-green chips are still tellable apart by a clinician with deuteranopia.",
    "Generate a dark-mode variant of a ward dashboard without losing the separation between amber and green.",
    "Get a separate text tone for amber and green statuses, since the vivid versions rarely clear 4.5:1 as words on a white card.",
    "Export CSS variables for surfaces, borders and status colours so the design and front-end teams work from one source.",
  ],
  benefits: [
    [
      "Two audits, not one",
      "Contrast and colour-blindness separation are both scored, because a palette can pass one and fail the other.",
    ],
    [
      "Status hues stay conventional",
      "Red, amber, green, blue and slate keep their meanings; only lightness and saturation are tuned per mode.",
    ],
    [
      "Automatic text repair",
      "Where a vivid status colour is too light to carry words, a darker sibling of the same hue is generated until it reaches 4.5:1.",
    ],
  ],
  faqs: [
    [
      "What colours should a medical or healthcare interface use?",
      "A near-neutral base — clinical blue, teal or slate at low saturation — for everything structural, so the only saturated colour on screen carries clinical meaning. Reserve red for critical, amber for abnormal, green for within range, blue for informational and a desaturated slate for awaiting result, and never let a decorative accent share a hue with a status.",
    ],
    [
      "How many people cannot tell red and green apart?",
      "Colour vision deficiency affects roughly 8% of men and 0.5% of women of Northern European descent, and the large majority of those cases are red-green — protanopia, protanomaly, deuteranopia or deuteranomaly. In a clinical team of any size, someone will read your red and green chips differently from you, which is why this tool simulates both dichromacies.",
    ],
    [
      "Is colour alone enough to show a critical result?",
      "No. WCAG 2.x SC 1.4.1 requires that colour is never the only way information is conveyed, and clinical safety guidance says the same. Pair every status colour with a text label, an icon shape or a position, so the meaning survives greyscale printing, a monochrome monitor and any degree of colour vision deficiency.",
    ],
    [
      "What is CIE76 delta E and what number should I aim for?",
      "Delta E is the distance between two colours in CIELAB space; CIE76 is the plain Euclidean version. A value near 2.3 is the classic just-noticeable difference for two large patches side by side. Small chips seen apart from each other in variable lighting need far more, so this tool targets 20 under the worst simulated deficiency — a practical design threshold rather than a published standard.",
    ],
  ],
};

export default seo;
