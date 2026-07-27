const seo = {
  intro:
    "The AI Adoption Readiness Quiz scores an organisation's preparedness for rolling out AI across the four dimensions maturity frameworks consistently test: data readiness, skills and people, process fit, and governance and risk. Twelve questions each carry 0–3 maturity points (36 total), and the percentage score maps to one of four bands from 'not ready yet' to 'ready to scale', with the weakest dimension called out first. It is designed for operations leads and executives sizing up an AI rollout before committing budget.",
  useCases: [
    "An operations director asked to 'roll out AI' who wants a structured gap check before choosing any vendor",
    "A leadership team comparing readiness across departments by having each one take the quiz and comparing dimension scores",
    "A consultant framing a discovery workshop around the four dimensions and using the weakest-area result to set the first workstream",
  ],
  benefits: [
    ["Four-dimension model", "Data, skills, process and governance are scored separately, so you see where the gap actually is."],
    ["Banded verdict", "80%+ scale, 60–79% pilot, 40–59% early stage, under 40% fix foundations — a clear next step, not just a number."],
    ["Weakest-link callout", "The lowest-scoring dimension is flagged because AI rollouts fail at their weakest dimension, not their average."],
  ],
  faqs: [
    [
      "How do I know if my company is ready to adopt AI?",
      "Check four things: whether the data AI needs is accessible and reliable, whether people have skills and an accountable owner, whether target workflows are identified with measurable baselines, and whether use policy and review rules exist. This quiz scores all four on a 0–3 maturity scale and bands the result; scoring under 60% overall suggests piloting only low-risk workflows while fixing the gaps.",
    ],
    [
      "What score do I need before starting an AI pilot?",
      "In this quiz, 60% or higher indicates you are ready to run scoped pilots, because it means most foundations — accessible data, an owner, candidate workflows, basic policy — are at least partly in place. Between 40% and 59% a small low-risk pilot is possible, and below 40% the advice is to fix foundations before buying tools.",
    ],
    [
      "What is the most common blocker to AI adoption in companies?",
      "Data readiness and governance are the most frequently cited blockers in industry surveys: data that is scattered or unclassified, and the absence of a written policy on acceptable use and review of AI output. That is why half of this quiz's questions sit in those two dimensions, and why the tool flags your weakest dimension rather than just an average.",
    ],
    [
      "Why does the quiz flag the weakest dimension instead of the overall score?",
      "Because AI rollouts fail at the weakest link: excellent data with no governance produces compliance incidents, and strong skills with inaccessible data produces toy demos. The overall band sets the pace, but the weakest dimension tells you what to fix first before scaling.",
    ],
  ],
};

export default seo;
