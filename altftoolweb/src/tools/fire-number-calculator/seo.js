const seo = {
  intro:
    "This calculator turns your annual spending into a financial-independence target — annual expenses divided by your safe withdrawal rate, so 4% means 25 times a year's expenses — and then projects how long your current corpus and monthly investing take to reach it. Growth is modelled in real terms: it converts your nominal return and inflation into a real rate with (1 + return) ÷ (1 + inflation) − 1, so every figure on the page stays in today's rupees. It also computes your Coast FIRE number — the smaller balance that would grow into the full target by your chosen retirement age with no further contributions — and tells you whether you have already passed it.",
  useCases: [
    "You spend ₹6 lakh a year, have ₹15 lakh invested and put ₹50,000 a month away, and you want the month and the age at which the target is reached",
    "You are wondering whether you can stop adding to investments and let what you have coast to your number by 60, and you want the exact gap if you cannot yet",
    "You are deciding between funding a trimmed-down retirement and your current lifestyle, and want the Lean, Regular and Fat targets side by side before you set a savings rate",
  ],
  benefits: [
    [
      "Everything is computed on the real return",
      "A 12% nominal return with 6% inflation becomes 5.66% real, so the timeline is not flattered by inflation the way a nominal-only projection is.",
    ],
    [
      "Answers the coasting question directly",
      "It discounts your FIRE number back from your chosen retirement age and gives a yes/no verdict plus the rupee shortfall, rather than leaving you to work out whether you can stop contributing.",
    ],
    [
      "Prices three lifestyles from one expense figure",
      "Lean, Regular and Fat targets are derived at 0.7×, 1× and 1.5× your annual spending, each with its own timeline and the age you would reach it.",
    ],
  ],
  faqs: [
    [
      "What is my FIRE number?",
      "Your annual expenses divided by your safe withdrawal rate. At the 4% rule that is a 25× multiple, so ₹6 lakh of yearly spending gives a ₹1.5 crore target; at 3.5% the multiple is 28.6× and at 3% it is 33.3×.",
    ],
    [
      "What is Coast FIRE and how do I know if I'm coasting?",
      "Coasting means your existing corpus alone, left to compound at your real return until your retirement age, will reach your FIRE number without another rupee added. The tool computes that threshold as the FIRE number divided by (1 + real return) raised to the years remaining, then compares it against what you hold and reports the shortfall if you are not there yet.",
    ],
    [
      "How much does my savings rate change the timeline?",
      "Enormously — it is the single biggest lever. Starting from zero at a 5.66% real return and a 4% withdrawal rate, saving 10% of take-home takes about 47 years, 25% takes about 30, 50% takes about 16, and 75% takes about 7, because a higher rate raises contributions and lowers the target at the same time.",
    ],
    [
      "Why does it say my target is not reachable?",
      "Because the projection ran its full 960-month limit — 80 years — without the corpus reaching the target. That normally means the monthly contribution is zero or very small relative to the target, or your inflation input is at or above your expected return, which makes the real rate zero or negative. These are informational projections on fixed assumptions; consult a licensed adviser before making retirement decisions.",
    ],
  ],
};

export default seo;
