const seo = {
  title: "AI Time Saved Calculator: Before and After",
  metaDescription:
    "Weekly and annual hours saved by AI from your own before/after timings and runs per week over 46 working weeks. Tasks that got slower show as negative.",
  steps: [
    "Fill Task 1 name and enter Before AI (minutes per run), With AI (minutes per run) and Times per week, counting the time spent reviewing AI output in the \"with AI\" figure.",
    "Use Add task for each extra task and Remove to drop one, then set Working weeks per year — 46 by default, which is 52 minus leave and holidays.",
    "Hours saved per week appears at the top; the breakdown lists each task's min/wk with the percentage faster or slower, then the annual hours and full-working-day equivalent, and Copy result copies it.",
  ],
  intro:
    "The AI Time Saved Calculator estimates weekly and annual hours saved by AI using the before/after task-timing method: (minutes before − minutes with AI) × runs per week, summed across tasks and multiplied by your working weeks per year (default 46). Because it works from measured timings rather than vendor productivity multipliers, it also handles the honest case where a task got slower with AI. It is built for individuals and team leads who want a defensible savings number for a review, business case or renewal decision.",
  useCases: [
    "A support lead timing routine email replies before and after adopting an AI drafting tool to quantify the team's weekly saving",
    "An analyst preparing a renewal case who needs total annual hours saved across five recurring tasks, expressed in working days",
    "A sceptical manager checking whether a task that now needs heavy AI-output review is actually a net time loss",
  ],
  benefits: [
    ["Measured, not assumed", "Savings come from your own before/after timings per task — the same method time-and-motion studies use."],
    ["Multi-task totals", "Add any number of tasks; the tool sums weekly minutes and converts to annual hours and 8-hour-day equivalents."],
    ["Negative savings visible", "A task that got slower shows a negative row instead of being silently dropped from the total."],
  ],
  faqs: [
    [
      "How do I measure how much time AI actually saves me?",
      "Time the same task twice — once the old way, once with AI, including the time spent reviewing and fixing AI output — then multiply the difference by how often you do the task each week. That before/after pairing is exactly what this calculator computes; it is far more reliable than estimating a percentage improvement from memory.",
    ],
    [
      "How many hours a week does AI save on average?",
      "Published workplace studies mostly land in the range of 1 to 5 hours per week for regular users, but the spread across roles is enormous, which is why an average is a poor planning number. Measure your own tasks: three routine tasks with solid timings beat any benchmark figure.",
    ],
    [
      "Why does the calculator use 46 working weeks per year instead of 52?",
      "Because nobody works 52 weeks: subtracting typical annual leave, public holidays and sick days from 52 calendar weeks leaves roughly 46 working weeks for a full-time role. Multiplying weekly savings by 52 would overstate the annual figure by about 13%; the field is adjustable if your number differs.",
    ],
    [
      "Should I include AI review time in the 'after' timing?",
      "Yes — always. The honest 'after' number is the full cycle: prompting, generation, reviewing and correcting the output. Skipping review time is the most common way AI savings get overstated, and it is also how tasks that are net-slower with AI get missed; this tool shows those as negative savings.",
    ],
  ],
};

export default seo;
