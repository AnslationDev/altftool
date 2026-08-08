const seo = {
  title: "BAC Calculator: Widmark Formula and 0.08% Check",
  metaDescription:
    "Estimate BAC with the Widmark formula: 14 g per standard drink, 0.68/0.55 body factor, minus 0.015% per hour. Educational estimate, not a driving test.",
  intro:
    "The Blood Alcohol Content Calculator estimates BAC with the Widmark formula, treating each standard drink as 14 grams of pure alcohol, dividing by body weight times a distribution factor of 0.68 for men or 0.55 for women, and subtracting 0.015 percentage points per hour for elimination. It reports the result as a percentage and flags whether it sits above or below the 0.08% threshold used in most of the United States. It is an educational estimate for understanding how drinks, weight and time interact — never a fitness-to-drive test.",
  useCases: [
    "You are curious why the same three drinks affect you and a heavier friend so differently, and want to see the weight term in the formula do the work.",
    "You are studying pharmacology or forensic science and need to check a Widmark worked example against the textbook answer.",
    "You are planning an event and want to understand roughly how many hours the body needs to clear a given number of drinks before people would even begin to consider driving the next morning.",
  ],
  benefits: [
    ["States the assumptions it uses", "The 14 g standard drink, the 0.68 and 0.55 distribution factors and the 0.015 per hour elimination rate are the Widmark constants, not hidden fudge factors."],
    ["Shows the grams of alcohol, not just a percentage", "Seeing that three drinks is 42 grams of ethanol makes the input side of the calculation concrete and easy to sanity-check."],
    ["Time is part of the answer", "Hours since the first drink are subtracted at the elimination rate, so the estimate falls as it should rather than treating all drinks as if consumed at once."],
  ],
  faqs: [
    [
      "How is BAC calculated?",
      "The Widmark equation: grams of alcohol divided by (body weight in grams x the distribution factor r), expressed as a percentage, minus 0.015 per hour elapsed. Here r is 0.68 for men and 0.55 for women, reflecting differences in body water proportion.",
    ],
    [
      "How much alcohol is in one standard drink?",
      "This tool uses 14 grams of pure ethanol, the US standard drink — roughly a 350 ml regular beer at 5%, 150 ml of wine at 12%, or 45 ml of 40% spirits. The UK unit is 8 grams and Australia uses 10, so convert before entering a count.",
    ],
    [
      "How long does it take for alcohol to leave your system?",
      "Roughly one hour per standard drink, since the body clears alcohol at about 0.015 percentage points of BAC per hour and one drink raises a typical adult by around that much. A BAC of 0.08% therefore takes about five hours to reach zero — and nothing speeds it up: not coffee, food, a cold shower or exercise.",
    ],
    [
      "Can I use this to decide if I am safe to drive?",
      "No. This is an educational estimate only. Real BAC varies with food, medication, drinking pace, health and individual metabolism, and impairment begins well below any legal limit — 0.05% in much of Europe and 0.03% or effectively zero in India, Brazil and many other countries. If you have been drinking, do not drive.",
    ],
  ],
};

export default seo;
