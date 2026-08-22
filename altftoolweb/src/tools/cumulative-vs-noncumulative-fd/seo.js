const seo = {
  title: "Cumulative vs Non-Cumulative FD Compared",
  metaDescription:
    "Compare quarterly compounding with monthly, quarterly, half-yearly or annual payouts at the same rate, plus the break-even reinvestment rate and TDS.",
  steps: [
    "Enter the Deposit amount (INR), the Interest rate (% per year) and the Tenure (years, 1 to 10).",
    "Pick the 'Payout frequency on the non-cumulative option' — Monthly, Quarterly, Half-yearly or Annually — set the rate you would reinvest payouts at (0 if the income is spent) and your marginal slab rate, and tick the resident senior citizen box for the higher TDS threshold.",
    "Read what compounding is worth over the term, the actual payout beside the cumulative maturity value, the Break-even reinvestment rate, and the TDS and post-tax value of each structure; press Copy result.",
  ],
  intro:
    "This comparator puts a cumulative fixed deposit, which leaves interest inside the deposit to compound quarterly at P x (1 + r/4)^(4n), beside a non-cumulative deposit that pays the same interest out monthly, quarterly, half-yearly or annually. It shows the payout you would actually receive, the total the compounding option earns instead, and — solved numerically — the reinvestment rate at which the payout route catches up. It is for savers choosing between an income deposit and a growth deposit at the same bank and rate.",
  useCases: [
    "See what a ₹10 lakh deposit at 7.25% pays out each month, and why it is less than the rate divided by twelve.",
    "Decide whether monthly interest credited to a savings account at 3% beats letting the deposit compound.",
    "Find the reinvestment rate a retiree would need to match a cumulative deposit while still drawing an income.",
  ],
  benefits: [
    ["Real payout convention", "Uses the discounted payout banks apply for periods shorter than a quarter, not a naive rate divided by twelve."],
    ["Break-even rate solved", "Bisects for the exact reinvestment rate at which the payout stream equals the compounded deposit."],
    ["Both structures taxed", "Applies the section 194A TDS test and your slab rate to each option separately."],
  ],
  faqs: [
    [
      "What is the difference between a cumulative and a non-cumulative fixed deposit?",
      "A cumulative deposit keeps the interest inside the deposit so it compounds and everything is paid at maturity. A non-cumulative deposit pays interest out at a chosen frequency and returns only the principal at maturity, so the total received is lower unless the payouts are reinvested.",
    ],
    [
      "Why is my monthly interest payout less than the rate divided by twelve?",
      "Because banks accrue interest quarterly and discount anything paid before the quarter ends. The monthly payout is P x ((1 + r/4)^(1/3) − 1), so a ₹10 lakh deposit at 7.25% pays about ₹6,006 a month rather than the ₹6,042 that dividing by twelve suggests.",
    ],
    [
      "Which fixed deposit option is better for a retiree?",
      "It depends on whether the interest is needed for spending. A non-cumulative deposit gives predictable monthly income; a cumulative deposit produces more money in total but nothing until maturity. If the income would simply sit in a savings account earning 3%, the cumulative option almost always ends ahead. This is general information, not personal financial advice.",
    ],
    [
      "Is a cumulative FD taxed only at maturity?",
      "No. Interest is taxable as it accrues each year even though it is not received, and banks deduct TDS on the interest credited each financial year once it crosses ₹50,000, or ₹1,00,000 for a resident senior citizen. Waiting until maturity to declare the whole amount can create a mismatch with your Form 26AS.",
    ],
  ],
};

export default seo;
