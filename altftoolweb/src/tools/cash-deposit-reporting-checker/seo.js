const seo = {
  title: "Cash Deposit Checker: Rule 114E, 194N, 269ST",
  metaDescription:
    "Enter a year of cash deposits and withdrawals to see which Rule 114E, PAN and section 194N thresholds you cross, with the 194N TDS the bank deducts.",
  steps: [
    "Under \"Your financial year figures (INR)\" enter the totals you have — \"Cash deposited into savings accounts (year total)\", \"Cash withdrawn from all bank accounts\", \"Largest cash deposit made on one day\" and \"Largest cash sum received from one person in a day\".",
    "Tick \"I have filed my income tax returns for the last three years\" and, where it applies, \"The account holder is a co-operative society (₹3 crore section 194N limit)\".",
    "\"Every threshold, checked\" marks each limit Crossed or Within limit with the rule behind it, while the summary gives the section 194N threshold that applies to you, the amount liable, the TDS the bank must deduct and any section 271DA penalty exposure; \"Copy result\" copies the lot.",
  ],
  intro:
    "This checker compares a financial year of cash deposits, withdrawals and card payments against every threshold that makes a bank report you under Rule 114E of the Income-tax Rules, 1962 — the Statement of Financial Transactions that feeds your Annual Information Statement. It also applies the Rule 114B and Rule 114BA PAN-quoting rules, the section 194N TDS slabs on cash withdrawals, and the section 269ST prohibition on receiving ₹2,00,000 or more in cash from one person in a day. You get a line-by-line verdict showing which limits you cross, the rule behind each and what it means before you file.",
  useCases: [
    "A shopkeeper who banked ₹12,00,000 of daily takings into a savings account wanting to know why it appeared in the AIS and whether the ₹10,00,000 Rule 114E limit was the trigger.",
    "A contractor drawing large sums for wages checking how much section 194N TDS the bank will deduct on withdrawals above ₹1 crore, and how the figure changes if returns have not been filed for three years.",
    "A family that received a large cash gift at a wedding checking the section 269ST limit before accepting it, since the penalty under section 271DA falls on the receiver and equals the whole amount.",
  ],
  benefits: [
    ["Ten rules in one pass", "Reporting, PAN quoting, mandatory PAN and cash-receipt limits are tested together."],
    ["Names the rule", "Every result cites the rule or section so you can look it up before answering a notice."],
    ["Quantifies section 194N", "Splits withdrawals across the 2% and 5% slabs and shows the exact TDS the bank deducts."],
  ],
  faqs: [
    [
      "How much cash can I deposit in a savings account without it being reported?",
      "Banks report the moment cash deposits reach ₹10,00,000 in a financial year across your savings accounts, under Rule 114E(2) item 2. Current accounts have a separate ₹50,00,000 limit that counts deposits and withdrawals together, and any single-day cash deposit above ₹50,000 already needs your PAN under Rule 114B.",
    ],
    [
      "Does a reported cash deposit mean I will get an income tax notice?",
      "No. Reporting under Rule 114E is routine information gathering, and the entry simply appears in your Annual Information Statement. A query only follows if the reported cash does not reconcile with the income and sources declared in your return, so keep the books and bank narration that explain it.",
    ],
    [
      "When does the bank deduct TDS on my cash withdrawals?",
      "Section 194N applies at 2% on cash withdrawals above ₹1 crore in a financial year. If you have not filed returns for all three preceding assessment years whose due dates have passed, the deduction starts much earlier — 2% from ₹20,00,000 and 5% above ₹1 crore. Co-operative societies have a higher ₹3 crore base threshold from 1 April 2023.",
    ],
    [
      "When is a PAN compulsory for cash banking?",
      "Rule 114BA makes holding and quoting a PAN compulsory once cash deposits, or cash withdrawals, aggregate to ₹20,00,000 or more in a financial year across your bank, co-operative bank or post office accounts. Opening a current account or cash credit account also requires it regardless of amount, and Form 60 is the substitute only for someone who genuinely has no PAN.",
    ],
  ],
};

export default seo;
