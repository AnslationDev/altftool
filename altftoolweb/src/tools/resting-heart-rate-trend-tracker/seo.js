const seo = {
  title: "Resting Heart Rate Tracker: 7-Day Average",
  metaDescription:
    "Log morning pulse readings to see a 7-day rolling average, a 28-day personal baseline, deviation in bpm and a least-squares trend per week.",
  steps: [
    "Under 'Add a morning reading', pick the date and enter your resting heart rate in bpm (25 to 130), then press 'Add reading'.",
    "Watch the 7-day rolling average, 28-day personal baseline and deviation update — a rise of 5 bpm or more above baseline is flagged as elevated.",
    "Read the least-squares trend in bpm per week and click 'Copy result' for a plain-text summary of latest, baseline, deviation and extremes.",
  ],
  intro:
    "This tracker turns a log of morning resting heart rate readings into a 7-day rolling average, a 28-day personal baseline, and the deviation between the two — the three numbers that actually reveal a trend, rather than a single noisy morning figure. It also fits a least-squares trend line to show whether your pulse is drifting up or down in beats per minute per week. A sustained rise of about 5 bpm above your own baseline is the point most recovery guidance treats as a signal to ease off.",
  useCases: [
    "Spot the resting heart rate spike that shows up a day or two before a cold, and pull back the week's intensity.",
    "Confirm that a 12-week base-building block is working by watching the rolling average drift downward.",
    "Separate a genuine upward trend from normal day-to-day noise after a stretch of poor sleep or travel.",
    "Keep a portable record of morning pulse readings to show a doctor at a check-up.",
  ],
  benefits: [
    [
      "Baseline, not single readings",
      "A 28-day personal baseline means the tool compares today against you, not against a population average.",
    ],
    [
      "Trend in bpm per week",
      "A least-squares slope quantifies the drift instead of leaving you to eyeball a jagged chart.",
    ],
    [
      "Stays on your device",
      "Readings are stored in your browser's local storage — nothing is uploaded or shared.",
    ],
  ],
  faqs: [
    [
      "What is a normal resting heart rate?",
      "The American Heart Association puts the normal adult range at 60 to 100 beats per minute. Well-trained endurance athletes often sit between 40 and 60 bpm, which is normal for them. Your own baseline matters more than the population range — a jump from 48 to 58 bpm is meaningful even though both numbers look fine on paper.",
    ],
    [
      "How much does resting heart rate vary day to day?",
      "Typically 2 to 4 bpm around your baseline. Alcohol, a late meal, heat, dehydration, poor sleep and hard training the previous day each push it up, often by 5 to 10 bpm. That is why a rolling average is the number to watch rather than any single morning.",
    ],
    [
      "When does a rise in resting heart rate mean I should rest?",
      "A rise of roughly 5 bpm or more above your rolling baseline, sustained for two or three mornings, usually means incomplete recovery or an oncoming infection. One elevated morning after a hard session or a late night is normal and rarely worth changing plans over.",
    ],
    [
      "How should I measure resting heart rate?",
      "Take it immediately on waking, still lying down, before caffeine, standing or checking your phone. Either count the pulse at your wrist or neck for 30 seconds and double it, or use the automatic overnight figure from a wearable. Use the same method every day, since wrist and chest-strap readings are not directly comparable. This tool is informational — a persistently high or irregular pulse should be reviewed by a doctor.",
    ],
  ],
};

export default seo;
