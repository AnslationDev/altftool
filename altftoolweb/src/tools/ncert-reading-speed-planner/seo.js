const seo = {
  title: "NCERT Reading Planner: Daily Pages to Meet a Deadline",
  metaDescription:
    "Enter pages left, deadline, weekly days off and a revision buffer — get the daily NCERT page quota and minutes per day at your own reading speed.",
  steps: [
    "Enter 'Total pages' and 'Pages already read', then set the 'Start date' and 'Target finish date'.",
    "Set 'Days off per week' (0–6), the 'Revision buffer (% of study days)' and 'Minutes one page takes you' — the plan recomputes as you type, with no button to press.",
    "Read the 'Required pace' in pages/day plus the study days, revision buffer days, actual reading days and 'Estimated minutes per day' rows; 'Copy plan' copies the breakdown.",
  ],
  intro:
    "This planner computes the exact daily page quota needed to finish an NCERT book — or a whole stack of them — before a target date. The formula is stated openly: study days are calendar days scaled by (7 − days off)/7 and rounded down, a chosen percentage of those days is reserved as a revision buffer, and pages left are divided by the remaining reading days and rounded up. It is built for board students and UPSC/NEET aspirants who know their deadline but not the pace it implies.",
  useCases: [
    "A UPSC aspirant with 1,200 pages of class 6-12 History and Geography NCERTs left and a prelims-oriented deadline three months away",
    "A Class 12 student planning how many Physics NCERT pages per evening will finish the book two weeks before boards",
    "An aspirant comparing what taking one versus two weekly days off does to the required daily pace",
  ],
  benefits: [
    ["Honest pace", "Days off and a revision buffer are subtracted first, so the quota is one you can actually sustain."],
    ["Time estimate", "Converts the daily page quota into minutes per day using your own reading speed."],
    ["Transparent formula", "Every intermediate figure — study days, buffer days, reading days — is shown, not hidden."],
  ],
  faqs: [
    [
      "How many pages of NCERT can I read in a day?",
      "A careful read of a dense NCERT page with underlining typically takes around 3 minutes, so an hour of focused reading covers roughly 20 pages, and a 2-hour daily slot covers about 40. Skimming is two to three times faster, while note-making can halve the pace — the planner lets you set your own minutes-per-page figure.",
    ],
    [
      "How long does it take to finish all NCERTs for UPSC?",
      "The commonly read class 6-12 NCERT set for UPSC (History, Geography, Polity, Economics, Science and Society) runs to several thousand pages, so at 30-40 pages a day with one weekly day off it typically takes three to five months. Enter your actual page count and target date to get the precise daily quota instead of a rule of thumb.",
    ],
    [
      "Why does the planner round study days down and pages per day up?",
      "Rounding works against you on purpose so the plan cannot silently slip: a fraction of a study day you don't have is dropped, and a fractional page quota is raised to the next whole page. That guarantees the schedule finishes on or before the target date even in the worst rounding case.",
    ],
    [
      "What is a revision buffer and how big should it be?",
      "It is a share of your study days deliberately kept free of new reading so you can revise what you covered — the planner defaults to 10%. For retention-heavy exams many mentors suggest 20-30%, and the tool accepts anything from 0% to 90%.",
    ],
  ],
};

export default seo;
