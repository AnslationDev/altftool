const seo = {
  intro:
    "This calculator works out the monthly contribution needed to hit a savings target by a chosen date, using the sinking-fund formula PMT = FV x i / ((1 + i)^n - 1), where i is your annual return divided by 12 and n is the number of months. It first grows whatever you have already saved at the annual rate for the full horizon, subtracts that future value from the target, and solves only for the shortfall. Enter a target, a time horizon in years, an expected annual return and your current savings, and you get the monthly figure plus what today's savings will be worth by the deadline.",
  useCases: [
    "You want a 20 lakh house deposit in six years and already have 4 lakh set aside, and need to know what standing instruction to set up on payday",
    "Your child starts university in 11 years and you want to see how much lower the monthly number gets if you assume 8% instead of 5% — and how much of the total the returns are doing versus you",
    "You have a fixed monthly amount you can spare and are working backwards: you adjust the horizon until the required contribution drops to what you can actually afford",
  ],
  benefits: [
    ["Existing savings are compounded, not just subtracted", "Current savings grow at the annual rate for the whole horizon before the shortfall is worked out, so you are not told to save more than you need."],
    ["Solves for the payment, not the balance", "Most calculators grow a contribution you guess; this one inverts the annuity formula and hands you the contribution directly from the target."],
    ["Zero-return case handled correctly", "If you enter 0% expected return it falls back to a straight target divided by months, so a cash-under-the-mattress plan still gives a sensible answer."],
  ],
  faqs: [
    [
      "How much do I need to save each month to reach 10 lakh in 5 years?",
      "About 13,610 a month at an 8% annual return, starting from zero. Without any return at all you would need 16,667 a month, so the compounding is covering roughly 18% of the goal over that five-year window.",
    ],
    [
      "What formula does it use?",
      "The future value of an ordinary annuity, rearranged to solve for the payment: PMT = FV x i / ((1 + i)^n - 1). The monthly rate i is the annual rate divided by 12 and n is years x 12, which assumes contributions land at the end of each month and returns compound monthly.",
    ],
    [
      "What return rate should I assume?",
      "Use a rate that matches the instrument you will actually hold, and err low. A recurring deposit or debt fund behaves very differently from an equity index, and because the payment scales inversely with growth, an optimistic rate quietly under-funds the goal. This is an informational projection, not a forecast or investment advice — a licensed adviser should confirm the assumptions before you commit.",
    ],
    [
      "Does it account for inflation or tax on returns?",
      "No. The target you enter is treated as a nominal amount in today's currency, and returns are applied gross. If the goal is 15 years out, enter a target you have already inflated yourself, and remember that capital gains tax on the growth will reduce what you actually receive.",
    ],
  ],
};

export default seo;
