const seo = {
  intro:
    "Tech Spec Prompt Builder assembles a design-document prompt from thirteen canonical sections — context, goals, non-goals, proposed design, alternatives, risks, rollout, observability, security, testing, API changes, open questions and milestones — and attaches a word target to each. It scores the outline for completeness by weight, and estimates reading time at 238 words per minute, the average adult silent reading rate for non-fiction reported in Brysbaert's 2019 meta-analysis. For engineers who keep getting design docs sent back for the same three missing sections.",
  useCases: [
    "Draft an RFC where the non-goals section actually exists, instead of being argued about in review comments.",
    "Turn three bullet points of context into a cross-team design doc brief a reviewer can follow.",
    "Check whether your outline is missing rollout, observability or security before you start writing.",
    "Size a one-pager versus a full design doc before committing an afternoon to it.",
  ],
  benefits: [
    ["Non-goals are mandatory", "Goals, non-goals and the proposed design cannot be switched off, because a doc without them gets bounced."],
    ["Length before writing", "Each section carries a word target, so the total and its reading time are known up front."],
    ["Invented numbers blocked", "The prompt forbids latencies, costs and error rates you did not supply and demands a [MEASURE] marker instead."],
  ],
  faqs: [
    [
      "What is the difference between goals and non-goals in a design doc?",
      "Goals are the testable outcomes the work must achieve; non-goals are the things it deliberately will not do, with a reason each is out of scope for now. Non-goals matter more than they look: they are what stops a review turning into a scope negotiation.",
    ],
    [
      "What sections should a technical design document have?",
      "At minimum: context and problem, goals, non-goals, the proposed design, and alternatives considered. Most review processes also expect risks, rollout and migration, observability, security and privacy, and a testing strategy — this tool weights those thirteen sections and scores how many your outline covers.",
    ],
    [
      "How long should a design doc be?",
      "A standard design doc lands around 2,000 to 3,000 words, or roughly 8 to 13 minutes of reading at 238 words per minute. A one-pager should stay under 700 words. Past about 4,000 words reviewers skim, so extra detail belongs in an appendix.",
    ],
    [
      "Why include alternatives you already rejected?",
      "Because the first question in any review is 'why not X'. Writing down at least two alternatives, including doing nothing, with the specific reason each was rejected, answers that in advance and stops the same debate reopening after implementation starts.",
    ],
  ],
};

export default seo;
