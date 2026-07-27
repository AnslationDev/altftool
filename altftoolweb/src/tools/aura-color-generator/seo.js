const seo = {
  intro:
    "This aura colour generator finds the dominant hue of a photo using a saturation-weighted hue histogram in HSL colour space, then maps that hue to one of eight aura bands with a playful reading and a five-colour palette. With no photo, it hashes a name with FNV-1a so the same name always returns the same aura. The colour science is real; the aura reading is entertainment.",
  useCases: [
    "Upload a selfie and find out whether the photo's dominant hue puts you in Deep Blue or Rose Magenta territory.",
    "Generate a repeatable aura colour for every member of a group chat from their names alone.",
    "Pull a five-colour palette — analogous, triadic and complementary — out of a photo you already like.",
  ],
  benefits: [
    ["Photo never leaves the device", "Pixels are read on a canvas in your browser; no upload, no account, no stored image."],
    ["Repeatable, not random", "Name-based auras use an FNV-1a hash, so the same name gives the same colour every time."],
    ["A usable palette falls out", "Every reading comes with analogous (±30°), triadic (+120°) and complementary (+180°) companions in CSS-ready form."],
  ],
  faqs: [
    [
      "How does the tool decide my aura colour?",
      "It scales your photo to 220 pixels on the long edge, converts up to 20,000 sampled pixels from sRGB to HSL, and builds a hue histogram in 10° buckets weighted by each pixel's saturation. The heaviest bucket wins. Weighting by saturation matters because grey pixels have a numerically defined hue that means nothing visually.",
    ],
    [
      "Why did I get a silver or grey aura?",
      "Because the average saturation of the photo came in under 8%, which is the threshold where an image has no meaningful hue at all. Flat indoor light, a white wall behind you or a black-and-white photo will all do it — retake the photo somewhere with colour in the frame.",
    ],
    [
      "Is an aura colour a real thing?",
      "No. There is no measurable field around people and no scientific basis for aura reading. What this tool measures is genuine — the dominant hue of your photograph — and the personality lines attached to each hue are written for fun, not as an assessment.",
    ],
    [
      "Will the same photo always give the same colour?",
      "Yes. The whole calculation is deterministic: same pixels in, same hue out, with no randomness anywhere. Re-uploading the same file gives the identical result, and a name typed the same way always hashes to the same hue.",
    ],
  ],
};

export default seo;
