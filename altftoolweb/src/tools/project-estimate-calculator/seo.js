const seo = {
  title: "Project Estimate Calculator - Cost & Delivery Date",
  metaDescription:
    "Turn task hours into a quote - per-task costs, a priced contingency buffer, and a weekday delivery date from the hours you can really give each week.",
  steps: [
    "List the work under Tasks — press Add task and give each row a name and Hours (the defaults model a website build: Discovery and planning, Design, Build, Testing and revisions).",
    "Set Hourly rate (INR), Contingency buffer (%), Hours available per week and a Start date; the estimate recalculates as you type.",
    "Read the 'Quote this project at' total with the per-task Hours/Share/Cost table and the weekdays-only Estimated delivery date, then press Copy result.",
  ],
  "intro": "Project Estimate Calculator turns a task list into a quote and a delivery date. Enter the hours you expect each piece of work to take, set your hourly rate and a contingency buffer, and it returns the cost before and after the buffer, the total hours, and a finish date based on the hours you can actually give the project each week. Built for freelancers, agencies and studios who need a defensible number rather than a gut-feel figure.",
  "useCases": [
    "Price a website build by breaking it into discovery, design, build and testing hours.",
    "Show a client what a 20 percent contingency buffer adds in both hours and money.",
    "Check whether a project can realistically ship by a requested date at 25 billable hours a week."
  ],
  "benefits": [
    [
      "Task-level transparency",
      "Every task shows its hours, share of the project and cost, so a quote can be defended line by line."
    ],
    [
      "Buffer priced explicitly",
      "Contingency is calculated as its own hours and rupee figure instead of being hidden inside padded estimates."
    ],
    [
      "Realistic delivery date",
      "The timeline uses weekdays and your real weekly capacity, not an imaginary 40-hour week on one project."
    ]
  ],
  "faqs": [
    [
      "How big should a project contingency buffer be?",
      "Common practice is 15 to 25 percent for familiar work and 30 to 50 percent when requirements are vague or the technology is new. The buffer covers rework and unknowns, not scope the client adds later."
    ],
    [
      "Should I quote a fixed price or hourly?",
      "Estimate in hours either way. A fixed price is simply your buffered hours times your rate, agreed up front, which shifts the risk of overrun to you — so a clear scope and a healthy buffer matter more."
    ],
    [
      "Why is my delivery date later than total hours divided by 40?",
      "Because almost nobody bills 40 hours a week to one project. Enter the hours you can genuinely dedicate — often 20 to 30 — and the timeline stretches accordingly, which is why deadlines slip."
    ],
    [
      "How do I estimate hours for a task I have not done before?",
      "Break it into subtasks small enough to picture finishing in a day or less, estimate each, then add them up. Smaller pieces are far more accurate than one large guess, and unfamiliar work deserves a bigger buffer."
    ]
  ]
};

export default seo;
