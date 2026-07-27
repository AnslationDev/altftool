const seo = {
  intro:
    "A loan against a fixed deposit is a secured overdraft priced at the deposit's own rate plus a spread, and this calculator sets it against the alternative of closing the deposit early. Breaking an FD reprices the interest to the card rate for the period the money actually stayed, minus a premature-withdrawal penalty of usually 0.5% to 1%, applied from the date of deposit. Both routes are valued at the original maturity date, with quarterly compounding on the deposit and simple interest on the overdraft, so the two figures are directly comparable.",
  useCases: [
    "Needing Rs 3 lakh eighteen months into a five-year Rs 5 lakh deposit and deciding whether to close it or take an overdraft.",
    "Checking whether a 90% loan-to-value overdraft even covers the amount you need before applying.",
    "Testing how the answer flips when the bank's premature penalty is 0.5% instead of 1%, or the loan spread is 1% instead of 2%.",
  ],
  benefits: [
    [
      "Prices the repricing, not just the penalty",
      "Premature closure pays the card rate for the run period less the penalty — the larger cost, and the one people miss.",
    ],
    [
      "Checks the loan-to-value first",
      "Flags when 90% of the deposit value is less than the cash you need, so the comparison stays honest.",
    ],
    [
      "One comparable number",
      "Both routes are carried forward to the original maturity date, so the verdict is a single rupee difference.",
    ],
  ],
  faqs: [
    [
      "How much can I borrow against a fixed deposit?",
      "Banks typically lend 90% of the deposit value, and some go up to 95%. The limit is set by each bank's board-approved policy rather than by RBI, and the deposit is marked as lien so it cannot be closed while the loan is outstanding.",
    ],
    [
      "What interest rate is charged on a loan against FD?",
      "The deposit's contracted rate plus a spread of about 1% to 2% a year. On a 7% deposit that means roughly 8% to 9%, which is well below any unsecured personal loan, and interest is charged only on the amount actually drawn.",
    ],
    [
      "How much do I lose by breaking a fixed deposit early?",
      "Two things: the interest is recomputed at the card rate for the period the deposit actually ran, and a penalty of usually 0.5% to 1% is deducted from that rate. Both apply from the date of deposit, so a five-year deposit closed at 18 months earns roughly the 18-month rate minus the penalty for the whole 18 months.",
    ],
    [
      "Is a loan against FD better than breaking it?",
      "Usually yes when the loan is needed for a short period or the deposit was booked at a high rate, because you only pay the spread rather than surrender the whole rate difference. Breaking wins when the money is needed for most of the remaining tenure and the penalty is small — which is exactly what this calculator settles for your numbers.",
    ],
  ],
};

export default seo;
