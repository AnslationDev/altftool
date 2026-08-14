const seo = {
  title: "SLA Uptime to Downtime Calculator — Day, Month & Year",
  metaDescription:
    "Convert an uptime percentage into allowed downtime per day, week, month, quarter and year — 99.9% allows about 44 minutes a month — or work backwards.",
  steps: [
    "Enter your availability in 'Uptime target (%)' or tap a nines preset chip — 99%, 99.5%, 99.9%, 99.95%, 99.99% or 99.999%.",
    "There is no calculate button — the budget recomputes as you type; for the reverse check fill 'Actual downtime (minutes)' and 'Over which period'.",
    "'Allowed downtime per month' headlines the result with per-day, week, quarter and year rows below; press 'Copy result' to copy all five figures.",
  ],
  intro:
    "This calculator converts an SLA availability percentage into the exact downtime it permits — allowed downtime = (1 − uptime% ÷ 100) × period length — reported per day, week, month, quarter and year. It is built for SREs, platform engineers and anyone negotiating or monitoring a service-level agreement, and it also works in reverse: enter real downtime to get the uptime percentage achieved. Periods use the Gregorian mean year of 365.2425 days so all five figures stay consistent.",
  useCases: [
    "An SRE translating a proposed 99.95% SLO into a monthly error budget before agreeing to it in a service review",
    "A SaaS buyer comparing vendor SLAs by seeing that 99.5% allows about 3.7 hours of downtime a month while 99.9% allows about 44 minutes",
    "An on-call engineer entering last month's 38 minutes of outage to check whether the 99.9% target was met",
  ],
  benefits: [
    ["All five windows at once", "Daily, weekly, monthly, quarterly and yearly budgets from one percentage, mutually consistent."],
    ["Works in reverse", "Enter actual downtime minutes over any window and get the achieved uptime percentage."],
    ["Standard nines presets", "One tap for 99%, 99.5%, 99.9%, 99.95%, 99.99% and 99.999% targets."],
  ],
  faqs: [
    [
      "How much downtime does 99.9% uptime allow?",
      "About 43 minutes 50 seconds per month and 8 hours 46 minutes per year. The formula is (1 − 0.999) × period length, using an average month of 30.44 days; per day it is roughly 1 minute 26 seconds.",
    ],
    [
      "What is the difference between 99.9% and 99.99% uptime?",
      "Roughly a factor of ten in allowed downtime: 99.9% permits about 8.8 hours of outage per year while 99.99% permits about 52.6 minutes. Per month that is about 43.8 minutes versus 4.4 minutes, which is why each extra nine gets significantly more expensive to engineer.",
    ],
    [
      "How do I calculate uptime percentage from downtime?",
      "Divide downtime by the total length of the period, subtract from 1 and multiply by 100: uptime% = 100 × (1 − downtime ÷ period). For example, 30 minutes of downtime in a 30.44-day month is 100 × (1 − 30 ÷ 43,829) ≈ 99.932%.",
    ],
    [
      "Does a monthly SLA use 30 days or the calendar month?",
      "It depends on the contract — many providers measure per calendar month, so February has a smaller minute count than January. This tool uses the Gregorian average of 30.436875 days per month so the daily, monthly and yearly figures agree; check your SLA's own definition of the measurement window and any maintenance exclusions before relying on a figure.",
    ],
  ],
};

export default seo;
