const seo = {
  intro:
    "This calculator converts an absolute (point-to-point) return into an annualised return — the CAGR — and converts it back the other way. Enter the total percentage gain and how long you held the investment in years and months, and it shows the compounded annual rate, the final value, the value multiple and the doubling time. It is built for anyone comparing a fund fact sheet, a fixed deposit and a property sale that all quote returns on different bases.",
  useCases: [
    "A stock rose 60% in three years — you want the annualised figure to compare it against a 7% fixed deposit.",
    "A fund fact sheet quotes 14% CAGR over five years and you want to know the total gain on your 2 lakh rupee investment.",
    "You sold a property for twice what you paid after nine years and want the honest annual rate of return.",
  ],
  benefits: [
    ["Both directions", "Absolute to annualised and annualised to absolute in one tool, no formula juggling."],
    ["Months-level precision", "Handles part-year holding periods such as 2 years 7 months rather than rounding to whole years."],
    ["Context built in", "Shows doubling time, value multiple and how the same total gain looks over 1, 3, 5 and 10 years."],
  ],
  faqs: [
    [
      "What is the difference between absolute return and annualised return?",
      "Absolute return is the total percentage change between two points, regardless of time. Annualised return, or CAGR, is the constant yearly rate that would compound your starting value to the ending value over that same period.",
    ],
    [
      "What is the formula for converting absolute return to CAGR?",
      "CAGR = ((1 + absolute return / 100) raised to the power 1 divided by the number of years) minus 1. For a 60% gain over 3 years that gives 1.6 to the power one-third minus one, or about 16.96% a year.",
    ],
    [
      "Why do mutual funds show absolute returns for periods under one year?",
      "SEBI's advertising norms require returns for periods shorter than 12 months to be shown in absolute terms, because annualising a few months of performance can project an unrealistically large yearly figure.",
    ],
    [
      "Should I use CAGR for a SIP?",
      "No. CAGR assumes one lump sum invested at the start. When money goes in at many different dates, use XIRR, which weights each cash flow by how long it was actually invested.",
    ],
  ],
};

export default seo;
