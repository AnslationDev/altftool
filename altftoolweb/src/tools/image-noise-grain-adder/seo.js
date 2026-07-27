const seo = {
  intro:
    "This tool adds synthetic film grain to a photo by overlaying seeded Gaussian noise whose amplitude is weighted by 4L(1 − L), a parabola that peaks at mid grey and falls to zero at clipped black and blown white — the same way density fluctuation behaves on real silver-halide film. Grain size is simulated by generating the noise on a coarser lattice, so a size of 3 gives 3 × 3 pixel clusters, and chromatic grain uses independent noise per channel the way colour negative dye layers do. It is for photographers and video editors who want a filmic texture on clean digital files, and everything runs in the browser with no upload.",
  useCases: [
    "Add ISO 400 black-and-white texture to a clean digital portrait so it matches scanned film in the same set.",
    "Match grain across a sequence of frames by keeping the same seed and settings on every export.",
    "Break up visible banding in a smooth sky gradient by adding a little fine chromatic noise.",
  ],
  benefits: [
    ["Midtone-weighted, not flat", "Grain fades out of the deep shadows and highlights instead of muddying them, which is what makes it read as film."],
    ["Repeatable by seed", "The same seed and settings always produce byte-identical grain, so a whole sequence can be matched."],
    ["Never leaves your device", "Pixels are read from a canvas and processed in JavaScript; nothing is uploaded anywhere."],
  ],
  faqs: [
    [
      "How much grain should I add to a digital photo?",
      "An intensity of 15 to 35 out of 100 covers most looks — that is a standard deviation of roughly 7 to 17 code values out of 255 at mid grey. Above about 50 the texture starts to compete with the subject, which is the point of the pushed and cinematic presets.",
    ],
    [
      "Why does grain look wrong when it is applied evenly?",
      "Because real grain is not even. Density fluctuation on film is largest where the characteristic curve is steepest, around the midtones, and effectively disappears in clipped blacks and blown highlights. This tool applies a 4L(1 − L) weighting on Rec. 709 luminance so the shadows stay clean.",
    ],
    [
      "What is the difference between monochrome and chromatic grain?",
      "Monochrome grain uses one noise sample per pixel applied equally to red, green and blue, which is how black-and-white film and most luminance noise look. Chromatic grain draws an independent sample per channel, producing the colour speckle you get from colour negative dye layers and high-ISO sensors.",
    ],
    [
      "Should I export as PNG or JPEG after adding grain?",
      "PNG. Grain is high-frequency detail and JPEG's chroma subsampling and quantisation smear it, so a heavily compressed JPEG can undo most of what you just added. Export PNG here, then compress once at the end if you need a smaller file.",
    ],
  ],
};

export default seo;
