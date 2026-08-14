const seo = {
  title: "AI Dependency Self Check Across 6 Skill Domains",
  metaDescription:
    "Rate delegation 0-4 and unaided confidence before vs today across six skills; risk = delegation % × relative confidence loss ÷ 100, flagged at 25%.",
  steps: [
    "For each of the six domains — Writing and editing, Coding and debugging, Research and fact-finding, Arithmetic and data analysis, Planning and decisions, Memory and recall — answer 'How often does this go to AI first?' on the 0 to 4 scale.",
    "Fill 'Unaided confidence before AI (0-10)' and 'Unaided confidence today (0-10)' for every domain; risk is the delegation percentage multiplied by the relative confidence loss, divided by 100.",
    "Read 'Overall reliance risk' and the Domain / Delegation / Confidence lost / Risk table ranked worst first, where any domain at 25% or above is flagged, then press Copy result.",
  ],
  intro:
    "AI Dependency Self Check measures where AI reliance overlaps with lost skill confidence, across six domains: writing, coding, research, analysis, planning and recall. For each one you rate how often the task goes to AI first (0-4) and your unaided confidence today against your unaided confidence before, then the risk figure is delegation percentage multiplied by relative confidence loss, divided by 100. Because it is a product, delegating heavily with no confidence loss scores zero, and so does losing confidence in something you rarely delegate.",
  useCases: [
    "Find out which single skill to practise unaided next, rather than vaguely resolving to use AI less.",
    "Check whether heavy code-completion use has actually cost you debugging confidence, or only saved you typing.",
    "Give a team an honest starting point for a conversation about where AI help is fine and where it is quietly hollowing out review quality.",
    "Re-run the same six ratings after a month of deliberate unaided practice and compare the risk figures.",
  ],
  benefits: [
    [
      "Delegation alone is not the problem",
      "The score only rises where high delegation and lost confidence occur together, so useful automation is not penalised.",
    ],
    [
      "Points to one domain, not a verdict",
      "Domains are ranked by risk and anything at 25% or above is flagged, which turns the result into a next action.",
    ],
    [
      "Fully reproducible arithmetic",
      "Every figure comes from two divisions and one multiplication that you can check by hand.",
    ],
  ],
  faqs: [
    [
      "Does using AI every day mean I am dependent on it?",
      "Not by itself. In this worksheet, delegating a task almost always scores 100% on delegation but still produces zero risk if your unaided confidence has not fallen. Risk only appears where both numbers move together.",
    ],
    [
      "How is the risk percentage calculated?",
      "Risk equals delegation percentage multiplied by relative confidence loss, divided by 100. Delegating 75% of the time with confidence down from 8 to 6 gives 75 multiplied by 25, divided by 100, which is roughly 19%.",
    ],
    [
      "What counts as a high score?",
      "Any single domain at 25% or above is flagged for deliberate practice, and an overall figure of 50% or more means both signals are present across most domains. These cut points are descriptive quartile bands defined for this worksheet, not clinical thresholds.",
    ],
    [
      "How do I rebuild a skill that has drifted?",
      "Pick the single highest-risk domain and do one real task in it end to end without help, then compare your output with what AI would have produced. Rebuilding one skill at a time works better than trying to stop using AI everywhere at once. If the pattern is affecting your work or wellbeing, speak to a qualified professional.",
    ],
  ],
};

export default seo;
