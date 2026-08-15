const seo = {
  title: "FD Premature Withdrawal Calculator: Break",
  metaDescription:
    "What a bank pays when you close an FD early — repriced at the card rate for the period it ran, less the penalty — versus a loan held to the maturity date.",
  steps: [
    "Enter \"Deposit amount (INR)\", \"Contracted rate (% per year)\", \"Original tenure (months)\" and \"Months completed so far\".",
    "Add the \"Bank's card rate for the completed period (%)\" and the \"Premature closure penalty (percentage points)\", plus \"Cash you need now (INR)\" and the loan rate.",
    "Read \"You receive on breaking\" with the rate actually applied, then compare the \"Break the deposit\" and \"Borrow against it\" columns at the original maturity date.",
  ],
  intro:
    "This calculator shows what a bank actually pays when you close a fixed deposit before its maturity date: interest is recomputed at the card rate for the period the deposit really ran, then reduced by the bank's premature closure penalty, which is typically 0.50 to 1.00 percentage points. It also runs the alternative — borrowing against the deposit and letting it mature — and compares the two on what you hold at the original maturity date. Useful when you need cash mid-term and want to know which route costs less.",
  useCases: [
    "Find out how much of your interest disappears when a 3-year deposit booked at 7.2% is closed after 14 months.",
    "Decide between breaking a deposit and taking a loan against it at roughly 1.5 points above the deposit rate.",
    "Check the realised annual return on money that sat in a deposit you had to close early.",
  ],
  benefits: [
    ["Repricing, not just penalty", "Applies the card rate for the run period first, which usually costs more than the penalty itself."],
    ["Like-for-like comparison", "Values both routes at the original maturity date, so the shorter and longer horizons line up."],
    ["Honest edge cases", "Flags when the penalty wipes out the whole rate, or when breaking cannot raise the cash you need."],
  ],
  faqs: [
    [
      "How much penalty do banks charge for breaking an FD?",
      "Most Indian banks levy 0.50% to 1.00% on the applicable rate, set by their own board-approved policy under the RBI Master Direction on Interest Rate on Deposits. The bigger loss is usually the repricing: interest is recalculated at the card rate for the period the deposit actually ran, not the rate you booked.",
    ],
    [
      "What interest do I get if I close an FD early?",
      "The rate the bank quotes for a deposit of the length yours actually ran, minus the penalty. So a 3-year deposit booked at 7.2% but closed at 14 months earns the 12–18 month card rate, say 6.8%, less a 1% penalty — 5.8% — applied with quarterly compounding.",
    ],
    [
      "Is a loan against an FD better than breaking it?",
      "Often yes, especially close to maturity. The loan is priced about 1 to 2 percentage points above your deposit rate and you pay interest only on what you borrow for the months left, while the deposit keeps earning its contracted rate on the full amount instead of being repriced downward.",
    ],
    [
      "Do I get any interest if I close a deposit within a few days?",
      "No. A term deposit that has run for fewer than seven days earns no interest at all, so a deposit closed in the first week returns only the principal. Interest also stops accruing at the contracted rate for any period beyond the maturity date unless the deposit has an auto-renewal instruction.",
    ],
  ],
};

export default seo;
