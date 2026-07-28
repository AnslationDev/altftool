const seo = {
  title: "Sleep Calculator — Bedtime & Wake-Up by Sleep Cycles",
  h1: "Sleep Calculator",
  metaDescription:
    "Free sleep calculator: pick a wake-up time or bedtime and get four options from 90-minute sleep cycles plus fall-asleep time. No signup, runs in-browser.",
  intro:
    "The Sleep Calculator counts 90-minute sleep cycles forward or backward from one clock time. Set a wake-up time and it subtracts 6, 5, 4 and 3 cycles — plus the minutes you take to fall asleep — to give four candidate bedtimes; switch to \"Sleep at\" and it adds the same intervals to give four wake-up times. The arithmetic is plain JavaScript Date maths (minutes × 60,000 milliseconds) running in the page itself, with results formatted to your browser's local time settings. Nothing is sent to a server and there is no account to create.",
  useCases: [
    "Work out what time to go to bed tonight when the alarm is already set for a fixed wake-up time.",
    "Find the wake-up time that lands at the end of a cycle when you are going to bed later than planned.",
    "Plan a short night honestly — see that 3 cycles is 4.5 hours asleep and 4 cycles is 6.0 hours, before deciding which alarm to set.",
  ],
  benefits: [
    [
      "Both directions from one screen",
      "Toggle between \"Wake up at\" and \"Sleep at\" — the same four cycle counts are subtracted or added, so you never have to do the reverse sum yourself.",
    ],
    [
      "Fall-asleep time is built in",
      "A separate field (0–60 minutes, 15 by default) is added on top of the cycles, so a bedtime is the time to be in bed, not the time to be unconscious.",
    ],
    [
      "Four options, each labelled in hours",
      "Every result card shows the clock time, the cycle count, and the sleep it represents — 9.0, 7.5, 6.0 or 4.5 hours — so the trade-off is visible.",
    ],
    [
      "Free, private and instant",
      "No account, no upload, no stored data. The calculation runs entirely in your browser and updates the moment you change a field.",
    ],
  ],
  faqs: [
    [
      "What time should I go to bed if I need to wake up at 6am?",
      "Using 90-minute cycles and 15 minutes to fall asleep, the four bedtimes are 8:45 PM (6 cycles, 9.0 hours asleep), 10:15 PM (5 cycles, 7.5 hours), 11:45 PM (4 cycles, 6.0 hours) and 1:15 AM (3 cycles, 4.5 hours). Each is the wake-up time minus cycles × 90 minutes, minus your fall-asleep minutes.",
    ],
    [
      "How many hours is 5 sleep cycles?",
      "7.5 hours. The calculator treats one cycle as a flat 90 minutes, so 3 cycles is 4.5 hours, 4 is 6.0 hours, 5 is 7.5 hours and 6 is 9.0 hours. Those figures are time asleep only — the minutes you spend falling asleep are added separately when working out the clock time.",
    ],
    [
      "Is a sleep cycle actually 90 minutes?",
      "Ninety minutes is an average, not a fixed number. Sleep research generally puts a full cycle somewhere in the region of 70 to 120 minutes, and it varies between people and across a single night — early cycles tend to be shorter than later ones. This tool uses a flat 90-minute cycle for every calculation, so treat the times it produces as a scheduling guide rather than a precise prediction of your sleep stages.",
    ],
    [
      "Why does the sleep calculator add 15 minutes?",
      "That is the sleep latency field — how long you take to actually fall asleep after getting into bed. It defaults to 15 minutes and accepts any whole number from 0 to 60. It is added to the total in both modes, so a bedtime result tells you when to be in bed, and a wake-up result already accounts for the time before you drop off.",
    ],
    [
      "What is the difference between the \"Wake up at\" and \"Sleep at\" modes?",
      "The direction of the maths. \"Wake up at\" takes your alarm time and subtracts each cycle option to give bedtimes. \"Sleep at\" takes the time you are getting into bed and adds each option to give wake-up times. The four cycle counts (6, 5, 4 and 3) and the fall-asleep minutes are identical in both.",
    ],
    [
      "Does the calculator show whether a time is after midnight?",
      "The result cards show the clock time only, with no date label — so a bedtime of 1:15 AM for a 6:00 AM alarm is the following morning, and a wake-up time can likewise roll past midnight. Times are formatted with your browser's local settings, which means you will see a 12-hour AM/PM clock or a 24-hour clock depending on your device's region.",
    ],
    [
      "Can I use it for naps?",
      "Only for whole cycles. The tool offers 6, 5, 4 and 3 cycles, so the shortest result it produces is 4.5 hours of sleep — too long for a nap. There is no option for a partial cycle or a 20-minute nap.",
    ],
    [
      "Is this sleep calculator free, and is my data stored?",
      "Yes, it is free with no signup, and no data is stored or transmitted. The time and fall-asleep values stay in the page's memory while you use it and are gone when you close the tab — there is no network request and nothing is written to your device. It is a scheduling calculator, not a medical device; if you regularly struggle to sleep or wake unrested, that is worth raising with a doctor.",
    ],
  ],
  steps: [
    "Choose a mode: \"Wake up at\" to work backwards from your alarm, or \"Sleep at\" to work forwards from the time you get into bed.",
    "Set the time, then set how many minutes you take to fall asleep — the field defaults to 15 and accepts 0 to 60.",
    "Read the four result cards. Each shows a clock time, its cycle count, and the hours asleep it works out to (9.0, 7.5, 6.0 or 4.5) so you can pick the option that fits your night.",
  ],
};

export default seo;
