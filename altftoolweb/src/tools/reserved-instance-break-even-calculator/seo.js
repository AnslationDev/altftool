const seo = {
  title: "Reserved Instance Break-Even Calculator",
  metaDescription:
    "Find the months of uptime where a 1- or 3-year cloud reservation beats on-demand, plus minimum utilisation % — works for AWS, Azure and GCP commitments.",
  steps: [
    "Enter the \"On-demand price (USD per hour)\", the \"Reserved recurring price (USD per hour)\" (enter 0 for all-upfront) and any \"Upfront payment (USD)\".",
    "Choose the \"Commitment term\" — 1-year or 3-year commitment — and the analysis recomputes instantly on 730-hour months.",
    "Read the break-even uptime in months and \"Minimum utilisation to break even\", then click \"Copy result\" for the text summary.",
  ],
  intro:
    "This calculator finds the break-even point of a cloud reservation: the number of months of real uptime at which a 1-year or 3-year commitment (upfront plus recurring rate over 730-hour months) becomes cheaper than paying the on-demand hourly price. It applies the same structure AWS Reserved Instances and Savings Plans, Azure Reservations and GCP Committed Use Discounts share, so engineers and FinOps teams can sanity-check a commitment before signing it.",
  useCases: [
    "A platform engineer checking whether a 1-year no-upfront RI at a 40% discount still wins if the service might be decommissioned in 8 months",
    "A FinOps analyst computing the minimum utilisation percentage a 3-year all-upfront reservation needs to beat on-demand",
    "A startup deciding between partial-upfront and no-upfront pricing by comparing break-even months for each quote",
  ],
  benefits: [
    ["One number that matters", "Converts any reservation quote into break-even months and a minimum utilisation percentage."],
    ["Never-pays-off detection", "Flags quotes where the reservation loses to on-demand even at 100% uptime."],
    ["Provider-agnostic", "Uses the upfront + recurring-rate structure common to AWS, Azure and GCP commitments."],
  ],
  faqs: [
    [
      "How do I calculate the break-even point of a reserved instance?",
      "Divide the total reservation cost (upfront payment plus the reserved hourly rate times 730 hours times the term months) by the monthly on-demand cost (on-demand hourly rate times 730). The result is the number of months of actual usage at which the reservation and on-demand spending are equal; fewer months of use than that means on-demand would have been cheaper.",
    ],
    [
      "What utilisation do I need for a reserved instance to be worth it?",
      "Divide the break-even months by the term length. A typical 1-year reservation at a 40% discount breaks even at 60% utilisation — about 7.2 months of uptime out of 12 — so if the workload will run more than that, commit; if its future is uncertain beyond half the term, stay on demand.",
    ],
    [
      "Why do cloud providers use 730 hours for a month?",
      "730 is simply 8,760 hours in a year divided by 12, and AWS, Azure and GCP all quote monthly prices on that basis. Using a calendar month of 720 or 744 hours would change results by under 2%, but 730 keeps estimates consistent with every provider's own pricing calculator.",
    ],
    [
      "Should I choose all-upfront, partial-upfront or no-upfront?",
      "All-upfront gives the largest discount but concentrates risk: if the workload dies mid-term the money is spent, whereas no-upfront commitments still bill monthly but can sometimes be exchanged or resold (AWS convertible RIs and the RI marketplace). Compare the break-even months of each quote — a lower break-even means less utilisation risk — and remember this is a planning tool, not financial advice.",
    ],
  ],
};

export default seo;
