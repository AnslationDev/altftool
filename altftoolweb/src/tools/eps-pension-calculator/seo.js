const seo = {
  intro:
    "This EPS Pension Calculator estimates the monthly pension payable under the Employees' Pension Scheme, 1995 using EPFO's statutory formula: pensionable salary × pensionable service ÷ 70. It adds the two bonus years granted once you complete 20 years of service, applies the 4% per year reduction for pension drawn before 58 (or the 4% increase for deferring to 59 or 60), and shows the family pension your spouse and children would receive. If your service is under 10 years it switches to the Table D withdrawal benefit instead, because no monthly pension is payable below that threshold.",
  useCases: [
    "A private-sector employee retiring at 58 after 32 years of EPF membership wants to know the monthly pension EPFO will sanction on the ₹15,000 wage ceiling.",
    "Someone considering early pension at 50 wants to see exactly how much the 4% per year reduction costs them over a lifetime before signing Form 10D.",
    "An employee who left a job after 7 years wants to check the one-time EPS withdrawal benefit under Table D versus keeping a Scheme Certificate.",
  ],
  benefits: [
    ["Uses the actual EPFO formula", "Pensionable salary × pensionable service ÷ 70, plus the 2-year bonus above 20 years of service."],
    ["Compares start ages side by side", "See the pension at 50, 55, 58 and 60 in one table so early versus deferred pension is an informed choice."],
    ["Covers family pension too", "Widow/widower pension at 50% and child pension at 25% each are calculated automatically."],
  ],
  faqs: [
    [
      "What is the EPS pension formula?",
      "Monthly pension = (pensionable salary × pensionable service) ÷ 70. Pensionable salary is the average of the last 60 months of contributory wages, capped at ₹15,000 a month since 1 September 2014 unless a higher-pension option was approved.",
    ],
    [
      "How many years of service are needed for an EPS pension?",
      "You need at least 10 years of eligible service to get a lifelong monthly pension. With less than 10 years you can take a one-time withdrawal benefit under Table D or hold a Scheme Certificate to carry the service forward.",
    ],
    [
      "Can I take EPS pension before 58?",
      "Yes, an early pension can start any time from age 50 once you have 10 years of service, but it is reduced by 4% for every year you draw it before 58. Deferring past 58 raises it by 4% per year up to age 60.",
    ],
    [
      "What is the minimum EPS pension?",
      "The Government of India has set a minimum EPS-95 pension of ₹1,000 per month for eligible members, so the calculator floors the result at that amount when the formula produces less.",
    ],
  ],
};

export default seo;
