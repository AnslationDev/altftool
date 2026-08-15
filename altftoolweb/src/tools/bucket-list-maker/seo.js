const seo = {
  title: "Bucket List Goal Planner with Target-Date Countdown",
  intro:
    "The Bucket List Goal Planner turns one bucket-list ambition and a target date into a live countdown, showing exactly how many days are left — or how many days the goal is already overdue. Enter the goal and the date you want it done by and it returns the formatted target, the day count, and a three-step starting plan: break it into three milestones, set a monthly reminder, and check progress weekly. It is for the goal that has been sitting on a list for years without a date attached to it.",
  useCases: [
    "\"Visit Japan\" has been on your list since 2019 and you finally want to pin it to a spring date and see how many days that actually leaves you to save.",
    "You are planning a marathon, a diving certificate or a road trip and need the day count to work backwards into a training or savings schedule.",
    "You are reviewing an old list at New Year and want to see which items are already past their date so you can either re-commit or drop them.",
  ],
  benefits: [
    ["Forces a date onto the goal", "An undated wish never competes for time; attaching a target converts it into a countdown you can actually plan against."],
    ["Says when you are already late", "If the target has passed, the tool reports the number of days overdue rather than quietly showing zero."],
    ["Hands you the first three steps", "Instead of stopping at the number, it returns a starting structure — three milestones, a monthly reminder, a weekly check — so the goal has somewhere to go next."],
  ],
  faqs: [
    [
      "How many days do I have left to reach my goal?",
      "The planner subtracts today's date from your target date and rounds up to whole days, so a target 18 months out shows roughly 548 days. If the target date is in the past, it reports the same figure as days overdue instead.",
    ],
    [
      "How should I break a bucket-list goal into milestones?",
      "Split it into three checkpoints spaced across your countdown — for a trip, that is typically money saved, dates booked, and everything reserved. Three is enough to show progress without turning the goal into a project plan you abandon.",
    ],
    [
      "What makes a realistic target date for a bucket-list item?",
      "Work backwards from the constraint that moves slowest, usually money or training time rather than availability. If the total cost divided by what you can genuinely set aside each month lands beyond your date, move the date rather than the budget.",
    ],
    [
      "Can I plan more than one goal at a time?",
      "The planner handles one goal and one target date per run, so change the goal and date to price a second item. Keeping bucket-list goals to two or three live at once is usually what makes any of them finish.",
    ],
  ],
};

export default seo;
