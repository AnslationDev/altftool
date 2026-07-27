const seo = {
  intro:
    "The Rule of 72 estimates how many years an investment takes to double by dividing 72 by the annual compound rate of return — 72 ÷ 8% gives 9 years. This tool runs that shortcut alongside the exact logarithmic answer, ln(2) ÷ ln(1 + r), for annual, quarterly, monthly, daily or continuous compounding, so you can see exactly how much the mental-maths version is off. It also shows tripling time (Rule of 114), quadrupling time (Rule of 144) and what inflation does to the wait.",
  useCases: [
    "Sanity-checking a mutual fund or index fund pitch: at a 12% long-run return, money doubles about every 6 years, so a 25-year SIP horizon is roughly four doublings.",
    "Comparing a 7% fixed deposit with 9% debt fund returns to see the doubling gap — 10.3 years versus 8 years — before locking in a tenure.",
    "Showing a student or a client how inflation halves purchasing power: at 6% inflation, prices double in about 12 years even if nothing else changes.",
  ],
  benefits: [
    ["Shortcut and exact side by side", "See the 72 ÷ r estimate next to ln(2) ÷ ln(1 + r) and the precise error in years and percent."],
    ["Compounding actually matters", "Switch between annual, quarterly, monthly, daily and continuous compounding instead of assuming yearly."],
    ["Real returns, not just nominal", "Enter inflation and get the Fisher-adjusted real rate and the true years to double purchasing power."],
  ],
  faqs: [
    [
      "How does the Rule of 72 work?",
      "Divide 72 by the annual compound growth rate written as a whole number, and the answer is roughly the number of years to double. At 6% that is 72 ÷ 6 = 12 years, against an exact 11.90 years. The 72 comes from 100 × ln(2) ≈ 69.3, nudged up because 72 divides cleanly by 2, 3, 4, 6, 8, 9 and 12 and tracks the exact curve best near 8%.",
    ],
    [
      "Is the Rule of 72 accurate?",
      "It is within about 1% of the exact answer for rates between roughly 4% and 12%, which covers most investment returns. At 8% it predicts 9.00 years against an exact 9.01. Accuracy drops at extremes: at 1% it overstates the wait (72 years versus an exact 69.7), and at 30% it understates it (2.4 years versus 2.64).",
    ],
    [
      "When should I use the Rule of 70 or Rule of 69.3 instead?",
      "Use 69.3 for continuous compounding, because 100 × ln(2) = 69.3147 is the exact numerator in that case. Use 70 for low rates such as inflation, GDP growth or population growth, where it is closer than 72. Use 72 for everyday percentage returns because the arithmetic is easier.",
    ],
    [
      "How long does it take to triple money instead of double it?",
      "Divide 114 by the rate. At 8% that is 14.25 years, against an exact 14.27 years from ln(3) ÷ ln(1.08). Quadrupling is simply two doublings, so use 144 ÷ rate — 18 years at 8%. These are informational estimates that assume a constant rate; real returns vary, so consult a licensed financial adviser before planning around them.",
    ],
  ],
};

export default seo;
