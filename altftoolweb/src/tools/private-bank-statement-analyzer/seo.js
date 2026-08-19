const seo = {
  title: "CSV Bank Statement Analyzer: No Data Uploads",
  steps: [
    "Paste the rows or press Choose text file for a CSV, TSV or .txt export up to 10 MB and 25,000 rows, then press Parse locally.",
    "Confirm the Date, Description, Debit / money out and Credit / money in mappings, pick DD/MM/YYYY or MM/DD/YYYY, then press Analyze in memory.",
    "Money in, money out and net movement appear with outflow by category and month; Download summary saves private-statement-aggregate-summary.csv.",
  ],
  intro:
    "This analyzer reads a CSV, TSV or delimited bank-statement export in your browser, maps its columns to date, description and debit/credit (or a single signed amount), then classifies every transaction with a fixed keyword rulebook and totals inflow, outflow and net movement by category and by month. The rulebook is deterministic — 15 spending categories from Housing and Groceries through Transport, Utilities, Subscriptions, Bank fees, Transfers and Insurance & tax, plus an Income bucket for salary, pension, dividend, refund, cashback and reimbursement credits — so the same file always produces the same figures. It is built for anyone who wants a spend breakdown without handing their statement to a budgeting service.",
  useCases: [
    "You are applying for a loan and want to see, before the lender does, how your last six months split between rent, EMIs, transfers and discretionary spend.",
    "You suspect a subscription was billed twice and need the rows that share the same date, description and amount pulled out of a thousand-line export.",
    "A freelancer reconciling the year totals income credits against outflow categories to hand a clean summary to their accountant.",
  ],
  benefits: [
    ["Maps any bank's column names", "Header hints recognise narration, particulars, withdrawal, paid out, money in and a dozen other variants, and you can override every mapping by hand."],
    ["Understands messy money columns", "Parentheses, trailing Dr/Cr suffixes, currency symbols and thousands separators all parse to the right sign instead of being dropped."],
    ["Flags rows for review, not verdicts", "Duplicate groups, oversized outflows and higher-spend months are surfaced with the threshold that triggered them so you can check the original statement."],
  ],
  faqs: [
    [
      "What file formats and delimiters does it accept?",
      "CSV, TSV and plain .txt exports using comma, tab, semicolon or pipe separators. Delimiter detection is automatic — it counts separators outside quotes in the first non-empty line — but you can force any of the four from a dropdown if a description field confuses the guess.",
    ],
    [
      "How does it decide a transaction is unusually large?",
      "An outflow is flagged when it exceeds the larger of 4x the median outflow and 3x the mean outflow for that file, and only once the file has at least 5 outflows. A month is flagged when its outflow is more than 1.75x the median monthly outflow, and only once there are at least 3 months of data.",
    ],
    [
      "Does my statement get uploaded anywhere?",
      "No. Parsing, categorising and totalling all run as JavaScript inside the page, and the summary and signal-count CSVs are generated locally as downloads. Nothing about the account leaves the device.",
    ],
    [
      "My dates are American — will they parse correctly?",
      "Yes, switch the date order to MM/DD/YYYY; the default is DD/MM/YYYY, and ISO YYYY-MM-DD is detected automatically either way. Two-digit years pivot at 70, so 70-99 read as 1970-1999 and 00-69 read as 2000-2069.",
    ],
  ],
};

export default seo;
