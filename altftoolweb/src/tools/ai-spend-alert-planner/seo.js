const seo = {
  title: "AI Spend Alert Planner: Thresholds & Trip Dates",
  metaDescription:
    "Projects month-end AI spend from your run rate and shows the day each alert threshold trips, with a named owner and action per level plus spike detection.",
  steps: [
    "Enter your monthly AI budget, spend so far this month, today's day of the month and the biggest single day so far, in USD, EUR, GBP or INR.",
    "List \"Alert thresholds (% of budget)\" — the default ladder is 50, 75, 90, 100 — and owners in escalation order, comma separated.",
    "Read the projected month-end spend and the Alert thresholds table showing the day each level trips with its owner and action; \"Copy plan\" exports it.",
  ],
  intro:
    "The AI Spend Alert Planner projects where a monthly AI budget will land and tells you which day each alert threshold is due to trip. It uses the linear run-rate method billing consoles use — daily burn equals spend to date divided by days elapsed, projected month equals daily burn times days in the month — and solves each threshold for the day it is crossed. Alongside the numbers it assigns a named owner and a concrete action to every level, because an alert nobody owns is just a notification.",
  useCases: [
    "Set 50/75/90/100% budget alerts on a new AI project and decide in advance who acts on each.",
    "Explain to a finance partner mid-month why the current run rate ends the month over budget.",
    "Spot that a single backfill day cost more than 1.5 times the daily average and needs its own spike alert.",
    "Work out the maximum safe daily spend for the rest of the month after an unexpected usage jump.",
  ],
  benefits: [
    ["Threshold trip dates", "Not just 'you will overspend' but the day number each alert level is projected to fire."],
    ["Owners and actions", "Every threshold carries a named owner and a specific response, from log-it to hard cap."],
    ["Spike detection", "Flags when one day is more than 1.5 times the daily average, which monthly alerts always miss."],
  ],
  faqs: [
    [
      "How do I forecast this month's AI spend?",
      "Divide spend to date by the number of days elapsed to get the daily burn, then multiply by the days in the month. At 2,200 spent by day 12 of a 30-day month the burn is 183.33 a day, so the projection is 5,500 — 110% of a 5,000 budget, with three weeks still to run.",
    ],
    [
      "What alert thresholds should I set on an AI budget?",
      "50%, 75%, 90% and 100% of budget is the common ladder, with escalating owners: an FYI at 50%, an investigation at 75%, a freeze on new experiments at 90%, and hard per-key caps at 100%. Add a separate daily alert, because a monthly threshold cannot catch a single runaway job in time.",
    ],
    [
      "Why did our AI bill spike without more users?",
      "Cost scales with tokens, not headcount. Longer context windows, retries, agent loops that call the model repeatedly, a switch to a more expensive model, and batch backfills all raise spend with the same user count — which is why a day costing more than 1.5 times the daily average deserves an alert of its own.",
    ],
    [
      "Who should own an AI budget alert?",
      "Name an individual per threshold rather than a channel, escalating from the person closest to the workload up to the budget holder. This planner assigns your listed owners in escalation order, so the 100% alert reaches whoever can actually authorise a cap or a spend increase.",
    ],
  ],
};

export default seo;
