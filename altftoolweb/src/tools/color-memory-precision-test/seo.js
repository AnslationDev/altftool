const seo = {
  intro:
    "Color Memory Precision Test shows you a colour for a few seconds, hides it, and asks you to rebuild it from memory with RGB and HSL sliders — then scores how close you got. The score blends two measures: euclidean distance in RGB space (40% of the result) and a hue, saturation and lightness comparison (60%), because raw RGB distance does not match what the eye actually notices. It is a visual-memory exercise for designers, artists and anyone curious about how badly colour memory drifts.",
  useCases: [
    "Train colour recall before a paint, fabric or print match where you cannot carry the sample with you",
    "Compare how much harder desaturated greys are to remember than vivid hues by switching from easy to hard difficulty",
    "Use it as a warm-up in a design class to show a room full of people that everyone's colour memory drifts, and in which direction",
  ],
  benefits: [
    ["A score that matches perception", "Hue error counts twice as much as saturation or lightness error, so a colour that is the right hue but slightly light scores better than one that is the right lightness but the wrong hue."],
    ["Three difficulty bands", "Easy keeps saturation at 70-99%, medium 40-99%, hard 10-89% with lightness from 15% to 84% — the near-greys where colour memory fails fastest."],
    ["Full error breakdown", "Each round reports the per-channel RGB gap and the hue, saturation and lightness gaps, so you can see whether you consistently guess too dark or too warm."],
  ],
  faqs: [
    [
      "How is the accuracy score calculated?",
      "It is 40% RGB accuracy plus 60% HSL accuracy. RGB accuracy is 100 minus the euclidean distance between the two colours divided by 441.67 — the black-to-white maximum, √(255² × 3) — times 100. HSL accuracy is 100 minus a weighted error of 50% hue, 25% saturation and 25% lightness. Identical colours score 100; pure black against pure white scores 45, because the hue and saturation of both are technically zero.",
    ],
    [
      "What is a good score on this test?",
      "Anything at 90 or above counts as Master here, 95+ is Elite and 99+ is Perfect. Most people land in the 60-85 band (Adept to Expert) on medium difficulty, because colour memory is categorical — people remember \"teal\" rather than the exact shade, and drift toward the prototype of that colour name.",
    ],
    [
      "Why is hue weighted more than saturation and lightness?",
      "Because hue errors are the ones people notice. Shifting a colour 10% lighter usually reads as the same colour under different light; rotating it 30° round the hue circle reads as a different colour entirely. Weighting hue at 50% of the HSL term, against 25% each for saturation and lightness, makes the score track what an observer would call a miss.",
    ],
    [
      "Why is the hard mode so much harder?",
      "Hard mode draws saturation from 10-89% and lightness from 15-84%, which includes near-greys and very dark or very light tints. At low saturation the hue signal is weak, so there is far less for memory to hold on to — and small slider movements change the result a great deal, which the score picks up.",
    ],
  ],
};

export default seo;
