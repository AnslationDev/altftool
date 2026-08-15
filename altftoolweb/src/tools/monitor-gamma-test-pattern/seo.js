const seo = {
  title: "Monitor Gamma Test Pattern — Measure Without a Colorimeter",
  metaDescription:
    "Match a solid grey to a one-pixel dither to measure your display's actual gamma, plus a step wedge, bit-depth banding ramp and clipping patches.",
  steps: [
    "Open the page at 100% browser zoom on the display's native resolution so the one-pixel black and white dither renders unscaled.",
    "Step back and drag the 'Matching patch value (0-255)' slider until the solid grey half stops standing out from the striped block.",
    "Read the estimated display gamma and its offset from sRGB and gamma 2.2, then check the step wedge, the 4/6/8/10-bit banding ramp and the near-black and near-white clipping patches.",
  ],
  intro:
    "This test pattern measures a display's gamma by exploiting the fact that a one-pixel black and white dither emits exactly 50% of the panel's peak light. Match the striped block to a solid grey and the tool inverts V = 255 x 0.5^(1/gamma) to report the gamma you are actually looking at, alongside a step wedge, a bit-depth banding ramp and near-black and near-white clipping patches. It is a five-minute sanity check for anyone editing photos, video or UI without a colorimeter to hand.",
  useCases: [
    "Check a new monitor's tone curve before trusting it for photo editing.",
    "Find out whether a laptop screen is crushing shadows before you grade footage on it.",
    "Spot a 6-bit panel faking 8-bit by looking for visible steps in the banding ramp.",
    "Confirm a display profile change actually moved the tone curve rather than only the white point.",
  ],
  benefits: [
    ["Measurement, not guesswork", "The match point inverts a real transfer function instead of asking you to eyeball a curve."],
    ["Four patterns in one page", "Gamma match, step wedge, banding ramp and clipping patches, all driven by the same maths."],
    ["Honest about its limits", "It reports what the tone curve does; it cannot measure white point, uniformity or absolute nits."],
  ],
  faqs: [
    [
      "What gamma should my monitor be set to?",
      "Gamma 2.2 is the standard for web, photo and general desktop work, and matches the sRGB transfer function closely. Video grading in a dim room usually targets gamma 2.4 per ITU-R BT.1886, and older Mac prepress workflows used 1.8.",
    ],
    [
      "How does the black and white stripe test measure gamma?",
      "Alternating one-pixel black and white lines average to half the display's peak light output regardless of gamma, because the eye integrates the light linearly. The solid grey that matches has a code value V where (V/255)^gamma = 0.5, so gamma = ln(0.5) / ln(V/255) — a match at 186 means gamma 2.2, and at about 188 means the sRGB curve.",
    ],
    [
      "Why does the pattern look wrong at browser zoom other than 100%?",
      "Scaling resamples the one-pixel stripes, which changes their average brightness and shifts the match point. Set the browser to 100% zoom and view the page on the native resolution of the display you are testing.",
    ],
    [
      "Can this replace a hardware colorimeter?",
      "No. It measures only the grey tone response and cannot measure white point, absolute luminance in cd/m², panel uniformity or colour accuracy. Treat it as a quick check; a calibrator plus profiling software is still needed for colour-critical work.",
    ],
  ],
};

export default seo;
