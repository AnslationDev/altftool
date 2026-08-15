const seo = {
  title: "CGST SGST IGST Split Calculator with GSTIN State",
  metaDescription:
    "Same state code both sides splits tax into CGST plus SGST or UTGST; different codes mean IGST. SEZ and export supplies stay inter-state under s.7(5).",
  steps: [
    "Pick the Supplier state (location of supplier) and the Place of supply state — or paste a GSTIN under 'Read the state code from a GSTIN', choose whether it is the supplier or the place of supply, and press 'Apply' to take its first two digits — then enter the Taxable value (INR), GST rate (%) and any compensation cess.",
    "Tick 'Supply to or by an SEZ developer or unit', 'Export out of India' or the letter of undertaking box where they apply: section 7(5) makes those supplies inter-state whatever the two state codes say.",
    "Read the invoice lines — CGST and SGST/UTGST at half the rate when the codes match, or the full rate as IGST when they differ — with any cess, total tax and invoice total, then press 'Copy result'.",
  ],
  intro:
    "This calculator applies the test in sections 7 and 8 of the IGST Act, 2017: when the location of the supplier and the place of supply fall in the same state code the supply is intra-state and tax splits equally into CGST and SGST or UTGST; when the codes differ it is inter-state and the whole amount is IGST. Section 7(5) overrides the codes for SEZ and export supplies, which are always inter-state and zero-rated under section 16. Enter the two state codes, the taxable value and the rate to get the invoice lines.",
  useCases: [
    "A Maharashtra supplier billing a Karnataka customer and confirming that IGST rather than CGST plus SGST applies",
    "A vendor supplying an SEZ unit in its own state, where the supply is still inter-state",
    "An accountant reading the state code off a customer's GSTIN before raising the invoice",
  ],
  benefits: [
    ["Reads a GSTIN", "Paste a GSTIN and the first two digits fill in the state automatically."],
    ["SEZ and export handled", "Applies the section 7(5) override and the letter-of-undertaking option."],
    ["UTGST labelled correctly", "Shows UTGST instead of SGST for union territories without a legislature."],
  ],
  faqs: [
    [
      "When is IGST charged instead of CGST and SGST?",
      "IGST applies when the location of the supplier and the place of supply are in different states or union territories, under section 7 of the IGST Act. It also applies to any supply to or by an SEZ developer or unit and to imports and exports, under section 7(5), even if both parties are in the same state.",
    ],
    [
      "What are the first two digits of a GSTIN?",
      "They are the state code of the registration — 27 is Maharashtra, 29 is Karnataka, 07 is Delhi, 33 is Tamil Nadu and 09 is Uttar Pradesh. Comparing the supplier's code with the place-of-supply code is the quickest way to tell intra-state from inter-state.",
    ],
    [
      "How is 18% GST split into CGST and SGST?",
      "Equally: 9% CGST and 9% SGST or UTGST. The total tax on the invoice is the same 18% either way; the split only decides whether the revenue goes to the Centre and the state, or entirely through the IGST pool for later apportionment.",
    ],
    [
      "Is the place of supply always the customer's address?",
      "No. Sections 10 to 13 of the IGST Act set special rules — services relating to immovable property are supplied where the property is, admission to an event where the event is held, and passenger transport where the journey begins. Use those rules to fix the place of supply first, then apply the split, and check with a GST practitioner in unusual cases.",
    ],
  ],
};

export default seo;
