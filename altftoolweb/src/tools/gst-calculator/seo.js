const seo = {
  title: "GST Calculator — Add or Remove GST with CGST/SGST",
  h1: "GST Calculator",
  metaDescription:
    "Add or remove GST at 0, 3, 5, 12, 18 or 28% and see the taxable value, CGST, SGST or IGST split instantly. Free, runs in your browser, no signup.",
  intro:
    "The GST Calculator runs both directions on the same screen. In Add GST mode it multiplies the taxable value by the rate (tax = amount × rate ÷ 100); in Extract GST mode it divides a tax-inclusive figure by (1 + rate ÷ 100) to recover the base, then takes the difference as tax. That tax is halved into CGST and SGST for an intra-state supply, or reported in full as IGST for an inter-state one. All of it is plain JavaScript arithmetic inside a React useMemo hook that re-runs on every keystroke — no submit button, no API call, no upload — with amounts formatted through Intl.NumberFormat in the en-IN locale, so figures render in rupees with Indian lakh and crore digit grouping.",
  useCases: [
    "Pricing an invoice from a net figure — ₹10,000 at 18% shows ₹1,800 GST and an ₹11,800 total, already split into ₹900 CGST and ₹900 SGST.",
    "Working backwards from an all-in price a customer was quoted, so an ₹11,800 receipt at 18% resolves to ₹10,000 taxable value and ₹1,800 tax.",
    "Switching a quote to an inter-state supply, where the whole tax sits in IGST instead of being halved across CGST and SGST.",
  ],
  benefits: [
    [
      "Both directions, one screen",
      "Toggle between Add GST and Extract GST without retyping anything — the amount, rate and supply type carry across, and all six figures update as you type.",
    ],
    [
      "Every tax head shown separately",
      "Taxable value, GST amount, CGST, SGST, IGST and final amount each get their own card, so an intra-state supply reads as two equal halves and an inter-state one as a single IGST line.",
    ],
    [
      "One-tap presets and reset",
      "Three presets load a complete scenario at once — a ₹10,000 standard invoice at 18%, an ₹11,800 bill to extract, and a ₹50,000 interstate quote — and Reset returns the form to ₹10,000 at 18%, intra-state.",
    ],
    [
      "Free, no account, nothing uploaded",
      "All six rate slabs and both modes are available without signup, and the arithmetic executes entirely in your browser — the amounts you type never leave the device.",
    ],
  ],
  faqs: [
    [
      "How do I calculate GST on an amount?",
      "Multiply the taxable value by the rate and divide by 100 — at 18%, ₹10,000 carries ₹1,800 GST for an ₹11,800 total. Stay in Add GST mode, type the amount, and tap one of the six slab buttons (0, 3, 5, 12, 18 or 28%). The taxable value, GST, tax split and final amount all appear at once.",
    ],
    [
      "How do I remove GST from a total price?",
      "Divide the total by 1 plus the rate as a decimal — at 18%, divide by 1.18. Switch to Extract GST mode and an ₹11,800 inclusive figure resolves to ₹10,000 taxable value and ₹1,800 GST. Subtracting 18% from the total instead would understate the base.",
    ],
    [
      "Why is 18% GST not 18% of the bill total?",
      "Because the rate applies to the base, not the total. Tax as a share of a GST-inclusive amount is rate ÷ (100 + rate), so 18% GST is 15.25% of the gross figure. That is exactly why Extract GST mode divides by 1.18 rather than taking 18% off the top.",
    ],
    [
      "What is the difference between CGST, SGST and IGST?",
      "CGST and SGST apply to a supply within one state and split the tax equally; IGST applies to an inter-state supply and carries the whole amount. The total tax is identical either way — at 18% you either see 9% CGST plus 9% SGST, or 18% IGST. The CGST + SGST / IGST toggle switches between the two.",
    ],
    [
      "Which GST rates does this calculator support?",
      "Six slabs: 0%, 3%, 5%, 12%, 18% and 28%, selected by button rather than typed. Which slab applies to a specific good or service depends on its HSN or SAC classification, which this calculator does not look up — it computes the split for whichever rate you pick.",
    ],
    [
      "Can I copy or download the GST calculation?",
      "Yes, both. Copy report puts a plain-text summary on your clipboard — mode, tax type, amount entered, rate, taxable value, GST amount, CGST, SGST, IGST, final amount and a timestamp. Download saves that same text as gst-calculation-report.txt.",
    ],
    [
      "Is this GST calculator free, and is my data sent anywhere?",
      "It is free with no account, and nothing is transmitted. The calculation is JavaScript running in the page; there is no network request and no upload step, so the amounts you enter live only in browser memory until you close the tab.",
    ],
    [
      "Does it work for GST outside India?",
      "No. Amounts are formatted in Indian rupees using the en-IN locale, and the rate slabs and CGST/SGST/IGST structure follow India's GST. For other jurisdictions, use the separate Singapore, Australia and New Zealand GST calculators on AltFTool.",
    ],
  ],
  steps: [
    "Type the amount, then tap a rate — 0, 3, 5, 12, 18 or 28% — or load one of the three presets.",
    "Choose Add GST to build a total from a net figure or Extract GST to pull the taxable value out of an inclusive one, then set CGST + SGST for an intra-state supply or IGST for an inter-state supply.",
    "Read the six result cards — taxable value, GST amount, CGST, SGST, IGST and final amount — then copy the report or download it as gst-calculation-report.txt.",
  ],
};

export default seo;
