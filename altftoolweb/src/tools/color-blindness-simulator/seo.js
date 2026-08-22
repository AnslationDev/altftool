const seo = {
  title: "Color Blindness Simulator for Images",
  metaDescription:
    "Re-render your image as protanopia, deuteranopia, tritanopia or achromatopsia in LMS cone space, with a 0–1 severity slider and side-by-side compare.",
  intro:
    "Color Blindness Simulator re-renders an image or interface screenshot as someone with protanopia, deuteranopia, tritanopia or achromatopsia would see it, using the Viénot–Brettel–Mollon dichromacy model in LMS cone space. It is for designers and developers checking whether a chart, a status badge or a red/green button pair still reads when one cone type is missing. A severity slider covers the anomalous forms too — around 0.5 approximates deuteranomaly and protanomaly, where the cone is shifted rather than absent.",
  useCases: [
    "Check whether a red-versus-green dashboard chart is still readable under deuteranopia before shipping it, and add a shape or label if it is not",
    "Test a form's error state — red text on white — against protanopia, the most common way that cue fails",
    "Review a brand palette in achromatopsia mode to confirm every pair still differs in luminance, not only in hue",
  ],
  benefits: [
    ["Cone-space accuracy", "Simulation runs in LMS cone space via linear RGB, not by rotating hues in sRGB, so the result matches how a dichromat actually confuses colours."],
    ["Severity, not just on/off", "Anomalous trichromacy is far more common than full dichromacy; the slider covers the whole range from 0 to 1 instead of only the extreme."],
    ["Side-by-side comparison", "A draggable divider puts the original and the simulation on the same pixels, which is the only reliable way to spot a distinction that has collapsed."],
  ],
  faqs: [
    [
      "How common is colour blindness?",
      "About 8% of men and 0.5% of women of Northern European descent have a red-green deficiency — roughly 1 in 12 men. Deuteranomaly (shifted green cone) is the most common form by a wide margin. Tritanopia is far rarer, under 0.01%, and unlike the red-green forms it affects men and women equally because the gene is not on the X chromosome.",
    ],
    [
      "What is the difference between protanopia and deuteranopia?",
      "Protanopia is the absence of L (long-wavelength, red) cones; deuteranopia is the absence of M (medium, green) cones. Both collapse reds and greens toward yellows, but protanopes also see red as much darker — pure red comes out near RGB 115,115,0 in this simulation, a dim olive, which is why red-on-black text can vanish entirely for them.",
    ],
    [
      "How do I make a design colour-blind safe?",
      "Never carry meaning in hue alone. Pair colour with a shape, icon, label or pattern; keep a contrast ratio of at least 4.5:1 for body text so the distinction survives in achromatopsia mode; and avoid red/green and blue/purple as your only differentiator. Checking the design in achromatopsia mode is the fastest test — if it still works with no colour at all, it works for every deficiency.",
    ],
    [
      "Are my images uploaded when I use this?",
      "No. The image is drawn to a canvas in your own browser and each pixel is transformed in JavaScript; nothing is sent to a server, so unreleased designs and screenshots stay on your machine.",
    ],
  ],
};

export default seo;
