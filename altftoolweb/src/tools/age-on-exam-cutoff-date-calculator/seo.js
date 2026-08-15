const seo = {
  title: "Age on Cutoff Date Calculator for Exam",
  metaDescription:
    "Get your exact age in years, months and days on any exam's crucial date and test it against minimum and maximum limits with the day margin shown.",
  steps: [
    "Enter your \"Date of birth\" and the notification's \"Cutoff (\\\"as on\\\") date\".",
    "Optionally add the \"Minimum age in years\" and \"Maximum age in years\" from the eligibility clause, including any relaxation yourself.",
    "Read your completed age in years, months and days, the day margin on each limit and the age-window verdict, then click \"Copy result\".",
  ],
  intro:
    "This calculator computes your exact completed age — years, months and days — on any exam notification's cutoff or \"crucial\" date, using the calendar convention recruitment bodies apply: a year of age completes on the birthday anniversary. It can also test that age against a minimum limit (\"must have attained\") and a maximum limit (\"must not have attained\"), showing the precise day margin on either side, which is where borderline candidates usually get eligibility wrong.",
  useCases: [
    "A UPSC aspirant checking whether they stay under 32 years as on 1 August of the exam year, down to the day",
    "An SSC or state-PSC candidate born near the crucial date confirming the minimum 18 or 21 years is attained in time",
    "A candidate comparing two notifications with different cutoff dates to see which one they remain age-eligible for",
  ],
  benefits: [
    ["Exact to the day", "Returns completed years, months and days plus total days lived, so boundary cases are unambiguous."],
    ["Both limits tested", "Checks 'attained the minimum' and 'not attained the maximum' the way notifications phrase them, with the day margin for each."],
    ["Any exam, any date", "Works for UPSC, SSC, banking, state PSC or any form — you supply the cutoff date the notice prints."],
  ],
  faqs: [
    [
      "How is age calculated as on a cutoff date?",
      "By the calendar: count completed years to the last birthday on or before the cutoff, then completed months, then leftover days. Someone born 10 March 2002 is 24 years, 4 months and 22 days old as on 1 August 2026 — a year of age completes only on the birthday anniversary, never by rounding.",
    ],
    [
      "What does \"must not have attained 32 years\" mean?",
      "It means your 32nd birthday must fall after the cutoff date. If your 32nd birthday is exactly on the cutoff you have attained 32 years that day and are over the limit — which is why UPSC-style notices equivalently say you must have been born on or after the date 32 years before the day following the cutoff.",
    ],
    [
      "Does this calculator handle age relaxation for OBC, SC/ST or ex-servicemen?",
      "Add the relaxation to the maximum limit yourself — for example UPSC Civil Services allows 32 years for General, so enter 35 for OBC (+3) or 37 for SC/ST (+5). Relaxations vary by notification and can combine, so take the figure from the notice you are applying under.",
    ],
    [
      "Why does my age differ between exam forms?",
      "Because each notification fixes a different crucial date — 1 January, 1 July, 1 August or the application closing date — and your completed age can differ across them. Always compute against the exact date printed in the eligibility clause, not today's date.",
    ],
  ],
};

export default seo;
