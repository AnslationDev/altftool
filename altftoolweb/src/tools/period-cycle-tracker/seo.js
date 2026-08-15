const seo = {
  title: "Period Tracker: Next 3 Periods, Fertile Window",
  metaDescription:
    "Predict your next three periods, the 7-day fertile window and ovulation (14 days before the next period). Logs stay in your browser; not contraception.",
  steps: [
    "Set First day of your last period on the date field, which will not accept a date after today, then enter Average cycle length (days) between 21 and 40 and Period length (days) between 2 and 10.",
    "Press Log this period to save that start date on this device — the button then reads Already logged, and once two or more entries exist a Personal average line reports your shortest, longest and mean cycle and overrides the length you typed.",
    "Read Where you are today, which shows Day N of your N-day cycle, then the Next 3 predicted periods cards and the two-month calendar colour-coded for period days, fertile window and the estimated ovulation day. Copy summary puts those dates on the clipboard.",
  ],
  intro:
    "This period tracker predicts your next three periods, fertile windows and ovulation dates from your last period start date, your typical cycle length and how many days you bleed. It uses the standard luteal-phase rule — ovulation is estimated 14 days before the next period starts, with a fertile window running from 5 days before ovulation to 1 day after — and once you log two or more period start dates it switches to your own average cycle length instead of the number you typed. Everything is stored in your browser only, and the output is informational: it is not contraception and not a substitute for advice from a clinician.",
  useCases: [
    "Booking a holiday or a wedding and wanting to know whether your period is likely to land in that week",
    "Trying to conceive and needing the six-day fertile window flagged on a calendar rather than guessing from cycle day",
    "Suspecting your cycles have got irregular and wanting the shortest, longest and average gap across the periods you have logged",
  ],
  benefits: [
    ["Learns your real cycle length", "After two logged periods it averages the gaps between them and predicts from that, overriding the default 28 days."],
    ["Flags how reliable the prediction is", "If the spread between your shortest and longest logged cycle is more than 7 days, it labels the pattern irregular rather than showing a confident date."],
    ["Two-month calendar view", "This month and next are colour-coded for period days, fertile window and the single estimated ovulation day."],
  ],
  faqs: [
    [
      "How is the ovulation date calculated?",
      "It is placed 14 days before the predicted start of your next period, so on a 28-day cycle that is day 14 and on a 32-day cycle it is day 18. The luteal phase is the more stable half of the cycle, which is why counting backwards from the next period is the standard estimate.",
    ],
    [
      "How long is the fertile window shown here?",
      "Seven days: the five days before the estimated ovulation date, the day itself, and the day after. Sperm can survive several days in the reproductive tract while the egg is viable for around 24 hours, which is why the window opens well before ovulation.",
    ],
    [
      "How many periods do I need to log before predictions improve?",
      "Two, which produces one measured gap. Only gaps between 15 and 60 days are counted so mid-cycle spotting or a missed entry does not skew the average, and the resulting cycle length is kept within 21 to 40 days.",
    ],
    [
      "Can I use this as birth control?",
      "No. Calendar predictions are estimates based on past cycles and cannot account for stress, illness, travel, medication or an ovulation that shifts by several days, so they should never be relied on to prevent pregnancy. Speak to a doctor or a sexual health clinic about contraception, and about any cycle that is persistently irregular, absent or unusually painful.",
    ],
  ],
};

export default seo;
