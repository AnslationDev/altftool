const seo = {
  intro:
    "The Stream BRB Screen Maker builds a be-right-back holding card at full stream resolution and tells you whether the text is actually readable on it. Contrast between the text and the background is measured with the WCAG 2.2 formula — relative luminance from linearised sRGB channels, then (L1 + 0.05) / (L2 + 0.05) — and graded against the 3:1 large-text and 4.5:1 normal-text AA thresholds. Layout guides follow SMPTE RP 218, which puts the action-safe area at the central 93% of the frame and the title-safe area at 90%. Export the finished scene as SVG or PNG.",
  useCases: [
    "Make a matching BRB, starting-soon and stream-ended set in your channel colours in a few minutes.",
    "Check that a dark-on-dark brand palette still clears 4.5:1 before an overlay goes live in front of an audience.",
    "Produce a 1080 × 1920 vertical version of the same card for a mobile-first stream or a Shorts simulcast.",
    "Confirm the headline sits inside the title-safe box so a platform's chat bar or overscan does not clip it.",
  ],
  benefits: [
    ["Contrast measured, not guessed", "Uses the actual WCAG 2.2 relative-luminance formula and reports the ratio and pass level."],
    ["Broadcast-correct guides", "Action-safe and title-safe overlays come from SMPTE RP 218, the same standard broadcast monitors use."],
    ["Clean vector export", "Text stays as text in the SVG, so the card resizes without softening; PNG export is one click away."],
  ],
  faqs: [
    [
      "What size should a BRB screen be?",
      "Match your stream canvas: 1920 × 1080 for a standard 1080p stream, 2560 × 1440 if you output at 1440p, and 1080 × 1920 for a vertical stream. Building at the output size means OBS never rescales the image, which is what makes overlay text look soft.",
    ],
    [
      "What contrast ratio do overlay captions need?",
      "WCAG 2.2 asks for at least 4.5:1 for normal text and 3:1 for large text, where large means 24 px regular or 18.66 px bold. A headline on a BRB card is far above that size threshold, but the small print under it is not — aim for 4.5:1 on the supporting line so it survives being watched on a phone.",
    ],
    [
      "What is the title-safe area on a stream overlay?",
      "SMPTE RP 218 defines the action-safe area as the central 93% of the picture and the title-safe area as the central 90%. On a 1920 × 1080 canvas that is a 1728 × 972 box inset 96 px on each side — keep text inside it so nothing is lost to overscan or a platform's own chat and viewer-count chrome.",
    ],
    [
      "Does the countdown on the exported image count down?",
      "No. The exported SVG or PNG is a still image, so the time is fixed at whatever you set. For a live countdown, use the exported card as a background and add a dedicated timer or countdown source on top of it in OBS or Streamlabs.",
    ],
  ],
};

export default seo;
