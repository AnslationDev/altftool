const seo = {
  intro:
    "Sleep debt is the running total of the hours you slept less than you needed, and this planner works it out from a week of nightly figures then splits the payback into small nightly instalments. It sums max(0, target hours - hours slept) for every night, caps the extra sleep added to any single night at two hours, and prints the earlier bedtime that produces it while your wake-up time stays fixed. It is built for shift workers, students and parents who want a realistic catch-up schedule rather than a Sunday lie-in.",
  useCases: [
    "Adding up a week of 5-6 hour nights before deciding how many evenings of earlier bedtime it will take to clear them",
    "Replacing a four-hour Saturday lie-in with a 45-minute earlier bedtime for six nights so Monday's wake-up still works",
    "Checking whether a planned recovery window is long enough, or whether some debt will still be outstanding at the end of it",
  ],
  benefits: [
    ["Honest arithmetic", "Surplus sleep on one night is reported separately, never silently subtracted from another night's shortfall."],
    ["Bedtime you can act on", "Every recovery night shows the exact clock time to be asleep by, derived from your fixed wake-up time."],
    ["Protects your body clock", "Extra sleep is capped at two hours a night so recovery does not turn into weekend social jet lag."],
  ],
  faqs: [
    [
      "How do you calculate sleep debt?",
      "Sleep debt is the sum of each night's shortfall: for every night you add max(0, target hours - hours slept), and nights where you slept more than your target add nothing. Seven nights at 6.5 hours against an 8-hour target give 10.5 hours of debt.",
    ],
    [
      "Can you catch up on sleep in one long lie-in?",
      "Not fully. A single long night restores some alertness but studies of recovery sleep show attention and metabolic measures still lag after one weekend, and shifting your wake time by more than about two hours moves your circadian clock, which is why this planner spreads the payback over several nights instead.",
    ],
    [
      "How much extra sleep should I add per night?",
      "Between 30 and 60 minutes is the instalment most people can hold to, and the planner caps any single night at two hours extra. Going to bed 45 minutes earlier for a week repays roughly 5 hours of debt without changing your wake-up time.",
    ],
    [
      "How many hours of sleep do adults actually need?",
      "Adults aged 18 to 64 need 7 to 9 hours a night according to the American Academy of Sleep Medicine and Sleep Research Society consensus, with 7 hours as the lower bound for regular health. Use your own steady-state figure as the target if you know it; persistent sleepiness despite adequate hours is worth raising with a doctor.",
    ],
  ],
};

export default seo;
