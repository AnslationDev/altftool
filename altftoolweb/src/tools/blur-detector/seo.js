const seo = {
  title: "Photo Blur Detector: Sharpness Score and Heatmap",
  intro:
    "Blur Detector measures how sharp a photo is by converting it to Rec.601 luminance, averaging the brightness difference between each pixel and its right and lower neighbours, and turning that gradient energy into a sharpness score, a blur percentage and a six-step verdict from Sharp down to Severe Blur. It also tiles the image into blocks and paints a red heatmap over the softest ones, so you can see whether the whole frame is soft or only part of it. It is a quick triage pass for photographers and anyone culling a shoot, not a substitute for zooming in at 100 percent.",
  useCases: [
    "You came back from an event with 300 frames and want a fast first pass that flags the ones too soft to keep before you start editing.",
    "A client says a supplied photo looks soft in print and you need something more concrete than an opinion — a sharpness score and an edge-density figure to point at.",
    "A portrait looks off and you cannot tell whether you missed focus entirely or only landed it on the ear; the heatmap shows which blocks of the frame carry the detail.",
  ],
  benefits: [
    [
      "A number, not an impression",
      "Reports sharpness, blur percentage, edge density and focus area as separate figures instead of a single vague pass or fail.",
    ],
    [
      "Shows where the softness is",
      "Splits the frame into blocks and shades each one by its own local gradient, so a sharp subject on a soft background scores differently from a uniformly soft frame.",
    ],
    [
      "Works on the full-resolution file",
      "Analysis runs on the image's native pixel data drawn to a canvas, not on a downscaled preview that would smooth away the detail being measured.",
    ],
  ],
  faqs: [
    [
      "How does the tool decide an image is blurry?",
      "It computes the mean absolute luminance gradient across the image — for every pixel, the brightness difference to the pixel on its right plus the pixel below — and scales that against a reference of 30 to produce the sharpness score. Blur percentage is simply 100 minus that score, and a value above 50 triggers the shooting suggestions.",
    ],
    [
      "What do the blur labels mean?",
      "They are severity bands on the same average gradient value: under 5 is Severe Blur, under 15 Significant, under 30 Moderate, under 50 Slight, under 80 Minimal, and anything above that is labelled Sharp. They describe how much blur is present, not whether it came from camera shake or missed focus.",
    ],
    [
      "What is edge density telling me?",
      "It is the share of pixels whose gradient magnitude exceeds 30, expressed as a percentage — effectively how much of the frame carries hard detail. A crisp architectural shot scores high, while a correctly focused portrait against a smooth backdrop can score low without being blurry, so read it alongside the heatmap rather than on its own.",
    ],
    [
      "Why does a deliberately shallow depth-of-field shot get flagged?",
      "Because the measurement is global: intentional background bokeh lowers the average gradient exactly the way a missed focus does. Switch to the heatmap view — if the red overlay covers the background but leaves your subject clear, the frame is doing what you intended.",
    ],
  ],
};

export default seo;
