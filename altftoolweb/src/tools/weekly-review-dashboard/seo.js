const seo = {
  intro:
    "A weekly review dashboard grades the week you just finished: each goal is scored on the OKR 0.0-1.0 scale (actual divided by target, capped at 1.0), the scores are combined using the weight you gave each goal, and the result sits alongside task completion and the gap between hours planned and hours actually worked. It is for anyone running a personal or team weekly review who wants a number they can compare week to week, not just a feeling.",
  useCases: [
    "Turn Friday's review into a two-minute manager update with per-goal scores and a written focus for next week",
    "Notice that you consistently plan 40 hours and work 52, then fix the estimate rather than the effort",
    "Track whether your weekly score is drifting up or down across a quarter instead of guessing",
  ],
  benefits: [
    ["Weighted, not averaged", "A goal you marked weight 5 moves the score five times as much as a weight-1 goal."],
    ["Overshoot is capped", "Hitting 150% of a target still scores 1.00, so one easy win cannot mask a missed priority."],
    ["Exportable and local", "Copy a markdown summary in one click; everything autosaves to your own browser, not a server."],
  ],
  faqs: [
    [
      "What is a good weekly OKR score?",
      "0.6 to 0.7. Google's re:Work guidance treats that band as the expected landing zone for ambitious objectives — consistently scoring 1.0 is a sign the goals were set too safely, and anything under 0.4 counts as a genuine miss worth investigating.",
    ],
    [
      "How is the overall score calculated?",
      "Each goal scores actual divided by target, capped at 1.0. Those scores are then averaged with the weights as multipliers: three goals scoring 0.80 (weight 3), 0.50 (weight 1) and 1.00 (weight 1) give (2.40 + 0.50 + 1.00) divided by 5 = 0.78.",
    ],
    [
      "Why is a goal capped at 1.0 when I exceeded it?",
      "Because an uncapped score lets one runaway win paper over a missed priority — delivering 300% of an easy goal would drag the week's average above target on its own. The raw ratio is still recorded, so you can see the overshoot; it just does not inflate the grade.",
    ],
    [
      "When does the tool flag my time estimates?",
      "When you work more than 25% above the hours you planned. On a 40-hour plan that means anything over 50 hours, and the warning quotes the exact overrun in hours so you can size the correction for next week.",
    ],
  ],
};

export default seo;
