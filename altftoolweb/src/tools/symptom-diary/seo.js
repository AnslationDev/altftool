const seo = {
  intro:
    "This is a symptom diary that records each episode with a 0–10 severity rating alongside the date, time, duration, suspected trigger, medication taken, mood, energy and sleep quality, then charts those entries so patterns become visible. Severity is banded as mild at 3 or below, moderate from 4 to 7 and severe at 8 or above, and the dashboard plots your last 10 entries as a severity trend, breaks entries down by category and trigger, and overlays sleep quality against severity. Everything can be exported as CSV or as a PDF report with the charts and a dated table, which is what you hand to a clinician.",
  useCases: [
    "You get migraines a few times a month and your neurologist asked you to bring a record — log each one with its trigger and severity, then print the PDF the day before the appointment",
    "You suspect a food, screen time or poor sleep is behind recurring stomach or headache episodes, and you want several weeks of entries with triggers attached rather than a vague memory of \"it happens sometimes\"",
    "You started a new medication and want to see whether severity ratings actually trend down over the following month, with each dose noted against the episode it was taken for",
  ],
  benefits: [
    ["Context recorded, not just the symptom", "Every entry carries a trigger from a 15-option list plus mood, energy and sleep-quality scores, which is what makes the later pattern analysis possible."],
    ["Sleep plotted against severity", "The dashboard overlays sleep quality with symptom severity across your recent entries, and flags the average severity of episodes that followed a sleep score of 4 or below."],
    ["A PDF your doctor can actually read", "The export renders the charts as an image followed by a dated table of symptom, category, severity, trigger and medication — appointment-ready without transcribing anything."],
  ],
  faqs: [
    [
      "How does the severity scale work?",
      "It is a 0–10 slider that you set yourself, and the tool groups the results into three bands: 1–3 mild, 4–7 moderate, and 8–10 severe. Consistency matters more than precision — pick a personal anchor for what a 5 feels like and rate against it every time, so the trend line means something.",
    ],
    [
      "How many entries before the patterns are useful?",
      "The insight panel stays quiet until you have at least three logs, and the trend charts show your most recent 10 entries. In practice, a few weeks of consistent logging is what turns a list of bad days into a visible relationship between a trigger, your sleep and how severe the episode was.",
    ],
    [
      "Is my health data sent anywhere?",
      "No. Entries are stored in this browser's localStorage under a single key and never leave the device, which also means clearing site data or switching browsers deletes them — export the CSV periodically if the history matters to you.",
    ],
    [
      "Can this tell me what is wrong with me?",
      "No, and it does not try to. It records what you report and summarises it; it makes no diagnosis and suggests no treatment. Correlations it surfaces — such as worse symptoms after poor sleep — are patterns in your own entries, not medical conclusions, and any recurring, worsening or sudden severe symptom needs a doctor.",
    ],
  ],
};

export default seo;
