const seo = {
  intro:
    "The HSN Code GST Rate Finder lets you search common Indian goods and services by name or by HSN/SAC code and instantly see which GST slab they fall into — Nil, 5%, 18% or the 40% demerit rate, plus the special 0.25%, 1.5% and 3% rates for stones and precious metals. Pick an item, enter an invoice amount, and the tool splits it into taxable value, CGST and SGST for an intra-state supply or IGST for an inter-state one, working forwards from a base price or backwards from a GST-inclusive figure. It is built for small business owners, freelancers, accountants and e-commerce sellers who need a fast sanity check before raising an invoice.",
  useCases: [
    "A shopkeeper raising a manual bill wants to confirm whether packaged namkeen sits at 5% or 18% before printing the invoice.",
    "A freelance designer billing a client in another state needs the 18% SAC 9983 rate split as IGST rather than CGST plus SGST.",
    "A buyer who has been quoted an all-inclusive price of Rs 59,000 for an air conditioner wants to back-calculate the 18% GST hidden inside it.",
  ],
  benefits: [
    ["Search by name or code", "Type “cement”, “8517” or “hotel” and the matching HSN or SAC heading appears with its slab."],
    ["Correct CGST/SGST/IGST split", "One toggle switches between intra-state and inter-state supply so the tax heads are always right."],
    ["Works both directions", "Add GST to a base price, or strip GST out of a quoted inclusive amount using the 100/(100+rate) formula."],
  ],
  faqs: [
    [
      "What is the difference between an HSN code and an SAC code?",
      "HSN (Harmonised System of Nomenclature) codes classify goods, while SAC (Services Accounting Code) headings classify services and all begin with 99. Both are quoted on a GST invoice to identify what is being supplied.",
    ],
    [
      "What are the current GST slabs in India?",
      "After the rate rationalisation notified with effect from 22 September 2025 the main slabs are Nil, 5% and 18%, with a 40% rate on demerit and luxury items such as pan masala, tobacco, sugary aerated drinks, large cars and online money gaming. Special rates of 0.25%, 1.5% and 3% still apply to rough stones, polished diamonds and precious metals.",
    ],
    [
      "When do I charge IGST instead of CGST and SGST?",
      "IGST applies when the place of supply is in a different state or union territory from the supplier's location, and on imports. For a supply within the same state you split the same total tax equally into CGST and SGST/UTGST.",
    ],
    [
      "How many digits of the HSN code do I need on my invoice?",
      "Reporting requirements depend on your aggregate turnover — smaller taxpayers report fewer digits than larger ones, and B2B invoices have stricter requirements than B2C. This tool shows chapter and heading level codes for orientation; confirm the exact digit requirement and the full 8-digit code for your product with your tax adviser or the CBIC notifications.",
    ],
  ],
};

export default seo;
