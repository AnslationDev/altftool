const seo = {
  intro:
    "A bond yield calculator converts a bond's face value, coupon rate, market price and years to maturity into two numbers: current yield (annual coupon ÷ market price) and an approximate yield to maturity using the standard bond-yield approximation, (C + (F − P) / n) ÷ ((F + P) / 2). It is built for investors comparing bonds that trade above or below par, where the printed coupon rate no longer describes the return. You get the annual coupon in currency, the current yield, the approximate YTM and the discount or premium to face value in one pass.",
  useCases: [
    "You are choosing between a 6% bond quoted at 950 and a 7% bond quoted at 1,080, and want to know which actually returns more if you hold both to maturity.",
    "A bond in your portfolio has fallen to 88 of face value and you want to see how much the pull-to-par gain lifts the yield above the 6% coupon printed on it.",
    "You are checking a broker's quoted YTM on a corporate bond before buying, and want an independent approximation from the four inputs on the term sheet.",
  ],
  benefits: [
    ["Two yields, not one", "Shows current yield and approximate YTM side by side so you can see how much of the return is coupon and how much is price pull-to-par."],
    ["Explains the gap to par", "Reports the discount or premium (price minus face value) as a currency figure, which is the amount amortised across the remaining years."],
    ["Uses the textbook approximation", "Applies the standard (C + (F − P) / n) ÷ ((F + P) / 2) formula rather than a hidden iterative solve, so the result is reproducible by hand."],
  ],
  faqs: [
    [
      "What is the difference between current yield and yield to maturity?",
      "Current yield is only the annual coupon divided by the market price, while yield to maturity also spreads the gain or loss between price and face value over the remaining years. On a 1,000 face bond with a 6% coupon bought at 950 with 10 years left, current yield is 6.32% but approximate YTM is about 6.67%, because the 50 discount is recovered at maturity.",
    ],
    [
      "How is the approximate yield to maturity calculated here?",
      "It uses the bond-yield approximation formula: annual coupon plus (face value minus price) divided by years, all divided by the average of face value and price. That average, (F + P) / 2, stands in for the capital tied up over the life of the bond, which is why the answer is an approximation rather than the exact internal rate of return.",
    ],
    [
      "Why is my yield higher than the coupon rate?",
      "Because you paid less than face value. A bond bought at a discount pays its coupon on the full face value while you invested less, and you are repaid the full face value at maturity, so both components push the yield above the coupon rate; a bond bought at a premium does the reverse.",
    ],
    [
      "How accurate is the approximation compared with a true YTM?",
      "It is usually within a few basis points to a few tenths of a percent of the exact figure, with the gap widening for long maturities and prices far from par. For a precise number, or for any actual purchase decision, use an exact IRR calculation and consult a qualified financial professional — this tool is informational, not investment advice.",
    ],
  ],
};

export default seo;
