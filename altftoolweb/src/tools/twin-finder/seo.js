const seo = {
  intro:
    "Twin Finder scores how alike two photographs look by combining three measurements: a 128-bit perceptual hash (average hash plus difference hash on an 8x8 luma grid), a 64-bin RGB colour histogram intersection, and the gap in average brightness. The three are blended 55/30/15 into a single percentage. It is a party trick for friends, couples and pet owners — it is not face recognition and it cannot tell you whether two people are related.",
  useCases: [
    "Settle an argument about which sibling looks more like the childhood photo on the mantelpiece",
    "Compare two takes of the same portrait to see which one matches your reference shot more closely",
    "Check whether your dog really does look like the celebrity everyone keeps mentioning",
  ],
  benefits: [
    ["Three separate measures", "Structure, colour and tone are reported individually, so you can see what drove the score."],
    ["Photos never leave the device", "Both images are resampled to 128x128 on a canvas in your own browser; nothing is uploaded."],
    ["Difference heat map", "An 8x8 grid shows exactly which regions of the frame disagree most."],
  ],
  faqs: [
    [
      "How does the similarity score work?",
      "It is a weighted blend: 55% structural agreement from a 128-bit perceptual hash, 30% colour histogram overlap across 64 RGB bins, and 15% closeness in average brightness. Because two unrelated images already share about half their hash bits by chance, the structural term is rescaled so that 50% raw agreement maps to a score of zero.",
    ],
    [
      "Can this tell me if two people are related?",
      "No. It measures pixels — framing, pose, lighting and palette — not facial geometry, and it has no model of family resemblance. Two photos of the same person in different lighting can score lower than two strangers photographed the same way.",
    ],
    [
      "Are my photos uploaded anywhere?",
      "No. Each photo is drawn onto a 128x128 canvas inside the page, read back as pixel data and discarded when you close the tab. There is no upload, no server call and no storage.",
    ],
    [
      "Why did two blank images score 0% when they look equally plain?",
      "A perceptual hash carries no information on a flat image — every cell equals the average, so a white square and a black square hash identically. When the 8x8 grid varies by less than 3 levels out of 255 the structural term is dropped entirely and the score comes from colour and tone alone, which is why a white and a black frame score 0.",
    ],
  ],
};

export default seo;
