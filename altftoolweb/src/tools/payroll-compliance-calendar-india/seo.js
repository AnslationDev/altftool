const seo = {
  title: "India Payroll Due Dates: PF, ESI, TDS, Prof. Tax",
  metaDescription:
    "PF and ESI by the 15th, salary TDS by the 7th (30 April for March), Form 24Q quarters and state PT dates for any wage month, with late-payment cost.",
  steps: [
    "Set the Wage month and Year, pick your Professional tax state, and set Treat this date as today so overdue items are marked.",
    "Read Monthly deadlines with its Due date, Obligation and Rule columns — Para 38(1) for PF, Regulation 31 for ESI, Rule 30 for salary TDS — and the Financial year deadlines table for the Form 24Q quarters.",
    "Under What a late deposit costs pick EPF (12% interest + Section 14B damages), ESI (12% interest) or Salary TDS (1.5% per month or part), enter Amount payable (₹), Statutory due date and Date actually paid, then press Copy calendar.",
  ],
  intro:
    "This payroll compliance calendar turns one Indian wage month into the exact dates you must deposit PF, ESI, salary TDS and state professional tax, and shows what a late deposit costs. It applies Para 38(1) of the EPF Scheme 1952 and Regulation 31 of the ESI (General) Regulations 1950 (both the 15th of the following month), Rule 30 of the Income-tax Rules 1962 (the 7th, or 30 April for March deductions), Rule 31A for the quarterly Form 24Q statements, and each state's own professional tax Act. It is built for payroll executives, HR generalists and accountants running monthly salary cycles for Indian employers.",
  useCases: [
    "A payroll manager closing the June salary run and needing the July deposit dates for PF, ESI, TDS and Maharashtra PTRC in one view before the finance team releases funds.",
    "An accountant who missed the 15th EPF deadline and has to quote the Section 7Q interest and Section 14B damages to the client before making the delayed challan.",
    "A startup founder hiring their first employees in Karnataka, checking that professional tax is remitted by the 20th and that the Form 24Q Q1 statement is due 31 July.",
  ],
  benefits: [
    ["Every deadline cited", "Each row names the rule behind it — Para 38(1), Regulation 31, Rule 30, Rule 31A — so you can defend the date."],
    ["Weekend warning", "Flags due dates that land on a Saturday or Sunday so you fund the challan on the working day before."],
    ["Late cost priced", "Applies 12% a year to PF and ESI, graded 5-25% Section 14B damages, and 1.5% per month or part month to TDS."],
  ],
  faqs: [
    [
      "When is PF payment due in India?",
      "EPF contributions are due within 15 days of the close of the wage month, so June wages must be remitted through the ECR by 15 July. The rule is Para 38(1) of the Employees' Provident Funds Scheme 1952, and late payment carries 12% a year interest under Section 7Q plus damages under Section 14B.",
    ],
    [
      "What is the due date for TDS on salary?",
      "The 7th of the month following deduction, with one exception: tax deducted in March may be deposited up to 30 April. That comes from Rule 30 of the Income-tax Rules 1962, and delay costs 1.5% for every month or part of a month under Section 201(1A)(ii).",
    ],
    [
      "What are the Form 24Q filing dates?",
      "31 July for Q1 (April-June), 31 October for Q2, 31 January for Q3 and 31 May for Q4, under Rule 31A. Filing late attracts a fee of ₹200 per day under Section 234E, capped at the TDS amount, and Form 16 must reach employees by 15 June.",
    ],
    [
      "Do all states charge professional tax?",
      "No. Maharashtra, Karnataka, West Bengal, Tamil Nadu, Telangana, Andhra Pradesh, Gujarat, Madhya Pradesh and Odisha levy it, while Delhi, Haryana and Uttar Pradesh do not. Due dates differ by state — the 10th in Telangana and Andhra Pradesh, the 20th in Karnataka, the 21st in West Bengal and the last day of the following month for monthly Maharashtra PTRC filers.",
    ],
  ],
};

export default seo;
