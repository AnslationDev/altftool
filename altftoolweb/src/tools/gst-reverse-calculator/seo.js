const seo = {
  title: "Reverse GST Calculator with CGST/SGST Split",
  metaDescription:
    "Split any GST-inclusive amount into taxable value and tax at 0.25% to 28% or a custom rate - CGST/SGST halved to the paise, or one IGST line.",
  steps: [
    "Type the GST-inclusive amount (₹) — the MRP or the round figure the customer actually paid.",
    "Pick the GST rate — 0%, 0.25%, 3%, 5%, 12%, 18%, 28% or Custom rate — and choose Intra-state (CGST + SGST) or Inter-state (IGST).",
    "Read the taxable value and GST split instantly, compare the same amount across every slab in the side-by-side table, and press Copy result.",
  ],
  "intro": "GST Reverse Calculator works backwards from a GST-inclusive amount to show the taxable value and the GST hidden inside it. Pick any Indian slab — 0%, 0.25%, 3%, 5%, 12%, 18% or 28% — or type a custom rate, and it splits the tax into CGST plus SGST for intra-state supply or a single IGST line for inter-state supply. Useful for anyone who has an MRP or a paid amount but needs the pre-tax figure for books, invoices or input tax credit.",
  "useCases": [
    "Split a GST-inclusive MRP or restaurant bill into base price and tax before recording it in your books.",
    "Work out the taxable value to enter on a GSTR-1 line when a customer paid you a round inclusive figure.",
    "Check the CGST/SGST halves on an intra-state purchase invoice against what the supplier charged."
  ],
  "benefits": [
    [
      "Every slab covered",
      "All notified GST rates plus a custom-rate box for cess-style or legacy percentages."
    ],
    [
      "Correct CGST/SGST split",
      "Intra-state tax is halved to the paise with the rounding difference kept in the SGST line so the total always ties back."
    ],
    [
      "Side-by-side slab table",
      "See what the same inclusive amount would break into at every other rate, so a wrong slab is obvious."
    ]
  ],
  "faqs": [
    [
      "How do you calculate GST backwards from an inclusive amount?",
      "Divide the inclusive amount by (1 + rate/100) to get the taxable value, then subtract that from the total to get the GST. For example, ₹1,180 at 18% gives a base of ₹1,000 and GST of ₹180."
    ],
    [
      "When is it CGST + SGST and when is it IGST?",
      "Intra-state supplies (supplier and place of supply in the same state) carry CGST and SGST at half the rate each. Inter-state supplies carry IGST at the full rate."
    ],
    [
      "What are the current GST slabs in India?",
      "The main slabs are 0%, 5%, 12%, 18% and 28%, with special rates of 0.25% on rough diamonds and 3% on gold and precious metals. Some goods also attract compensation cess over and above the slab."
    ],
    [
      "Is the base value the same as the assessable value on an invoice?",
      "Usually yes for a simple supply, but discounts, freight and packing charges form part of the taxable value under Section 15 of the CGST Act. This tool is informational — check the invoice composition before filing."
    ]
  ]
};

export default seo;
