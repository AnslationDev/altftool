const seo = {
  title: "Student Loan Calculator: Payment, Interest",
  metaDescription:
    "Amortised monthly payment plus the grace-period interest that capitalises, a year-by-year schedule, and what an extra payment each month would save.",
  steps: [
    "Enter Amount borrowed, pick a Currency, then set Annual interest rate (%) and Repayment term (years) — the US standard plan runs 10 years.",
    "Add Months before repayment starts and any Extra payment each month, or tick \"Subsidised loan — interest is paid for me before repayment starts\".",
    "Monthly payment heads the result, with Interest capitalised before repayment, Total repaid and Payoff time below, plus a year-by-year Interest, Principal and Balance table.",
  ],
  intro:
    "This student loan calculator gives the level monthly payment, the interest that capitalises before repayment begins, and the total amount you will repay, using the standard amortisation formula M = B × i ÷ (1 − (1 + i)^−n) with i as the monthly rate and n the number of instalments. It also models the grace period, where an unsubsidised loan accrues simple interest that is added to the balance when repayment starts, and shows what an extra payment each month would save. It is built for students and graduates deciding how much to borrow or how fast to repay.",
  useCases: [
    "Seeing what borrowing $30,000 will actually cost once ten years of interest is added",
    "Comparing a subsidised loan with an unsubsidised one where interest builds through a six-month grace period",
    "Testing whether an extra $100 a month is worth it before committing to the higher payment",
  ],
  benefits: [
    ["Capitalisation shown separately", "Grace-period interest is calculated and displayed on its own, so you see the balance grow before the first payment."],
    ["Extra-payment comparison", "Reports months saved and interest saved side by side with the scheduled plan."],
    ["Year-by-year schedule", "Splits every year into interest, principal and closing balance so you can see how slowly early payments touch the principal."],
  ],
  faqs: [
    [
      "What is the monthly payment on a $30,000 student loan?",
      "At 6% over the standard 10-year term it is $333.06 a month, and you repay $39,967 in total — $9,967 of it interest. Raising the rate or extending the term lowers the monthly figure but increases the total interest.",
    ],
    [
      "What does it mean when student loan interest capitalises?",
      "Capitalisation is unpaid interest being added to your principal, after which you pay interest on that interest. On a $30,000 unsubsidised loan at 6.53%, a six-month grace period adds about $980 to the balance before the first payment is even due.",
    ],
    [
      "How long is the standard student loan repayment term?",
      "Ten years, or 120 monthly payments, under the US Department of Education's Standard Repayment Plan for Direct Loans. Extended and income-driven plans can run 20 to 25 years, which cuts the monthly payment but raises the total interest substantially.",
    ],
    [
      "Does paying extra on a student loan actually save money?",
      "Yes, because every extra dollar goes straight against principal and stops accruing interest. On the $30,000 at 6% example, adding $100 a month clears the loan in 86 months instead of 120 and saves about $3,046 in interest.",
    ],
  ],
};

export default seo;
