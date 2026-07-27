const seo = {
  intro:
    "This planner builds a phone-free study schedule whose blocks escalate linearly — block length on day n = min(cap, start + (n−1) × daily increase) — so the detox grows from an easy first day to a sustained ceiling instead of demanding cold turkey. It computes the day your blocks hit the cap, the growth factor from day one to the final day, and total phone-free study hours across the plan. It is for students who repeatedly fail all-or-nothing phone bans and want a ramp they can actually hold.",
  useCases: [
    "A student who cannot manage 30 phone-free minutes today building up to 90-minute blocks over two weeks",
    "A board-exam aspirant planning a 30-day ramp to two 2-hour phone-free sessions per day before the exams",
    "Someone restarting after a failed cold-turkey attempt, this time with a 10-minute daily escalation they can keep",
  ],
  benefits: [
    ["Escalation, not willpower", "Targets grow a few minutes a day from an easy start, the graded-exposure approach to habit change."],
    ["Realistic ceilings", "Blocks stop growing at your cap, and plans demanding more than 12 phone-free hours a day are rejected."],
    ["Milestones computed", "The plan shows exactly which day you hit the cap and how many total phone-free hours you will bank."],
  ],
  faqs: [
    [
      "How do I do a digital detox while studying?",
      "Start with a phone-free block you can definitely complete — even 20-30 minutes with the phone in another room — and lengthen it a little each day. This planner formalises that ramp: pick a start, a daily increase and a cap, and follow the printed day-by-day targets.",
    ],
    [
      "Why do escalating targets work better than quitting the phone cold turkey?",
      "Because each day's target is only slightly harder than yesterday's success, the plan builds a streak of wins instead of one dramatic failure. It is the same graded-exposure logic used in habit formation and training: increase the load gradually and only on top of completed days.",
    ],
    [
      "How long should a phone-free study block be?",
      "Long enough to finish real work but short enough to survive without checking: most students land between 60 and 120 minutes at the cap. A common ramp is 30 minutes on day one growing by 10 minutes daily, which reaches a 90-minute cap on day 7.",
    ],
    [
      "What should I do with my phone during a study block?",
      "Put it in a different room, switched to silent or off — physical distance removes both notifications and the reflex to check. Keeping it face down on the desk still loses the block for many people, because the trigger is reach, not just sound.",
    ],
  ],
};

export default seo;
