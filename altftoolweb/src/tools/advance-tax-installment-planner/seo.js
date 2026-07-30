const seo = {
  metaDescription:
    "Plan India's cumulative advance-tax instalments from estimated liability, TDS/TCS credits, prior payments, and presumptive-taxpayer mode.",
  intro:
    "The Advance Tax Installment Planner turns one estimated annual tax figure into the four cumulative Indian advance-tax instalments — 15% by 15 June, 45% by 15 September, 75% by 15 December and 100% by 15 March — after subtracting your expected TDS and TCS credits and anything you have already paid. It is built for freelancers, consultants, traders and small-business owners in India whose tax is not fully deducted at source and who need to know what to transfer before each date rather than in one panicked March payment. There is also a presumptive-taxpayer mode that collapses the whole liability into a single 100% target on 15 March.",
  useCases: [
    "You freelance, your clients deduct some TDS, and it is late May — you want to know what to actually pay by 15 June rather than guessing",
    "You already paid one instalment and your income forecast has changed, so you need the revised amount due at the next cumulative checkpoint",
    "You file under the presumptive scheme and want to confirm that one payment by 15 March covers you instead of four quarterly ones",
  ],
  benefits: [
    ["Cumulative, not quarterly quarters", "Indian advance tax targets are cumulative percentages of the year's liability, and the table shows both the running target and the incremental cheque for each date."],
    ["Credits and part-payments come off first", "TDS and TCS credits reduce the base before any instalment is calculated, and anything already paid is carried forward so later instalments shrink automatically."],
    ["Handles the presumptive exception", "One toggle switches from the four-date schedule to the single 15 March target that eligible presumptive taxpayers follow."],
  ],
  faqs: [
    [
      "What are the advance tax due dates in India?",
      "Four, and each is a cumulative share of the year's liability: at least 15% by 15 June, 45% by 15 September, 75% by 15 December and 100% by 15 March. Because they are cumulative, a missed June instalment simply enlarges the September payment rather than disappearing.",
    ],
    [
      "Who has to pay advance tax at all?",
      "Broadly, a taxpayer whose net tax liability for the year, after TDS and TCS credits, is ₹10,000 or more. Resident senior citizens with no income from business or profession are outside the requirement. The planner does not test eligibility for you, so check your own position against current Income Tax Department guidance.",
    ],
    [
      "What happens if I miss an instalment?",
      "Interest becomes payable on the shortfall — section 234C covers deferment of individual instalments and section 234B covers a shortfall in total advance tax for the year, both charged as simple interest on the unpaid amount for the period of delay. This planner schedules payments only; it does not calculate that interest, so confirm the current rate and any relief before assuming a figure.",
    ],
    [
      "Why does my TDS reduce the instalment?",
      "Because advance tax is due only on the tax that will not already have been collected at source. The tool subtracts your expected TDS and TCS credits from the estimated annual liability first, and every percentage target is then applied to that net base. If your actual TDS lands lower than expected, revisit the estimate — this is a planning tool and not tax advice, so a chartered accountant should confirm the final numbers.",
    ],
  ],
};

export default seo;
