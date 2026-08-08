const seo = {
  title: "XIRR Calculator for SIPs and Irregular Cash Flows",
  metaDescription:
    "Enter dated cash flows — money in negative, out positive — for the annualised XIRR, shown beside point-to-point CAGR, invested and redeemed.",
  steps: [
    "Fill each row's 'Date' and 'Amount (₹)' following the stated sign convention — money you put in is negative, money you take out is positive — pressing 'Add transaction' for more rows, or paste one 'date,amount' pair per line into 'Paste transactions' and press 'Import (replaces rows)'.",
    "Set the 'Valuation date' and 'Current value (₹)' in the 'Current value today' box, or start from the 'SIP + lump top-up' or 'Irregular investing' preset. There is no calculate button: the rate re-solves as you edit.",
    "Read the annualised percentage under 'Your true annualized return' with the Total invested, Total redeemed, Current value and Period tiles, the 'Why XIRR ≠ CAGR here' comparison, and the Date / Type / Amount / 'Invested so far' table, then press 'Copy result'.",
  ],
  intro:
    "XIRR is the annualised rate that makes the present value of a set of dated cash flows sum to zero, and this calculator solves it for investments paid in at irregular dates — SIP instalments, top-ups, partial withdrawals and a closing valuation. Enter each flow as a date and an amount (money in negative, money out or current value positive), and it returns the annual rate along with total invested, total redeemed and the period in years. It also shows the naive point-to-point CAGR beside it so you can see how much the timing of your instalments actually changed the answer.",
  useCases: [
    "You have paid a fixed SIP every month for two years and the app shows an absolute gain percentage that tells you nothing about annual performance",
    "You added a lump-sum top-up halfway through and took a partial withdrawal later, so a simple start-to-end return no longer describes what you earned",
    "You want to know whether a fund actually beat a fixed deposit once the drip-feed of monthly instalments is accounted for, not just whether the final value is bigger",
  ],
  benefits: [
    ["Solves flows a simple formula cannot", "Newton-Raphson from a 10% seed, falling back to a bracketed bisection search between -99% and +1000%, so awkward flow patterns still converge instead of failing."],
    ["XIRR and CAGR side by side", "The point-to-point CAGR is shown explicitly as the figure that ignores timing, which makes the gap between the two easy to explain."],
    ["Paste a statement instead of typing it", "Import accepts one date,amount pair per line in YYYY-MM-DD or DD/MM/YYYY, strips currency symbols and thousands separators, and names the line number when something will not parse."],
  ],
  faqs: [
    [
      "What is the difference between XIRR and CAGR?",
      "CAGR assumes one lump sum invested at the start, while XIRR weights every contribution by how long it was actually invested. For a monthly SIP the two can differ sharply — money paid in during the final month has barely been working, so CAGR computed on total invested versus final value usually understates the true annual rate.",
    ],
    [
      "Why do the amounts have to be negative and positive?",
      "The sign is what tells the solver which direction the money moved: investments and purchases are negative, redemptions and the closing value are positive. A calculation needs at least two dated flows with at least one of each sign, and at least two different dates, or there is no rate that can zero the equation.",
    ],
    [
      "Why does it say it cannot converge?",
      "Because no rate between -99% and +1000% makes the net present value zero for those flows, which nearly always means a date or a sign is wrong — for example every amount entered as positive, or a valuation dated before the last instalment. Check the signs and the dates first; a genuine set of investment flows almost always has a solution in that range.",
    ],
    [
      "What do the benchmark rates represent?",
      "They are fixed reference lines set at 7% for a bank fixed deposit, 6% for inflation and 12% for a long-run index average, used only to place your XIRR on a scale. They are illustrative defaults, not current market rates, and nothing here is investment advice — talk to a licensed adviser before acting on a comparison.",
    ],
  ],
};

export default seo;
