const seo = {
  intro:
    "This converter maps any calendar date to its fiscal quarter — and any fiscal quarter back to exact start and end dates — for a fiscal year beginning in any month. It handles both year-naming conventions: the India/UK style that names the year after its starting calendar year (FY 2025-26, per the April–March year in the Income-tax Act) and the US federal style that names it after its ending year (FY2026 for the year starting 1 October 2025 under 31 USC 1102). Analysts, accountants and anyone reconciling reports across countries get the quarter label, date range and progress through the period.",
  useCases: [
    "An analyst translating a US company's Q1 FY2026 into calendar months before comparing it with an Indian company's Q2 FY 2025-26",
    "A finance team checking exactly which dates 'Q3' covers under their company's February-start fiscal year",
    "A project manager computing how many days remain in the current fiscal quarter for a burn-rate forecast",
  ],
  benefits: [
    ["Any fiscal calendar", "Presets for India, US federal, Australia, Japan and February-start corporates, plus any custom start month."],
    ["Both naming styles", "Start-year naming (FY 2025-26) and end-year naming (FY2026) are handled explicitly, so labels are never ambiguous."],
    ["Two-way conversion", "Date to quarter and quarter to date range, with day-of-quarter and percentage progress."],
  ],
  faqs: [
    [
      "What quarter is July in the Indian financial year?",
      "Q2. The Indian financial year runs 1 April to 31 March, so Q1 is April–June, Q2 is July–September, Q3 is October–December and Q4 is January–March. A date in July 2026 therefore falls in Q2 of FY 2026-27.",
    ],
    [
      "Why is the US fiscal year numbered differently from India's?",
      "Because the two governments name the year from opposite ends. The US federal fiscal year runs 1 October to 30 September and is named after the calendar year it ends in — the year starting 1 October 2025 is FY2026. India's runs 1 April to 31 March and is named after the year it starts in — the year starting 1 April 2025 is FY 2025-26.",
    ],
    [
      "How do I convert a fiscal quarter to calendar dates?",
      "Take the fiscal year's start month, add three months per completed quarter, and that month's 1st is the quarter start; the quarter ends on the last day of the third month. For example Q3 of a July-start Australian fiscal year FY2026 runs 1 January to 31 March 2026. This tool does the arithmetic and the year-name resolution for you.",
    ],
    [
      "Do all companies use standard three-month fiscal quarters?",
      "Most do, but retailers commonly use a 4-4-5 week calendar inside a 52/53-week fiscal year, which makes each quarter exactly 13 weeks and shifts quarter-end a few days from the month boundary. This converter covers standard month-based quarters; for a 4-4-5 company check the dates in its own filings.",
    ],
  ],
};

export default seo;
