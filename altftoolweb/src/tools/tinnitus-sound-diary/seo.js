const seo = {
  title: "Tinnitus Sound Diary: Track Loudness, Triggers & Trend",
  metaDescription:
    "Log daily 0-10 loudness and annoyance ratings with triggers; see 7-day averages, a points-per-week trend and trigger comparisons, saved in your browser.",
  steps: [
    "Pick the Date, drag the Loudness and Annoyance sliders (0 to 10), choose where you hear it and what it sounds like, and tick anything notable that day.",
    "Click Save entry — one entry per date is kept in this browser's local storage, and Clear diary asks for confirmation before deleting.",
    "Read the last-7-days average, the points-per-week trend (needs at least 4 entries) and the noted-triggers comparison table, then click Copy diary to export it as text.",
  ],
  intro:
    "A tinnitus sound diary is a daily record of how loud the sound is, how much it bothers you, and what else was going on that day. Ratings use the 0 to 10 scale clinics commonly use for tinnitus loudness and annoyance, and the summary reports averages, a seven-day figure, a least-squares trend in points per week, and how each noted trigger compares with days you did not note it. It is a self-monitoring log for taking to an appointment, not a diagnosis or a hearing test.",
  useCases: [
    "Build a few weeks of evidence before an audiology appointment instead of relying on recall.",
    "See whether the sound is actually getting worse or just feels worse on bad days.",
    "Check whether poor sleep, loud noise exposure or caffeine line up with your higher ratings.",
    "Keep a record of a change after starting sound therapy, a hearing aid or a new medication.",
  ],
  benefits: [
    ["Trend as a number", "A least-squares slope over all entries reports change in points per week rather than an impression."],
    ["Triggers compared honestly", "Averages are shown side by side only when both groups have enough days, and labelled as association, not cause."],
    ["Stays on your device", "Entries are held in this browser's local storage and are never uploaded."],
  ],
  faqs: [
    [
      "What should I write in a tinnitus diary?",
      "The date, a loudness rating out of ten, an annoyance rating out of ten, which ear it is in and what it sounds like, plus anything notable that day — sleep, noise exposure, stress, caffeine, alcohol, medication changes. Loudness and annoyance are recorded separately because they often move independently.",
    ],
    [
      "How long should I keep a tinnitus diary?",
      "Two to four weeks of near-daily entries usually gives a clearer picture than months of sporadic ones, because trend and trigger comparisons both depend on having enough days on each side. This tool needs at least four entries before it will report a trend, and at least two days in each group before it compares a trigger.",
    ],
    [
      "Does caffeine make tinnitus worse?",
      "The evidence is mixed and does not show a consistent effect across people, so the honest answer is that it may matter for you and may not. A diary can show whether your own ratings differ on caffeine days, but a difference in a personal log is an association and not proof of cause — several trial-and-return cycles are more informative than one week.",
    ],
    [
      "When should I see a doctor about tinnitus?",
      "Promptly if the sound pulses in time with your heartbeat, is in one ear only, comes with sudden hearing loss, vertigo, ear pain, discharge or a recent head injury, or if it is causing severe distress. Sudden hearing loss in particular is treated as an emergency in hearing guidance. This tool is informational and cannot assess any of that — speak to a doctor or audiologist.",
    ],
  ],
};

export default seo;
