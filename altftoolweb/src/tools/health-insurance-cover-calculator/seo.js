const seo = {
  title: "Health Insurance Cover Calculator: Sum Insured",
  metaDescription:
    "Sizes a family floater from city tier, family size, eldest age and chronic conditions, then shows the gap against the cover you already hold.",
  steps: [
    "Pick your band under \"Where you would be treated\" — Metro, Tier 1, Tier 2 or Tier 3 / smaller towns — then enter adults (1-4), children (0-6), the age of the eldest member and the cover you already hold in rupees.",
    "Tick \"Senior parents on the same policy\" or \"Someone has a chronic condition\" (a 30% loading), and set medical inflation and the plan horizon in years; the figure recalculates as you type and rounds to a sum-insured slab insurers actually sell.",
    "Read \"Recommended cover today\", the shortfall against your existing policy, and the suggested base policy plus super top-up split; \"Copy result\" puts the whole breakdown on the clipboard and Reset restores the defaults.",
  ],
  intro:
    "This health insurance cover calculator estimates the family floater sum insured you should be carrying, based on what a serious hospitalisation costs in your city band, how many people are on the policy, the age of the eldest member and any chronic condition in the household. It compares that figure against the cover you already hold, shows the gap, and suggests a cheaper base-policy-plus-super-top-up structure. It also projects the number forward at medical inflation, which in India has been running well ahead of retail inflation.",
  useCases: [
    "A Bengaluru couple with one child and a ₹5 lakh employer mediclaim wants to know how much personal cover to add before a job change.",
    "Someone whose parent has diabetes wants to see how a chronic-condition loading changes the sum insured they should target.",
    "A family holding a ₹10 lakh policy bought five years ago wants to check whether medical inflation has already made it too small.",
  ],
  benefits: [
    ["City-aware base cover", "Starts from what a major hospitalisation actually costs in a metro versus a tier-2 town."],
    ["Gap against what you hold", "Nets off employer and personal policies so you see only the extra cover to buy."],
    ["Base plus super top-up plan", "Suggests splitting the cover so you pay a far smaller premium for the upper layer."],
  ],
  faqs: [
    [
      "How much health insurance cover does a family in India need?",
      "For a young metro family of three, most planners suggest at least ₹15-25 lakh of floater cover, because a single cardiac or oncology admission in a top metro hospital can run past ₹10 lakh. Smaller cities need less, and households with senior members or chronic conditions need more.",
    ],
    [
      "What is a super top-up and why is it cheaper?",
      "A super top-up pays only after your total claims in a policy year cross a deductible, usually set equal to your base cover. Because the insurer is exposed to fewer, larger claims, the premium is a small fraction of a standalone policy of the same size — so ₹10 lakh base plus ₹15 lakh super top-up costs far less than a single ₹25 lakh policy.",
    ],
    [
      "Should I include my parents in the same family floater?",
      "Usually not. A floater is priced off the oldest person on it, so adding a 65-year-old parent raises the premium for everyone. A separate senior-citizen policy for parents is generally cheaper and avoids one big claim wiping out the whole family's sum insured.",
    ],
    [
      "Is employer group health cover enough on its own?",
      "It rarely is. Group cover is typically ₹3-5 lakh, may carry room-rent limits and co-pay, and ends the day you leave the company — often exactly when a fresh policy would mean serving pre-existing disease waiting periods again. Most people keep a personal policy running alongside it.",
    ],
  ],
};

export default seo;
