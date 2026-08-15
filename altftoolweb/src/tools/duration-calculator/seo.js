const seo = {
  title: "Convert Seconds to Days, Hours, Minutes and Seconds",
  metaDescription:
    "Type a number of seconds and get a compact duration — 90061 becomes 1d 1h 1m 1s — with a Days, Hours, Minutes and Seconds breakdown.",
  intro:
    "Duration Calculator converts a raw number of seconds into days, hours, minutes and seconds — 90,061 seconds becomes 1d 1h 1m 1s. It divides by the fixed constants 86,400 seconds per day, 3,600 per hour and 60 per minute, then shows both the compact string and a breakdown row for each unit. It is built for developers and analysts reading durations out of logs, APIs, video metadata or database columns that store elapsed time as a plain integer.",
  useCases: [
    "A monitoring dashboard reports an incident lasted 274,860 seconds and you need to say in the postmortem how many days and hours that actually was.",
    "You are reading a cache TTL or token lifetime out of a config file as 604800 and want to confirm at a glance that it means one week.",
    "A video processing job logs total runtime in seconds and you need it in hours and minutes for a billing or capacity note.",
  ],
  benefits: [
    [
      "Zero units are dropped",
      "The compact result only shows the units that are non-zero, so 3,700 seconds reads as 1h 1m 40s rather than 0d 1h 1m 40s.",
    ],
    [
      "Compact string plus a per-unit table",
      "You get the human-readable line for pasting into a ticket and a separate days/hours/minutes/seconds breakdown for when you need one figure on its own.",
    ],
    [
      "Predictable handling of odd inputs",
      "Fractional seconds are floored and negative values are clamped to zero, so a stray -1 or 12.7 from a log never produces nonsense output.",
    ],
  ],
  faqs: [
    [
      "How many seconds are in a day?",
      "86,400 seconds — 24 hours multiplied by 3,600 seconds per hour. This calculator uses that fixed constant, so it does not account for leap seconds or daylight-saving transitions, which affect calendar dates rather than elapsed-time counts.",
    ],
    [
      "How long is 604800 seconds?",
      "Exactly 7 days, or one week. Divide by 86,400 to get days: 604,800 ÷ 86,400 = 7, with no remaining hours, minutes or seconds — which is why that value is the standard one-week TTL in caching and cookie settings.",
    ],
    [
      "What happens if I enter a decimal like 90.7 seconds?",
      "It is floored to the whole second below, so 90.7 is treated as 90 seconds and displayed as 1m 30s. Convert milliseconds to seconds before entering them, since the input is read as seconds only.",
    ],
    [
      "Does it handle durations longer than a year?",
      "Yes, but the largest unit shown is days — 31,536,000 seconds displays as 365d rather than 1 year. Months and years vary in length, so expressing long spans in days keeps the result exact.",
    ],
  ],
};

export default seo;
