const seo = {
  title: "Story Points to Hours Calculator Using Team",
  metaDescription:
    "Convert story points to hours from your team's own rate — sprint person-hours divided by velocity — with a confidence range and sprints needed.",
  steps: [
    "Enter \"Story points to convert\" or tap one of the Fibonacci chips (1, 2, 3, 5, 8, 13, 21, 34).",
    "Fill in \"Team velocity (points per sprint)\" and \"Sprint person-hours (whole team)\", and set the confidence percentage.",
    "Read the \"Estimated effort\" in hours with its optimistic-pessimistic range and \"Sprints needed\", then click \"Copy result\".",
  ],
  intro:
    "This calculator converts story points into an hour estimate by dividing your team's sprint person-hours by its velocity — the empirical hours-per-point method described in Mike Cohn's Agile Estimating and Planning, since points have no universal time value. It is built for scrum masters, tech leads and engineers who need to answer 'how long will this take?' for stakeholders, and it returns a midpoint plus an optimistic–pessimistic range driven by a confidence percentage.",
  useCases: [
    "A tech lead asked for a delivery date on a 13-point epic converts it to hours using the team's 30-point velocity before answering the product manager",
    "A scrum master sanity-checks whether a 21-point story can fit in one sprint by comparing its hour estimate with the team's remaining capacity",
    "A contractor billing by the hour translates a backlog estimated in points into a defensible hour quote with an explicit uncertainty range",
  ],
  benefits: [
    ["Uses your team's real rate", "Hours-per-point comes from your velocity and sprint hours, not a made-up universal constant."],
    ["Honest uncertainty", "An 80% confidence setting widens the answer to a ±20% range instead of one false-precision number."],
    ["Sprint forecast included", "Shows fractional and whole sprints needed straight from velocity, independent of the hour conversion."],
  ],
  faqs: [
    [
      "How many hours is one story point?",
      "There is no fixed number — a point is a relative size unit, so the only meaningful conversion is your team's own rate: sprint person-hours divided by velocity. A team with 240 person-hours per sprint completing 30 points runs at 8 hours per point; another team's rate could be 3 or 20 hours for the same backlog.",
    ],
    [
      "How do I convert story points to hours?",
      "Divide the person-hours your team has in a sprint by the points it typically completes, then multiply by the story's points. Example: 240 person-hours ÷ 30 points = 8 hours per point, so a 13-point story is about 104 hours. Always quote it as a range, because velocity varies sprint to sprint.",
    ],
    [
      "What is team velocity in scrum?",
      "Velocity is the number of story points a team completes per sprint, averaged over recent sprints — commonly the last three to five. It is a planning tool local to one team; comparing velocities across teams is meaningless because each team's point scale is different.",
    ],
    [
      "Why use the Fibonacci sequence for story points?",
      "The modified Fibonacci scale (1, 2, 3, 5, 8, 13, 21) forces bigger gaps between larger values, reflecting that uncertainty grows with size — nobody can meaningfully distinguish 20 from 21 units of work. Stories landing at 13 or above are usually a signal to split the work before committing to it.",
    ],
  ],
};

export default seo;
