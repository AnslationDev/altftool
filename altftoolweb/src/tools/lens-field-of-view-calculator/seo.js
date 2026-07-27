const seo = {
  intro:
    "The Lens Field of View Calculator works out how much of a scene a given focal length actually captures on a given sensor, using the thin-lens angle-of-view formula AOV = 2 · arctan(sensor dimension ÷ 2 × focal length). It reports horizontal, vertical and diagonal angles, the crop factor against the 43.27 mm full-frame diagonal, the scene width and height covered at your subject distance, and the hyperfocal distance and depth-of-field limits from H = f² ÷ (N × c) + f. Photographers, videographers and drone operators use it to pick a lens before they get to the location.",
  useCases: [
    "Check whether a 24 mm lens on APS-C will fit a 4 m wide room interior from 3 m back.",
    "Find the distance needed to frame a 1.8 m person head-to-toe with an 85 mm portrait lens.",
    "Compare the same scene on Micro Four Thirds and full frame before renting a second body.",
  ],
  benefits: [
    ["Real optics", "Angle of view, coverage and depth of field come from the published formulas, not lookup tables."],
    ["Ten sensor presets", "Medium format down to a 1/2.55-inch phone sensor, with exact millimetre dimensions."],
    ["Side-by-side table", "Eight common focal lengths compared at your chosen distance in one glance."],
  ],
  faqs: [
    [
      "What is the field of view of a 50 mm lens on full frame?",
      "46.8° diagonally, 39.6° horizontally and 27.0° vertically. That comes from 2 · arctan(43.27 ÷ 100) for the diagonal, using the 36 × 24 mm sensor. At 3 m it covers 2.16 m across.",
    ],
    [
      "How do I convert a focal length between sensor sizes?",
      "Multiply by the crop factor, which is 43.27 mm (the full-frame diagonal) divided by your sensor's diagonal. APS-C at 23.5 × 15.6 mm gives 1.53×, so a 50 mm lens frames like a 77 mm on full frame; Micro Four Thirds is 2.0×, so 50 mm frames like 100 mm.",
    ],
    [
      "Does the crop factor change the aperture too?",
      "The f-number and exposure do not change — f/2.8 is f/2.8 on any sensor. What changes is depth of field: to match the full-frame look you also multiply the f-number by the crop factor, so f/2.8 on Micro Four Thirds gives roughly the same background blur as f/5.6 on full frame.",
    ],
    [
      "What circle of confusion does the depth of field use?",
      "Sensor diagonal ÷ 1500, which works out to 0.029 mm on full frame and 0.019 mm on APS-C. That is the Zeiss convention behind most printed DoF tables; some manufacturers use 0.03 mm or diagonal ÷ 1730, which shifts the near and far limits by a few percent.",
    ],
  ],
};

export default seo;
