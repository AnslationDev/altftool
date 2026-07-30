const seo = {
  intro:
    "Future Salary Predictor compounds your current salary by a fixed annual increment to show what you will earn in each future year, using salary × (1 + rate)ⁿ where year 1 is your pay today and the first raise lands in year 2. It returns three summary figures — final-year salary, total earned across the whole period, and average annual salary — plus a year-by-year table with a running cumulative total. Increments run from 0% to 100% and the horizon from 1 to 50 years, so it works for both a modest cost-of-living rise and an aggressive growth scenario.",
  useCases: [
    "Weighing a job offer with a lower starting salary but a higher stated annual review percentage, and needing to know which one wins over eight years.",
    "Planning a mortgage or long study commitment and wanting a realistic cumulative earnings figure rather than just next year's pay.",
    "Preparing for a pay review: modelling 3% versus 6% over ten years to show, in money, what the gap is worth over the whole period.",
  ],
  benefits: [
    ["Cumulative, not just the last year", "The table carries a running total alongside each year's salary, so you can see lifetime earnings for the period, not only the end point."],
    ["Compounding done properly", "Each raise is applied to the previous year's raised salary, which is what makes a 5% increment worth far more than 5 × 10 years of your starting pay."],
    ["Long horizons supported", "Projections run out to 50 years, enough to model a full career rather than the three-to-five years most calculators stop at."],
  ],
  faqs: [
    [
      "How is the future salary calculated?",
      "It compounds: each year's salary is the previous year's multiplied by (1 + increment ÷ 100). Year 1 shows your current salary unchanged, so after 10 years at 5% a $50,000 salary reaches roughly $77,566 in the final year and about $628,895 in total.",
    ],
    [
      "How long does it take for my salary to double?",
      "At a steady 5% annual increment a salary doubles after about 14 raises, and at 7% after about 10 — the shortcut is 72 divided by the percentage. Enter your own rate and read the final-year figure to confirm.",
    ],
    [
      "What increment percentage should I use?",
      "Use the figure your employer actually applies at review time, and if you want a real-terms view subtract inflation from it — a 5% raise during 4% inflation is closer to 1% of genuine growth. The tool accepts anything from 0% to 100%.",
    ],
    [
      "Is this financial advice?",
      "No, it is an arithmetic projection and nothing more. It assumes one flat increment every year with no promotions, job changes, bonuses, tax or inflation, so treat the output as a scenario and speak to a qualified adviser before making financial commitments on it.",
    ],
  ],
};

export default seo;
