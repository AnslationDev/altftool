const seo = {
  title: "CAGR Calculator with Doubling Time & Growth Path",
  metaDescription:
    "Enter start value, end value and years (or two dates) to get CAGR, absolute return, growth multiple, doubling time and a year-by-year growth path.",
  steps: [
    "Enter the Starting value and Ending value, pick a currency (INR, USD, EUR or GBP) and set 'Period entered as' to number of years or start and end dates.",
    "Type the Holding period (years) — or pick the two dates — and the CAGR recomputes instantly; there is no calculate button.",
    "Read the CAGR with absolute return, growth multiple, years to double and the 'Smooth growth path' year-by-year table, then click 'Copy result'.",
  ],
  intro:
    "CAGR is the single constant yearly rate that would carry a starting value to an ending value over a given period, calculated as (end ÷ start)^(1 ÷ years) − 1. This calculator returns that rate along with the absolute return, the growth multiple, and the number of years the money would take to double at the same pace. Investors, founders and analysts use it to compare holdings of different sizes and holding periods on one scale.",
  useCases: [
    "Compare a mutual fund held for 3 years against a stock held for 11 years on the same annualised basis.",
    "Turn a property's purchase and sale price into a yearly growth rate before deciding whether it beat a fixed deposit.",
    "Report revenue growth over a five-year window as one headline rate for a board deck or investor update.",
  ],
  benefits: [
    ["Geometric, not averaged", "Uses the compounding identity rather than dividing total gain by years, so the rate actually reproduces the ending value."],
    ["Years or dates", "Enter a plain number of years, or two calendar dates and let the fractional period be worked out for you."],
    ["Doubling time included", "Applies t = ln 2 ÷ ln(1 + r) so you can see how long the same rate needs to double your money."],
  ],
  faqs: [
    [
      "How do you calculate CAGR?",
      "Divide the ending value by the starting value, raise the result to the power of 1 divided by the number of years, then subtract 1. For example, ₹2,50,000 growing to ₹10,00,000 over 10 years gives (4)^(1/10) − 1 = 14.87% a year.",
    ],
    [
      "What is the difference between CAGR and absolute return?",
      "Absolute return is the total percentage gain over the whole period, while CAGR spreads that gain across the years with compounding. A 100% absolute return over 5 years is a CAGR of 14.87%, not 20%.",
    ],
    [
      "Is a good CAGR the same for every asset?",
      "No — it depends on the asset class and the period. Broad equity indices have historically compounded in the high single to low double digits over long stretches, while cash and bonds sit far lower; judge any figure against a relevant benchmark over the same window, not in isolation.",
    ],
    [
      "Can CAGR be negative?",
      "Yes. If the ending value is lower than the starting value the rate is negative, and if the investment ends at zero the CAGR is exactly −100%. Negative CAGR simply means the value shrank at that compounded rate each year.",
    ],
  ],
};

export default seo;
