const seo = {
  intro:
    "This planner works backwards from an early shift start time to the exact minute you should be asleep, using shift start minus commute minus getting-ready time for the alarm, then subtracting your sleep target and your usual sleep-onset time for lights-out. It is built for people on 4am, 5am and 6am starts — bakers, warehouse and factory crews, hospital early shifts, delivery drivers and cabin crew. Defaults follow the AASM and Sleep Research Society consensus that adults need 7 or more hours a night, with an 8-hour caffeine cutoff and a 90-minute screen-dimming buffer.",
  useCases: [
    "A warehouse picker on a 5am start finds the real lights-out time is 20:15 once a 25-minute drive and 35 minutes of getting ready are counted.",
    "A nurse moving onto a run of early shifts plans the caffeine cutoff and last meal so the first night is not spent lying awake.",
    "A parent with a 4:30am delivery round checks whether a 7-hour target is realistic, and sees the nap length needed if it is not.",
  ],
  benefits: [
    ["Counts the hidden minutes", "Commute and getting-ready time are what usually eat the sleep, so they drive the whole schedule."],
    ["Whole-evening timeline", "Caffeine, food, light and wind-down all get a clock time, not just bedtime."],
    ["Flags an impossible plan", "Warns when a target falls below 7 hours or lands the bedtime absurdly early."],
  ],
  faqs: [
    [
      "What time should I go to bed for a 4am shift?",
      "For a 4am start with a 30-minute commute and 45 minutes of getting ready, the alarm goes at 2:45am, so lights-out is 7:30pm the evening before if you want 7 hours of sleep plus about 15 minutes to fall asleep. Adjust for your own commute — every 10 minutes of travel is 10 minutes off the previous evening.",
    ],
    [
      "How many hours of sleep do shift workers need?",
      "The same as everyone else: the AASM and Sleep Research Society recommend 7 or more hours per night for adults aged 18 to 60. Shift work does not lower the requirement, it just makes hitting it harder, which is why sleep debt accumulates across a run of earlies.",
    ],
    [
      "When should I stop drinking coffee before an early bedtime?",
      "About 8 hours before lights-out. Caffeine has a half-life of roughly 5 hours in most adults, and a 2013 trial found a dose taken even 6 hours before bed still measurably reduced total sleep time. For a 7:30pm bedtime that means the last coffee is around 11:30am.",
    ],
    [
      "Is it better to nap or to go to bed very early?",
      "If the required bedtime lands before about 7pm it is usually easier to sleep a little less at night and add a short nap than to lie awake for an hour. A 20-minute nap avoids waking out of deep sleep; a full 90-minute cycle is the alternative if you have the time. Ongoing exhaustion on a shift pattern is worth raising with a doctor or occupational health rather than managing alone.",
    ],
  ],
};

export default seo;
