const seo = {
  intro:
    "Rent Receipt Generator turns one set of rent details — tenant, landlord, PAN, address, monthly rent and a from/to month range — into a series of formal, print-ready rent receipts, one per month or one per quarter. Each receipt carries a serial number, the amount in figures and in Indian-system words (Thousand, Lakh, Crore), the payment mode, the rented address, the period covered, and a landlord signature block. It is built for salaried employees assembling HRA proof for a payroll declaration, and everything is generated in the browser.",
  useCases: [
    "Payroll has asked for twelve rent receipts covering April to March before the investment-proof deadline, and you need them all issued and printed in one sitting.",
    "Your landlord is happy to sign but will not write out receipts, so you prepare them yourself with the correct period, amount in words and PAN line for him to sign.",
    "You pay rent quarterly by bank transfer and want four receipts for the year instead of twelve, each covering a three-month block at three times the monthly rent.",
  ],
  benefits: [
    ["Amount in words, Indian system", "Every receipt spells the rupee figure out in Thousand, Lakh and Crore, so you never hand-write \"Rupees Fifteen Thousand Only\" twelve times."],
    ["Revenue stamp prompt where it applies", "Pick Cash as the payment mode and any receipt above ₹5,000 automatically shows a revenue stamp box and a note to affix it."],
    ["PAN format checked as you type", "The landlord PAN field validates against the ABCDE1234F pattern — five letters, four digits, one letter — before it prints on the receipt."],
  ],
  faqs: [
    [
      "When does my landlord's PAN have to appear on the receipt?",
      "As a rule of thumb, the landlord's PAN is required once annual rent crosses ₹1,00,000; below that most employers accept receipts without it. The tool leaves the PAN field optional and only prints it when you fill in a validly formatted number. Confirm the exact requirement with your employer's payroll team or a tax professional.",
    ],
    [
      "Do I need a revenue stamp on a rent receipt?",
      "A ₹1 revenue stamp is expected on cash payments above ₹5,000; receipts paid by UPI, bank transfer or cheque generally do not need one because the bank record is the evidence. Choose Cash as the payment mode and the tool prints a stamp box plus a reminder on every receipt over that amount.",
    ],
    [
      "What date is printed on each receipt?",
      "The last day of the final month in that receipt's period — so a receipt for June is dated 30 June, and a quarterly receipt covering April to June is dated 30 June. That keeps the issue date consistent with rent already paid rather than rent due.",
    ],
    [
      "How many months can I generate at once?",
      "Up to 60 months in a single run. If your from/to range is longer, the tool generates the first 60 and warns you to split the rest into a second batch. In quarterly mode those months are grouped into blocks of three.",
    ],
  ],
};

export default seo;
