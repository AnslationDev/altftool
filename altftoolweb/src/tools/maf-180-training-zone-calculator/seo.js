const seo = {
  title: "MAF 180 Formula Calculator for Aerobic Heart Rate",
  metaDescription:
    "180 minus your age with the -10, -5, 0 or +5 category adjustment: your MAF ceiling, the 10 bpm band under it, and MAF test pace per km and mile.",
  steps: [
    "Enter Age (years) and, optionally, a Resting heart rate, then choose one of the four Health and training category radios worth -10, -5, 0 or +5 bpm, plus a Senior adjustment (0-10 bpm) if it applies.",
    "The MAF heart rate ceiling updates live, with the working shown underneath: starting value 180 - age, category adjustment, senior adjustment applied, and the ceiling as a percentage of heart rate reserve.",
    "Under 'MAF test pace' enter Distance covered (km) and Time taken (minutes) for pace per kilometre, pace per mile and average speed, then press 'Copy result' to save the zone and the pace.",
  ],
  intro:
    "The MAF 180 Formula, devised by Dr Philip Maffetone, produces a maximum aerobic function heart rate: subtract your age from 180, then adjust by −10, −5, 0 or +5 beats depending on illness, injury history and how long you have trained consistently. The result is a ceiling for aerobic base work, not a target to chase, and the training band is the 10 bpm immediately beneath it. This calculator applies the category rules and the age-65-plus allowance, then converts a MAF test run into pace per kilometre and per mile so you can track aerobic progress month to month.",
  useCases: [
    "Set the heart rate cap for a three-month aerobic base block before starting marathon-specific work.",
    "Recalculate your ceiling after a season of consistent injury-free training moves you from category C to category D.",
    "Work out the correct −10 adjustment while you are on medication or returning from surgery.",
    "Log a monthly 8 km MAF test and compare pace at the same heart rate to see whether aerobic fitness is actually improving.",
  ],
  benefits: [
    [
      "Every category rule applied",
      "The four health and training modifiers, the 65-plus allowance and the fixed 165 bpm for under-16s are all built in.",
    ],
    [
      "Shows the arithmetic",
      "Each step of the calculation is listed, so you can see exactly which adjustment produced your number.",
    ],
    [
      "MAF test tracking",
      "Converts distance and time into pace per km, per mile and average speed for repeat testing at the same heart rate.",
    ],
  ],
  faqs: [
    [
      "What is the MAF 180 formula?",
      "Take 180, subtract your age, then apply one adjustment: −10 if recovering from major illness, surgery or on regular medication; −5 if injured, regressing, getting more than two colds a year, or returning after a break; 0 if you have trained consistently at least four times a week for up to two years; +5 if you have trained more than two years with steady improvement and no injury. A 38-year-old in the third group gets 180 − 38 = 142 bpm.",
    ],
    [
      "Is the MAF heart rate a target or a maximum?",
      "It is a maximum. Aerobic base sessions are run at or below it, with the training band conventionally set as the 10 bpm just underneath — 132 to 142 bpm for a 142 bpm ceiling. Going above it for part of a run is what the method is specifically designed to avoid.",
    ],
    [
      "How often should I do the MAF test?",
      "Every three to four weeks. Warm up for 15 minutes, then cover the same course at the same MAF heart rate and record the time. If pace is improving at an unchanged heart rate, aerobic function is improving; if it stalls or slows, the usual causes are too much high-intensity work, poor sleep, or under-recovery.",
    ],
    [
      "Why does my MAF heart rate feel far too easy?",
      "That is the intended effect — the formula deliberately sets a conservative ceiling so training stays below the point where fat oxidation drops off. Many runners have to walk hills for the first few weeks. It is a coaching heuristic rather than a lab-validated threshold, so if the number seems wildly wrong for you, a lactate or gas-exchange test with a sports physician gives a personalised answer.",
    ],
  ],
};

export default seo;
