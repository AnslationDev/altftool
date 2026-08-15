const seo = {
  title: "Petty Cash Book Builder: Imprest, Heads",
  metaDescription:
    "Post vouchers against a fixed float and get the running balance, totals by expense head for one journal entry, and the reimbursement that restores it.",
  steps: [
    "Set the Imprest float (₹), Opening cash in hand (₹), Extra cash received (₹) and the Period from / Period to dates.",
    "Press 'Add voucher' for each payment and fill Date, Voucher no., Particulars, Expense head and Amount (₹).",
    "Read the reimbursement to claim, closing balance and 'Totals by expense head'; enter 'Cash counted at close' to prove the book against the box.",
  ],
  intro:
    "A petty cash book on the imprest system records small office payments against a fixed float, and this builder posts your vouchers to it: opening cash plus top-ups minus payments gives the running balance, and imprest minus closing balance gives the reimbursement that restores the float. It also produces the analytical columns — totals by expense head such as conveyance, stationery and postage — which are the figures your journal entry actually needs. Add the cash you physically counted and the book is proved against the box.",
  useCases: [
    "Closing the month's petty cash on a ₹10,000 float and claiming back exactly what was spent.",
    "Preparing the expense-head totals an accountant needs to journalise petty cash in one entry.",
    "Proving the cash box: comparing counted notes against the book balance to find a shortage before the auditor does.",
  ],
  benefits: [
    [
      "True imprest arithmetic",
      "Reimbursement is computed as imprest minus closing balance, so the float always comes back to the same figure.",
    ],
    [
      "Analytical head totals",
      "Every voucher is posted to an expense head and the head totals are summed ready for a single journal entry.",
    ],
    [
      "Control checks built in",
      "Repeated voucher numbers, dates outside the period and any voucher that would overdraw the float are flagged as you type.",
    ],
  ],
  faqs: [
    [
      "What is the imprest system of petty cash?",
      "The petty cashier is given a fixed sum — the imprest — and at the end of each period is reimbursed with exactly the amount spent, bringing the cash back to that same fixed sum. It keeps the cash at risk capped and makes the reimbursement claim self-checking, because the claim must equal the total of the vouchers.",
    ],
    [
      "How do you calculate the closing balance of a petty cash book?",
      "Closing balance = opening cash in hand + any extra cash received − total payments made. Under the imprest system that closing balance plus the reimbursement always equals the imprest float, which is the quickest way to spot a posting error.",
    ],
    [
      "What expense heads go in an analytical petty cash book?",
      "Typically conveyance and travel, printing and stationery, postage and courier, refreshments, repairs and maintenance, cleaning, staff welfare and a miscellaneous column. Each voucher is entered once in the total column and once in its head column, so the head columns must add back to the total payments.",
    ],
    [
      "What if the cash counted does not match the book?",
      "Recount first, then look for an unrecorded voucher, a top-up that was never entered, or a payment posted twice. A persistent difference is a cash shortage or excess and is written off to a shortage account only with the approval your organisation's policy requires — speak to your accountant before writing anything off.",
    ],
  ],
};

export default seo;
