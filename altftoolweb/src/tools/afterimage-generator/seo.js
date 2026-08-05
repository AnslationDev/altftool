const seo = {
  title: "Afterimage Illusion Generator — Free Colour Tool",
  metaDescription:
    "Stare, then see the exact complementary colour appear — computed two ways (RGB inverse and HSL hue rotation), with a contrast check. Free.",
  intro:
    "A negative afterimage is the complementary colour that appears when you stare at a saturated patch and then look at a blank white field, and this generator computes that complement two ways before you try it: the sRGB inverse (255 minus each channel) and a 180-degree hue rotation in HSL. Stare at pure red #FF0000 for twenty seconds and the afterimage is cyan #00FFFF, because the red-sensitive side of the red-green opponent channel adapts while the other side does not. It is built for students, designers and anyone curious about how opponent-process colour vision works.",
  useCases: [
    "Show a class why a green, black and orange flag reappears in red, white and blue on a white wall.",
    "Get the exact complement of a brand colour before designing an afterimage illusion or a complementary palette.",
    "Compare the photographic negative of a colour with its 180-degree hue rotation, which differ for anything that is not fully saturated.",
  ],
  benefits: [
    ["Both complements", "Shows the sRGB inverse and the HSL hue rotation side by side, since only fully saturated colours give the same answer."],
    ["Stimulus strength check", "Reports WCAG relative luminance and the contrast against the white reveal field, and warns when a swatch is too pale to adapt to."],
    ["Opponent axis read-out", "Names whether the colour loads the red-green or the blue-yellow opponent channel, and which way the afterimage will lean."],
  ],
  faqs: [
    [
      "What colour is the afterimage of red?",
      "Cyan. The sRGB inverse of #FF0000 is #00FFFF, and a 180-degree hue rotation gives the same answer for a fully saturated colour. Green gives magenta, blue gives yellow, and yellow gives blue-violet.",
    ],
    [
      "How long should I stare to get an afterimage?",
      "Fifteen to thirty seconds on a saturated patch is enough for most people; this tool caps the timer at 60 seconds because the modelled adaptation curve is already 99.9% complete by then. Keep your gaze fixed on one point — moving your eyes spreads the adaptation and weakens the effect.",
    ],
    [
      "Why is the afterimage the complementary colour?",
      "Because colour vision is coded on opponent channels — red versus green and blue versus yellow. Prolonged stimulation fatigues one side of a channel, so when you look at neutral white the unfatigued side dominates and you perceive the opposite colour.",
    ],
    [
      "Is staring at bright colours on a screen safe?",
      "For most people a short colour-staring exercise is harmless, but skip it if you are photosensitive, have epilepsy or are prone to migraine. Keep the room lit rather than dark and stop if you feel any discomfort.",
    ],
  ],
  steps: [
    "Set Stimulus colour with the swatch picker or by typing a hex code in the field beside it, or press one of the eight Preset stimuli — Red, Green, Blue, Yellow, Orange, Violet, Turquoise, Magenta. Then set Staring time (seconds, max 60) and choose a Complement model: sRGB inverse (255 − channel) — photographic negative, or Hue + 180° in HSL — designer's complement.",
    "Click Start experiment. The panel floods with your stimulus colour and counts down under it — Hold your gaze on the centre dot — Ns left — then switches to the white reveal field and reports Now look at the white field. Modelled strength remaining: N%. Stop ends the run early, and the button reads Restart once a run has started.",
    "Read Predicted afterimage colour, shown as a swatch plus its hex, with the table beneath giving sRGB inverse, Hue + 180° complement, Stimulus hue, Stimulus saturation, Relative luminance (WCAG), Contrast against the white field, Dominant opponent axis and Modelled fade time. Copy result copies that summary to the clipboard and briefly reads Copied!, and Reset returns the colour, staring time and model to their defaults.",
  ],
};

export default seo;
