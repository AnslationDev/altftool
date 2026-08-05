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
  steps: [
    "Load a picture into each of the two file pickers, First photo and Second photo. Both take any image file the browser can open, up to 12 MB — a bigger one is rejected with its own size and the limit, and a non-image with Pick an image file (JPG, PNG, WebP or GIF). Each slot previews the photo and prints its filename; two generated demo portraits are loaded at first paint until you replace them.",
    "The score recalculates the moment both slots hold a photo — there is no compare button. Similarity score gives the percentage and a verdict from Complete strangers up to Separated at birth, and the panel breaks it down into Structure match (shown as n/a (flat image) when the picture is too flat to hash), Colour match, Tone match, Hash distance out of 128 bits, Brightness and Contrast, above a Difference heat map (8×8) whose darker cells are the regions that disagree most.",
    "Copy result puts a one-line summary — both filenames, the score, the verdict and the structure, colour and tone figures — on the clipboard, and the button reads Copied! for about a second and a half. Reset restores the two demo photos and clears any error message.",
  ],
};

export default seo;
