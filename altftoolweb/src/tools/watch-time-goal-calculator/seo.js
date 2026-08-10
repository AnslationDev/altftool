const seo = {
  title: "Watch Time Goal Calculator: Videos to 4,000 Hours",
  metaDescription:
    "How many uploads and weeks to reach 4,000 YouTube watch hours, whether your pace fits the rolling 365-day window, and the view duration needed to finish.",
  steps: [
    "Enter your 'Watch-hour target' (defaults to the 4,000-hour Partner Programme requirement) and 'Watch hours so far (last 12 months)'.",
    "Set 'Average views per video', 'Average view duration (minutes)', 'Uploads per week' and 'Weeks you want to finish in'.",
    "Read 'Videos still needed', the 12-month rolling-window check and 'View duration needed to finish in time', then click 'Copy result'.",
  ],
  intro:
    "Watch Time Goal Calculator works out how many uploads and how many weeks stand between you and a watch-hour target, using the identity that one video produces views x average view duration / 60 watch hours. It defaults to the 4,000 valid public watch hours the YouTube Partner Programme requires within a rolling 365 days, alongside 1,000 subscribers, and warns when your current pace would take longer than that window allows. Written for creators planning an upload schedule rather than guessing at it.",
  useCases: [
    "See how many more videos you need at your current average views and view duration to reach 4,000 hours.",
    "Test whether moving from one upload a week to two actually brings monetisation inside the 12-month window.",
    "Find the average view duration you would need to hit the target in the six months you have.",
    "Set a non-YouTube watch-hour goal for a course or membership library and plan the publishing schedule around it.",
  ],
  benefits: [
    ["Rolling window checked", "Flags when your pace is slower than the 365-day window, so early hours expire before the later ones arrive."],
    ["Retention as a lever", "Shows average percentage viewed, because lifting duration raises watch hours without needing more views."],
    ["Reverse calculation", "Tells you the view duration required to finish inside a deadline you choose."],
  ],
  faqs: [
    [
      "How many watch hours do you need to monetise on YouTube?",
      "4,000 valid public watch hours in the previous 12 months, plus 1,000 subscribers. There is a separate Shorts route: 1,000 subscribers and 10 million valid public Shorts views in the previous 90 days.",
    ],
    [
      "How do you calculate watch hours from views?",
      "Multiply views by average view duration in minutes, then divide by 60. A video with 3,000 views and a 4.2-minute average view duration produces 3,000 x 4.2 / 60 = 210 watch hours.",
    ],
    [
      "Do watch hours expire?",
      "Yes. The 4,000-hour requirement is measured over a rolling 365 days, so hours earned more than a year ago drop out of the count. If your pace would take longer than a year, older hours expire faster than new ones accumulate.",
    ],
    [
      "Is it faster to make longer videos to reach 4,000 hours?",
      "Only if the longer format holds retention. Watch hours depend on duration actually watched, not runtime, so doubling the length while halving the average percentage viewed leaves you exactly where you started. Check the average percentage viewed figure before extending.",
    ],
  ],
};

export default seo;
