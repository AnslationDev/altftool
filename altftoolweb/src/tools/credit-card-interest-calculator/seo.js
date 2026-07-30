const seo = {
  intro:
    "This calculator shows what paying only the minimum due on a credit card really costs, by simulating the balance month by month: interest at APR/12 on the outstanding amount, 18% GST charged on that interest, and a minimum payment of the greater of a set percentage of the total due or a floor amount. It reports how many months the card takes to clear, the total interest and GST paid, and compares that against a fixed monthly payment or a plan sized to clear the balance in 3, 6 or 12 months. Figures are in rupees, with the GST treatment used on Indian card statements.",
  useCases: [
    "Your statement shows a large balance and a comfortingly small minimum due, and you want to see what happens if you keep paying only that",
    "You are deciding between paying a fixed amount every month and taking the card balance onto a personal loan, and need the total interest figure to compare against",
    "You want to clear a festive-season balance within six months and need to know the exact monthly payment that achieves it, GST included",
  ],
  benefits: [
    ["The minimum-payment trap is quantified", "It runs the balance forward month by month until it clears, so the payoff period is a simulated result rather than a rule of thumb."],
    ["GST on interest is included", "18% GST on the finance charge is added every month, which most payoff calculators leave out entirely."],
    ["Target plans alongside the trap", "The payment needed to clear in 3, 6 or 12 months is solved directly, so you have an actionable number, not just a warning."],
  ],
  faqs: [
    [
      "What happens if I only pay the minimum due every month?",
      "The balance barely moves, because most of the payment covers interest. On a ₹85,000 balance at 42% APR with a 5% minimum, the simulation takes 326 months — over 27 years — and costs about ₹3.15 lakh in interest and GST, nearly four times what was borrowed.",
    ],
    [
      "How much faster is a fixed monthly payment?",
      "Dramatically faster, because the payment stops shrinking as the balance falls. The same ₹85,000 at 42% APR clears in 15 months at a fixed ₹8,000 a month, with roughly ₹29,000 of interest and GST — against ₹3.15 lakh on the minimum-only path.",
    ],
    [
      "Is GST charged on credit card interest?",
      "Yes, in India GST at 18% applies to the interest and finance charges on a card, and this calculator adds it to every month's interest. So a card quoted at 3.5% a month effectively costs about 4.13% a month once GST is applied.",
    ],
    [
      "What is the minimum due usually set at?",
      "Commonly 5% of the total amount due, subject to a small floor amount, and the calculator defaults to 5% with a ₹200 floor — but issuers differ, and some add the full EMI and overlimit amounts on top. Check the minimum-due formula printed on your own statement, and treat this as an informational estimate rather than financial advice.",
    ],
  ],
};

export default seo;
