const seo = {
  intro:
    "This builder assembles a system prompt for a product-management assistant that writes PRDs with explicit non-goals, user stories in the Connextra format meeting the INVEST checklist with Given/When/Then acceptance criteria, and a backlog run through a real prioritisation framework — RICE, ICE and WSJF with the scoring arithmetic shown, or MoSCoW's Must/Should/Could/Won't categories — instead of vague priority labels. It is for product managers and founders who want AI drafting help that argues from evidence instead of inventing metrics.",
  useCases: [
    "A PM standardising spec quality so every AI-drafted PRD has a problem statement, success metrics, non-goals and open questions",
    "A founder turning a feature idea into INVEST-compliant user stories with acceptance criteria before briefing engineers",
    "A product team running a RICE pass over a 30-item backlog with the reach, impact, confidence and effort numbers visible for debate",
  ],
  benefits: [
    ["Real frameworks, cited", "RICE (Intercom), ICE and WSJF (SAFe) are written into the prompt with their actual scoring formulas; MoSCoW gets its real Must/Should/Could/Won't categories rather than a made-up score."],
    ["Anti-hallucination rules", "One-click rules force assumptions to be labelled and ban invented user research, quotes and metrics."],
    ["Specs with teeth", "Every spec must name non-goals and define success as a measurable number with a baseline and date."],
  ],
  faqs: [
    [
      "What is the RICE prioritisation framework?",
      "RICE, created at Intercom, scores each item as (Reach × Impact × Confidence) ÷ Effort. Reach is users affected per period, Impact is rated 0.25 / 0.5 / 1 / 2 / 3, Confidence is 50%, 80% or 100%, and Effort is in person-months. Higher scores rank higher; the value of the exercise is mostly in arguing about the four inputs, which is why this builder makes the assistant show its arithmetic.",
    ],
    [
      "What does INVEST mean for user stories?",
      "INVEST is Bill Wake's checklist for a good user story: Independent, Negotiable, Valuable, Estimable, Small and Testable. A story failing the checklist — say, too big to estimate or with no testable outcome — should be split or rewritten. The builder pairs INVEST with the Connextra template ('As a …, I want …, so that …') and Gherkin Given/When/Then acceptance criteria.",
    ],
    [
      "What should a PRD include?",
      "A working minimum: the problem and evidence for it, goals with measurable success metrics, explicit non-goals (what is out of scope), user flows or scenarios, and open questions. Non-goals are the most commonly skipped section and the biggest source of scope creep, so this builder can make a spec without them count as unfinished.",
    ],
    [
      "How do I stop an AI assistant from making up user data and metrics?",
      "Give it two hard rules: never invent research, metrics, quotes or competitor facts — ask or leave an open question instead — and label every unbacked claim as 'Assumption:'. These are the two most important rules in this builder and it warns you if the first is disabled. Treat AI-drafted numbers as placeholders until a human sources them.",
    ],
  ],
};

export default seo;
