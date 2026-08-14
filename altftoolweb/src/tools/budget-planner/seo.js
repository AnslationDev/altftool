const seo = {
  title: "Monthly Budget Planner: Surplus, Deficit, Savings",
  metaDescription:
    "Enter one month's income and seven spending categories to see total expenses, a labelled Monthly Surplus or Deficit, and your savings rate.",
  steps: [
    "Enter Monthly Income in rupees, then Housing (Rent/Mortgage), Food & Groceries, Transportation, Utilities, Insurance, Entertainment and Savings & Investments.",
    "Press Calculate, which adds the seven category amounts into Total Monthly Expenses and subtracts them from your income.",
    "Read the headline labelled Monthly Surplus or Monthly Deficit, and check the Savings Rate tile for the share of income left over.",
  ],
  intro:
    "The Budget Planner adds up a month of spending across fixed categories — housing, food, transport, utilities, insurance, entertainment and money set aside for savings — subtracts the total from your monthly income, and tells you whether you finished the month in surplus or deficit. It also reports total expenses and the leftover as a percentage of income, so you can measure your budget against a rule like 50/30/20 instead of guessing. Everything is entered as monthly rupee amounts, so the result reflects one real month rather than an annualised projection.",
  useCases: [
    "Your salary lands on the 1st and is gone by the 25th, and you want to see on paper which category is actually consuming it.",
    "You have been offered a flat at a higher rent and need to know whether the increase pushes your month from surplus into deficit before you sign.",
    "You want to check your current split against the 50/30/20 rule to see whether the savings line is really 20 percent of income or closer to 8.",
  ],
  benefits: [
    ["Treats savings as a line, not a leftover", "Savings sits in the budget alongside rent and food, so it is planned before spending rather than whatever survives the month."],
    ["Names the outcome plainly", "The headline figure is labelled Monthly Surplus or Monthly Deficit, so an overspent month is never disguised as a small positive number."],
    ["Shows leftover as a percentage of income", "The same ₹6,000 gap means something very different on ₹30,000 and ₹1,20,000 of income, so the ratio is reported alongside the amount."],
  ],
  faqs: [
    [
      "What is the 50/30/20 budget rule?",
      "Put 50 percent of take-home pay toward needs, 30 percent toward wants, and 20 percent toward savings and debt repayment. On ₹60,000 a month that is ₹30,000 for rent, food, transport and utilities; ₹18,000 for discretionary spending; and ₹12,000 into savings.",
    ],
    [
      "How much of my income should go on rent?",
      "A common guideline is no more than 30 percent of take-home pay, which is ₹18,000 on a ₹60,000 monthly income. In expensive metros people often exceed it, and the trade-off usually shows up as a squeezed savings line rather than reduced food or transport.",
    ],
    [
      "Why does my budget show a deficit when my bank balance is fine?",
      "Because the planner counts money moved into savings and investments as an outflow, so a month that funds ₹10,000 of SIPs can show a deficit even though nothing was overspent. Compare the deficit against your savings line before assuming you are living beyond your means.",
    ],
    [
      "How often should I redo my monthly budget?",
      "Re-enter the numbers monthly for the first three months to get real category averages, then quarterly once they settle, and again whenever rent, income or a loan EMI changes. Estimates drift fastest in food and transport, which is where most budgets break.",
    ],
  ],
};

export default seo;
