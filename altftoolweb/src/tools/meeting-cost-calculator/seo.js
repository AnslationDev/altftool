const seo = {
  title: "Meeting Cost Calculator — Team Cost Estimator",
  h1: "Meeting Cost Calculator — Per-Meeting, Weekly and Annual Cost",
  metaDescription:
    "Free meeting cost calculator. Add attendee groups with headcount and ₹/hr rates to get per-meeting, weekly and annual cost. Runs entirely in your browser.",
  intro:
    "The Meeting Cost Calculator prices a meeting by multiplying each attendee group's headcount by its hourly rate and by the loaded time per person — meeting duration plus prep plus follow-up, divided by 60 — then adding a context-switching buffer of (1 + productivity loss %). Group totals are summed into one meeting cost, which is multiplied by meetings per week and working weeks per year to give the weekly, daily-burn and annual view, drawn as Recharts bar and donut charts. Every figure recomputes in your browser on each keystroke via React's useMemo; the tool makes no network requests, and amounts are formatted in Indian rupees with Intl.NumberFormat(\"en-IN\").",
  useCases: [
    "An engineering manager checking what a 60-minute weekly sync with nine people actually costs before it becomes a standing invite.",
    "An operations lead exporting the per-role CSV to show which team absorbs the largest share of a recurring review meeting.",
    "A founder comparing the current schedule against the built-in Lean Meeting preset — 30 minutes, no prep or follow-up, once a week.",
  ],
  benefits: [
    [
      "Loaded time, not just the invite",
      "Prep and follow-up minutes are added per attendee before costing, so a 60-minute meeting with 10 minutes either side is priced as 80 minutes of paid time.",
    ],
    [
      "Mixed rates by role",
      "Add any number of named attendee groups, each with its own headcount and hourly rate. The tool reports a headcount-weighted blended rate alongside the total and splits cost by role in a bar and donut chart.",
    ],
    [
      "Recurring cost, not a one-off",
      "Meetings per week (accepts half-steps) times working weeks per year turns a single meeting into weekly, daily-burn and annual figures, plus total team hours consumed.",
    ],
    [
      "Copy or export in one click",
      "Copy a plain-text summary to the clipboard, or download meeting-cost-summary.csv with attendees, rate, hours, base cost, productivity loss and total for every role.",
    ],
  ],
  faqs: [
    [
      "How do you calculate the cost of a meeting?",
      "Multiply attendees by their hourly rate and by the meeting's length in hours, then include prep and follow-up time. This tool does that per attendee group — headcount × hourly rate × (duration + prep + follow-up) ÷ 60 — sums the groups, and raises the result by your productivity-loss percentage.",
    ],
    [
      "Does the calculator include prep and follow-up time?",
      "Yes. Prep and follow-up minutes are entered per attendee and added to the duration before costing. The default sample uses a 60-minute meeting plus 10 minutes each side, so every attendee is charged for 1.3 hours of time, not 1.",
    ],
    [
      "What is the productivity loss percentage for?",
      "It is a context-switching buffer applied on top of the base salary cost, and it is your own assumption rather than a measured figure. Whatever you enter (0–100%, default 15%) is multiplied against the base cost and added — 15% on ₹28,800 of attendance time adds ₹4,320.",
    ],
    [
      "How much does a recurring weekly meeting cost per year?",
      "Single meeting cost × meetings per week × working weeks per year. With the built-in sample — nine people, 80 loaded minutes each, a blended ₹2,400/hr, three meetings a week over 48 weeks — one meeting is ₹33,120 and the year comes to ₹47,69,280.",
    ],
    [
      "What does the 15-minute saving figure mean?",
      "It re-prices the same meeting with 15 minutes cut from the duration, floored at a 15-minute minimum, and shows the difference. Prep and follow-up time stay unchanged. In the sample scenario, trimming 60 minutes to 45 saves ₹6,210 per meeting, or ₹8,94,240 across 144 meetings a year.",
    ],
    [
      "Can I use dollars or euros instead of rupees?",
      "Not as a display option — every amount is formatted in Indian rupees using Intl.NumberFormat(\"en-IN\"), and there is no currency selector. The arithmetic is currency-agnostic, so you can enter hourly rates in any currency and read the outputs as that currency; only the ₹ symbol and Indian digit grouping are fixed.",
    ],
    [
      "Is this meeting cost calculator free, and is my salary data uploaded?",
      "It is free, requires no signup, and nothing is uploaded. All calculation happens in your browser in React state, the tool's code contains no network requests, and the CSV is built locally as a Blob download. Nothing is stored either — reloading the page resets the inputs to the sample values.",
    ],
    [
      "What are the input limits?",
      "You can add unlimited roles; each accepts 0–100,000 people and a rate up to ₹1,00,00,000/hr. Duration, prep and follow-up are each capped at 1,440 minutes (24 hours), meetings per week at 1,000 in steps of 0.5, working weeks at 1–60, and productivity loss at 100%.",
    ],
  ],
  steps: [
    "Set the meeting duration, prep and follow-up minutes per attendee, then meetings per week, working weeks per year, and a productivity-loss percentage.",
    "Add each attendee group with a role name, headcount and average hourly rate — start from the four sample roles or replace them with your own.",
    "Read the single-meeting, weekly and annual totals and the role cost split, then copy the summary or export the per-role CSV.",
  ],
};

export default seo;
