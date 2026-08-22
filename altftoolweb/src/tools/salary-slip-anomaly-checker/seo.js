const seo = {
  title: "Salary Slip Checker: Do the Totals Add Up?",
  metaDescription:
    "Paste Month | gross | deductions | net for each payslip to flag any totals mismatch over 0.01 or a net swing past your threshold.",
  steps: [
    "Paste one month per line into Monthly salary figures as Month | gross | deductions | net, e.g. 2026-07 | 80000 | 18000 | 62000.",
    "Set the Change alert threshold (%), 5 by default, for how far net pay may move against the previous month.",
    "Read the Month, Gross, Deductions, Net, Math gap and Review columns with the count of flagged months.",
  ],
  intro:
    "Salary Slip Anomaly Checker re-does the arithmetic on your payslips and flags any month where net pay does not equal gross minus deductions, or where net pay moved more than your chosen percentage against the previous month. You paste one line per month as Month | gross | deductions | net, set a change threshold (5% by default), and get a table showing the exact math gap in currency and a review note for every row. It is an arithmetic cross-check for salaried employees and freelancers reconciling their own slips — not a payroll, tax, or employment-rights determination.",
  useCases: [
    "Your July net pay dropped and HR says nothing changed — you line up May, June and July to see whether the deduction column grew or the gross fell.",
    "You are gathering six months of slips for a home-loan file and want to be sure none of them has a totals mismatch before the lender's verification team spots it.",
    "You switched employers mid-year and want to check that the new company's slip actually adds up before you raise a ticket with its payroll desk.",
  ],
  benefits: [
    [
      "Catches arithmetic that quietly does not add up",
      "Every row is tested against net = gross − deductions and any difference larger than 0.01 is reported as a signed math gap, so a rounding slip and a real error look different.",
    ],
    [
      "Month-to-month drift, not just single-slip totals",
      "Net pay is compared with the previous month's net and reported as a percent change, so a gradual creep across three slips shows up as clearly as one bad month.",
    ],
    [
      "You set what counts as unusual",
      "The alert threshold is yours to move — tighten it to 1% for a fixed salary, loosen it to 15% if variable pay or incentives make swings normal.",
    ],
  ],
  faqs: [
    [
      "How do I check if my salary slip is correct?",
      "Confirm that net pay equals gross pay minus total deductions, then compare that net against the previous month. This tool does both: it computes net − (gross − deductions) for each line and marks a Totals mismatch whenever the difference exceeds 0.01, and separately flags any month whose net moved past your percentage threshold.",
    ],
    [
      "What does the change alert threshold do?",
      "It sets how large a month-to-month swing in net pay has to be before the month is flagged, and it defaults to 5%. The percentage is measured against the previous month's net, so with the default a net of 68,000 followed by 62,000 (−8.8%) is flagged, while a 3% variation is not.",
    ],
    [
      "What format do I enter my payslip figures in?",
      "One month per line, four values separated by pipes: Month | gross | deductions | net — for example 2026-07 | 80000 | 18000 | 62000. Blank lines are ignored, the month label is free text, and rows are compared in the order you list them, so keep them chronological.",
    ],
    [
      "My slip is flagged — does that mean my employer deducted something illegally?",
      "No. A flag only means the numbers did not reconcile or the month moved more than your threshold; it says nothing about whether a deduction is lawful, correctly taxed, or contractually owed. Use the result as a prompt to ask payroll for a breakdown, and take a suspected statutory or contractual issue to a qualified payroll or employment professional.",
    ],
  ],
};

export default seo;
