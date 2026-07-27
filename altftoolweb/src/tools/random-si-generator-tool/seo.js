const seo = {
  intro:
    "The Random Startup Idea Generator builds a business concept by combining five independent slots — audience, problem, delivery model, differentiator and pricing model — into one of 86,400 distinct combinations. Each generated idea also gets a build-effort score from 1 to 10, calculated by adding the effort weight of each slot (1 for a form and a spreadsheet, 5 for regulated or marketplace work) and mapping the 5-to-25 raw total onto a 1-to-10 scale. It is a structured brainstorming prompt for founders, hackathon teams and product classes, not a market forecast.",
  useCases: [
    "Break a blank-page block at the start of a 48-hour hackathon by locking your team's delivery model and shuffling the other four slots.",
    "Run a product-management class exercise where each student defends one generated idea against its build-effort score.",
    "Generate ten side-project concepts scored 3 or below to find something one person can genuinely ship over a few weekends.",
  ],
  benefits: [
    ["Effort is scored, not guessed", "Every audience, model, twist and pricing option carries a documented 1-5 weight, so the 1-10 score is reproducible."],
    ["Lock what you already know", "Fix the audience or the delivery model and shuffle only the parts you are still exploring."],
    ["Reproducible by seed", "Each idea is generated from its seed number, so you can note the seed and rebuild the exact idea later."],
  ],
  faqs: [
    [
      "How many different startup ideas can this generate?",
      "86,400 — that is 12 audiences x 12 problems x 10 delivery models x 10 differentiators x 6 pricing models. The panel shows which numbered combination you are looking at.",
    ],
    [
      "What does the build-effort score actually measure?",
      "It measures how hard the idea is to build and sell, not how good it is. Each of the five slots carries a weight from 1 to 5; the raw total runs 5 to 25 and is mapped linearly onto 1 to 10, where 1-3 is a weekend build and 9-10 means regulated, hardware-bound or marketplace-liquidity work.",
    ],
    [
      "Are these ideas validated or researched?",
      "No. They are structured prompts, deliberately generic enough to be a starting point. Any idea still needs customer interviews, a look at existing competitors and a check on regulation before you commit time to it.",
    ],
    [
      "Can I get the same idea back tomorrow?",
      "Yes. Note the seed number shown under the inputs; typing it back in with the same locks regenerates exactly the same idea, because nothing is stored on a server.",
    ],
  ],
};

export default seo;
