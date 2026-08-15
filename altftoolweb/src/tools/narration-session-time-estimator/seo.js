const seo = {
  title: "Narration Time Estimator: Booth Hours, Not Read",
  metaDescription:
    "Turn word count into real booth time: a clean read at your wpm plus punch-and-roll retakes, vocal rest per hour and setup for each session.",
  steps: [
    "Under Script, enter Word count, Read pace (words per minute), Errors per 100 words — or tap a preset from Familiar copy, own script through to Cold read, no prep — and Seconds lost per retake.",
    "Under Session shape, set Vocal rest (minutes per hour), Setup and warm-up per session (minutes), Maximum session length (minutes) and Sessions per day, capped at 4.",
    "Total booth time appears with the session and day count, broken out as Clean read time, Retakes (count x seconds), Time actually voicing, Vocal rest, Setup across all sessions and Booth minutes per finished minute; press Copy result.",
  ],
  intro:
    "A narration session estimator works out how long a script really occupies the booth, not just how long a clean read takes. It adds three things the raw read time hides: punch-and-roll retakes, costed as errors per hundred words multiplied by the seconds each correction takes; vocal rest, allowed as minutes per hour of voicing; and setup, which happens once per session rather than once per script. For voice artists quoting studio time, producers booking rooms and authors budgeting a self-narrated project.",
  useCases: [
    "Quote a client a realistic booth block for a 5,000-word corporate script instead of the 32-minute read time.",
    "See how many recording days a 90,000-word audiobook needs at four hours a day.",
    "Compare a familiar script against dense technical copy by changing only the error rate.",
    "Find out how many words fit into a single booked three-hour session before you split a job.",
  ],
  benefits: [
    ["Retakes are costed properly", "A punch-and-roll fix means re-reading the last sentence, so each flub costs seconds, not a word."],
    ["Vocal rest is scheduled, not skipped", "Break time is built into the total rather than discovered halfway through the day."],
    ["Setup scales with days", "Mic placement, levels and warm-up are charged once per session, so multi-day jobs are costed correctly."],
  ],
  faqs: [
    [
      "How long does it take to record 1,000 words of narration?",
      "About 6.5 minutes of clean read at 155 words per minute, but expect 30 to 40 minutes of booth time once retakes, rest and setup are included. At 3 errors per hundred words and 20 seconds per punch-and-roll correction, 1,000 words alone adds 10 minutes of retakes, and a once-per-session setup allowance adds more on top.",
    ],
    [
      "How many hours of narration can you record in a day?",
      "Most professional narrators cap continuous work at 3 to 5 hours of booth time, which yields roughly 1 to 1.5 finished hours at a typical error rate — booth time runs about three times the finished read time once retakes, rest and setup are counted. Voice fatigue degrades consistency long before it becomes painful, and re-recording a tired session costs more time than stopping early.",
    ],
    [
      "What is punch and roll?",
      "A recording technique where, on hearing a mistake, the narrator rolls the playback back to the last clean sentence, listens into it and punches in a new take at the same point. It removes the need for separate editing passes, but it makes every error cost the time of the re-read, typically 15 to 30 seconds.",
    ],
    [
      "How often should a narrator take a break?",
      "Common practice among professional voice users is a short break every 45 to 60 minutes of continuous voicing, with water rather than caffeine, which is where the 10 minutes per hour default comes from. This is general guidance, not medical advice — persistent hoarseness, pain or vocal fatigue warrants seeing an ENT or a speech and language therapist.",
    ],
  ],
};

export default seo;
