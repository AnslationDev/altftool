const seo = {
  title: "Podcast Guest Brief Builder: Timed Rundown & Questions",
  metaDescription:
    "Turn a recording length into a timecoded rundown, a question count that fits at 1.5, 2.5 or 4 minutes each, and a pre-record tech checklist.",
  steps: [
    "Fill in 'Guest name', 'Guest role', 'Company or project' and 'Episode topic', then set 'Recorded length (minutes)' and 'Segments (1-6)'.",
    "Set 'Intro (minutes)', 'Outro (minutes)' and 'Technical buffer (% of recording)', choose a 'Question depth' of Quick takes (1.5 min per question), Standard interview (2.5) or Deep dive (4), and pick an 'Edit style' of Light, Normal or Heavy.",
    "Read 'Questions to prepare' with 'Interview time after intro, outro and buffer' and 'Estimated published runtime' beneath it, work down the 'Timed rundown' blocks with their mm:ss timecodes and the 'Pre-record tech checklist', then press 'Copy brief'.",
  ],
  intro:
    "Podcast Guest Brief Builder converts a target recording length into a timed rundown, a question count that actually fits the tape, and a pre-record tech checklist. It budgets the episode as intro plus segments plus outro plus a technical buffer, then divides the remaining interview minutes by the minutes a question realistically consumes (1.5 for quick takes, 2.5 for a standard interview, 4 for a deep dive). Built for hosts and producers who want to send a guest something concrete instead of a vague 'let's just chat'.",
  useCases: [
    "Prep a 45-minute interview and find out you have room for 12 questions, not the 30 you drafted.",
    "Send a first-time guest a rundown with timecodes so they know when the rapid-fire round starts.",
    "Hand a producer a fixed segment structure so several episodes in a series feel consistent.",
    "Check whether a 20-minute slot can still carry four segments once intro, outro and buffer are removed.",
  ],
  benefits: [
    [
      "Question count that fits",
      "Questions are derived from available interview minutes, so the prep sheet matches the recording slot.",
    ],
    [
      "Timecoded rundown",
      "Every block carries a cumulative mm:ss start you can read against the recorder's clock.",
    ],
    [
      "Buffer booked, not borrowed",
      "A separate technical buffer covers level checks and restarts instead of quietly eating the interview.",
    ],
  ],
  faqs: [
    [
      "How many questions should I prepare for a podcast interview?",
      "Budget roughly 2 to 3 minutes per question for a standard interview, which works out to about 10 to 14 questions for a 45-minute recording once intro, outro and buffer are removed. Prepare a few spares you can drop, and never plan to ask every question you wrote.",
    ],
    [
      "How long should a podcast intro be?",
      "Two to three minutes is enough for a hook, the guest's credibility line and the promise of the episode. Longer intros push the strongest material past the point where most listeners decide whether to stay.",
    ],
    [
      "What should I send a podcast guest before recording?",
      "Send the episode topic, the segment structure with rough timings, the themes of the questions (not necessarily the exact wording), the recording platform and start time in their timezone, and the tech checklist covering headphones, a quiet room and a wired connection.",
    ],
    [
      "How much recorded audio becomes the published episode?",
      "It depends on edit style: a lightly edited conversation loses roughly 8% of the tape, a normally tightened episode around 15%, and a heavily produced show 25% or more. Record longer than your target runtime rather than hoping the raw take lands exactly right.",
    ],
  ],
};

export default seo;
