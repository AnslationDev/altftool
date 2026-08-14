const seo = {
  title: "Creator Income Tracker: Gross, Fees & Withholding Log",
  metaDescription:
    "Turns pipe-separated payment lines into an 8-column income table and counts rows missing a field - sponsorships, affiliate and ad revenue together.",
  steps: [
    "In 'Records, one per line', enter each payment as Date | Client / platform | Income stream | Gross | Fees | Withholding | Net received | Invoice / payout ref, or load the 'Example records' preset.",
    "Keep the 'Completeness review' toggle on to flag rows with missing columns.",
    "Read the 'structured record(s)' result with its incomplete-row count and the 8-column table (first 200 rows shown); Copy or Download exports it.",
  ],
  intro:
    "This tracker takes one pipe-separated line per payment and lays your creator income out in eight fixed columns: date, client or platform, income stream, gross, fees, withholding, net received, and the invoice or payout reference. It then counts how many rows are complete and how many have a blank or missing field, so the gaps in your records are visible before an accountant finds them. It handles sponsorships, affiliate payouts and platform ad revenue in one table, up to 200 rows.",
  useCases: [
    "It is the end of the quarter and your income is scattered across a brand's remittance email, an affiliate dashboard and a platform payout page, and you need it in one consistent table",
    "Your accountant asks for gross versus net with tax withheld shown separately, and your own notes only ever recorded what landed in the bank",
    "A payout is missing and you want to find which entries have no invoice or payout reference against them, so you know what to chase",
  ],
  benefits: [
    ["Gross, fees and withholding kept apart", "Net received is only one of eight columns, so the amount deducted before payout is recorded rather than lost."],
    ["Incomplete rows are counted, not ignored", "The completeness check reports exactly how many entries are missing a field, which is the number that matters at tax time."],
    ["One format for every income stream", "Sponsorship, affiliate and platform revenue go into the same eight columns, so they can actually be compared."],
  ],
  faqs: [
    [
      "What format do the records have to be in?",
      "One record per line, with a pipe character between eight fields in this order: Date | Client / platform | Income stream | Gross | Fees | Withholding | Net received | Invoice / payout ref. A row with fewer than eight fields, or any blank field, is counted as needing review.",
    ],
    [
      "Does it add up my total income?",
      "No — it structures and audits the records rather than totalling them. It reports how many rows are complete, how many need review, and displays them in a consistent table; take that cleaned table into a spreadsheet or your accounting software for the sums.",
    ],
    [
      "Why record gross and withholding separately from net received?",
      "Because tax is usually assessed on gross income, while your bank only ever sees net. Platform commissions, payment-processor fees and any tax deducted at source sit between the two, and if you only log the net figure you cannot reconcile a payout against an invoice or claim the deductions back.",
    ],
    [
      "Is my income data uploaded anywhere?",
      "No. Everything you paste is processed in your browser and nothing is sent to a server, which is why the tool holds no account and stores no history. Keep your own copy of the records, and speak to a qualified accountant about how this income should be reported where you live.",
    ],
  ],
};

export default seo;
