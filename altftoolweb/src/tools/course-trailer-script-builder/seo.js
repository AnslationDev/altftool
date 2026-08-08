const seo = {
  title: "Course Trailer Script Builder with Per-Beat Word Counts",
  metaDescription:
    "Split a 15–300 second course trailer across seven beats — hook to call to action — and get each beat's seconds and word budget at 120, 140 or 160 wpm.",
  steps: [
    "Fill in \"Course title\", \"Who it is for\", \"Outcome they walk away with\", \"Modules or skills (comma separated)\", \"Credibility line\" and \"Call to action\".",
    "Set \"Trailer length (seconds)\" between 15 and 300 and \"Narration pace (words per minute)\" between 80 and 220, or click the \"Measured (120 wpm)\", \"Standard narration (140 wpm)\" or \"Energetic promo (160 wpm)\" preset.",
    "Read the \"Total narration budget\" in words, check the \"Hook length (target 3s or less)\" row, then work down the \"Beat sheet\" — Hook, Problem, Promise, What you'll learn, Who it's for, Credibility and Call to action, each with its timecode and word budget.",
  ],
  intro:
    "A course trailer script builder splits your promo video's running time across seven fixed beats — hook, problem, promise, curriculum, audience, credibility and call to action — and converts each beat's seconds into a word budget at your chosen narration pace. It is built for course creators who keep recording trailers that overrun, because the word count is derived from the plain rule words = seconds × words-per-minute ÷ 60. Beat seconds are distributed with the largest-remainder method, so the beat lengths always add back to the exact total you set.",
  useCases: [
    "Writing a 60-second sales-page trailer and needing to know that a 140 wpm read gives you roughly 140 words total, not 300",
    "Cutting an existing 90-second trailer down to a 30-second pre-roll slot without losing the credibility beat",
    "Briefing a freelance voice artist with a per-beat timecode and word count instead of a loose paragraph",
  ],
  benefits: [
    ["Timing before recording", "You see the per-beat second count and word budget before you open the mic."],
    ["Beat structure baked in", "The seven-beat direct-response order stops trailers turning into a rambling course tour."],
    ["Pace-aware word counts", "Switch between 120, 140 and 160 wpm and every word budget recalculates."],
  ],
  faqs: [
    [
      "How long should a course trailer be?",
      "Between 60 and 90 seconds for a course sales page, and 15 or 30 seconds if you are cutting it for paid placements. Anything past two minutes reads as a lesson rather than a trailer, and most viewers who are going to leave have already left by the 30-second mark.",
    ],
    [
      "How many words fit in a 60-second video?",
      "About 140 words at a standard narration pace of 140 words per minute. A slower, measured documentary read at 120 wpm gives you roughly 120 words, and an energetic promo read at 160 wpm gives you around 160 — the formula is simply seconds × wpm ÷ 60.",
    ],
    [
      "What should the first three seconds of a course trailer do?",
      "State the outcome or the surprising claim, with no logo, greeting or channel intro. Three seconds matters because that is the point at which Meta counts a video view, so a slate or animated logo there burns your whole measurable opening.",
    ],
    [
      "Does a course trailer need a call to action at the end?",
      "Yes, and it should be a single instruction spoken and shown on screen at the same time. Two competing asks — 'enrol, or download the free guide' — reliably split attention, so pick the one action you actually want and leave the other for the sales page.",
    ],
  ],
};

export default seo;
