const seo = {
  title: "AI Usage Journal: First-Pass Rate & Time Saved",
  metaDescription:
    "Log each AI task with one of five outcomes weighted 1.0 to 0, and get an effectiveness score out of 100, a first-pass rate and net minutes saved.",
  steps: [
    "Under Log a task fill What did you ask for?, Date, Assistant or model, Attempts / re-prompts, Minutes spent on the AI and Minutes it saved you.",
    "Pick the Outcome — Used as-is, Light edit, Heavy rewrite, Redone from scratch or Abandoned — and press Add entry.",
    "Read Net time saved in hours with the First-pass rate (used as-is, one attempt) and Effectiveness score rows, then press Copy result to take the summary and the tab-separated entries.",
  ],
  intro:
    "AI Usage Journal is a running log of the tasks you hand to an AI assistant, scored so you can see how often the output ships untouched and how much time it really saves. Each entry records the task, the model, the number of re-prompts and one of five outcomes — used as-is, light edit, heavy rewrite, redone from scratch, abandoned — which are weighted 1.0, 0.75, 0.4, 0.15 and 0 to produce an effectiveness score out of 100. Useful for anyone who has to justify an AI subscription, choose between assistants, or find the task types where the tool is quietly costing more time than it saves.",
  useCases: [
    "Track a two-week trial of a paid assistant and check whether the net minutes saved cover the subscription cost.",
    "Compare two models on the same kind of work by logging each under its own name and reading the per-assistant table.",
    "Spot the task categories where you always re-prompt three or four times, and stop using AI for those.",
    "Take a first-pass rate and hours-saved figure into a team retro instead of an impression that AI 'helps a bit'.",
  ],
  benefits: [
    ["Honest scoring", "A heavy rewrite counts as 0.4 of a completed task, not a success, so the score reflects real rework."],
    ["Net, not gross", "Time saved is reported after subtracting the minutes you spent prompting and re-prompting."],
    ["Stays on your device", "Entries are saved in this browser's local storage and are never uploaded."],
  ],
  faqs: [
    [
      "What is a good first-pass rate for AI output?",
      "There is no published benchmark, which is exactly why logging your own baseline matters. In this journal a task counts toward the first-pass rate only when it was used as-is on the first attempt, so a rate of 40-60% on well-scoped tasks is already a strong result, while long-form or highly specific work usually lands much lower.",
    ],
    [
      "How should I estimate 'minutes it saved me'?",
      "Estimate how long the task would have taken you from a blank page, then record that figure. The journal subtracts the minutes you spent prompting, so an entry with 45 minutes saved and 15 minutes spent nets 30 minutes — if you cannot honestly say the unaided version would have taken longer, record zero.",
    ],
    [
      "How is the effectiveness score calculated?",
      "It is the average outcome weight across all entries, multiplied by 100. Used as-is scores 1.0, light edit 0.75, heavy rewrite 0.4, redone from scratch 0.15 and abandoned 0, so three tasks scored 1.0, 0.75 and 0.15 give an average of 0.633 and a score of 63.3 out of 100.",
    ],
    [
      "Is my journal data private?",
      "Yes. Entries live in your browser's local storage on this device only, with no account and no server copy. Clearing site data or using a private window will remove them, so use the copy button to export the tab-separated table if you need a durable record.",
    ],
  ],
};

export default seo;
