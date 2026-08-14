const seo = {
  title: "GST Input Tax Credit Calculator: Rule 88A Set-Off",
  metaDescription:
    "Cash GST payable per head after set-off in the section 49 and rule 88A order: IGST credit first, and no CGST-against-SGST cross utilisation.",
  steps: [
    "Under Output tax liability, enter Output IGST, Output CGST and Output SGST / UTGST in rupees, then fill the IGST, CGST and SGST / UTGST credit available under Input tax credit available.",
    "Leave \"Spread the balance IGST credit to minimise cash outgo (allowed by rule 88A)\" ticked to optimise the allocation, or untick it to see the plain CGST-first order.",
    "Read GST payable in cash with the head-wise cash, credit utilised and credit carried forward, plus the Set-off working matrix that marks CGST against SGST as not allowed.",
  ],
  intro:
    "The GST Input Tax Credit Calculator works out how much GST you actually have to pay in cash after setting off the credit lying in your electronic credit ledger. It follows the statutory utilisation order under section 49 read with rule 88A — IGST credit is used first, and CGST and SGST credit clear their own heads before touching IGST — and never allows the CGST-against-SGST cross set-off the law prohibits. It is built for GSTR-3B preparers, accountants and business owners planning the month's tax outflow.",
  useCases: [
    "Preparing GSTR-3B and needing the exact cash figure to deposit in the electronic cash ledger under each head.",
    "Checking whether spreading a large IGST credit across CGST and SGST avoids paying SGST in cash while CGST credit sits idle.",
    "Explaining to a client why their CGST credit balance cannot be used to clear an SGST liability.",
  ],
  benefits: [
    [
      "Correct set-off order",
      "Implements IGST-first utilisation with the rule 88A flexibility, not a naive head-by-head netting.",
    ],
    [
      "Shows the cash saving",
      "Compares the cash outgo of the optimised allocation against the common CGST-first order.",
    ],
    [
      "Full working shown",
      "A credit-versus-liability matrix makes the set-off auditable and easy to paste into working papers.",
    ],
  ],
  faqs: [
    [
      "In what order must input tax credit be used?",
      "IGST credit must be set off against IGST liability first; the balance may then be used against CGST and SGST in any order. CGST and SGST credit are used against their own head first and can be applied to IGST only after the IGST credit is fully exhausted.",
    ],
    [
      "Can CGST credit be used to pay SGST?",
      "No. Cross-utilisation between CGST and SGST or UTGST is not permitted under section 49. Each can be used against its own head and, after IGST credit is exhausted, against IGST.",
    ],
    [
      "What happens to unused input tax credit?",
      "It stays in the electronic credit ledger and is carried forward to the next tax period. Refunds of accumulated credit are available only in limited situations such as zero-rated supplies and an inverted duty structure.",
    ],
    [
      "Is all GST paid on purchases eligible as credit?",
      "No. Section 17(5) blocks credit on items such as motor vehicles below the specified seating capacity, food and beverages, club memberships and goods lost, stolen or given as free samples. Credit also requires the invoice to appear in your GSTR-2B and the supplier to have paid the tax.",
    ],
  ],
};

export default seo;
