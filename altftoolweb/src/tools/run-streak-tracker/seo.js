const seo = {
  title: "Run Streak Tracker with the USRSA One-Mile Rule",
  metaDescription:
    "Log dated runs to see your live and record streaks, longest gap and 30-day consistency. The one-mile (1.609 km) qualifying threshold is editable.",
  steps: [
    "Under \"Log a run\", pick the Date, enter the Distance (km), set the \"Qualifying distance per day (km)\" threshold — 1.609 km is the official one-mile minimum — and click \"Add to log\".",
    "Read the \"Current streak\" card and its rows: longest streak, ran today, qualifying days, total distance, consistency over the last 30 days, longest gap and next milestone.",
    "Scan the \"Last 30 days\" squares — filled means a qualifying day, faded means a run under the threshold — and click \"Copy result\" for a text summary; the log is saved in this browser.",
  ],
  intro:
    "A run streak is a set of consecutive calendar days on which you completed at least one qualifying run, and the US Running Streak Association sets that minimum at one mile (1.609 km) per day. This tracker takes a log of dated runs and returns the live streak, the record streak, the longest gap between runs and a 30-day consistency percentage. The threshold is editable, so a club or personal rule of 3 km or 5 km works just as well.",
  useCases: [
    "Check whether a 0.9 km shakeout counted as a streak day before the calendar rolls over.",
    "Rebuild a streak history from a training diary and find out what your true record run of consecutive days was.",
    "See a 30-day consistency percentage when you are aiming for regular running rather than an unbroken streak.",
    "Count down the days to the next landmark — 100 days, or the 365 days at which the USRSA will list a streak.",
  ],
  benefits: [
    ["Calendar-day logic", "Streaks break only after a whole day passes with no qualifying run, so today still counts as open."],
    ["Editable threshold", "Keep the official one-mile rule or set your own minimum distance for a day to count."],
    ["Consistency, not just streaks", "The 30-day percentage still shows progress after a streak ends."],
  ],
  faqs: [
    [
      "What counts as an official run streak day?",
      "The US Running Streak Association requires at least one mile — 1.609 km — run on foot within a single calendar day. Treadmill miles count, but walking does not, and the distance must be covered in one day rather than split across midnight.",
    ],
    [
      "Does my streak break if I have not run yet today?",
      "No. A streak only ends once a full calendar day has passed with no qualifying run, so a streak whose last run was yesterday is still live and simply at risk. This tracker flags that case rather than zeroing your count.",
    ],
    [
      "How long does a streak have to be before it is listed?",
      "The USRSA lists streaks that have reached one year — 365 consecutive days — and groups them into tiers above that. Shorter targets such as 7, 30 or 100 days are ordinary training landmarks with no governing body behind them.",
    ],
    [
      "Is running every day safe?",
      "A streak removes rest days, so the usual advice is to keep most streak days short and easy, vary surfaces, and take the mile at a genuinely relaxed effort. If you have pain that changes your gait, stopping the streak is the safer choice — this is general information, not medical advice, so speak to a clinician about persistent symptoms.",
    ],
  ],
};

export default seo;
