const seo = {
  title: "Weigh-In Rolling Average & Weight Trend Calculator",
  metaDescription:
    "Smooths daily weigh-ins with a moving average and 0.1 exponential trend, then reports your weekly rate and the calorie balance it implies.",
  steps: [
    "Log each morning in the Date and Weight rows, using \"Add reading\" for more days, then pick Kilograms or Pounds and an \"Averaging window (readings)\" of 3, 5, 7, 10 or 14.",
    "Read \"Weekly rate on the trend line\" with the Latest trend weight, Daily noise (1 std dev), Trend fit R squared and \"Implied energy balance\" rows — everything recomputes as you type.",
    "Check the \"Raw readings against the trend\" chart and \"Reading by reading\" table, then press \"Copy result\" for the summary including the 30-day projection.",
  ],
  intro:
    "A rolling weigh-in average replaces a single noisy scale reading with the average of your last several days, which is the only way to see a change of 0.5 kg a week through daily swings of 1-2 kg. This tool computes a simple moving average over a window you choose, an exponentially weighted trend using the Hacker's Diet smoothing factor of 0.1, and a least-squares weekly rate with an R-squared fit. It then converts that rate into an implied energy balance at about 7,700 kcal per kilogram.",
  useCases: [
    "Decide whether a plateau is real or just three noisy mornings in a row.",
    "Check your actual weekly rate against the 0.5-1% of body weight target before adjusting calories.",
    "Cross-check a food log: if the trend says -300 kcal/day and the app says -700, one of them is wrong.",
    "Show a coach or dietitian a trend line rather than a screenshot of one morning's number.",
  ],
  benefits: [
    ["Two smoothers, not one", "A window average for a plain readable number and an exponential trend that reacts faster to a genuine change of direction."],
    ["Quantified noise", "Reports the standard deviation of readings around the trend, so you know how far off the line is normal for you."],
    ["Honest about short logs", "Flags when the window is incomplete or when the straight-line fit explains too little of the variation to trust yet."],
  ],
  faqs: [
    [
      "Should I use a 7-day average for weight?",
      "Seven days is the usual choice because it covers a full weekly routine — weekday meals, weekend eating, training days and rest days all appear exactly once. Shorter windows react faster but stay noisy; longer windows are smoother but lag a real change by more days.",
    ],
    [
      "Why does my weight go up even though the average is falling?",
      "Because a single reading includes fluid, glycogen and gut contents, which move by a kilogram or more overnight. The moving average cancels most of that out. If your latest reading is further from the trend than your usual daily noise, it is almost certainly fluid.",
    ],
    [
      "What is a moving average versus an exponential trend?",
      "A moving average gives every reading in the window equal weight and drops the oldest one entirely. An exponential trend weights recent readings more heavily and never fully forgets older ones — with a smoothing factor of 0.1 each new reading moves the line one tenth of the way towards itself.",
    ],
    [
      "How many days of weigh-ins do I need before the trend means anything?",
      "At least a week, and ideally two to three. With daily noise of around 0.5 kg and a target rate of 0.5 kg per week, a few days of data cannot separate signal from noise — which is why the R-squared figure here stays low until the log is long enough.",
    ],
  ],
};

export default seo;
