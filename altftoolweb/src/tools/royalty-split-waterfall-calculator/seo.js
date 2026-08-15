const seo = {
  title: "Royalty Split Waterfall Calculator: Fees to Payouts",
  metaDescription:
    "Runs gross receipts past the distributor fee and recoupable balance, then splits the pool in whole cents so payouts reconcile exactly.",
  steps: [
    "Enter Gross receipts, the Platform / distributor fee (%) and the Recoupable balance, or load the 60/25/15 split example.",
    "List each collaborator in the Collaborator splits box as Payee | percent, one per line.",
    "Read the distributable pool with the Payee, Entered split and Allocated columns, then use Copy or Download.",
  ],
  intro:
    "The Royalty Split Waterfall Calculator runs gross receipts down a four-step waterfall — gross, minus the platform or distributor fee percentage, minus the recoupable balance, leaving a distributable pool that is then divided between named collaborators by percentage. Splits are allocated in whole cents and normalised against the total percentage entered, with the last payee taking the rounding remainder so the payouts always add back to the pool exactly. It is for creators, producers and small labels reconciling a statement or agreeing a split sheet before money moves.",
  useCases: [
    "A distributor statement shows 100,000 gross with a 15% fee and a 10,000 advance still to recoup, and you need to tell three collaborators what each is actually owed.",
    "Your split sheet says 60/25/15 but the percentages you were given add to 105 — you want to see what each share becomes once they are normalised.",
    "A payout run keeps ending up one or two cents off the pool total, and you need an allocation where the remainder is assigned to a named payee instead of vanishing.",
  ],
  benefits: [
    [
      "Reconciles to the cent",
      "Allocates in integer cents and gives the final payee the remainder, so the sum of the payouts equals the distributable pool with no drift.",
    ],
    [
      "Recoupment capped at what exists",
      "Recoupment can never exceed post-fee receipts, so an unrecouped balance leaves a zero pool rather than a negative one.",
    ],
    [
      "Handles splits that do not total 100",
      "Percentages are normalised against the total you entered and the entered total is shown, so a 105% or 98% split sheet is flagged rather than silently mis-paid.",
    ],
  ],
  faqs: [
    [
      "How is a royalty waterfall calculated?",
      "In order: platform or distributor fee comes off the gross first, then the recoupable balance comes off what remains, and only the leftover pool is split between collaborators. On 100,000 gross with a 15% fee and 10,000 recoupable, the fee is 15,000, recoupment takes 10,000 from the 85,000 remaining, and 75,000 is distributable.",
    ],
    [
      "What does each collaborator get on a 60/25/15 split?",
      "Of a 75,000 pool, 60% is 45,000, 25% is 18,750 and 15% is 11,250. Each share is calculated against the pool after fees and recoupment, not against the gross — a common source of disputes when a statement is read too quickly.",
    ],
    [
      "What happens if my splits do not add up to 100%?",
      "Each share is scaled by its portion of the total entered, so 60/25/20 (105 total) pays out 57.14%, 23.81% and 19.05% of the pool. The entered total is displayed so you can correct the split sheet rather than accept the normalised figures.",
    ],
    [
      "Does this match what my contract says I am owed?",
      "Not necessarily — this is arithmetic reconciliation only. A real agreement may apply reserves, taxes, cross-collateralisation across releases, different fee bases, or a different ordering of fees and recoupment. Use the figure as a check against a statement, and have a lawyer or accountant read the contract before disputing a payment.",
    ],
  ],
};

export default seo;
