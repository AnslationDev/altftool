const seo = {
  intro:
    "An AI project scoping worksheet forces seven answers out of an idea before any modelling starts: the problem, the users, the data sources, one primary success metric, today's measured baseline, the target that makes the work worthwhile, and the fallback for when the model is wrong or offline. This tool captures those answers, scores how complete the scope is out of seven, and emits a markdown scope document you can paste into a ticket or design doc. It follows the standard machine-learning project-scoping sequence — define the metric and the baseline before choosing a model — used in Google's People + AI guidance and in Andrew Ng's ML project scoping steps.",
  useCases: [
    "A product manager turning an executive's 'can we use AI for support tickets?' into a scoped pilot with a baseline first-response time and a target",
    "A data lead reviewing three competing AI proposals and rejecting the two that have no measurable baseline or fallback path",
    "An agency writing a statement of work that names the data owner, the success metric and the rollback plan before quoting a price",
  ],
  benefits: [
    ["Baseline before model", "Records today's measured value of the metric so improvement can actually be proved later."],
    ["Fallback is mandatory", "Treats the wrong-answer and outage path as a core question, not an afterthought."],
    ["Portable output", "Produces markdown with explicit TBD placeholders, so gaps stay visible when the doc is shared."],
  ],
  faqs: [
    [
      "What should an AI project scope include?",
      "At minimum seven things: the problem in someone's workflow, who uses the output and who is harmed by errors, the data sources and who owns access to them, one primary success metric, the current measured baseline for that metric, the target value, and the fallback when the system is wrong or unavailable. Scopes that skip the baseline cannot prove improvement, and scopes that skip the fallback tend to stall at the go-live review.",
    ],
    [
      "Why do you need a baseline before starting an AI project?",
      "Because without a measured starting value there is no way to tell whether the model helped. If median first response is 46 minutes today, a pilot that lands at 30 minutes is a clear win; with no baseline the same result is just a number. Measure the baseline from an existing system report rather than estimating it from memory.",
    ],
    [
      "How many success metrics should an AI pilot have?",
      "One primary metric, with any others treated as guardrails. A single primary metric makes the go/no-go decision unambiguous; guardrail metrics such as error rate, cost per request or customer satisfaction stop the team from optimising the primary metric into a worse product.",
    ],
    [
      "What is a fallback plan in an AI project?",
      "The defined path the work takes when the model is unavailable or below its confidence threshold — usually routing to the existing manual process plus a feature flag that disables the AI path entirely. Writing it during scoping is what makes a pilot reversible; if you cannot describe how to turn the system off, it is not ready to switch on.",
    ],
  ],
};

export default seo;
