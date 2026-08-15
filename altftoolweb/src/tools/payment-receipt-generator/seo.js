const seo = {
  title: "Payment Receipt Generator with Amount in Words",
  metaDescription:
    "Number receipts as RCPT-2026-0007, spell the amount in Indian lakh or short-scale words, and show the balance still due on the invoice.",
  steps: [
    "Set the Receipt date, Currency (INR, USD, EUR, GBP, AED, SGD, AUD, CAD or JPY), Series prefix, Number pattern from the {PREFIX} {YYYY} {SEQ} tokens, and the Serial number with its zero padding.",
    "Fill in Issued by, Received from, Against invoice, the Payment mode with its transaction / cheque reference, the Invoice total, Already paid before this receipt and Amount received now.",
    "Read the receipt number, the amount in words and the balance due — or the overpayment flag — then press \"Copy receipt\" to take the plain-text Receipt text block.",
  ],
  intro:
    "A payment receipt is the document a seller issues to acknowledge money that has actually been received, as distinct from an invoice, which only demands it. This generator numbers that receipt from a pattern you control, names the payment instrument and its reference, spells the amount in words in either Indian (lakh/crore) or short-scale (thousand/million) form, and works out the balance still outstanding as invoice total minus everything receipted so far. It is built for freelancers, studios and small businesses collecting part payments across borders in INR, USD, EUR, GBP, AED, SGD, AUD, CAD or JPY.",
  useCases: [
    "Acknowledge a 40% milestone payment on a project invoice and show the client exactly what remains due.",
    "Issue a gapless serial receipt series such as RCPT-2026-0007 so the numbering survives an audit.",
    "Record a cheque or NEFT payment with its reference number so the bank credit can be reconciled later.",
  ],
  benefits: [
    ["Balance is never guessed", "Balance due is computed as invoice total less all receipted payments, and flagged as an overpayment when it goes negative."],
    ["Correct amount in words", "Indian receipts get lakh and crore grouping; international ones get thousand, million and billion."],
    ["Currency-aware rounding", "Amounts round to the ISO 4217 minor units — two decimals for USD and INR, none for JPY."],
  ],
  faqs: [
    [
      "What is the difference between an invoice and a payment receipt?",
      "An invoice requests payment; a receipt confirms payment was received. The invoice is raised when the work or goods are delivered, the receipt only once money lands, and one invoice can produce several receipts if the customer pays in instalments.",
    ],
    [
      "Do payment receipts have to be numbered in sequence?",
      "Serial, gapless numbering is the standard expectation of auditors and of most tax administrations because it makes suppressed receipts visible. Pick a pattern such as PREFIX-YEAR-SERIAL, restart the serial only at the start of a financial year, and never reuse or skip a number.",
    ],
    [
      "Why does a receipt show the amount in words as well as figures?",
      "Because words cannot be altered by adding a digit, the written amount governs if it conflicts with the figures under long-standing commercial practice. It is why cheques and receipts both carry the line.",
    ],
    [
      "What should I do if a customer pays more than the invoice total?",
      "Receipt the full amount received and show the excess as a credit rather than silently capping it, then either refund it or set it against the next invoice. This tool marks that case as an overpayment so the surplus is visible on the document.",
    ],
  ],
};

export default seo;
