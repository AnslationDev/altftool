const seo = {
  title: "Invoice Fraud Change Inspector: 13 Fields",
  metaDescription:
    "Diff two invoices across 13 fields and see bank account, IBAN and UPI changes flagged on their own. Runs locally; the export holds counts, not values.",
  steps: [
    "Paste invoice text or a JSON invoice object into \"Earlier or trusted invoice\" and \"New invoice to inspect\", or press Choose text PDF to read a local PDF's text layer, then press Extract fields on each side.",
    "Correct every value under Confirm earlier invoice fields and Confirm new invoice fields, tick \"I reviewed these extracted fields against the original invoice\" on both, and press Compare confirmed fields.",
    "Metric cards report Fields reviewed, Observable changes, Routing changes, Unchanged and Unavailable; a changed bank account, IBAN or UPI ID raises a \"Payment-routing details changed\" panel, and Download change counts saves altftool-invoice-change-counts.json with counts only.",
  ],
  intro:
    "The Invoice Fraud Change Inspector compares two versions of an invoice across 13 extracted fields — invoice number, date, vendor, tax ID/GSTIN/VAT, bank account, IBAN, UPI ID, currency, subtotal, tax amount, total, line-item count and line summary — and marks each one added, changed, removed, unchanged or unavailable. Anything in the payment-routing group (bank account, IBAN, UPI ID) is flagged separately, because that is where a redirected payment shows up. It is for accounts-payable staff and finance teams doing a manual second look, and it deliberately reports observable differences only, never a fraud verdict.",
  useCases: [
    "A supplier emails a 'corrected' invoice for an unpaid bill and you want to see whether anything besides the bank account actually changed before releasing the payment.",
    "You are reconciling a PDF quotation against the final invoice and need a field-level diff of subtotal, tax amount and total rather than reading both documents side by side.",
    "An approver asks for evidence of what changed between invoice revisions, and you export a counts-only JSON report that records the differences without carrying the invoice values themselves.",
  ],
  benefits: [
    [
      "Payment-routing changes called out separately",
      "Bank account, IBAN and UPI ID sit in their own group, so a changed beneficiary is never buried among harmless edits like a reworded line summary.",
    ],
    [
      "Format-aware matching",
      "Amounts are compared numerically rather than as strings, and account numbers, IBANs, tax IDs and UPI IDs are normalised for spacing and case so cosmetic reformatting is not reported as a change.",
    ],
    [
      "Confirmation gate before comparing",
      "You must tick that you have checked the extracted fields against the original document on both sides before a comparison runs, so a bad PDF text layer cannot quietly produce a wrong diff.",
    ],
  ],
  faqs: [
    [
      "Does this tool detect invoice fraud?",
      "No. It reports observable field differences between two invoice versions and flags which of them touch payment routing; a change is not proof of fraud, intent or identity. Treat the output as a prompt to verify the account with the supplier through a known phone number, and escalate through your organisation's own controls.",
    ],
    [
      "Which fields does it compare?",
      "Thirteen, split into four groups: identity (invoice number, invoice date, vendor, tax ID/GSTIN/VAT), payment routing (bank account, IBAN, UPI ID), amounts (currency, subtotal, tax amount, total) and line items (line-item count, line summary).",
    ],
    [
      "Can it read a PDF invoice?",
      "It can read the text layer of a text-based PDF locally in your browser, and it also accepts pasted invoice text or a JSON invoice object. A scanned or image-only PDF has no text layer, so nothing will be extracted and you will need to type the fields in and confirm them yourself.",
    ],
    [
      "Are my invoices uploaded anywhere?",
      "No. Extraction and comparison run in the page, and the exported report is a counts-only JSON file that records how many fields in each group were added, changed, removed, unchanged or unavailable — it does not include the invoice values themselves.",
    ],
  ],
};

export default seo;
