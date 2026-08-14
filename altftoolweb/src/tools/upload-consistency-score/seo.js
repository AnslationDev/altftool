const seo = {
  title: "Upload Consistency Score: Rate Your Posting Cadence",
  metaDescription:
    "Paste your publish dates for a 0-100 score built from gap adherence, coefficient of variation and pace, plus every silence over 2.5x your target.",
  steps: [
    "Paste your publish dates into the Upload dates field, one YYYY-MM-DD date per line.",
    "Set Target gap between uploads (days) and Tolerance either side (days); the score recomputes from adherence at weight 0.5, regularity 0.3 and pace 0.2.",
    "Read the score out of 100 with the average gap, standard deviation and coefficient of variation, then check the Gap by gap table where each row reads on schedule, off schedule or silence.",
  ],
  intro:
    "Upload Consistency Score turns a list of publish dates into a 0-100 index built from three measurable parts: the share of gaps that land inside your target cadence, the evenness of those gaps measured as one minus the coefficient of variation, and how the average gap compares with the schedule you set. It also names every silence longer than two and a half times your target, which is where audience habit usually breaks. For creators and newsletter writers who suspect their schedule is slipping but want the number rather than the feeling.",
  useCases: [
    "Audit a year of uploads to see whether a weekly channel is genuinely weekly.",
    "Find the specific gaps that broke momentum before a drop in views or subscribers.",
    "Compare two quarters to check whether a new production process actually steadied the schedule.",
    "Set a realistic cadence by seeing what your average gap has actually been rather than what you intended.",
  ],
  benefits: [
    ["Reproducible score", "The three components and their weights are shown, so the number can be checked by hand."],
    ["Dispersion, not just averages", "Standard deviation and coefficient of variation catch a schedule that averages out but swings wildly."],
    ["Silences named", "Every gap over 2.5x your target is listed with its dates, so you can line it up against your analytics."],
  ],
  faqs: [
    [
      "How consistent do I need to be on YouTube?",
      "There is no algorithmic penalty for an irregular schedule, but a predictable one helps viewers form a habit and helps you plan production. Judge it against the cadence you promised your audience rather than a universal number.",
    ],
    [
      "How is the consistency score calculated?",
      "Half the score comes from the share of gaps within your tolerance of the target, 30% from regularity — one minus the coefficient of variation of the gaps — and 20% from pace, the target divided by the average gap and capped at 1. All three are shown separately.",
    ],
    [
      "What is the coefficient of variation of upload gaps?",
      "It is the standard deviation of the gaps divided by their mean, so it measures spread relative to size. Gaps of 7, 7, 7 and 14 days have a mean of 8.75 and a standard deviation of about 3.03, giving a coefficient of variation of 0.35.",
    ],
    [
      "Does missing one upload really matter?",
      "One missed slot barely moves the score; a repeated pattern of long silences does, because it is dispersion rather than a single gap that makes a schedule unpredictable. The gap-by-gap table shows which category yours falls into.",
    ],
  ],
};

export default seo;
