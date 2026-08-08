const seo = {
  title: "Shift Rotation Fairness Auditor: Weighted Burden",
  metaDescription:
    "Paste a rota as date | member | type | hours and get per-person nights, weekends and weighted burden (nights x1.5, weekends x1.25) plus the spread.",
  steps: [
    "Paste the rota into Assigned shifts, one line per shift as date | member | type | hours.",
    "Set Night burden weight, 1.5 by default, and Weekend burden weight at 1.25, to match how your rota values unsociable time.",
    "Read the weighted-hour spread headline and mean burden, over a table of shifts, hours, nights, weekends and weighted burden per member.",
  ],
  intro:
    "This auditor scores how evenly a rota is spread across a team by converting each assigned shift into a weighted burden — hours multiplied by 1.5 for nights and 1.25 for weekends by default, 1 for ordinary days — and reporting the gap between the most and least loaded member. Paste your roster as one line per shift in the form date | member | type | hours and you get a per-person table of shift count, raw hours, nights, weekends and weighted burden, plus the team mean. It is for team leads, ward managers and on-call coordinators who need to show whether a rotation is actually balanced rather than argue about it from memory.",
  useCases: [
    "Settle a complaint that one nurse keeps drawing the night shifts by pasting last month's rota and reading off her weighted burden against the team mean",
    "Check a draft on-call rotation before you publish it, and reshuffle until the weighted-hour spread between the busiest and lightest engineer closes",
    "Compare two teams doing the same work by running each roster separately and seeing which one carries the wider burden gap",
  ],
  benefits: [
    ["Weights unsociable hours, not just hours", "A 10-hour night counts more than a 10-hour weekday, which is how the people working it experience it."],
    ["Spread, not just totals", "The headline figure is the max-minus-min weighted burden, so one overloaded person shows up even when the averages look fine."],
    ["Adjustable burden multipliers", "Set your own night and weekend weights to match how your team or your enhanced-pay agreement actually values them."],
  ],
  faqs: [
    [
      "How is the fairness score calculated?",
      "Each shift's hours are multiplied by a burden weight — 1.5 for night, 1.25 for weekend and 1.0 for anything else by default — and summed per person; the score is the difference between the highest and lowest personal total. A spread near zero means the weighted load is even, and the mean burden is shown alongside so you can judge the gap in proportion.",
    ],
    [
      "What if a shift is both a night and a weekend?",
      "It is counted as a night, because the night weight is applied first and takes precedence over the weekend weight. If Saturday nights deserve more in your rota, either raise the night weight or label those shifts with a single custom type and weight accordingly.",
    ],
    [
      "What format should I paste the roster in?",
      "One shift per line, four pipe-separated fields: date | member | type | hours, for example 2026-07-01 | Asha | night | 8. The date is carried for your reference only, the type is matched for the words night and weekend, and lines with no member name are ignored.",
    ],
    [
      "Does an even score mean the rota is legally compliant?",
      "No. This is a descriptive workload audit and says nothing about minimum rest periods, maximum weekly hours, leave, availability, accommodation for disability, seniority rules or your local labour law. Use it as evidence in a scheduling conversation, and check compliance with your HR team or an employment law professional.",
    ],
  ],
};

export default seo;
