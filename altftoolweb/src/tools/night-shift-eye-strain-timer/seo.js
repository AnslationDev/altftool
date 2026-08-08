const seo = {
  title: "Night Shift Eye Break Timer: 20-20-20 on the Clock",
  metaDescription:
    "Lays every 20-minute eye break across an overnight shift as wall-clock times, lengthens the ones in the 03:00-05:00 circadian low, adds a wind-down.",
  steps: [
    "Set Shift starts and Shift ends — 22:00 to 06:00 rolls past midnight correctly — then Break interval (minutes), Break length (seconds) and Screen wind-down before the end (minutes).",
    "Toggle the button between Sleeping after this shift and Staying up after this shift so the light advice matches what you do when you get home.",
    "Eye breaks this shift gives the count, the rows show Breaks in the circadian low (lengthened threefold) and Screen wind-down starts, and the Break times table lists every Clock time with its Length and a Circadian low or Wind-down note; Copy schedule copies it.",
  ],
  intro:
    "This planner lays 20-20-20 eye breaks across an overnight shift on the actual wall clock, handling the roll past midnight, and treats the early hours differently from the rest of the night. Breaks that land between 03:00 and 05:00 — the window around the circadian nadir, when core body temperature, alertness and error rates are all at their worst — are automatically lengthened. It also sets a screen wind-down before the end of the shift, because light in the final hours before you try to sleep is what pushes your body clock furthest out of step.",
  useCases: [
    "Plan a 22:00 to 06:00 shift and see all 23 break times printed as clock times, not as offsets you have to work out.",
    "Find which of your breaks fall inside the 03:00-05:00 low so you can take those ones properly rather than skipping them.",
    "Set a one-hour screen wind-down before a 06:00 finish when you are heading straight to bed.",
    "Compare a 12-hour night against an 8-hour one and see how much extra time sits inside the worst part of the night.",
  ],
  benefits: [
    ["Real clock times", "Handles shifts crossing midnight and prints every break as a time you can set an alarm for."],
    ["Circadian low built in", "Breaks between 03:00 and 05:00 are lengthened automatically instead of being treated like any other."],
    ["Light timing, not just eye rest", "Adds a wind-down window and adjusts the advice depending on whether you sleep after the shift."],
  ],
  faqs: [
    [
      "What time is the hardest part of a night shift?",
      "Roughly 03:00 to 05:00. That window sits around the circadian nadir, where core body temperature and alertness bottom out, and it is where microsleeps, errors and the subjective feeling of eye strain cluster. Breaks taken there are the ones most worth protecting.",
    ],
    [
      "Should I dim my screen on a night shift?",
      "Match it to the room rather than simply turning it down. A bright screen against a black surround makes the pupil keep readjusting, which is uncomfortable; a modest light behind the monitor fixes that better than dimming alone. In the final hour or two before you sleep, lowering overall light exposure genuinely helps, because light in the biological night suppresses melatonin and delays the body clock.",
    ],
    [
      "Why do my eyes hurt more at night than during the day?",
      "A combination of things: blink rate is already halved during concentrated screen work, air conditioning dries the eye surface further, the contrast between a bright screen and a dark room is harsher, and you are working through the point in the 24-hour cycle when alertness is lowest. Persistent grittiness often responds to preservative-free artificial tears, but recurring pain or blurred vision needs an eye examination.",
    ],
    [
      "Should I wear sunglasses home after a night shift?",
      "If you are going straight to sleep, yes. Morning daylight is the strongest signal for shifting the body clock, and a bright commute home directly undermines the sleep you are about to attempt. If you plan to stay awake and re-adapt to daytime, do the opposite and get bright light early. This is general information — shift-work sleep problems that persist are worth raising with a doctor or occupational health service.",
    ],
  ],
};

export default seo;
