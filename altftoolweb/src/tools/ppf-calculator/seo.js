const seo = {
  title: "PPF Calculator: Year-Wise Growth at the 7.1% Rate",
  metaDescription:
    "Project PPF maturity year by year at 7.1%, within the ₹500-₹1,50,000 yearly limits, over 15, 20 or 25 years with loan and withdrawal caps.",
  steps: [
    "Type your deposit into the 'Yearly investment (₹)' box or drag its slider, staying inside the '₹500 min' and '₹1,50,000 max / year' bounds printed beneath it, then set 'Interest rate (% p.a.)', which opens at the notified 7.1%.",
    "Pick a Duration button — '15 years' (Base term), '20 years' (+5 extension) or '25 years' (+10 extension). There is no calculate button: the maturity figure recomputes the moment a field changes, and 'Reset to defaults' returns you to ₹50,000 at 7.1% over 15 years.",
    "Read the maturity amount with the Total invested, Total interest and Effective multiple tiles, scan the Year-wise growth table's Year, Deposit, Interest earned and Closing balance columns where post-15 years carry an 'Ext' badge, then press 'Copy summary'.",
  ],
  intro:
    "The PPF Calculator projects a Public Provident Fund balance year by year, compounding annually on the assumption that each year's deposit goes in at the start of the year, so the closing balance is (previous balance + deposit) x (1 + rate). It is for anyone deciding how much to put into PPF this financial year and wanting to see the maturity figure, the split between money invested and interest earned, and how a 5-year extension changes the curve. The rate is prefilled at 7.1% per annum and the yearly deposit is capped at the statutory ₹1,50,000, with ₹500 as the minimum.",
  useCases: [
    "You are deciding between ₹50,000 and the full ₹1,50,000 a year and want to see the gap in the maturity figure across the 15-year term before you commit.",
    "Your PPF account is approaching maturity and you want to compare closing at 15 years against extending to 20 or 25 with the same annual deposit.",
    "You need money in year 4 and want a rough figure for the loan you could take — 25% of the balance held two years earlier — before asking at the bank.",
  ],
  benefits: [
    [
      "Year-by-year table, not just a maturity number",
      "Each of the 15 to 25 years shows opening deposit, interest credited and closing balance, so you can see the point at which annual interest overtakes the annual deposit.",
    ],
    [
      "Extension years shown separately",
      "The growth chart colours years 16 onward differently from the base 15-year term, making the effect of one or two 5-year extension blocks visible at a glance.",
    ],
    [
      "Loan and withdrawal limits applied to your numbers",
      "Instead of stating the rules abstractly, it computes your year-3 loan ceiling and year-7 partial withdrawal ceiling from the balances your own inputs produce.",
    ],
  ],
  faqs: [
    [
      "What is the maximum I can deposit in PPF in a year?",
      "₹1,50,000 per financial year, with a minimum of ₹500 to keep the account active — the calculator enforces both. The limit applies across all PPF accounts you hold, including one opened for a minor.",
    ],
    [
      "How long is a PPF account locked in, and can I extend it?",
      "The base term is 15 years, after which the account can be extended in blocks of 5 years, any number of times, with or without fresh deposits. The 20-year and 25-year options model one and two extension blocks respectively.",
    ],
    [
      "When can I take a loan or withdraw from PPF?",
      "A loan is available between the 3rd and 6th financial year, capped at 25% of the balance at the end of the year two years prior. Partial withdrawal opens from the 7th year, capped at 50% of the balance four years prior. The calculator shows both limits for your inputs.",
    ],
    [
      "Is PPF interest taxable?",
      "PPF is in the exempt-exempt-exempt (EEE) category: deposits qualify for a Section 80C deduction, the annual interest is tax-free, and the maturity amount is tax-free. The interest rate itself is notified by the government and can change from quarter to quarter, so the projection is an estimate at whatever rate you enter rather than a guaranteed return. This is informational only — confirm current rates, deduction eligibility under your tax regime, and account rules with your bank, post office or a qualified financial adviser.",
    ],
  ],
};

export default seo;
