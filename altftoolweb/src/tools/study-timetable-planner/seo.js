const seo = {
  title: "Study Timetable Planner: 60-Minute Blocks",
  metaDescription:
    "Turn subjects with difficulty, priority and exam dates into 7 days of dated 60-minute study blocks with 15-minute breaks. Saves locally, exports JSON.",
  steps: [
    "On the Subjects tab press Add Subject, then give chapters, Difficulty (Easy/Medium/Hard), Priority and an Exam Date.",
    "Press Generate Schedule on the Timetable tab: 7 days of 60-minute blocks from 08:00 to 20:00, hardest subject first.",
    "Mark sessions complete to move the Done rate, then Export as JSON for a study-plan-<date>.json backup.",
  ],
  intro:
    "The Study Timetable Planner turns a list of subjects — each with a difficulty, a priority, chapters and an exam date — into a week of dated study blocks, rotating subjects hardest-first and dropping a break in after every session. The default plan runs 08:00 to 20:00 for 7 days in 60-minute sessions with 15-minute breaks, and tags about one block in five as revision. It is built for students juggling several exams who want a schedule that spaces the heavy subjects out instead of a blank calendar to fill in by hand.",
  useCases: [
    "Three weeks before finals with five subjects and uneven chapter counts, and you need a day-by-day plan that puts the two you are weakest at into the first slots.",
    "Starting a new semester and wanting a repeatable weekly template — fixed study window, fixed session length — instead of deciding what to study each evening.",
    "Tracking whether you actually did the work: marking sessions complete through the week and checking the completion rate before deciding what to reschedule.",
  ],
  benefits: [
    ["Orders subjects by difficulty, then priority", "High-difficulty subjects claim the earlier slots automatically, so the hardest material does not get pushed to a tired evening."],
    ["Builds breaks into the grid", "A 15-minute break is inserted after each session as a real calendar block, so the plan reflects hours you can actually sustain."],
    ["Reserves time for revision, not just new material", "Roughly 20% of blocks are generated as revision on a subject you have already covered rather than fresh chapters."],
  ],
  faqs: [
    [
      "How long is each study session and can I change it?",
      "Sessions default to 60 minutes with a 15-minute break after each, inside an 08:00–20:00 day over 7 days. All of those — day count, start and end hour, session length and break length — are configurable before you generate the plan.",
    ],
    [
      "How does it decide which subject goes first?",
      "Subjects are sorted by difficulty (high, medium, low) and ties are broken by priority, then rotated through the day's slots in that order. Set a subject to high difficulty and it will consistently land in the earlier, higher-energy blocks.",
    ],
    [
      "Is my plan saved if I close the tab?",
      "Yes. Subjects, the generated timetable and your progress stats are stored in your browser's local storage and reload automatically, and you can export the whole plan as a JSON file to keep a copy or move it to another device.",
    ],
    [
      "What is the built-in focus timer set to?",
      "The focus timer runs a standard 25-minute Pomodoro work interval, which pairs with the 60-minute planned blocks as roughly two focused stretches plus a short reset.",
    ],
  ],
};

export default seo;
