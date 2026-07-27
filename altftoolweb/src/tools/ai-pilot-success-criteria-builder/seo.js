const seo = {
  intro:
    "The AI Pilot Success Criteria Builder turns a vague AI trial into a written go/no-go rule: you declare the must-have and nice-to-have metrics, their baseline and target, and it calculates how many observations per arm you need to prove that lift is real. Sample size comes from the standard two-sided normal-approximation formulas — n = (z(1-alpha/2) + z(1-beta))^2 x [p1(1-p1) + p2(1-p2)] / (p1-p2)^2 for rates, and n = 2 x (z(1-alpha/2) + z(1-beta))^2 x sigma^2 / delta^2 for averages. It is built for product, operations and data leads who have to defend a pilot decision to a budget holder.",
  useCases: [
    "A support lead sizing a copilot pilot who needs to know whether 8 weeks of ticket volume is enough to prove a 10% to 15% deflection rate improvement",
    "A product manager writing the go/no-go paragraph in a pilot charter before procurement will release budget",
    "A data analyst checking, after a pilot has ended, whether the must-have criteria were actually met or only the nice-to-haves",
  ],
  benefits: [
    [
      "Criteria before results",
      "You commit to the pass mark before you see the data, which is what stops a pilot being graded on whatever number happened to look good.",
    ],
    [
      "Real power calculation",
      "The sample size is the textbook two-sample formula at your chosen confidence and power, not a rule of thumb.",
    ],
    [
      "Must vs nice separation",
      "Only must-have criteria gate the decision, so a pretty secondary metric cannot rescue a pilot that missed its core target.",
    ],
  ],
  faqs: [
    [
      "How many users do I need in an AI pilot?",
      "It depends entirely on the size of the lift you need to detect. To prove a rate moving from 10% to 15% at 95% confidence and 80% power you need 683 observations per arm — 1,366 in total. Halve the lift to 10% versus 12.5% and the requirement roughly quadruples, because sample size scales with 1 / (difference squared).",
    ],
    [
      "What should the success criteria for an AI pilot be?",
      "Pick one primary metric tied to the business outcome, give it a numeric baseline and target, and mark it must-have; everything else is nice-to-have. A workable set is three to five criteria with at most two must-haves — more gates than that and almost every pilot fails on something.",
    ],
    [
      "What do 95% confidence and 80% power actually mean here?",
      "95% confidence (alpha 0.05) means a 5% chance of calling a difference real when it is not. 80% power means an 80% chance of detecting the target lift if it genuinely exists — so a 20% chance of missing it. Raising power to 90% increases the required sample by roughly 34% at the same effect size.",
    ],
    [
      "What if the calculator says I need more data than my pilot can produce?",
      "You have three honest options: run longer, aim for a larger lift, or accept the pilot is directional rather than conclusive and say so in the charter. Quietly running an underpowered pilot and reporting a non-significant result as failure is the most common way good AI projects get killed.",
    ],
  ],
};

export default seo;
