const seo = {
  title: "Mood Check Questionnaire: Nine Items, Scored 0-27",
  metaDescription:
    "Rate nine low-mood statements 0 to 3 over the last 14 days: total out of 27, bands at 5, 10, 15 and 20. A reflection aid, not a diagnosis.",
  steps: [
    "For each of the nine statements, pick how often it applied over the last 14 days: 0 Not at all, 1 Several days, 2 More than half the days, or 3 Nearly every day.",
    "Set the unscored difficulty question, from Not difficult at all through Extremely difficult, for how much the symptoms affected daily life.",
    "Read the Total score out of 27 with its severity band and the statements marked more than half the days; any self-harm answer above zero raises its own alert.",
  ],
  intro:
    "The Mood Check Questionnaire is a nine-item self-check that asks how often, over the last 14 days, each of nine common low-mood symptoms applied — covering interest, mood, sleep, energy, appetite, self-worth, concentration, restlessness and thoughts of self-harm. Each is rated 0 (not at all) to 3 (nearly every day), giving a total from 0 to 27 with severity bands at 5, 10, 15 and 20, the same cut-points used by the nine-item mood screeners routinely handed out in primary care. It is a reflection aid, not a diagnosis, and everything you enter stays in your browser.",
  useCases: [
    "Putting words to a vague sense of feeling off before a GP appointment, so you can describe specifics rather than 'I've been low'.",
    "Re-running the same nine questions each month to see whether a change in sleep, work or medication is shifting anything.",
    "Checking which single symptoms are showing up more than half the days, which is often more useful than the total alone.",
    "Helping a friend or family member decide whether what they are describing is worth taking to a professional.",
  ],
  benefits: [
    ["Scored the standard way", "Nine items, 0-3 each, banded at 5, 10, 15 and 20 — the widely used cut-points, not an invented scale."],
    ["Item-level detail", "Highlights every statement you rated 'more than half the days' so the pattern, not just the number, is visible."],
    ["Private by design", "Runs entirely in your browser: no account, no server, nothing stored or sent anywhere."],
  ],
  faqs: [
    [
      "What score on a nine-item mood questionnaire means depression?",
      "No score diagnoses depression. On the standard 0-27 scale, 0-4 is minimal, 5-9 mild, 10-14 moderate, 15-19 moderately severe and 20-27 severe, and 10 is the point at which clinicians usually suggest a full assessment. Diagnosis depends on a clinical interview, how long symptoms have lasted and their effect on your life.",
    ],
    [
      "How often should I retake this mood check?",
      "The questions ask about the last two weeks, so retaking it more often than fortnightly mostly measures noise. Monthly is a reasonable rhythm for tracking, or before and after a specific change such as starting therapy or adjusting a medication with your doctor.",
    ],
    [
      "I scored low but answered yes to the self-harm question. Does that matter?",
      "Yes, and it matters more than the total. Any answer above zero on that item is treated as a flag on its own, because someone can report few other symptoms and still be at risk. Please talk to a doctor, a crisis line or someone you trust today rather than waiting to see whether the score rises.",
    ],
    [
      "Is my data saved or shared?",
      "No. The scoring runs in JavaScript in your own browser, no answers are transmitted to a server, and nothing is written to an account. Closing or refreshing the page clears everything, so copy the result if you want to take it to an appointment.",
    ],
  ],
};

export default seo;
