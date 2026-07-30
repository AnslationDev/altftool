const seo = {
  intro:
    "The Diabetes Management Dashboard logs blood glucose readings in mg/dL or mmol/L and turns them into an average, a highest and lowest, a time-in-target percentage against your own range, and an estimated HbA1c using the ADAG relationship A1c = (average glucose + 46.7) ÷ 28.7. Each entry can also carry the reading type, carbs, water, exercise minutes and a note, so patterns show up next to the numbers that caused them. It is a self-monitoring and educational log for people tracking their own readings between appointments — it is not a medical device and does not replace your care team.",
  useCases: [
    "You have an endocrinologist appointment in three weeks and want a clean record of every reading, plus the average and time-in-range figures, to show instead of a handful of remembered numbers.",
    "Your meter reports in mmol/L but your clinic talks in mg/dL, so you log in whichever unit the device shows and let the dashboard normalise everything for the averages.",
    "You suspect late-evening meals are pushing your morning fasting readings up, so you log carbs and exercise alongside each reading and look at the entries together.",
  ],
  benefits: [
    ["Estimated A1c from your own log", "Applies the established eAG relationship (eAG = 28.7 × A1c − 46.7) to your logged average instead of leaving you to guess between lab tests."],
    ["Time in target against your range", "Scores readings against the target minimum and maximum you set with your clinician, not a generic band, and flags 70% as the point the figure reads as good."],
    ["Both units, one set of statistics", "Accepts mg/dL and mmol/L entries in the same log and converts mmol/L at the standard ×18 factor before averaging."],
  ],
  faqs: [
    [
      "How is estimated HbA1c calculated from average glucose?",
      "It inverts the ADAG study formula eAG = (28.7 × A1c) − 46.7, so A1c = (average glucose in mg/dL + 46.7) ÷ 28.7. An average of 154 mg/dL works out to roughly 7.0%.",
    ],
    [
      "Is an estimated A1c the same as a lab test?",
      "No — it is an estimate from the readings you happened to log, so it is only as representative as your testing pattern, and it cannot account for red-blood-cell conditions or anaemia that affect a real HbA1c. Only a laboratory HbA1c ordered by your doctor is diagnostic.",
    ],
    [
      "What blood sugar range should I aim for?",
      "The American Diabetes Association generally suggests 80–130 mg/dL (4.4–7.2 mmol/L) fasting or before meals, under 180 mg/dL (10.0 mmol/L) one to two hours after eating, and an HbA1c below 7% for many non-pregnant adults. Targets vary with age, diabetes type and other conditions, so set the range in your profile to the one your doctor gave you.",
    ],
    [
      "Where is my health data stored?",
      "In your own browser's local storage on this device — your profile and every log entry stay on the machine you entered them on and are never sent to a server. Clearing site data or switching browsers removes them, so export or note anything you need to keep.",
    ],
  ],
};

export default seo;
