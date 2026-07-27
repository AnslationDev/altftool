const seo = {
  intro:
    "Facebook Cover Size Generator works out the region of a cover photo that survives both the desktop crop and the mobile app crop, then exports the image at the correct upload size. Facebook fills each display box with a centred cover crop, so a 851 x 315 profile cover keeps only its central 560 px across both views, and a 1640 x 624 Page cover keeps about 1109 px. Designers and page owners get a measured safe zone instead of guessing where a headline will get cut.",
  useCases: [
    "Position a tagline on a Page cover so it is not sliced off when someone opens the page in the Facebook app.",
    "Check how much of a 2400 x 1000 px photograph is thrown away when it is cropped into the 1640 x 624 Page cover.",
    "Design a group banner with the profile-picture overlap in mind, keeping logos out of the lower-left corner.",
    "Export an event cover at the 1.91:1 ratio Facebook shares as a feed card without re-cropping in a design tool.",
  ],
  benefits: [
    ["Measured, not guessed", "The safe zone is the geometric intersection of the desktop and mobile cover crops, computed from the display sizes."],
    ["One export, correct pixels", "The download is rendered at the exact upload dimensions so Facebook does not resample it a second time."],
    ["Private by default", "The photo is decoded and drawn on a canvas in your browser; nothing is uploaded anywhere."],
  ],
  faqs: [
    [
      "What is the correct Facebook cover photo size?",
      "A personal profile cover is 851 x 315 px. A Page cover displays at 820 x 312 px on desktop and 640 x 360 px in the app, so uploading at 2x — 1640 x 624 px — keeps it sharp on retina screens.",
    ],
    [
      "Why does my Facebook cover look cropped on mobile?",
      "Desktop and mobile use different aspect ratios, and Facebook fills each with a centred crop. The desktop strip is roughly 2.63:1 while the mobile strip is 16:9, so the app shows a narrower slice of the same file — about 66% of the width on a Page cover.",
    ],
    [
      "Where should I keep text on a Facebook cover?",
      "Inside the centred safe zone. On the classic 851 x 315 cover that is the middle 560 px; on a 1640 x 624 Page cover it is the middle 1109 px. Also leave the lower-left corner clear where the profile picture overlaps on desktop.",
    ],
    [
      "Should a Facebook cover be a JPEG or a PNG?",
      "Use JPEG for photographic covers — Facebook recompresses uploads, and a JPEG at quality 0.9 already matches what the platform will store. Use PNG when the cover is flat colour, a logo or contains small text, where compression artefacts around edges are more noticeable.",
    ],
  ],
};

export default seo;
