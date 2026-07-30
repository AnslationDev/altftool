const seo = {
  intro:
    "Compound annual growth rate is the single steady yearly rate that would take a starting value to an ending value over a given period, and this calculator applies the standard formula CAGR = (final ÷ initial)^(1 ÷ years) − 1. Alongside the annual rate it reports the total growth percentage, the multiple your money grew by, and the absolute gain. It is for anyone comparing investments, revenue lines or fund returns that ran for different lengths of time.",
  useCases: [
    "A mutual fund shows \"up 150% since launch\" and you want the annualised figure so you can compare it against a fixed deposit quoting a per-year rate",
    "Your business went from ₹40 lakh to ₹1.1 crore of revenue over four years and the board wants the growth rate stated as one number",
    "You are deciding between two properties, one held six years and one held eleven, and total appreciation alone tells you nothing useful",
  ],
  benefits: [
    [
      "Puts unequal periods on the same footing",
      "A 3-year and a 9-year holding both collapse to one annual rate, which is the only fair way to rank them.",
    ],
    [
      "Shows the multiple alongside the rate",
      "Total growth, the growth multiple (2.5×) and the absolute gain appear next to the percentage, so the number stays connected to real money.",
    ],
    [
      "Refuses impossible inputs",
      "A zero or negative starting value, or zero years, produces a prompt rather than a misleading percentage — CAGR is undefined in those cases.",
    ],
  ],
  faqs: [
    [
      "How do you calculate CAGR?",
      "CAGR = (ending value ÷ beginning value) raised to the power of (1 ÷ number of years), minus 1, expressed as a percentage. For example ₹10,000 growing to ₹25,000 over 5 years is (2.5)^0.2 − 1 = 20.11% per year.",
    ],
    [
      "What is the difference between CAGR and average annual return?",
      "CAGR is a geometric mean and accounts for compounding; a simple average does not. A year of +50% followed by a year of −50% averages to 0% but the CAGR is −13.4%, because ₹100 becomes ₹150 then ₹75. CAGR always reflects what you actually ended up with.",
    ],
    [
      "Can CAGR be negative?",
      "Yes — whenever the ending value is below the starting value. ₹100,000 falling to ₹60,000 over 3 years gives a CAGR of −15.66% per year. The formula still needs a positive starting value and a positive number of years to be defined.",
    ],
    [
      "Does CAGR account for money added along the way?",
      "No. CAGR assumes one lump sum in at the start and nothing added or withdrawn until the end, so it does not describe a SIP or any schedule of contributions — use XIRR or an internal rate of return for those. This calculator is informational; speak to a licensed adviser before acting on investment comparisons.",
    ],
  ],
};

export default seo;
