const seo = {
  "intro": "Purchase Order Generator builds a complete, printable PO from your buyer and vendor details, line items and terms. It calculates taxable value per line, applies the GST slab you choose, splits the tax into IGST or CGST + SGST depending on whether the supply is inter-state, adds freight, rounds off the total and spells the amount in words using the Indian crore-lakh system. Made for small businesses, procurement teams and store managers who need a clean PO without accounting software.",
  "useCases": [
    "Raise a formal PO to a supplier before goods are dispatched, so the invoice can be matched line by line.",
    "Lock delivery and payment terms in writing — required-by date, ship-to address, advance percentage — before work starts.",
    "Give your accounts team a PO number and tax split they can reconcile against the vendor's GST invoice."
  ],
  "benefits": [
    [
      "Correct GST split",
      "One toggle switches between IGST for inter-state supply and CGST + SGST at half the rate each for intra-state."
    ],
    [
      "Amount in words",
      "The grand total is written out in the Indian numbering system, the way finance teams expect on a PO."
    ],
    [
      "Print-ready",
      "The form controls drop away when you print, leaving a clean one-page order you can sign, scan or PDF."
    ]
  ],
  "faqs": [
    [
      "What must a purchase order contain?",
      "At minimum: a unique PO number and date, buyer and vendor details, an itemised list with quantity and rate, the tax treatment, the delivery address and date, and payment terms. Anything else is a matter of company policy."
    ],
    [
      "When do I charge IGST instead of CGST and SGST?",
      "IGST applies when the supplier's location and the place of supply are in different states or union territories. Within the same state, the same total rate is split equally into CGST and SGST."
    ],
    [
      "Is a purchase order legally binding?",
      "A PO is generally treated as an offer that becomes a binding contract once the vendor accepts it. This tool produces a document, not legal advice — have your standard terms reviewed by a professional."
    ],
    [
      "Is freight taxable under GST?",
      "Freight charged by the supplier on the same invoice usually forms part of the taxable value of the supply. This tool keeps freight as a separate untaxed line so you can decide, so check the composition with your accountant."
    ]
  ]
};

export default seo;
