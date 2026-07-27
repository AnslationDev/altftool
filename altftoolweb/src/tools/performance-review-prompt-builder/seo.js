const seo = {
  intro:
    "The Performance Review Prompt Builder scores your rough review notes for evidence quality and assembles them into a single prompt an AI assistant can write from without inventing anything. Each note is checked for three things every feedback framework asks for — a measurable result, a timeframe and a concrete action verb — and weighted 50/30/20 into a score out of 100. The finished prompt follows either STAR (Situation, Task, Action, Result) or SBI (Situation, Behaviour, Impact) and instructs the model to mark any claim it cannot evidence rather than smoothing over the gap.",
  useCases: [
    "Check whether a year of scribbled one-to-one notes actually contains enough evidence to justify a rating before review season starts.",
    "Rewrite trait language such as 'good attitude' into behaviour and impact statements a report can act on.",
    "Draft a self review from your own achievement log without overstating results you cannot back with a number.",
    "Give every manager on a team one prompt so reviews across the group use the same structure and evidence bar.",
  ],
  benefits: [
    [
      "Every note scored",
      "See exactly which lines lack a number, a date or an action verb before you start writing.",
    ],
    [
      "Refuses to invent",
      "The prompt tells the model to insert a [NEEDS EVIDENCE] marker instead of filling a gap with plausible fiction.",
    ],
    [
      "Balance check",
      "Warns when there are no development notes at all, or when criticism is over three quarters of the input.",
    ],
  ],
  faqs: [
    [
      "What makes a performance review note good evidence?",
      "Three things: when it happened, what the person actually did, and what changed as a result. That is the common core of STAR and SBI, and it is what this tool scores — 50 points for a measurable result, 30 for a timeframe, 20 for an action verb. A note like 'cut first-response time from 9 hours to 4 hours in Q2' scores 100; 'was helpful' scores 0.",
    ],
    [
      "What is the difference between STAR and SBI feedback?",
      "STAR (Situation, Task, Action, Result) has four parts and suits achievement write-ups where the assignment matters. SBI (Situation, Behaviour, Impact), developed at the Center for Creative Leadership, has three and suits shorter behavioural feedback because it moves straight from what was observed to its effect. Both keep the focus on observable behaviour rather than personality.",
    ],
    [
      "How many goals should a performance review set?",
      "Two to five for a single cycle, which is the range this tool checks against. Beyond about five, goals compete for the same attention and most go unfinished; below two there is not enough direction. Each one should be SMART — a measure, a target value and a date inside the cycle.",
    ],
    [
      "Should I put an AI-drafted review straight into the HR system?",
      "No. Treat the output as a first draft you verify line by line against your own records, because performance documents can become evidence in an employment dispute and record-keeping duties differ by country. Everything in this tool runs in your browser and nothing is stored, but the finished wording should still be reviewed by your HR team.",
    ],
  ],
};

export default seo;
