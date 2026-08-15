const seo = {
  title: "Chit Fund Calculator with XIRR on Your Bidding",
  metaDescription:
    "Simulate a chit month by month — discount, foreman commission, dividend — then price your bidding month as an XIRR against FD, RD, PPF and loan rates.",
  intro:
    "A chit is auctioned every month: the member willing to accept the biggest discount takes the pot, the foreman keeps his commission out of that discount, and whatever is left is shared back to every member as dividend. This calculator runs the full term month by month — subscription of chit value divided by the number of months, a discount you set tapering from the first month to the last, commission capped at the foreman percentage, and dividend of (discount minus commission) divided by members — then tells you what your chosen bidding month costs or earns. It ends with an XIRR on the actual cash flows, so an early bid is priced as borrowing and a late bid as saving, against FD, RD, PPF, gold loan and personal loan benchmarks.",
  useCases: [
    "You are in a 25-month chit and deciding whether to bid in month 4 for a house deposit or hold out to month 25, and want the cost of bidding early in percentage terms",
    "A foreman is pitching a chit as a savings scheme and you want to see the annualised return if you never bid until the end, compared with a bank FD",
    "You are choosing between raising money through a chit and taking a personal loan, and need the two on the same effective-rate footing",
  ],
  benefits: [
    ["Prices your bid as an actual interest rate", "An XIRR is solved on the real dated cash flows, so a chit becomes directly comparable with a loan rate or a deposit rate instead of a vague total."],
    ["Knows whether you are borrowing or saving", "It compares the timing of money in against money out and picks the right benchmark set — loan rates for an early bid, deposit rates for a late one."],
    ["Flags terms a registered chit cannot have", "Discounts above the statutory ceiling trigger a warning, and the foreman commission field is labelled against the legal cap."],
  ],
  faqs: [
    [
      "How is the monthly dividend in a chit fund calculated?",
      "Take the winning discount for that month, subtract the foreman's commission, and divide the remainder equally among all members. So on a Rs 5,00,000 chit with a 25% discount and 5% commission, Rs 1,25,000 less Rs 25,000 leaves Rs 1,00,000 to share; across 25 members that is Rs 4,000 each, reducing that month's subscription from Rs 20,000 to Rs 16,000.",
    ],
    [
      "What is the maximum foreman commission allowed?",
      "The Chit Funds Act, 1982 caps the foreman's commission at 5% of the chit value, taken out of the discount each month. The Act also limits the discount itself, so the prize money handed to the winning bidder cannot be cut below 70% of the chit value.",
    ],
    [
      "Is bidding early or bidding late better?",
      "Neither is universally better, because they are different transactions. Bidding early means taking the pot before you have paid it in, which is borrowing at whatever rate the discount implies; bidding last means you have subscribed throughout and collected dividends, which is saving. The calculator shows the effective rate for each so you can compare against the alternative you actually have.",
    ],
    [
      "Are chit funds safe?",
      "Registered chits run under the Chit Funds Act, 1982 carry statutory protections that unregistered private chits do not, including a filed chit agreement and security deposited by the foreman. Default by other members, and foreman insolvency, remain the real risks — this tool models the arithmetic only and is not financial advice, so check the registration and take professional advice before committing.",
    ],
  ],
};

export default seo;
