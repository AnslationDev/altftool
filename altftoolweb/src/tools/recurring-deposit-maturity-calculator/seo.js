const seo = {
  title: "RD Calculator: Recurring Deposit Maturity and TDS",
  metaDescription:
    "Values every RD instalment for its own holding period at quarterly compounding, then shows year-wise interest, section 194A TDS and post-tax value.",
  steps: [
    "Enter the Monthly instalment (INR), the Interest rate (% per year) and the Tenure (months) between 6 and 120 — or tap a tenure preset — then pick your marginal slab rate.",
    "Set the TDS status boxes: 'Senior citizen', 'PAN given to bank' and 'Form 15G / 15H filed', so the right section 194A threshold and deduction rate are applied to each year's interest.",
    "Read the Maturity value, the 'Interest credited year by year' table and the value after tax; enter a figure under 'Work backwards from a goal' for the instalment needed, then press 'Copy result'.",
  ],
  intro:
    "This calculator gives the maturity value of a bank recurring deposit by valuing each monthly instalment separately: an instalment paid in month m of an n-month RD stays invested for (n − m + 1) months and grows at the quarterly compounded rate, so the maturity value is the sum of those n amounts. It also splits the interest by year, applies section 194A TDS and shows the post-tax figure. Savers use it because an RD's headline rate overstates the return — only the first instalment earns interest for the full term.",
  useCases: [
    "See what ₹5,000 a month at 6.75% for 36 months actually matures to before committing to the standing instruction.",
    "Work backwards from a ₹5,00,000 goal to the monthly instalment your chosen tenure and rate require.",
    "Check whether a large RD's yearly interest crosses ₹50,000 and starts attracting TDS.",
  ],
  benefits: [
    ["Instalment-level maths", "Values every deposit for its own holding period instead of applying the rate to the full amount."],
    ["Goal mode", "Turns a target maturity amount into the monthly instalment needed at your rate and tenure."],
    ["Tax shown properly", "Splits interest by year for the TDS test and then applies your slab rate to the whole amount."],
  ],
  faqs: [
    [
      "How is recurring deposit maturity calculated?",
      "Each instalment is compounded quarterly for the months it remains invested, and the maturity value is the sum. In formula terms, maturity = R x f x (f^n − 1) / (f − 1), where f = (1 + annual rate / 4)^(1/3) is the monthly growth factor and n the number of instalments.",
    ],
    [
      "Why is my RD return lower than the interest rate suggests?",
      "Because the average rupee is invested for only about half the term. In a 12-month RD the first instalment earns 12 months of interest and the last earns one, so the interest works out to roughly half of what the same total in a lump-sum FD would earn.",
    ],
    [
      "Is TDS deducted on recurring deposit interest?",
      "Yes. The Finance Act 2015 brought recurring deposits within section 194A, and from 1 April 2025 banks deduct 10% once the interest credited in a financial year exceeds ₹50,000, or ₹1,00,000 for a resident senior citizen. Without PAN the rate is 20% under section 206AA.",
    ],
    [
      "What happens if I miss an RD instalment?",
      "Banks charge a penalty on the delayed instalment — commonly ₹1 to ₹2 per ₹100 per month, varying by bank — and repeated defaults can lead the bank to close the account and pay interest at the applicable lower rate. Check your bank's schedule of charges, as it is contractual rather than statutory.",
    ],
  ],
};

export default seo;
