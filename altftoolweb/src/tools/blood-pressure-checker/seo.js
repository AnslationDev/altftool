const seo = {
  title: "Blood Pressure Checker – ACC/AHA Categories & Trends",
  metaDescription:
    "Log systolic and diastolic readings, see each labelled Normal, Elevated, Stage 1 or Stage 2, and plot both on one trend chart. Data stays in the page.",
  intro:
    "The Blood Pressure Checker logs systolic and diastolic readings, labels each one against the ACC/AHA categories — Normal, Elevated, Stage 1 and Stage 2 hypertension — and plots both numbers as a trend line so you can see the pattern rather than a single measurement. Every reading is timestamped as you add it and the two series are charted together in mmHg. It is for people who take readings at home and want the numbers organised before a doctor's appointment, not a diagnosis.",
  useCases: [
    "Your GP asked you to bring a week of home readings, so you log morning and evening measurements and show the chart rather than a scribbled list.",
    "You started a new medication and want to see whether the afternoon numbers are genuinely drifting down or just bouncing around.",
    "You got one alarming reading at a pharmacy machine and want to see how it compares once you have taken three more sitting quietly at home.",
  ],
  benefits: [
    ["Each reading is categorised as you enter it", "The label uses the standard thresholds rather than leaving you to look up whether 132 over 84 counts as elevated or Stage 1."],
    ["Systolic and diastolic plotted together", "Both lines share one time axis, which makes it obvious when only one of the two numbers is moving — something a list of pairs hides."],
    ["Nothing leaves the page", "Readings stay in the browser session, so there is no account, no upload and no health record held anywhere."],
  ],
  faqs: [
    [
      "What is a normal blood pressure reading?",
      "Under 120 systolic and under 80 diastolic, by the ACC/AHA categories this tool uses. Elevated is 120-129 systolic with diastolic still under 80; Stage 1 hypertension is 130-139 or 80-89; Stage 2 is 140 or higher, or 90 or higher.",
    ],
    [
      "How should I take a reading so it is accurate?",
      "Sit quietly with your back supported and feet flat for 5 minutes first, and avoid caffeine, smoking or exercise for at least 30 minutes beforehand. Keep the cuff at heart level and do not talk during the measurement — talking alone can add several mmHg.",
    ],
    [
      "Are my readings saved if I close the tab?",
      "No. Readings live in the page session only, so refreshing or closing the tab clears them. Note the numbers down or take a screenshot of the chart if you need to keep a record between sessions.",
    ],
    [
      "One high reading — should I worry?",
      "A single high reading is not a diagnosis; blood pressure varies through the day and with stress, so clinicians look at an average across several readings on different days. Seek urgent medical care if a reading is 180/120 or above, or if you have chest pain, breathlessness or vision changes — and discuss any persistent elevation with your doctor.",
    ],
  ],
};

export default seo;
