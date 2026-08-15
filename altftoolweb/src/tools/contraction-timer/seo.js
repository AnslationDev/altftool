const seo = {
  title: "Contraction Timer with 5-1-1 Rule Check for Labour",
  metaDescription:
    "Tap to time each contraction, get start-to-start gaps and averages, and test the pattern against the 5-1-1, 4-1-1 or 3-1-1 rule your maternity unit uses.",
  steps: [
    "Select your unit's threshold in the 'Pattern rule from your unit' dropdown — 5-1-1, 4-1-1 or 3-1-1, each requiring the pattern to hold for an hour.",
    "Press 'Start contraction' when one begins and 'Stop contraction' when it eases; 'Undo last' removes a mistimed entry and 'Clear' wipes the session.",
    "Read the average gap timed start to start, the three Met/Not yet rule checks, and press 'Copy summary' for a phone-ready report for triage.",
  ],
  intro:
    "A contraction timer records how long each contraction lasts and how far apart they are, measured start to start rather than end to start. Tap once when a contraction begins and again when it eases, and the session tracks average duration, average frequency, whether the pattern is regular, and whether it satisfies a chosen call-the-unit rule such as 5-1-1: contractions five minutes apart, lasting a minute, sustained for an hour. The summary is written in the form a midwife will ask for over the phone.",
  useCases: [
    "Timing early labour at home to see whether contractions are genuinely getting closer together or still irregular",
    "Checking a 5-1-1, 4-1-1 or 3-1-1 pattern against the threshold your own maternity unit gave you",
    "Reading out an accurate duration and frequency when you phone triage, instead of estimating from memory",
  ],
  benefits: [
    ["Measures frequency correctly", "Gaps are timed start to start, the way clinicians define contraction frequency, not from the end of one to the start of the next."],
    ["Tests a sustained pattern", "The rule only passes when the qualifying contractions have actually held for the required hour, not for a lucky few minutes."],
    ["Phone-ready summary", "One tap copies count, average length, average gap and how long the pattern has held."],
  ],
  faqs: [
    [
      "How do you time contractions correctly?",
      "Time the duration from the moment the contraction starts to the moment it eases, and time the frequency from the start of one contraction to the start of the next. Measuring the gap from the end of one to the start of the next is the common mistake and makes contractions look further apart than they are.",
    ],
    [
      "What is the 5-1-1 rule in labour?",
      "It means contractions coming about every 5 minutes, each lasting about 1 minute, and keeping that pattern up for 1 hour. Many units use 4-1-1 or 3-1-1 instead, so use the threshold your own midwife gave you rather than a generic one.",
    ],
    [
      "How do I know the difference between Braxton Hicks and real contractions?",
      "Braxton Hicks tightenings are irregular, do not get longer or stronger, and usually settle if you change position or drink water. Real labour contractions stay regular, get longer and more intense, and continue whatever you do, which is exactly what the interval trend in a timing session shows.",
    ],
    [
      "When should I call the hospital?",
      "Call when your unit's pattern rule is met, but also call immediately regardless of timing if your waters break, you have any bleeding, the baby's movements change, you have a fever or severe constant pain, or you have been told to come in early because of a previous caesarean, preterm gestation or a fast previous labour. A timer is not a substitute for that advice.",
    ],
  ],
};

export default seo;
