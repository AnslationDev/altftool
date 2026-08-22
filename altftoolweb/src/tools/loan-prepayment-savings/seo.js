const seo = {
  title: "Loan Prepayment Savings Calculator",
  metaDescription:
    "Runs your EMI schedule with and without prepayments, one-time to yearly, and reports interest saved, new closure month and a month-by-month CSV.",
  steps: [
    "Under Loan Details set Loan Amount, Interest Rate and Loan Term (Years), and pick a Currency of INR, USD, EUR or GBP.",
    "Choose a Prepayment Frequency — One-Time, Monthly, Quarterly, Half-Yearly or Yearly — and enter the Prepayment Amount.",
    "Read the Monthly EMI, Interest Saved and Time Saved cards and the Remaining Balance chart, then Copy Summary or Export CSV to get loan-prepayment-comparison.csv.",
  ],
  intro:
    "Loan Prepayment Savings runs your loan twice — once on the plain EMI schedule and once with your prepayments added — and reports the difference in total interest, total payment and closure month. It computes the EMI from the standard amortisation formula P x r x (1+r)^n / ((1+r)^n - 1), then applies a prepayment on one of five schedules (one-time, monthly, quarterly, half-yearly or yearly), charting the two balance curves side by side and exporting the full month-by-month comparison as CSV. It suits anyone planning a bonus, a windfall or a recurring top-up against a home, car or personal loan.",
  useCases: [
    "Your yearly bonus arrives every March and you want to see whether an annual prepayment beats spreading the same total across twelve monthly top-ups.",
    "You are about to make a single lump-sum prepayment and want the exact new closure month, so you know how much earlier the loan clears and can plan the next commitment around it.",
    "Your lender's statement only shows the EMI, and you want a downloadable month-by-month CSV of balance and interest with and without prepayment to check their figures.",
  ],
  benefits: [
    [
      "Two full amortisation schedules, not one estimate",
      "It builds the with-prepayment and without-prepayment schedules month by month and compares them directly, so the interest saved is a computed difference.",
    ],
    [
      "Five prepayment cadences in one place",
      "One-time, monthly, quarterly, half-yearly and yearly all use the same engine, making it easy to see which rhythm suits your cash flow.",
    ],
    [
      "CSV export of the whole comparison",
      "Every month exports with balance, interest and prepayment amount for both scenarios, so you can audit the arithmetic in a spreadsheet.",
    ],
  ],
  faqs: [
    [
      "How much does a one-time prepayment save on a home loan?",
      "On the default scenario — 50,00,000 at 8.5% over 20 years, EMI about 43,391 — a single 2,00,000 prepayment in the first month saves roughly 7,98,700 in interest and closes the loan about 23 months early. The earlier the prepayment lands, the larger both figures get.",
    ],
    [
      "Which prepayment frequency saves the most?",
      "For the same rupee amount per instalment, the more frequent the prepayment the more you save, because principal comes down sooner and less interest accrues. A monthly plan beats quarterly, which beats half-yearly and yearly. One-time is compared as a single payment in the first month.",
    ],
    [
      "Does prepaying shorten the tenure or lower the EMI here?",
      "This tool models tenure reduction: the EMI stays fixed at its original value and the loan simply closes earlier, which is the default treatment at most lenders. The result reports the new closure month and the months saved against the original tenure.",
    ],
    [
      "Are prepayment charges included in the saving?",
      "No. The comparison covers principal and interest only, so any foreclosure fee, part-payment charge or processing fee your lender levies has to be subtracted separately. Floating-rate home loans to individuals are often exempt from such charges, but check your own agreement and confirm the terms with your lender before prepaying.",
    ],
  ],
};

export default seo;
