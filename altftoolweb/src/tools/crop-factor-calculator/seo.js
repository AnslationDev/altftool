const seo = {
  intro:
    "Crop Factor Calculator works out a sensor's crop factor as 43.27 mm — the diagonal of a 36 × 24 mm full-frame frame — divided by the sensor's own diagonal, then applies it to focal length, f-number and ISO. Multiplying focal length by the crop factor gives the same framing, multiplying the f-number by it gives the same depth of field and total light, and multiplying ISO by the crop factor squared completes the equivalence. It also reports horizontal, vertical and diagonal angle of view from the sensor geometry.",
  useCases: [
    "Checking that a 50 mm f/1.8 on a Canon APS-C body frames like an 81 mm and renders depth of field like f/2.9 on full frame.",
    "Choosing a wide lens for Micro Four Thirds when you know the full-frame focal you want — divide by 2.",
    "Comparing a 1-inch compact against full frame and seeing the roughly 2.9-stop light-gathering gap.",
    "Working out the angle of view a Super 35 cinema sensor gives with a 35 mm prime before a shoot.",
  ],
  benefits: [
    ["Diagonal-based, not guessed", "Crop factor is computed from the actual sensor dimensions you enter."],
    ["Full equivalence", "Focal length, aperture and ISO together, not just the focal-length half of the story."],
    ["Angle of view included", "Horizontal, vertical and diagonal figures straight from 2·atan(dimension ÷ 2f)."],
  ],
  faqs: [
    [
      "How do you calculate crop factor?",
      "Divide the 35mm diagonal of 43.27 mm by the sensor's diagonal. A Canon APS-C sensor of 22.3 × 14.9 mm has a diagonal of 26.8 mm, giving a crop factor of 1.61; Micro Four Thirds at 17.3 × 13 mm works out at almost exactly 2.0.",
    ],
    [
      "Does crop factor change the aperture of my lens?",
      "No. An f/1.8 lens is f/1.8 on any body and gives the same exposure at the same ISO. What changes is the picture: for the same framing, depth of field and total light collected match a full-frame lens at f/1.8 × crop factor — f/2.9 on Canon APS-C.",
    ],
    [
      "What focal length on APS-C matches a 35 mm full-frame look?",
      "Divide by the crop factor: about 23 mm on a 1.5× APS-C sensor and about 22 mm on a 1.6× Canon body. On Micro Four Thirds you would use around 17.5 mm.",
    ],
    [
      "Why do smaller sensors look noisier at the same ISO?",
      "They collect less total light for the same framing and f-number, because the sensor area is smaller. Micro Four Thirds gathers about two stops less light than full frame, and a 1-inch sensor about 2.9 stops less, which is the ISO × crop-factor-squared figure in the results.",
    ],
  ],
};

export default seo;
