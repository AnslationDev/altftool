const seo = {
  intro:
    "The Blood Pressure Log records each cuff reading with its date, time, pulse, arm and posture, labels it against the 2017 AHA/ACC categories, and averages your readings over the last 7 and 30 days plus a separate morning and evening average. It is meant for anyone whose doctor asked them to monitor at home for a couple of weeks: instead of a paper slip of loose numbers you get a trend chart, a category breakdown, and a printable sheet. Readings live in your browser only, and the log records rather than diagnoses — hypertension is a diagnosis a clinician makes.",
  useCases: [
    "Your doctor asked for two weeks of home readings before deciding on medication, and you want to arrive with a printed sheet showing the 7-day and 30-day averages instead of a phone full of screenshots.",
    "You suspect white-coat hypertension because clinic readings run far higher than home ones, and you need a dated record of both to show the gap is real.",
    "You started a new tablet three weeks ago and want to see whether your morning average has actually moved, using the note field to mark the day the dose changed.",
  ],
  benefits: [
    [
      "Averages, not single numbers",
      "Computes 7-day, 30-day, morning and evening averages, which is what treatment decisions are actually based on.",
    ],
    [
      "Splits morning from evening",
      "Groups readings before noon separately from those after, so a morning-heavy pattern shows up instead of being averaged away.",
    ],
    [
      "Prints as a clinic handout",
      "One click produces a plain sheet with your name, the averages table, the category spread and every reading — designed to be handed over, not scrolled.",
    ],
  ],
  faqs: [
    [
      "What counts as high blood pressure at home?",
      "Under the 2017 AHA/ACC categories used here, 130-139 systolic or 80-89 diastolic is Stage 1 hypertension, and 140 or higher or 90 or higher is Stage 2. Normal is below 120 and below 80, with 120-129 over a diastolic under 80 counted as Elevated. Home averages are usually judged slightly lower than clinic readings, so bring the log to your doctor rather than self-diagnosing from it.",
    ],
    [
      "If only one of my two numbers is high, which category do I get?",
      "The worse of the two numbers decides, because the guideline joins the thresholds with 'or'. A reading of 135/75 is Stage 1 on the systolic alone, and 118/92 is Stage 2 on the diastolic alone — the log applies exactly that rule.",
    ],
    [
      "What blood pressure means I should get help right away?",
      "180 systolic or higher, and/or 120 diastolic or higher, is the hypertensive crisis range. Sit quietly for five minutes and repeat the measurement; if it stays that high, get medical help immediately, and do not wait to re-measure at all if you also have chest pain, breathlessness, weakness, trouble speaking or vision changes.",
    ],
    [
      "How do I take a reading that is actually worth logging?",
      "Sit still for five minutes with your back supported, feet flat and the cuff on bare skin at heart level, then take two readings a minute apart and log the average. Technique errors move a reading by 10-20 mmHg — crossed legs alone can add about 8 mmHg and a full bladder roughly 10 — which is more than many medications shift it.",
    ],
  ],
};

export default seo;
