const seo = {
  title: "AI Policy Quiz: 10 Workplace Scenarios, 80% Pass",
  metaDescription:
    "Ten scenario questions on confidential data, verification, disclosure, IP and accountability. Instant explanation per answer, scored at the 80% pass band.",
  steps: [
    "Answer all ten workplace scenarios by selecting one option each; the counter beside the buttons tracks how many of the 10 are answered.",
    "Press \"Check my answers\" to score the quiz and reveal the explanation under every question.",
    "Read Your score out of 10 with the percentage and band, where 90% is Excellent, 80% is Pass and below 50% is High risk, then press Copy result.",
  ],
  intro:
    "The AI Policy Quiz scores you on ten workplace scenarios covering acceptable AI use — confidential data in prompts, verifying model output, disclosure, intellectual property, hiring bias, meeting notetakers and accountability — with an instant explanation for every answer. The result is graded against the 80% pass mark common in compliance training, with themes drawn from typical enterprise acceptable-use policies and the NIST AI Risk Management Framework. It is built for team leads onboarding staff to an AI policy and for anyone checking their own judgement before using AI with work data.",
  useCases: [
    "A manager running the quiz in a team meeting after rolling out a new company AI acceptable-use policy",
    "A new hire self-testing before getting access to the company's approved AI tools",
    "A compliance lead spot-checking where a team's understanding is weakest — data handling, disclosure or IP",
  ],
  benefits: [
    ["Scenario-based, not trivia", "Ten realistic workplace situations — pasted contracts, leaked API keys, AI notetakers — not abstract definitions."],
    ["Instant explanations", "Every answer comes with the reasoning and the rule or framework behind it, right or wrong."],
    ["Graded against a real pass mark", "Scores band at 90/80/50 percent, mirroring the 80% threshold most compliance training uses."],
  ],
  faqs: [
    [
      "What score do I need to pass an AI policy quiz?",
      "This quiz uses 80% (8 of 10) as its pass band, which is the threshold most corporate compliance training applies. Scores of 90% or above rate as excellent, and below 50% flags serious gaps worth retraining before using AI with work data.",
    ],
    [
      "Can I put confidential company data into ChatGPT?",
      "Not into unapproved public tools — that is the most common rule in every corporate AI policy. Prompts sent to consumer AI services may be retained or used for training, so confidential, client or personal data belongs only in deployments your organisation has approved, or must be redacted first.",
    ],
    [
      "Why does AI output need human verification?",
      "Because language models hallucinate: they produce fluent, confident text that can contain invented facts, figures and citations. Frameworks like the NIST AI Risk Management Framework and virtually all editorial policies therefore require a human to verify factual claims against real sources before output is used or published — running it through a second AI does not count.",
    ],
    [
      "Who is responsible if AI-generated work contains an error?",
      "The human who reviewed and shipped it. AI policies consistently keep accountability with people, not tools or vendors — using AI changes how work is produced, not who answers for it. That is why review gates for AI-generated code and content exist.",
    ],
  ],
};

export default seo;
