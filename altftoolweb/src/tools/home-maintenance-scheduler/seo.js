const seo = {
  intro:
    "This scheduler turns a list of recurring home maintenance jobs into dated actions by adding each task's frequency interval to the date you last did it — weekly 7 days, biweekly 14, monthly 30, quarterly 90, half-yearly 182, yearly 365 — and flagging anything past due as Overdue and anything landing within 7 days as Due Soon. Enter a task's category, frequency, last completion date, estimated hours and cost, and you get a status for every job, a ranked next-actions list, a month-by-month view of when the work clusters, and an annualised budget. It is built for homeowners and landlords who want the servicing calendar and its cost in one place.",
  useCases: [
    "Moving into a new house and needing to know when the AC filter, water tank and smoke detectors are next due, starting from whatever dates the previous owner gave you",
    "Setting next year's household budget by seeing that a quarterly job at Rs 1,500 is really Rs 6,000 a year once the frequency is multiplied out",
    "Spotting that four jobs all land in the same month, so you can pull one forward rather than lose a whole weekend and pay two call-out charges",
  ],
  benefits: [
    ["Due dates are computed, not typed", "You record when a job was last done and the frequency; the next due date and its Overdue / Due Soon / Scheduled status follow automatically."],
    ["Safety work rises to the top", "The next-actions ranking scores overdue tasks highest and adds weight to anything in the safety category, so smoke detectors do not sit below cosmetic jobs."],
    ["Per-cycle and annual cost side by side", "Each estimate is multiplied by its yearly frequency, turning scattered small amounts into a single maintenance budget figure."],
  ],
  faqs: [
    [
      "How is the next due date calculated?",
      "Last completed date plus the frequency in days: 7 for weekly, 14 biweekly, 30 monthly, 90 quarterly, 182 half-yearly and 365 yearly. Leave the last-completed field blank and the task shows as Need Date, because there is no anchor to count from.",
    ],
    [
      "What is the difference between Overdue and Due Soon?",
      "Overdue means the computed due date is already in the past; Due Soon means it falls within the next 7 days inclusive. Anything further out is Scheduled, and ticking the completed box moves a task to Completed and drops it out of the next-actions list.",
    ],
    [
      "How is the annual budget worked out?",
      "Each task's estimated cost is multiplied by how many times it recurs in a year — 52 weekly, 26 biweekly, 12 monthly, 4 quarterly, 2 half-yearly, 1 yearly — and the results are added. The separate current-cycle figure is the plain sum of the estimates, i.e. what one round of every task costs.",
    ],
    [
      "Is my plan saved if I close the tab?",
      "No — the task list lives in the page while it is open, so use Export JSON to keep it. That file holds every task with its category, frequency, dates, hours, cost and notes, which is also how you move the plan to another device.",
    ],
  ],
};

export default seo;
