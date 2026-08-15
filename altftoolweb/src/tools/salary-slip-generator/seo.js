const seo = {
  title: "Salary Slip Generator: Payslip with Net Pay",
  metaDescription:
    "Build a monthly payslip from your own earning and deduction heads, prorate by paid days, and get gross, deductions and net pay spelled out in words.",
  steps: [
    "Enter Company name, Pay month, Employee name, Employee ID, Designation and Department, plus optional PAN, UAN and Bank account.",
    "Set Days in month and Paid days, tick 'Prorate earnings for loss of pay' so each earning head scales by paid days / days in month, then edit the Earnings and Deductions rows or press Add row for another head.",
    "The slip totals Gross earnings, Total deductions and Net pay with the amount written out in words; press Copy result, or Print to save it as a PDF.",
  ],
  "intro": "Salary Slip Generator builds a clean monthly payslip from earning and deduction heads you control. Add or rename rows like basic, HRA, conveyance, provident fund, professional tax or TDS, set the paid days so earnings prorate automatically for loss of pay, and the tool totals gross earnings, total deductions and net pay — with the net amount spelled out in words the way Indian payslips show it. Useful for small employers, HR teams without payroll software, and anyone who needs a tidy payslip copy to print or save as PDF.",
  "useCases": [
    "Issue payslips for a small team when the accounting software does not produce them.",
    "Prorate a joining or exit month where the employee was on the payroll for only part of the month.",
    "Produce a formatted payslip copy to attach to a loan, visa or rental application."
  ],
  "benefits": [
    [
      "Your own salary structure",
      "Earning and deduction rows are fully editable — add, rename or delete any head your company uses."
    ],
    [
      "Loss-of-pay proration",
      "Set paid days against days in the month and every earning head scales automatically."
    ],
    [
      "Net pay in words",
      "The net amount is converted to words in the Indian numbering system, ready for print or PDF."
    ]
  ],
  "faqs": [
    [
      "What must a salary slip contain?",
      "Typically the employer and employee details, the pay period, paid days, each earning head, each deduction head, gross earnings, total deductions and net pay. Many employers also print PAN, UAN and the bank account the salary was credited to."
    ],
    [
      "How is net pay calculated?",
      "Net pay = gross earnings minus total deductions. Gross earnings include basic, allowances and any bonus for the month; deductions cover provident fund, professional tax, TDS, insurance and any recoveries."
    ],
    [
      "How does loss of pay affect the payslip?",
      "Earnings are prorated by paid days divided by days in the month. Statutory deductions like provident fund are then computed on the reduced wages, so enter the deduction amounts that apply to the prorated pay."
    ],
    [
      "Is the data I enter stored anywhere?",
      "No. The payslip is built entirely in your browser, nothing is uploaded, and the page keeps no copy once you close it."
    ]
  ]
};

export default seo;
