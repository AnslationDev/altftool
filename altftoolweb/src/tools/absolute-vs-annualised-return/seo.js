const seo = {
  title: "Absolute vs Annualised Return Converter (CAGR)",
  metaDescription:
    "Turn a whole-period gain into a compounded yearly rate and back, via 1 + absolute = (1 + annualised)^years, for a period in years, months or days.",
  steps: [
    "Pick a Direction — \"Absolute → annualised\" or \"Annualised → absolute\" — and type the figure into the field that appears, either \"Absolute (total) return over the whole period (%)\" or \"Annualised return (% per year)\".",
    "Enter the Holding period and set \"Period unit\" to Years, Months or Days; optionally fill \"Optional: amount invested (INR) to see the result in money\".",
    "The headline gives the converted rate, and the list adds the growth multiple, the simple average per year, how many percentage points that shortcut overstates by, years to double, and a table of the same rate over other horizons; \"Copy result\" copies the summary.",
  ],
  intro:
    "This converter moves between absolute return — the total percentage gain across a whole holding period — and annualised return, the compounded yearly rate that produces it, using the identity 1 + absolute = (1 + annualised)^years. Enter either figure with a period in years, months or days and get the other, plus the growth multiple and the naive total-divided-by-years average for comparison. It exists because fund factsheets quote absolute returns under one year and annualised returns above it, which makes side-by-side comparison misleading.",
  useCases: [
    "Convert a fund's 3-year absolute return of 62% into an annualised figure before comparing it with a 5-year number.",
    "Work out what total gain a 12% a year expectation actually produces over a 7-year goal.",
    "Sanity-check a marketing claim that spreads a 90% total gain over 6 years as '15% a year'.",
  ],
  benefits: [
    ["Exact, not averaged", "Uses geometric compounding, so the annualised rate really does rebuild the total gain."],
    ["Any period unit", "Accepts years, months or days, converting days at the mean Gregorian year of 365.2425 days."],
    ["Shows the overstatement", "Prints the gap in percentage points between the true rate and the total-divided-by-years shortcut."],
  ],
  faqs: [
    [
      "How do I convert absolute return to annualised return?",
      "Add 1 to the absolute return as a decimal, raise it to the power of 1 divided by the number of years, then subtract 1. A 100% total gain over 5 years becomes (2)^(1/5) − 1 = 14.87% a year, not 20%.",
    ],
    [
      "Why do mutual funds show absolute returns for periods under one year?",
      "Because annualising a few months of performance projects a short run onto a full year and exaggerates it. Indian fund disclosure convention is to show point-to-point absolute returns below one year and CAGR at one year and above.",
    ],
    [
      "Is annualised return the same as CAGR?",
      "For a single lump sum held over one continuous period, yes — annualised return and CAGR are the same geometric calculation. They differ from XIRR, which handles multiple cash flows on different dates.",
    ],
    [
      "Which is the better number to compare two investments?",
      "The annualised rate, provided both are measured over the same length of period. Comparing one fund's 3-year annualised return with another's 10-year annualised return still compares different market conditions, so match the windows where you can.",
    ],
  ],
};

export default seo;
