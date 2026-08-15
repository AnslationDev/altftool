const seo = {
  title: "KPI Definition Prompt Builder",
  metaDescription:
    "Define a metric's numerator, denominator and grain, see the 95% margin of error on a worked example, and get an AI prompt that pins down edge cases.",
  steps: [
    "Fill in the Metric name, Type, Numerator and Denominator, a Sample numerator and Sample denominator (the default worked example is 820 of 1000), plus Grain and Direction.",
    "Review the three result tiles — Value, MOE in ±percentage points and the prompt's token estimate — which recalculate as you edit.",
    "Read the generated analytics-engineer prompt in the preview pane and press Copy prompt; Reset restores the worked example after a confirmation.",
  ],
  intro:
    "The KPI Definition Prompt Builder takes a metric's numerator, denominator, type and reporting grain, evaluates a worked example, and — for percentage metrics — computes the 95% margin of error using the normal approximation z × √(p(1−p)/n) along with the denominator you would need to hit a target margin. It then writes an AI prompt that turns all of it into a definition with the edge cases decided rather than caveated. For analysts and PMs tired of two dashboards disagreeing about the same number.",
  useCases: [
    "Settle whether checkout conversion counts sessions or users before two teams build it differently.",
    "Find out that a 25.8% rate on 4,800 sessions carries ±1.24 points, so a 1-point weekly move is noise.",
    "Work out the sample you need before a weekly metric is stable enough to set a target against.",
    "Force decisions on refunds, bot traffic and late-arriving events while the metric is still being written.",
  ],
  benefits: [
    ["Numerator and denominator first", "The definition starts from what is counted and what it is divided by, not from a dashboard name."],
    ["Noise made visible", "The 95% interval and required sample size show whether a movement is real before anyone reacts to it."],
    ["Edge cases as rules", "Ten common edge cases can be attached, and the prompt demands a rule for each, not a footnote."],
  ],
  faqs: [
    [
      "How do you define a KPI properly?",
      "State the numerator and denominator as specific events with their filters and time window, name the grain and direction, then decide every edge case as a rule. A definition is finished when two engineers reading it separately would write the same query.",
    ],
    [
      "How do I calculate the margin of error for a conversion rate?",
      "For a proportion, the 95% margin of error is 1.96 × √(p(1−p)/n), expressed in percentage points. At p = 0.258 and n = 4,800 that is about ±1.24 points, so anything smaller than a 2.5-point swing is inside the noise.",
    ],
    [
      "How large a sample do I need for a reliable percentage?",
      "Rearranging the formula, n = z²p(1−p)/e². To measure a 25.8% rate to within ±2 percentage points at 95% confidence you need roughly 1,839 in the denominator. The normal approximation also needs at least five in each outcome group before it is trustworthy at all.",
    ],
    [
      "What makes a metric easy to game?",
      "Any metric with a denominator someone can shrink, or a numerator someone can trigger without creating value. The prompt asks explicitly for three gaming routes and the guardrail metric that would catch each, because pairing a goal metric with a guardrail is what stops the optimisation going sideways.",
    ],
  ],
};

export default seo;
