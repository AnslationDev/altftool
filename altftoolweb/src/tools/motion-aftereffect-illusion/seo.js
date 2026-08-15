const seo = {
  title: "Motion Aftereffect Illusion: Run the Waterfall",
  metaDescription:
    "Adapt to a spiral, stripes, rings or wheel, then watch a still pattern drift. Predicts aftereffect seconds from adaptation time, speed and contrast.",
  steps: [
    "Choose an Adapting pattern of Rotating spiral, Waterfall (downward stripes), Expanding rings or Rotating wheel, and set Adaptation time (seconds) anywhere from 10 to 120.",
    "Set Drift speed in degrees of visual angle per second (0.5 to 32) and Pattern contrast (0.05 to 1), press Start adapting, and hold your gaze on the fixation point while the countdown runs.",
    "When the centre label reads 'Look away now', the striped test panel should appear to drift; the results card gives the Predicted aftereffect duration with the speed tuning and contrast multipliers.",
  ],
  intro:
    "The motion aftereffect is the illusion that a stationary scene drifts in the opposite direction after you have watched sustained motion — the waterfall illusion Robert Addams described at the Falls of Foyers in 1834. This tool runs the adaptation period for you with four classic stimuli (rotating spiral, downward stripes, expanding rings, spinning wheel) and predicts how long the aftereffect should last from the logarithmic adaptation-duration function, the band-pass speed tuning of motion neurons and Naka-Rushton contrast saturation. It is built for psychology students, teachers and anyone curious about how direction-selective cells in V1 and MT behave.",
  useCases: [
    "Run a 30-second spiral adaptation in a classroom so a whole group experiences the expanding-face aftereffect at the same time.",
    "Compare how much weaker the illusion is at 32 degrees per second than at the 4 degrees per second optimum.",
    "Show that halving contrast from 1.0 to 0.15 cuts predicted aftereffect duration to about 57% of full strength.",
  ],
  benefits: [
    ["Four classic stimuli", "Spiral, waterfall stripes, expanding rings and a spoked wheel, each with the aftereffect it produces."],
    ["Model, not guesswork", "Combines the logarithmic adaptation function with published speed tuning and contrast saturation curves."],
    ["Respects reduced motion", "If your system asks for reduced motion the pattern stays still, and a photosensitivity warning is shown up front."],
  ],
  faqs: [
    [
      "How long should I stare at the pattern for the waterfall illusion to work?",
      "About 30 seconds, which is the standard laboratory adaptation period and predicts roughly 8 seconds of aftereffect at optimal speed and full contrast. Below 10 seconds the effect is usually too weak to notice; beyond 60 seconds it grows very slowly because duration rises with the logarithm of adaptation time.",
    ],
    [
      "Why do still objects appear to move afterwards?",
      "Direction-selective neurons in visual areas V1 and MT fire less after prolonged stimulation in their preferred direction. When motion stops, the opposite-direction population is momentarily the stronger of the pair, and the brain reads that imbalance as movement.",
    ],
    [
      "What speed produces the strongest motion aftereffect?",
      "Roughly 2 to 8 degrees of visual angle per second, with the peak near 4 degrees per second. The effect is band-pass: at 32 degrees per second this model predicts only about 17% of the peak strength.",
    ],
    [
      "Is the motion aftereffect harmful?",
      "No. It is a temporary adaptation of normal visual neurons and fades on its own, typically within a minute. Anyone with photosensitive epilepsy or migraine with visual aura should skip flickering or high-contrast moving patterns as a general precaution.",
    ],
  ],
};

export default seo;
