const seo = {
  intro:
    "This calculator computes a scrum team's real sprint capacity using the standard formula: (headcount × working days − public holidays − planned leave) × hours per day, minus an overhead percentage for ceremonies, support and interruptions. It is built for scrum masters and engineering managers running sprint planning who need an honest hours figure — not the theoretical maximum — before the team commits to a sprint backlog.",
  useCases: [
    "A scrum master planning a two-week sprint with one public holiday and two engineers partly on leave computes the hours the team can actually commit",
    "An engineering manager justifies a smaller sprint commitment to stakeholders by showing 30% of theoretical capacity is consumed by holidays, leave and ceremonies",
    "A team that keeps overcommitting compares its planned load against calculated net capacity to recalibrate before the next planning session",
  ],
  benefits: [
    ["Counts what actually disappears", "Holidays, individual leave and ceremony overhead are all deducted explicitly, line by line."],
    ["Grounded overhead default", "The 15% default reflects the Scrum Guide's event timeboxes (≈12.5% of a two-week sprint) plus support slack."],
    ["Per-person and utilisation view", "Shows hours per person and what share of the theoretical maximum survives, so overcommitment is visible."],
  ],
  faqs: [
    [
      "How do you calculate sprint capacity?",
      "Multiply team size by sprint working days, subtract public-holiday and leave person-days, multiply by working hours per day, then deduct an overhead percentage for ceremonies and support. Example: 5 people × 10 days = 50 person-days; minus 5 holiday and 4 leave person-days leaves 41; at 8 hours and 15% overhead that is 278.8 net hours.",
    ],
    [
      "How much sprint time do scrum ceremonies take?",
      "For a two-week sprint the Scrum Guide's timeboxes total roughly 10 hours per person: sprint planning up to 4 hours, ten 15-minute daily scrums (2.5 hours), sprint review up to 2 hours and retrospective up to 1.5 hours — about 12.5% of an 80-hour fortnight. Teams with support duties typically reserve 15–25% overall.",
    ],
    [
      "Should a team plan to 100% of its capacity?",
      "No. Capacity is an upper bound; planning to it leaves zero room for production incidents, urgent bugs and estimation error, which is why chronically overcommitted sprints fail. A common practice is committing to about 80% of net capacity and pulling more work in if the sprint runs ahead.",
    ],
    [
      "What is the difference between capacity and velocity?",
      "Capacity is forward-looking available effort (hours or person-days) computed from the calendar; velocity is backward-looking delivered output measured in story points per sprint. Capacity tells you who is around this sprint; velocity tells you how much a full-strength team historically delivers — good planning uses both.",
    ],
  ],
};

export default seo;
