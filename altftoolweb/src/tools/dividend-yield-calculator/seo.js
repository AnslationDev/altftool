const seo = {
  title: "Dividend Yield Calculator: Tax & Target Income",
  metaDescription:
    "Annual dividend over share price gives the yield, then after-tax income per payout, the capital a target income needs, and growth compounded to 60 years.",
  steps: [
    "In the Dividend Inputs card enter Share Price, Annual Dividend / Share, Shares Owned and Target Annual Income.",
    "Set Tax Rate, Dividend Growth, Share Price Growth, Projection Years (1-60) and Payout Frequency — Annual, Half Yearly, Quarterly or Monthly.",
    "Read Dividend Yield, Net Annual Income, Capital For Target and Payback Estimate, then press Export CSV to download dividend-yield-plan.csv.",
  ],
  intro:
    "The Dividend Yield Calculator divides the annual dividend per share by the current share price to give the yield percentage, then uses your share count, tax rate and payout frequency to project gross income, after-tax income and the per-payout cheque. It also compounds dividend growth and price growth year by year for up to 60 years, and works backwards from a target annual income to the number of shares and the capital you would need. It is an informational modelling tool for income investors, not investment advice.",
  useCases: [
    "A share is quoted at 2,450 with a 92 annual dividend and you want to confirm the yield is 3.76% before comparing it with another holding.",
    "You want 1,20,000 a year in dividend income after a 10% tax deduction and need to know how many shares — and how much capital — that target actually requires at today's payout.",
    "A company pays quarterly, and you want to see what each of the four payouts looks like net of tax, and what that averages to per month.",
  ],
  benefits: [
    [
      "Tax-adjusted, not just gross",
      "Applies your dividend tax rate to every figure, so the income you see is what lands in the account rather than the headline payout.",
    ],
    [
      "Works backwards from a target",
      "Enter the annual income you want and it returns the share count and capital needed, instead of making you guess at position sizes.",
    ],
    [
      "Growth modelled on both sides",
      "Dividend growth and share-price growth compound separately each year, so the projected yield can rise or fall the way it does in reality.",
    ],
  ],
  faqs: [
    [
      "How is dividend yield calculated?",
      "Divide the annual dividend per share by the current share price and multiply by 100. A share priced at 2,450 paying 92 a year yields 92 ÷ 2,450 × 100 = 3.76%. Because the price is the denominator, the yield rises when the price falls even if the payout has not changed.",
    ],
    [
      "How much do I need to invest for a set dividend income?",
      "Divide your target income by the after-tax dividend per share to get the share count, then multiply by the share price. At a 3.76% yield and a 10% tax rate, roughly 29.6 lakh of capital supports about 1 lakh of net annual income — the calculator does this arithmetic for any target you enter.",
    ],
    [
      "Does the calculator account for dividend tax?",
      "Yes. You set a tax rate from 0% up to 80%, and it is deducted from gross dividend income to produce the net annual figure, the net per-payout amount and the monthly equivalent. Actual dividend taxation varies by country and by your income slab, so treat the result as a model and check your own rate with a tax professional.",
    ],
    [
      "What does the payback period figure mean?",
      "It is the investment value divided by the gross annual dividend — the number of years of dividends alone needed to return your capital, ignoring price movement. A 3.76% yield gives a payback of about 26.6 years, which shortens if the dividend grows.",
    ],
  ],
};

export default seo;
