const seo = {
  intro:
    "The Rule of 72 Calculator estimates how long an investment takes to double by dividing 72 by the annual rate of return, and runs the same shortcut in reverse to find the rate needed to double within a target number of years. Alongside the shortcut it computes the exact answer from the compound formula, ln(2) ÷ ln(1 + r), and reports how far the approximation is off in years and as a percentage. It also charts the doubling, tripling, quadrupling and 8× milestones so you can see the whole compounding path rather than a single number.",
  useCases: [
    "A fund has returned about 12% a year and you want a fast sanity check on how long your money would take to double at that pace before reading the fine print.",
    "You have 9 years until a goal and want to know what annual return would be needed to double the amount by then.",
    "You are explaining compounding to someone and want to show why 6% and 12% are not a small difference — 12 years to double versus 6.",
  ],
  benefits: [
    [
      "Shows the shortcut and the truth",
      "Puts 72 ÷ rate next to the exact ln(2) ÷ ln(1 + r) result and states the error, so you know when the mental shortcut is safe to use.",
    ],
    [
      "Works in both directions",
      "Switch between solving for years at a known rate and solving for the rate needed to double within a fixed deadline.",
    ],
    [
      "Beyond doubling",
      "Projects 3×, 4× and 8× milestones and plots the growth curve, since most goals are not exactly a doubling.",
    ],
  ],
  faqs: [
    [
      "How does the Rule of 72 work?",
      "Divide 72 by the annual rate of return to get the approximate number of years to double: at 8%, 72 ÷ 8 = 9 years. Reverse it to find a required rate — to double in 6 years you need roughly 72 ÷ 6 = 12% a year.",
    ],
    [
      "How accurate is the Rule of 72?",
      "It is most accurate between about 6% and 10%, where the error is a fraction of a year. At 8% the rule says 9.0 years and the exact compound formula gives 9.01; at 4% the rule says 18 years against an exact 17.7, and at 20% the gap widens further. The calculator shows the exact figure and the error alongside every estimate.",
    ],
    [
      "Why 72 and not 70 or 69.3?",
      "The mathematically exact constant for continuous compounding is 69.3, but 72 is used because it divides cleanly by 2, 3, 4, 6, 8, 9 and 12 — which makes the arithmetic doable in your head. For annually compounded returns in the 6–10% band, 72 also happens to be the closer fit.",
    ],
    [
      "Does the Rule of 72 account for inflation, fees or tax?",
      "No — it uses whatever single rate you enter, so if you want a real doubling time, enter the return after inflation, fees and tax rather than the headline figure. A nominal 10% return with 5% inflation doubles purchasing power in about 14 years, not 7. This is an informational estimate; talk to a licensed financial adviser before making investment decisions.",
    ],
  ],
};

export default seo;
