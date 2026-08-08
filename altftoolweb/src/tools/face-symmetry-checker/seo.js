const seo = {
  title: "Face Symmetry Checker: 68 Landmarks, 6 Feature Pairs",
  metaDescription:
    "Detects 68 facial landmarks in your browser and scores eyes, brows, cheeks, jaw, nose and lips against the nose-bridge midline.",
  steps: [
    "Drag an image onto \"Upload a clear front-facing photo\", or click to browse and pick one from your device.",
    "Detection runs in the page and draws the 68-point landmark overlay with the nose-bridge symmetry line and a confidence badge over your photo.",
    "Read the Symmetry Score percentage and the Feature Breakdown for eyes, brows, cheeks, jaw, nose and lips, then press Analyze Another for a different shot.",
  ],
  intro:
    "The Face Symmetry Checker detects 68 facial landmarks in a front-facing photo and scores how evenly six paired features sit either side of your facial midline: eyes, brows, cheeks, jaw, nose and lips. Each pair is scored as the ratio of the shorter side's distance from the midline to the longer side's, times 100 — so a left eye corner 90 px out and a right at 100 px scores 90% — and the overall figure is the average of the six. The landmark model runs in your browser, and the result comes with an overlay showing the detected points, the midline drawn through the bridge of the nose, and the paired measurements.",
  useCases: [
    "You have noticed one eyebrow sits higher than the other in photos and want a number on it rather than an impression from the mirror.",
    "You are choosing between two headshots and want to see which angle put your features more evenly around the midline.",
    "You are curious which of your features is the most and least balanced — the per-feature breakdown ranks eyes, brows, cheeks, jaw, nose and lips separately."
  ],
  benefits: [
    ["Six features scored separately", "A single overall percentage hides where the asymmetry actually is; the breakdown gives each pair its own score and its left and right distances in pixels."],
    ["You can see the measurement", "The overlay draws all 68 landmarks, highlights the key points and marks the nose-bridge midline, so you can check the detection landed correctly before trusting the number."],
    ["Photo stays on your device", "Detection and landmarking run in the page with a local model — the image is never uploaded for analysis."],
  ],
  faqs: [
    [
      "How is the symmetry score calculated?",
      "For each of the six feature pairs the tool measures the horizontal distance from the midline (landmark 27, the top of the nose bridge) to the left and right point, then scores that pair as the smaller distance divided by the larger, expressed as a percentage. The overall score is the plain average of those six numbers.",
    ],
    [
      "What counts as a good score?",
      "Scores of 80% and above are shown in the top band, 60-79% in the middle, and below 40% at the bottom. No human face is perfectly symmetrical, and mild differences between the two sides are the norm rather than a flaw.",
    ],
    [
      "Why did my score change between two photos of me?",
      "Because the measurement is horizontal distance, head rotation changes it — turning even slightly moves one side closer to the midline in the image. Use a square-on shot with level eyes and even lighting if you want two results to be comparable.",
    ],
    [
      "Can this tell me if something is medically wrong with my face?",
      "No — it is an entertainment and curiosity tool that measures pixel distances in a photo, not a clinical assessment. Sudden or one-sided facial drooping, weakness or numbness is a medical emergency, and any asymmetry that appeared recently should be looked at by a doctor.",
    ],
  ],
};

export default seo;
