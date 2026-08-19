const seo = {
  title: "Timesheet to Invoice Calculator with Rounding",
  metaDescription:
    "Enter time as 7:30, 7.5 or 7h 30m, set a 6 to 60-minute billing increment, and get the total with per-task rates, discount before tax and expenses.",
  steps: [
    "Set Billing increment and Rounding rule, then type each task's time into Time logged as 7:30, 7.5, 7h 30m or 450m.",
    "Press Add line for each extra task so it carries its own rate; the Invoice total recalculates as you type, with no submit button.",
    "Read Hours billed after rounding against Hours logged, then press Copy summary to take the invoice breakdown.",
  ],
  intro:
    "This calculator converts logged time into a billable invoice total in three stages: it parses entries written as 7:30, 7.5, 7h 30m or 450m into decimal hours, applies your contractual billing increment (6, 10, 15, 30 or 60 minutes, rounded up, down or to nearest), then prices each line at its own rate and adds discount, tax and pass-through expenses. Tax is charged on the taxable value after the discount and only on lines marked taxable, so reimbursed expenses are not taxed twice. It is aimed at consultants, agencies and contractors who bill by the hour across several tasks at different rates.",
  useCases: [
    "Convert a week of tracked time into an invoice when tasks carry different hourly rates.",
    "See how much a 15-minute billing increment adds compared with billing exact time.",
    "Separate taxable professional fees from non-taxable reimbursed travel on one invoice.",
  ],
  benefits: [
    ["Reads real timesheet formats", "Accepts 7:30, 7.5, 7h 30m and 450m without you converting anything by hand."],
    ["Increment effect made visible", "Shows the hours added by rounding, so you can defend the figure if a client queries it."],
    ["Correct tax base", "Applies the discount first, then taxes only the taxable lines, which is the treatment tax authorities expect."],
  ],
  faqs: [
    [
      "How do I convert 7 hours 30 minutes to decimal hours?",
      "Divide the minutes by 60 and add them to the hours: 30 ÷ 60 = 0.5, so 7:30 is 7.5 hours. This calculator does that automatically for entries typed as 7:30, 7h 30m or 450m.",
    ],
    [
      "What is a billing increment and which one should I use?",
      "It is the smallest unit of time you bill, with each entry rounded to it. Six minutes — one tenth of an hour — is the long-standing standard in legal and professional services; 15 minutes is common in agency and contractor work. Whatever you pick, state it in the engagement letter, because rounding up every short task materially changes the invoice.",
    ],
    [
      "Should tax be calculated before or after a discount?",
      "After. Tax is charged on the consideration actually payable, so apply the discount to the taxable lines first and then the tax rate. Charging tax on the pre-discount value overstates the invoice.",
    ],
    [
      "Do I charge tax on reimbursed expenses?",
      "It depends on whether the expense is a disbursement made as your client's agent or a cost you incurred yourself and are recharging — the second is usually part of your taxable supply. Mark such lines as taxable and confirm the treatment with an accountant, since the rules differ between VAT, GST and US sales tax.",
    ],
  ],
};

export default seo;
