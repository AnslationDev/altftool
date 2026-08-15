const seo = {
  title: "Video Series Content Calendar – Dated Episode",
  metaDescription:
    "Turn a start date, weekly cadence and topic list into dated episode slots with rotating formats; blank slots are flagged and export as spreadsheet rows.",
  steps: [
    "Set the Start date, Weeks (1–104) and Per week (1–7), toggle the Publish days buttons for your weekdays, list 'Formats to rotate (comma separated)' and add 'Topics, one per line'.",
    "The calendar builds live in UTC: every episode gets a real calendar date and a rotating format, with 'Topics written' and 'Slots still blank' counted so missing ideas stay visible.",
    "Review the Publishing schedule table (Ep, Date, Topic, Format) and press 'Copy for sheets' to copy tab-separated Ep/Week/Date/Day/Topic/Format rows for a spreadsheet.",
  ],
  intro:
    "Video Series Content Calendar turns a start date, a weekly cadence and a list of topics into dated episode slots, assigning each one a rotating format so a series is fully planned before the first shoot. Publish days are chosen by weekday, dates are calculated in UTC so they never drift with your timezone, and any slot without a topic is flagged as blank rather than quietly filled. Useful for creators, agencies and in-house teams running a fixed-length series across several weeks.",
  useCases: [
    "Map a six-week, twice-weekly launch series onto Tuesday and Friday slots with topics already assigned.",
    "See how many topic ideas you still need before committing to a 12-week run.",
    "Rotate formats — tutorial, Q&A, case study — so the series does not become eight identical talking-head videos.",
    "Export the schedule as spreadsheet rows to share with an editor or a client.",
  ],
  benefits: [
    ["Real dates, not week numbers", "Every episode gets an actual calendar date, including month and year rollovers."],
    ["Gaps are visible", "Slots without a topic are marked so you know exactly how many ideas are still missing."],
    ["Timezone-proof", "Scheduling runs in UTC, so a publish day never shifts by one when you travel."],
  ],
  faqs: [
    [
      "How often should you publish a video series?",
      "Pick the highest cadence you can sustain for the entire run — for most solo creators that is one video a week, and for a team two. Consistency matters more than volume: a weekly slot viewers can predict beats a burst of daily uploads followed by a three-week gap.",
    ],
    [
      "How many videos should a series have?",
      "Six to twelve episodes is a common range: long enough to build a habit with viewers, short enough to script and shoot in one or two batches. Decide the number before you start so you can batch-record and write a consistent series intro.",
    ],
    [
      "What is the best day to publish a video?",
      "There is no universal best day — check your own analytics for when your existing audience is active, then publish a few hours before that peak so the video is indexed and recommended when they arrive. The bigger win is publishing on the same day every week rather than picking the theoretically perfect one.",
    ],
    [
      "Should every video in a series use the same format?",
      "No. Rotating formats — a tutorial, then a Q&A, then a case study — keeps a series watchable and lets you cover the same topic from angles that suit different viewers. Keep the intro, thumbnail style and title pattern consistent instead; that is what signals the videos belong together.",
    ],
  ],
};

export default seo;
