const seo = {
  title: "Quotation Generator with GST, Discounts",
  metaDescription:
    "Price a client quote with per-line discounts and GST slabs, an overall discount, IGST or CGST+SGST, an advance-balance split and a validity date.",
  steps: [
    "Fill 'Quotation details' — number, date, 'Valid for (days)' and 'Advance required (%)' — and tick 'Inter-state supply (IGST)' if it applies.",
    "Click 'Add line' for each item and set its Quantity, Rate (INR), Discount (%) and a GST rate of 0, 5, 12, 18 or 28%.",
    "Click 'Copy quote' for a text summary or 'Print' for the formatted quotation with grand total, advance and balance.",
  ],
  "intro": "Quotation Generator prices a client proposal end to end. Each line takes a quantity, rate, its own discount percentage and GST slab; an optional overall discount is then spread across the lines in proportion to value so every line keeps its correct tax rate. The tool shows the taxable value, the IGST or CGST + SGST split, the rounded grand total, the advance-versus-balance breakdown and a validity date calculated from the quote date. Built for freelancers, agencies, consultants and small suppliers.",
  "useCases": [
    "Send a design or development proposal where each deliverable has its own price and negotiated discount.",
    "Show a client exactly how much a bundled discount saves them, in rupees and as a percentage of the gross value.",
    "Set a clear expiry on your pricing — a 15-day validity stops an old quote resurfacing after your costs change."
  ],
  "benefits": [
    [
      "Two levels of discount",
      "Discount individual lines, then apply an overall percentage on top, with the tax recalculated correctly."
    ],
    [
      "Advance and balance split",
      "Enter an advance percentage and see the deposit and the remaining balance as separate amounts."
    ],
    [
      "Validity worked out for you",
      "Set the number of days and the expiry date is calculated and printed on the quotation."
    ]
  ],
  "faqs": [
    [
      "How long should a quotation stay valid?",
      "Fifteen to thirty days is common for services, and shorter for anything exposed to material or currency prices. State the expiry on the document so there is no ambiguity later."
    ],
    [
      "Is a quotation the same as a proforma invoice?",
      "No. A quotation is an offer of price and scope before the client agrees; a proforma invoice is issued after agreement as a request for payment. Neither is a tax invoice."
    ],
    [
      "How is the overall discount applied to tax?",
      "It reduces the already-discounted line values proportionally, and GST is then charged on each line's reduced value at that line's own rate — so mixed 5%, 12% and 18% items stay accurate."
    ],
    [
      "Can I quote without GST?",
      "Yes — set the GST rate to 0% on every line, which suits businesses below the registration threshold or supplies that are exempt. Confirm your position with your accountant."
    ]
  ]
};

export default seo;
