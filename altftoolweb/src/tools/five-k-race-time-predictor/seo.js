const seo = {
  title: "5K Race Time Predictor Using the Riegel Formula",
  metaDescription:
    "Convert a recent race into a predicted 5K finish with Riegel's T2 = T1 × (D2/D1)^1.06, plus per-km target pace, even splits and equivalent times.",
  steps: [
    "Enter your 'Recent race distance (km)' with its Hours, Minutes and Seconds, or tap a preset from 1500 m up to Marathon.",
    "The prediction recalculates instantly with Riegel's 1.06 exponent, and a warning appears when the source race is more than about four times the 5K distance.",
    "Read the 'Predicted 5K time' with pace per km and per mile, the 'Even-pace splits for 5 km' table and 'Equivalent times at other distances'; press 'Copy result' to copy the summary.",
  ],
  intro:
    "The 5K Race Time Predictor converts a recent race or time trial into a projected 5K finish time using Pete Riegel's endurance formula, T2 = T1 x (D2/D1)^1.06. The 1.06 exponent encodes the roughly 6% slowdown per doubling of distance seen in real race results, so a 50:00 10K projects to about 23:59 for 5 km. Alongside the prediction you get target pace per kilometre and per mile, even-pace kilometre splits to run to, and equivalent times from 1500 m up to the marathon.",
  useCases: [
    "Turn last month's 10K result into a realistic 5K goal time before parkrun.",
    "Set a per-kilometre target pace for a 5K time trial instead of guessing off feel.",
    "Check whether a half marathon time suggests your 5K speed has stalled.",
    "Print even-pace splits to write on your hand or load into a watch alert.",
  ],
  benefits: [
    ["Published formula", "Uses Riegel's 1.06 exponent, the standard method behind most race equivalency charts."],
    ["Pace you can run to", "Gives per-km and per-mile pace plus a full split table, not just a finish time."],
    ["Reliability warning", "Flags predictions where the source race is more than four times the target distance."],
  ],
  faqs: [
    [
      "How do you predict a 5K time from a 10K?",
      "Multiply the 10K time by (5/10)^1.06, which is about 0.4796. A 50:00 (3000 second) 10K therefore predicts roughly 23:59 for 5K. That is the Riegel formula, and it assumes similar conditions and that you are trained for both distances.",
    ],
    [
      "How accurate is the Riegel race predictor?",
      "It is generally within a couple of percent when the two distances are within a factor of about four and the runner has the endurance base for both. It tends to be optimistic when predicting much longer races from short ones, because it does not model glycogen depletion or the extra training a marathon requires.",
    ],
    [
      "What pace do I need to run for a sub-25 minute 5K?",
      "Sub-25:00 for 5 km means holding under 5:00 per kilometre, or about 8:03 per mile. Sub-30:00 needs under 6:00 per kilometre, and sub-20:00 needs under 4:00 per kilometre.",
    ],
    [
      "Should I run 5K at even pace or start fast?",
      "Even or very slightly negative pacing produces the best times for most runners over 5 km, because going out fast pushes you past threshold early and costs more in the last kilometre than it gains in the first. Use the split table as a ceiling for the first kilometre rather than a target to beat.",
    ],
  ],
};

export default seo;
