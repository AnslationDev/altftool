const seo = {
  title: "Quotation Cover Letter Builder with GST",
  metaDescription:
    "Prices your line items, takes the discount off the subtotal, then charges GST on the net, and writes the covering note with a validity date.",
  steps: [
    "Type the Line items as \"Description | quantity | unit price\", one per line, up to 25, then set Discount (%) and a GST rate (%) slab of 0, 5, 12, 18 or 28.",
    "Set Valid for (days, 1–180), Advance on approval (%), Delivery lead time (days) and Tone; the discount comes off the subtotal before GST is charged on the net.",
    "Check Total payable with the Subtotal, Taxable value, GST, Advance and Balance rows, then Copy result takes the subject line and the whole Covering letter.",
  ],
  intro:
    "The Quotation Cover Letter Builder prices your line items, applies the discount and then the GST on the discounted value — the order a tax invoice requires — and wraps the result in a covering note. The letter states the quotation number and date, the itemised total, an explicit validity date, the advance and balance in rupees rather than percentages, the delivery lead time and one next step. Written for freelancers, agencies and small suppliers who send quotes by email and want them accepted rather than negotiated.",
  useCases: [
    "Send a design or fabrication quote with a hard validity date so the price is not treated as open forever.",
    "Show a client the 40% advance and the balance as actual amounts instead of leaving them to do the maths.",
    "Add an exclusions line — licences, travel, third-party fees — so scope creep has a written boundary.",
    "Re-issue a lapsed quote with a new number, a new date and an updated GST slab.",
  ],
  benefits: [
    [
      "Correct order of operations",
      "Discount comes off the subtotal and tax is charged on the discounted value, matching how a GST invoice is raised.",
    ],
    [
      "Validity as a date",
      "The letter says 'valid until 12 August 2026', which is far harder to argue with than 'valid for 15 days'.",
    ],
    [
      "Payment split in money",
      "The advance and the balance are shown as amounts, so approval and cash flow are unambiguous from the first read.",
    ],
  ],
  faqs: [
    [
      "What should a quotation cover letter include?",
      "The quotation number and date, a one-line scope, the itemised prices with subtotal, discount and tax shown separately, the total payable, a validity date, the payment terms, the delivery lead time, what is excluded, and a single next step. Anything else belongs in the attached quotation, not the letter.",
    ],
    [
      "Is GST calculated before or after discount?",
      "After. A discount shown on the face of the invoice reduces the taxable value, so GST is charged on the net amount after discount. On a 75,000 rupee subtotal with a 10% discount and 18% GST, tax is charged on 67,500 rupees, giving 12,150 rupees of GST and a total of 79,650 rupees.",
    ],
    [
      "How long should a quotation stay valid?",
      "Fifteen to thirty days is the common range for services, and shorter where material prices move. State an actual expiry date in the letter — an open-ended quote invites the client to come back months later expecting the old price.",
    ],
    [
      "How much advance should I ask for in a quotation?",
      "Between 30% and 50% on approval is normal for project work, with the balance on completion or against milestones. Show both parts as amounts, and remember this is general practice rather than tax or legal advice — confirm the GST treatment of advances with your accountant.",
    ],
  ],
};

export default seo;
