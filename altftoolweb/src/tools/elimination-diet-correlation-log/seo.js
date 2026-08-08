const seo = {
  title: "Elimination Diet Log: Average Severity per Food",
  metaDescription:
    "Paste a diary as date | foods | symptom | severity 0-10 | hours after; get appearances, mean severity and symptoms per food. Co-occurrence, not cause.",
  steps: [
    "Type one dated observation per line into \"Food and reaction log\" using the hinted format — date | foods (comma-separated) | symptom | severity 0–10 | hours after — for example 2026-07-20 | Milk, oats | Bloating | 6 | 3.",
    "Set \"Minimum food appearances\" to drop foods logged fewer times than that, or press the \"Example log\" button in the Examples strip to refill the box with a three-day sample.",
    "Read the table of Food, Appearances, Average entered severity and Symptoms noted, sorted highest average first, above the Log entries and Foods meeting minimum counts; Copy takes the summary and Download saves elimination-diet-correlation-log.txt.",
  ],
  intro:
    "Elimination Diet Correlation Log turns a pipe-separated food and symptom diary into a per-food summary: how many times each food appeared, the average severity you recorded on those days, and which symptoms were noted alongside it. Each line is entered as date | foods | symptom | severity 0–10 | hours after, foods are split on commas and matched case-insensitively, and the table is sorted by highest average severity with a minimum-appearances filter so single mentions do not dominate. It surfaces co-occurrence only — it is not a diagnosis, and elimination diets should be planned with a clinician or registered dietitian, particularly for children, pregnancy, chronic illness or severe reactions.",
  useCases: [
    "You have kept a three-week food diary in a notes app and want to see which foods keep appearing on the days you recorded the worst symptoms, before your gastroenterology appointment.",
    "A dietitian has asked you to reintroduce foods one at a time and you need a tidy summary of appearances and average severity per food to bring to the review.",
    "You suspect dairy but want to check whether the pattern holds up or whether tea, oats or something else shows the same co-occurrence in your own log.",
  ],
  benefits: [
    [
      "Ranks by average severity, not raw frequency",
      "A food you eat daily does not float to the top just for being common — the ordering uses mean recorded severity across the days it appeared.",
    ],
    [
      "A noise filter you control",
      "The minimum-appearances setting hides foods logged fewer times than you specify, so one-off meals stop crowding out the repeated patterns.",
    ],
    [
      "States its own limits",
      "The output is labelled as co-occurrence with no causal claim, and prompts you to record portion, timing, medication, sleep and illness as confounders.",
    ],
  ],
  faqs: [
    [
      "What format should each log line be in?",
      "Date | foods | symptom | severity | hours after — for example '2026-07-20 | Milk, oats | Bloating | 6 | 3'. Foods are comma-separated inside their field, severity is a 0–10 number that is clamped to that range, and each line is one dated observation.",
    ],
    [
      "How is the average severity per food worked out?",
      "It is the total of the severity values you entered on every line containing that food, divided by the number of those lines, shown to one decimal place. A food logged twice with severity 6 and 5 shows 5.5 across 2 appearances.",
    ],
    [
      "Does a high score mean that food is causing my symptoms?",
      "No. The table shows only how often a food and a symptom were recorded together, which cannot separate a trigger from a coincidence or from a confounder like sleep, stress, medication or portion size. Confirming a genuine trigger requires a structured reintroduction supervised by a clinician or dietitian.",
    ],
    [
      "Is it safe to cut foods out based on this log?",
      "Broad or prolonged restriction risks nutritional deficiency and, in some cases, loss of tolerance, so treat the summary as a prompt for a professional conversation rather than a plan. Anyone with severe reactions, suspected anaphylaxis, or who is pregnant, a child, or managing a chronic condition should involve a qualified clinician before removing any food group.",
    ],
  ],
};

export default seo;
