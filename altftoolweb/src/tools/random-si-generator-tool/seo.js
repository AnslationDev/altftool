const seo = {
  title: "Random Startup Idea Generator: 86,400 Combinations",
  metaDescription:
    "Five slots - audience, problem, delivery, differentiator, pricing - make 86,400 ideas, each with a 1-10 build-effort score and a reusable seed.",
  intro:
    "The Random Startup Idea Generator builds a business concept by combining five independent slots — audience, problem, delivery model, differentiator and pricing model — into one of 86,400 distinct combinations. Each generated idea also gets a build-effort score from 1 to 10, calculated by adding the effort weight of each slot (1 for a form and a spreadsheet, 5 for regulated or marketplace work) and mapping the 6-to-23 raw total onto a 1-to-10 scale. It is a structured brainstorming prompt for founders, hackathon teams and product classes, not a market forecast.",
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
      "It measures how hard the idea is to build and sell, not how good it is. Each of the five slots carries a weight from 1 to 5; the raw total runs 6 to 23 and is mapped linearly onto 1 to 10, where 1-3 is a weekend build and 9-10 means regulated, hardware-bound or marketplace-liquidity work.",
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
  steps: [
    "Set the inputs: Lock the audience and Lock the delivery model both start on Surprise me and can be pinned to any one option, and Seed (the same seed rebuilds the same idea) is a number field running from 1 to 2147483647 that opens on 2026.",
    "Press New idea to draw a fresh seed. The card rewrites itself immediately, headed Idea #N of 86,400, with the headline, the pitch, the build-effort score as N/10 next to its band label (Weekend build, Small team, one quarter, Funded build or Hard mode) and a breakdown of Audience, Problem, Delivery, Differentiator, Pricing and Raw effort weight shown as N of 23.",
    "Copy puts the headline, the pitch, all five slot labels and a Build effort line on the clipboard and the button reads Copied! for two seconds; Shortlist adds the idea to a Shortlist (last 8, kept in this tab only) table of Idea, Seed and Effort; Reset puts the seed back to 2026, clears both locks and empties the shortlist.",
  ],
};

export default seo;
