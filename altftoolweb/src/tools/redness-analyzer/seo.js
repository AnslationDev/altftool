const seo = {
  title: "Redness Analyzer: Measure Facial Redness",
  metaDescription:
    "Reads skin-toned pixels from a photo in your browser, converts sRGB to CIELAB and reports Δa* for cheeks, nose, forehead and chin. Not a diagnosis.",
  steps: [
    "Press Choose photo and load a straight-on, evenly lit face photo; its long edge is scaled to 1600 px in the browser before any pixel is sampled.",
    "Keep 'Show the areas that were sampled' ticked so the face box and the forehead, cheek, nose and chin windows are drawn over the canvas.",
    "Read the headline Δa* against the calmest skin in the same photo, the region-by-region a* table with its Even to Strong bands, and the skin-share, clipping and colour-cast flags, then press Copy result.",
  ],
  intro:
    "This analyzer measures facial redness as a colour difference: skin-toned pixels in the photo you load are converted from sRGB into CIELAB, and the a* channel — the green-to-red axis of that space — is averaged for the forehead, both cheeks, the nose and the chin. The number it leads with is Δa*, the gap between the reddest of those areas and the calmest one in the same frame, because comparing two areas of one photo cancels most of the skin tone, exposure and white balance that make a raw redness figure meaningless from one day to the next. It is a measurement of a photograph, made entirely inside your browser, and it is not a diagnosis.",
  useCases: [
    "Track a cheek against your own forehead over several weeks of a new retinoid, with a number that does not move just because the light did.",
    "Check whether post-workout flushing is sitting on the nose and cheeks or spread evenly across the face, using the per-region a* table.",
    "Take a series of same-lighting photos before a dermatology appointment so you can show a pattern instead of describing one from memory.",
    "See whether a photo is even usable — the tool reports how much of the frame is skin, how much is clipped or near-black, and whether the background suggests a colour cast.",
  ],
  benefits: [
    [
      "A real colour space, not a red-minus-green guess",
      "CIELAB with the D65 white point is the standard perceptual space for colour difference, so a* is a defined quantity rather than an ad-hoc channel formula.",
    ],
    [
      "Self-referenced, so lighting cancels",
      "Every region is reported against the calmest measured area in the same photo, which removes most of the skin tone and exposure that would otherwise dominate a raw score.",
    ],
    [
      "No invented confidence figure",
      "The tool shows how many skin pixels each region contributed and flags clipping, darkness and colour cast, instead of printing a reassuring percentage it has no way to compute.",
    ],
  ],
  faqs: [
    [
      "How is facial redness measured here?",
      "Pixels are kept only if their chroma falls inside the standard YCbCr skin window (Cb 77–127, Cr 133–173) and their brightness is between 40 and 245, which drops hair, background, blown highlights and deep shadow. Those pixels are converted sRGB → linear RGB → CIE XYZ → CIELAB at D65, and the a* value is averaged per region. The reported Δa* is that region's a* minus the a* of the calmest region in the same photo.",
    ],
    [
      "What counts as a big Δa*?",
      "About 1 unit is the just-noticeable difference in CIELAB, so anything under 1 is labelled Even — two areas that look the same colour. From there the bands step at 2.5 (Noticeable), 5 (Marked) and 8 (Strong). They describe the photograph, and are not clinical grades of any skin condition.",
    ],
    [
      "Does this detect inflammation or blood flow?",
      "No. A camera records the colour of light leaving the skin. Blood flow, inflammation and vascular activity are physiological measurements that need instruments such as laser Doppler flowmetry or a calibrated erythema meter, and no phone photo can stand in for them. Anything claiming otherwise from a single JPEG is guessing.",
    ],
    [
      "Is the photo uploaded anywhere?",
      "No. The file is decoded by your own browser into a canvas, the pixels are read locally, and the analysis is plain JavaScript running on this page. There is no upload, no API call and no image storage — closing the tab is all the deletion required.",
    ],
  ],
};

export default seo;
