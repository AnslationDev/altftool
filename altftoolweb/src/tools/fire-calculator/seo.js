const seo = {
  title: "FIRE Calculator: Your Number at Any Withdrawal Rate",
  metaDescription:
    "FIRE number = annual expenses ÷ your SWR — 25× at 4%, 33.3× at 3%. Projects your SIP over 360 monthly steps and names the crossing year.",
  steps: [
    "Enter Yearly Expenses in Retirement, Current Retirement Savings, Monthly SIP Contribution, Expected Return (% p.a.) and Safe Withdrawal Rate (%).",
    "Press Calculate to divide those expenses by your withdrawal rate and project the corpus across 360 monthly steps.",
    "Your FIRE Number and Projected Corpus appear, and Year-by-Year Breakdown opens a table of invested, interest and balance for each year.",
  ],
  intro:
    "Your FIRE number is your annual retirement spending divided by your safe withdrawal rate — at the classic 4% rule that is 25 times a year's expenses, and this calculator lets you move the rate to see how much the target shifts. It then projects your corpus forward month by month for 30 years using corpus = (corpus + monthly SIP) × (1 + annual return ÷ 12), starting from what you have already saved, and reports the first year in which the projected balance clears the target. A year-by-year table breaks the balance into money invested and growth earned.",
  useCases: [
    "You spend about ₹50,000 a month and want to know the corpus that would cover it indefinitely at a 4% withdrawal rate before you decide how much to invest",
    "You are arguing with yourself about 4% versus 3.5% and want to see how many extra rupees of corpus the safer rate demands",
    "You already have ₹10 lakh invested and put ₹30,000 a month into an index fund, and you want the year your balance is projected to cross the target",
  ],
  benefits: [
    [
      "The withdrawal rate is an input, not an assumption",
      "Dropping the rate from 4% to 3% moves the multiple from 25× to 33.3× annual expenses, and the target updates immediately so you can price the extra safety margin.",
    ],
    [
      "Shows the crossing year, not just the target",
      "The projection runs 360 monthly steps and reports the first anniversary at which the corpus reaches the FIRE number, so the answer is a date rather than a number to admire.",
    ],
    [
      "Separates contributions from growth",
      "The annual table lists total invested and total interest alongside the balance, which shows the year compounding starts contributing more than your SIP does.",
    ],
  ],
  faqs: [
    [
      "What is the 4% rule?",
      "It is the guideline that you can withdraw 4% of your retirement corpus in the first year and adjust that amount for inflation each year afterwards, with a high chance of the money lasting about 30 years. Inverted, it means a target of 25 times your annual expenses — ₹6 lakh a year of spending implies a ₹1.5 crore corpus.",
    ],
    [
      "How is my FIRE number calculated here?",
      "Annual retirement expenses divided by the safe withdrawal rate you enter. At 4% that is a 25× multiple, at 3.5% it is roughly 28.6×, and at 3% it is 33.3× — the multiple is simply 100 divided by the rate.",
    ],
    [
      "How far ahead does the projection run?",
      "Thirty years, simulated as 360 monthly steps with your SIP added at the start of each month and the monthly rate applied afterwards. If the corpus never reaches the target inside that window the projection reports the 30-year balance instead of a crossing year.",
    ],
    [
      "Does the FIRE number account for inflation?",
      "The target is computed directly from the expense figure you type, so it is expressed in whatever money terms you enter — put in today's spending and you get a today's-money target. If you want a figure in future rupees, inflate your annual expenses first. This is an informational projection based on a single fixed return, not a guarantee; a licensed adviser can model sequence-of-returns risk properly.",
    ],
  ],
};

export default seo;
