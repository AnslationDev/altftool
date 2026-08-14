/*
 * AltF Ideas — Learn guides.
 *
 * Written to be genuinely useful and genuinely citable. Each guide opens with
 * an `answer` paragraph (40-70 words, self-contained) because that is the chunk
 * generative engines lift, then carries structured sections, a data table where
 * one exists, and FAQs. No guide exists purely to hold a keyword.
 */

export const GUIDES = [
  {
    slug: "how-to-validate-a-startup-idea",
    title: "How to validate a startup idea in a week",
    description:
      "A seven-day validation sequence that produces evidence instead of encouragement, with the specific questions to ask and the answers that should stop you.",
    updated: "2026-07-29",
    readingMinutes: 9,
    keywords: [
      "how to validate a startup idea",
      "startup idea validation",
      "validate business idea",
      "customer discovery questions",
    ],
    answer:
      "Validating a startup idea means finding evidence that a specific group of people already spends money or meaningful time solving a problem, before you build anything. In practice that is seven to ten conversations with people who have the problem, one written summary of what they currently do instead, and a clear answer to what they would have to stop using to adopt yours.",
    sections: [
      {
        h: "Validation is not asking people if they like it",
        p: [
          "The most common failure is a conversation that produces encouragement rather than evidence. If you describe your idea and ask whether it sounds useful, almost everyone says yes, because saying no to an enthusiastic person is socially expensive and costs them nothing to avoid.",
          "Useful validation asks about the past, not the future. What did you do the last time this happened? How long did it take? What did you use? What did that cost? Past behaviour is a fact; future intention is a guess wearing a fact's clothing.",
        ],
      },
      {
        h: "The seven-day sequence",
        list: [
          "Day 1 — Write down who specifically has this problem. Not 'small businesses' but 'the office manager at a four-chair dental practice'. If you cannot name a role, you cannot find ten of them.",
          "Day 2 — Find fifteen of those people. LinkedIn, industry forums, local associations, or the comment sections of the software they already complain about.",
          "Day 3-5 — Have seven to ten conversations. Twenty minutes each. Ask what they did last time, not what they would do next time.",
          "Day 6 — Write one page summarising what they currently do instead. If you cannot describe the incumbent workflow in detail, you have not learned enough.",
          "Day 7 — Decide. Do at least half of them describe the same painful workflow, and can you name what they would stop using?",
        ],
      },
      {
        h: "The questions that actually work",
        list: [
          "Walk me through the last time you had to do this. — Produces the real workflow, including the parts people forget to mention.",
          "What did you try before that? — Surfaces the graveyard of solutions they have already rejected, and why.",
          "How much time did it take, and who did it? — Converts vague pain into a number you can price against.",
          "What happens if it just does not get done? — Distinguishes an annoyance from a real cost. If the answer is 'nothing much', the demand score is optimistic.",
          "Who else would need to approve buying something for this? — Reveals the buying committee before it ambushes you.",
        ],
      },
      {
        h: "Signals that should stop you",
        list: [
          "Everyone agrees it is a problem but nobody has ever looked for a solution. Latent pain is much harder to monetise than active pain.",
          "The workflow varies so much between people that there is no shared job to automate.",
          "The person with the problem cannot authorise spending, and the person who can does not feel it.",
          "The incumbent is free and good enough, and switching costs are high.",
          "Every conversation ends with a feature request for a different product.",
        ],
      },
      {
        h: "What validation cannot tell you",
        p: [
          "Validation reduces the chance of building something nobody wants. It does not tell you whether you can reach those people affordably, whether you can build it well, or whether the market is large enough to matter. Those are separate questions, and each one has killed companies that validated perfectly.",
        ],
      },
    ],
    faqs: [
      {
        question: "How many customer conversations are enough?",
        answer:
          "Seven to ten from the same specific role is usually enough to see whether a shared workflow exists. Fewer and you are reading noise; many more without a pattern emerging usually means the segment is defined too broadly.",
      },
      {
        question: "Can I validate without talking to anyone?",
        answer:
          "Partially. Search volume, community complaint threads, job listings for the manual role, and the pricing pages of adjacent tools are all real evidence. But none of them tell you what someone would stop using, which is the question that decides whether you get paid.",
      },
      {
        question: "Should I build a landing page first?",
        answer:
          "A landing page measures whether your copy is compelling, which correlates weakly with whether the product is needed. It is a useful second step after conversations, not a replacement for them.",
      },
    ],
    related: ["how-to-score-a-startup-idea", "startup-idea-red-flags"],
  },

  {
    slug: "how-to-score-a-startup-idea",
    title: "How to score a startup idea without fooling yourself",
    description:
      "A practical framework for comparing ideas against each other, and the cognitive traps that make scoring feel rigorous while producing nothing.",
    updated: "2026-07-29",
    readingMinutes: 7,
    keywords: [
      "how to score a startup idea",
      "startup idea evaluation framework",
      "compare startup ideas",
      "opportunity scoring",
    ],
    answer:
      "Scoring a startup idea means rating it on a fixed set of independent criteria so that ideas can be compared against each other rather than judged in isolation. The value comes from the comparison, not the number: a score of 71 means nothing on its own, but 71 against a median of 59 across a hundred alternatives is a real signal.",
    sections: [
      {
        h: "Score to rank, not to decide",
        p: [
          "A score cannot tell you whether to build something. It can tell you which three of your twenty ideas deserve a week of validation each. That is a genuinely useful narrowing function, and it is the only job a score should be asked to do.",
          "Treating a score as a verdict is how people end up building the thing that scored 84 instead of the thing they actually understand. Founder-market fit is not in any framework and beats every framework.",
        ],
      },
      {
        h: "The criteria worth using",
        table: {
          caption: "Independent criteria for comparing ideas",
          head: ["Criterion", "Question it answers", "Common mistake"],
          rows: [
            ["Demand", "Are people already spending money or hours on this?", "Counting enthusiasm as demand"],
            ["Moat", "What stops the second mover from copying it in a month?", "Assuming being first is a moat"],
            ["Monetisation", "Who pays, how much, and how often?", "Pricing against cost rather than value"],
            ["Feasibility", "How small can version one be?", "Scoping version three"],
            ["Timing", "What changed recently that makes this possible now?", "'AI got better' as a why-now"],
            ["Open field", "How well is this already served?", "Mistaking an empty market for an opportunity"],
          ],
        },
      },
      {
        h: "Weight the criteria to your situation",
        p: [
          "The same idea is not equally good for everyone. A solo developer should weight feasibility far above moat, because an unfinished defensible product is worth zero. A venture-backed team should do the reverse, because a feasible undefendable product gets copied and margin-crushed.",
          "This is why fixed frameworks mislead: they encode one situation's priorities as universal truth. If you use a scoring system, adjust the weights before you adjust the ideas.",
        ],
      },
      {
        h: "Four traps",
        list: [
          "Scoring your favourite idea last, after calibrating on ideas you do not care about. Score it first, then compare.",
          "Letting one criterion leak into another. If 'timing' and 'demand' always move together in your scoring, you have one criterion, not two.",
          "Using a score to justify a decision you already made. If no score would change your mind, skip the exercise and admit the decision.",
          "Comparing scores across different scoring systems. A 78 from one framework and an 78 from another are unrelated numbers.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is a good startup idea score?",
        answer:
          "It depends entirely on the distribution it sits in. A score is only meaningful relative to the alternatives it was measured against, which is why percentile-anchored tiers are more useful than absolute thresholds.",
      },
      {
        question: "How many criteria should a scoring framework have?",
        answer:
          "Between four and seven. Fewer and it collapses into gut feel with extra steps; more and the criteria start overlapping, which double-counts the same underlying judgement.",
      },
      {
        question: "Should the criteria be weighted equally?",
        answer:
          "No. Equal weighting is a hidden assumption that every criterion matters equally to you, which is almost never true. Set the weights deliberately and write down why.",
      },
    ],
    related: ["how-to-validate-a-startup-idea", "why-now-analysis"],
  },

  {
    slug: "why-now-analysis",
    title: "Why-now analysis: the question that separates good ideas from old ones",
    description:
      "Most obvious ideas have been tried. Why-now analysis asks what changed, and it is the fastest way to tell a real opening from a well-trodden failure.",
    updated: "2026-07-29",
    readingMinutes: 6,
    keywords: ["why now startup", "market timing analysis", "startup timing", "enabling technology shift"],
    answer:
      "Why-now analysis asks what specifically changed to make an idea possible or urgent that was not true two years ago. A credible answer names a dated, external shift — a cost curve crossing a threshold, a regulation taking effect, a platform opening an API, or a behaviour becoming normal. If the only answer is that the idea seems good, someone has probably already tried it and failed for reasons that still apply.",
    sections: [
      {
        h: "Four kinds of real answer",
        table: {
          caption: "Categories of why-now, with what makes each credible",
          head: ["Type of shift", "What to look for", "Example of a weak version"],
          rows: [
            ["Cost curve", "A unit cost crossing below a human alternative", "'It got cheaper' with no threshold named"],
            ["Regulation", "A dated rule creating an obligation or opening data", "'Regulators care about this now'"],
            ["Platform access", "An API or data source that was previously closed", "'Integrations are easier these days'"],
            ["Behaviour", "A measurable change in what people already do", "'Everyone is used to AI now'"],
          ],
        },
      },
      {
        h: "The test",
        p: [
          "A good why-now can be written as a sentence with a date and a number in it. 'Real-time speech dropped below six cents a minute in 2025, which is under the cost of a part-time receptionist' is a why-now. 'Voice AI is getting really good' is a mood.",
          "If you cannot write the dated sentence, search for who tried this before. Someone almost always did. Their failure post-mortem is the most valuable document you will read all week, and it will usually tell you whether the blocker has actually lifted.",
        ],
      },
      {
        h: "Why-now cuts both ways",
        p: [
          "A strong why-now also means the window is shared. If a cost curve crossed a threshold eighteen months ago, everyone reading the same chart saw it too. Timing tells you the door is open; it says nothing about how long, or how many people are already walking through.",
          "The ideas with the most durable openings tend to pair a recent shift with something slow — a regulatory moat, a data asset that takes years to accumulate, or a buyer relationship that is expensive to earn.",
        ],
      },
    ],
    faqs: [
      {
        question: "What makes a good why-now answer?",
        answer:
          "A specific, dated, external change: a cost crossing a threshold, a regulation with an effective date, a newly opened API, or a measurable behaviour shift. If it cannot be written as a sentence containing a date and a number, it is not yet an answer.",
      },
      {
        question: "Is 'AI got better' a valid why-now?",
        answer:
          "Only when made specific. Which capability, crossing which threshold, making which previously-impossible task reliable enough that a human stops checking the output? That version is a real answer; the general one is not.",
      },
    ],
    related: ["how-to-score-a-startup-idea", "startup-idea-red-flags"],
  },

  {
    slug: "startup-idea-red-flags",
    title: "Eleven red flags in a startup idea",
    description:
      "Patterns that show up repeatedly in ideas that fail slowly — the expensive kind of failure, where it takes two years to find out.",
    updated: "2026-07-29",
    readingMinutes: 7,
    keywords: ["startup idea red flags", "bad startup ideas", "why startups fail", "startup mistakes"],
    answer:
      "The most expensive startup ideas are not obviously bad; they are plausible enough to absorb two years before failing. The recurring warning signs are a buyer who does not feel the pain, a workflow too variable to automate, a free incumbent that is good enough, and a why-now that cannot be stated with a date and a number.",
    sections: [
      {
        h: "The eleven",
        list: [
          "The person with the problem cannot authorise spending, and the person who can does not feel it.",
          "The incumbent is free, ugly, and good enough. Spreadsheets have beaten more startups than competitors have.",
          "The workflow varies so much between customers that every deal becomes a bespoke implementation.",
          "You cannot name what the customer stops using when they adopt you. Additive products get cut first in a budget review.",
          "The why-now cannot be written with a date and a number in it.",
          "Every customer conversation ends in a feature request for a different product.",
          "The market is enormous and undifferentiated, so you cannot describe your first ten customers specifically.",
          "The value only appears after a large data migration that nobody has budget or appetite for.",
          "Accuracy needs to be near-perfect for the product to be usable, and you have no path to measuring it.",
          "The buying cycle is longer than your runway, and no pilot shortens it.",
          "You are excited about the technology rather than the workflow. This one is the hardest to see from the inside.",
        ],
      },
      {
        h: "A red flag is not a stop sign",
        p: [
          "Several of the best businesses in existence started with three of these. A long buying cycle in regulated healthcare is also a moat. A workflow that varies between customers is also a reason incumbents have not automated it.",
          "The point is to notice them deliberately, price them into your plan, and be honest about which ones you are choosing to accept. The failure mode is not having a red flag; it is having one you never named.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is the most common reason startup ideas fail?",
        answer:
          "Building something people describe as useful but never actively looked for. Latent pain converts far worse than active pain, and enthusiasm in a conversation is not evidence of either.",
      },
      {
        question: "How do I know if my incumbent is 'good enough'?",
        answer:
          "Ask how long the current workflow takes and whether anyone has ever tried to replace it. If nobody has searched for an alternative, the pain is not yet expensive enough to sell against.",
      },
    ],
    related: ["how-to-validate-a-startup-idea", "why-now-analysis"],
  },

  {
    slug: "vertical-saas-opportunities",
    title: "Why vertical SaaS still has room",
    description:
      "Horizontal software is crowded and vertical software is not, for structural reasons that have not changed. Where the remaining openings actually are.",
    updated: "2026-07-29",
    readingMinutes: 8,
    keywords: ["vertical SaaS", "vertical SaaS ideas", "niche software business", "industry specific software"],
    answer:
      "Vertical SaaS means software built for one industry's specific workflow rather than a general capability sold to everyone. It remains less crowded than horizontal software because each vertical is individually too small to attract large competitors, requires domain knowledge that is expensive to acquire, and rewards workflow depth over feature breadth.",
    sections: [
      {
        h: "The structural reason it stays open",
        p: [
          "A horizontal tool can be sold to every company on earth, which is exactly why fifty companies are selling one. A vertical tool for marine surveyors has a total addressable market that would embarrass a venture investor, which is why nobody funded a competitor.",
          "That asymmetry is durable. The market size that makes a vertical unattractive to a large company is the same market size that makes it excellent for a small one. A few hundred customers at a five-figure contract value is a failed venture outcome and a very good life.",
        ],
      },
      {
        h: "Where the openings concentrate",
        list: [
          "Industries where the incumbent software was written before the workflow moved to phones.",
          "Jobs that sit between two systems, where the handoff is currently a person retyping.",
          "Compliance work with a recent deadline, where the obligation is new and the tooling is not.",
          "Fragmented operator markets — thousands of independents with the same problem and no shared vendor.",
          "Work that is done at night or on weekends because it does not fit the working day.",
        ],
      },
      {
        h: "What makes vertical SaaS hard",
        p: [
          "The domain knowledge is real and cannot be shortcut. Selling into an industry whose vocabulary you do not speak fails quickly and visibly. This is why career changers with fifteen years inside an industry are structurally advantaged here in a way they are not in horizontal software.",
          "Integration is the other tax. Vertical incumbents often hold the system of record and have no interest in an open API. Budget real time for this, and treat 'we will integrate later' as a plan that has already failed.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is vertical SaaS still a good business in 2026?",
        answer:
          "Yes, for the same structural reason it always was: individual verticals are too small to attract large competitors while being large enough to support a focused company. What has changed is that AI mechanisms make previously unautomatable workflows tractable, which widens the set of viable verticals.",
      },
      {
        question: "How small can a vertical be?",
        answer:
          "If a few hundred businesses share the workflow and the pain is worth four figures a year each, that supports a small profitable company. It does not support a venture-scale one, and conflating those two targets is the most common planning error here.",
      },
    ],
    related: ["how-to-score-a-startup-idea", "how-to-validate-a-startup-idea"],
  },
];

export function findGuide(slug) {
  return GUIDES.find((g) => g.slug === slug) ?? null;
}
