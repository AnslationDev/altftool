const seo = {
  title: "Bonus & Variable Pay Calculator by Rating",
  metaDescription:
    "Work out your bonus from target variable pay: rating multiplier x company payout factor, prorated for eligible months, with tax and per-cycle payouts.",
  steps: [
    "Choose how variable pay is defined — '% of annual CTC' or 'Fixed annual amount' — and enter the figures (defaults: ₹20,00,000 CTC with a 15% share).",
    "Pick a 'Performance rating' from Outstanding 150% down to Below expectations 0%, then fine-tune the 'Rating multiplier (%)', 'Company / business payout factor (%)' and 'Months eligible in the year (0-12)'.",
    "Read the 'Gross bonus payout' headline with the after-tax figure and gross/net per payout cycle, then click 'Copy result' for the full text breakdown.",
  ],
  intro:
    "The Bonus and Variable Pay Calculator converts a target variable pay figure into the amount that actually reaches your account. Enter variable pay as a share of CTC or as a fixed annual number, then apply your individual rating multiplier, the company or business payout factor and the months you were eligible. It shows the gross payout, the tax deducted and what each quarterly or annual cycle pays out.",
  useCases: [
    "Your offer says 15% of CTC is variable and you want to know what an 'exceeds expectations' rating plus a 90% company factor actually pays.",
    "You joined in September and need the prorated bonus for the four months you were eligible in the performance year.",
    "You are comparing two offers where one has a large variable component and want the risk-adjusted cash at a 100% payout versus a 70% payout.",
  ],
  benefits: [
    ["Both multipliers modelled", "Individual rating and company payout factor are applied separately, the way most Indian bonus schemes actually work."],
    ["Proration built in", "Mid-year joiners and exits get the correct months-out-of-twelve target instead of a full-year number."],
    ["Cycle-level clarity", "Splits the payout across annual, half-yearly, quarterly or monthly cycles, gross and net of tax."],
  ],
  faqs: [
    [
      "How is variable pay calculated in an Indian salary structure?",
      "Variable pay is usually a stated percentage of CTC held back from fixed pay. The payout is the target amount multiplied by your individual performance factor and by a company or business unit achievement factor, prorated for the months you were eligible during the performance year.",
    ],
    [
      "What is a typical performance rating multiplier?",
      "Multipliers vary by employer, but a common ladder is around 130-150% for a top rating, 110-125% for exceeds expectations, 100% for meets expectations, 50-80% for partially meets and nil for below expectations. Always use the grid published in your own policy.",
    ],
    [
      "How is bonus taxed in India?",
      "A performance bonus is fully taxable as salary in the year it is received, and the employer deducts TDS at your applicable slab rate. Because a lump-sum bonus can push the month's TDS higher, the in-hand amount often looks smaller than expected before the year-end reconciliation.",
    ],
    [
      "Is statutory bonus the same as variable pay?",
      "No. Statutory bonus under the Payment of Bonus Act 1965 applies to employees drawing wages up to 21,000 per month and is payable at between 8.33% and 20% of eligible wages. Performance variable pay is a separate contractual arrangement and is not governed by that Act.",
    ],
  ],
};

export default seo;
