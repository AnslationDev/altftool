const seo = {
  title: "Brisk Walk Intensity Checker: Cadence & HR Zones",
  metaDescription:
    "Scores a walk on cadence against 100 and 130 steps/min, heart-rate zones from 208 − 0.7 × age, the talk test and Borg RPE, then takes the median.",
  steps: [
    "Enter Age (years), then whichever readings you have: Cadence (steps/min, 0 to skip), Heart rate while walking (bpm, 0 to skip), Resting heart rate (bpm, optional) and Borg RPE 6–20 (0 to skip).",
    "Pick a Talk test answer — I could sing a line of a song, I can hold a conversation but not sing, I can only manage a few words before a breath, or Not sure / skip. Supplying a resting heart rate switches the Zone method to Heart-rate reserve (Karvonen); leave it out and zones are Percent of maximum heart rate.",
    "Overall intensity reports Light, Moderate or Vigorous from the median of your readings, with Readings used out of 4, Estimated max heart rate, the Moderate and Vigorous heart-rate zones and the Cadence still needed / Heart rate still needed gaps, plus a Reading by reading card for each signal. Copy result copies the summary.",
  ],
  intro:
    "Brisk Walk Intensity Checker scores a walk against the four field measures of exercise intensity used in physical-activity research: cadence, heart rate, the talk test and Borg perceived exertion. Cadence is judged against the 100 and 130 steps-per-minute thresholds, heart rate against Karvonen or percent-of-maximum zones built on the Tanaka formula HRmax = 208 − 0.7 × age, and the verdict is the median of whichever readings you supply. It is for walkers who want to know if their daily walk really counts toward the 150-minutes-a-week guideline.",
  useCases: [
    "Confirm that a lunchtime walk at 105 steps per minute genuinely reaches moderate intensity.",
    "Translate a smartwatch heart-rate reading into a moderate or vigorous verdict for your age.",
    "Use the talk test on a walk where you have no watch or step counter.",
    "See how many extra steps per minute you need to cross from light into brisk walking.",
  ],
  benefits: [
    ["Four checks, one verdict", "Takes the median of cadence, heart rate, talk test and RPE so a single odd reading cannot skew it."],
    ["Better HRmax formula", "Uses Tanaka's 208 − 0.7 × age rather than the older, less accurate 220 − age."],
    ["Tells you the gap", "Shows exactly how many steps per minute or beats per minute short of moderate you are."],
  ],
  faqs: [
    [
      "How do I know if I am walking briskly?",
      "The simplest check is cadence: 100 steps per minute or more is the accepted moderate-intensity threshold for adults, roughly 3 METs. The talk test agrees when you can hold a conversation but cannot comfortably sing.",
    ],
    [
      "What heart rate counts as moderate-intensity walking?",
      "About 64 to 76 percent of your maximum heart rate. For a 40-year-old with an estimated maximum of 180 bpm that is roughly 115 to 137 bpm, or 111 to 133 bpm if a resting rate of 65 is used with the heart-rate reserve method.",
    ],
    [
      "What is the talk test?",
      "A no-equipment intensity check: if you can sing, the effort is light; if you can talk but not sing, it is moderate; if you can only get out a few words before needing a breath, it is vigorous. It tracks the ventilatory threshold closely enough to be recommended by ACSM.",
    ],
    [
      "Is 220 minus age a good way to estimate maximum heart rate?",
      "It is the best-known formula but it under-estimates maximum heart rate in older adults. Tanaka's 208 − 0.7 × age fits population data better, though individual maximums still vary by around 10 bpm either way. Anyone with a heart condition or on rate-limiting medication should get targets from a clinician rather than a formula.",
    ],
  ],
};

export default seo;
