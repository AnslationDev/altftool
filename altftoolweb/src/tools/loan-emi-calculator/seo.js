const seo = {
  title: "Loan EMI Calculator with Prepayment & Amortization",
  h1: "Loan EMI Calculator",
  metaDescription:
    "Calculate monthly EMI, total interest and a full amortization schedule. Add a one-time prepayment to see months saved. Runs in your browser, no signup.",
  intro:
    "The Loan EMI Calculator computes your monthly instalment with the standard reducing-balance formula — EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1), where r is the annual rate divided by 12 and n is the tenure in months — then feeds that EMI into a month-by-month amortization loop that splits each payment into interest (outstanding balance × r) and principal. A one-time prepayment can be placed in any month; because the EMI is held constant, the balance clears early and the tool reports how many months were cut and how much interest that avoided. Charts are drawn with Recharts and every amount is formatted with Intl.NumberFormat in the en-IN locale as whole rupees. All of this runs in your browser — the page makes no network requests, stores nothing, and requires no signup.",
  useCases: [
    "Compare two home-loan offers by moving the rate and tenure sliders and watching total interest, not just the EMI, change",
    "Test whether a bonus paid in month 18 or month 36 shortens the loan more, before committing the money",
    "Check the EMI-to-income ratio and the first two years of the amortization table before a loan application",
  ],
  benefits: [
    [
      "Full amortization, not just one number",
      "Alongside the EMI, the tool builds the complete month-by-month schedule — interest, principal and closing balance for every instalment — and shows the first 24 rows in the Schedule tab plus a 10-year principal-vs-interest bar chart in Breakdown.",
    ],
    [
      "One-time prepayment modelled month by month",
      "Set a lump sum (up to half the loan, in ₹10,000 steps) and the month it lands. The EMI stays fixed, so the schedule simply ends sooner, and the tool reports the exact months saved and interest avoided.",
    ],
    [
      "Everything computed on your device",
      "The formula and the amortization loop run in JavaScript in the page. No loan amount, income figure or result is sent anywhere, and there is no account, login or usage limit.",
    ],
    [
      "A report you can copy or keep",
      "Copy Report puts the loan details, EMI breakdown, affordability ratio, prepayment impact and first 12 months of the schedule on your clipboard; Download Report saves the same text as loan-emi-report.txt.",
    ],
  ],
  faqs: [
    [
      "How is EMI calculated on a loan?",
      "With the reducing-balance formula EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1). P is the principal, r is the annual interest rate divided by 12 and by 100 (so 8.5% p.a. becomes 0.0070833 per month), and n is the tenure in months. This calculator applies exactly that formula, then rebuilds each instalment by charging interest on the outstanding balance and putting the remainder against principal.",
    ],
    [
      "What is the EMI for a 10 lakh loan for 20 years?",
      "About ₹8,678 a month at 8.5% p.a. — the calculator's default setting. Over 240 instalments that totals roughly ₹20.83 lakh, of which about ₹10.83 lakh is interest. Move the rate slider and the figures update instantly, since the whole schedule is recomputed on every change.",
    ],
    [
      "Does prepaying a loan reduce the EMI or the tenure?",
      "In this calculator it reduces the tenure. The EMI stays at its original value, the lump sum is subtracted from the outstanding balance in the month you choose, and the schedule ends as soon as the balance hits zero. Example: ₹25,00,000 at 8.8% over 15 years with ₹2,00,000 prepaid in month 18 finishes 23 months early and avoids roughly ₹4 lakh of interest. Real lenders may offer either a lower EMI or a shorter tenure — confirm which one applies to your agreement.",
    ],
    [
      "What EMI to income ratio does this tool use?",
      "It flags 50%. Enter your monthly income and the tool divides the EMI by it, labelling the result affordable below 50% and a high EMI burden above it. That is a fixed threshold built into the calculator for quick reference, not a lending rule — banks use their own eligibility criteria and factor in your other obligations.",
    ],
    [
      "Can I see the full amortization schedule?",
      "The schedule is computed in full for every month of the tenure, and the Schedule tab displays the first 24 rows with EMI, principal, interest and closing balance, noting how many months exist in total. The downloadable report (loan-emi-report.txt) includes the first 12 months plus the loan summary and prepayment impact.",
    ],
    [
      "Is this EMI calculator free and is my data uploaded?",
      "It is free, needs no signup, and nothing you enter leaves your device. The source contains no fetch or API calls — the EMI formula, amortization loop and charts all execute in the browser, and the report is generated locally as a Blob for download or copied via the Clipboard API.",
    ],
    [
      "What are the input limits?",
      "Loan amount ranges from ₹1 lakh to ₹1 crore in ₹50,000 steps, interest rate from 5% to 20% p.a. in 0.1% steps, and tenure from 1 to 30 years. Prepayment can be anything from zero up to half the loan amount, placed in any month within the tenure, and monthly income runs from ₹10,000 to ₹5,00,000.",
    ],
    [
      "Does it work for home, car and personal loans?",
      "Yes, for any fixed-rate loan repaid on a reducing balance — that covers typical home, car and personal loans, and presets for a home loan (₹50 lakh, 8.5%, 20 years) and a car loan (₹8 lakh, 9.5%, 5 years) are one tap away. It does not model processing fees, insurance, GST on charges, floating-rate resets or moratorium periods, so a lender's sanction letter can differ.",
    ],
  ],
  steps: [
    "Set the loan amount, interest rate and tenure with the sliders, or tap the Home loan, Car loan or Prepay plan preset — the monthly EMI, total interest and total amount payable recalculate as you drag.",
    "Optionally add a one-time prepayment and the month it lands, and set your monthly income, to see interest saved, months cut off the tenure and the EMI-to-income ratio.",
    "Switch to the Breakdown and Schedule tabs for the yearly principal-vs-interest chart and the month-by-month table, then use Copy Report or Download Report to save the summary as loan-emi-report.txt.",
  ],
};

export default seo;
