const seo = {
  title: "Monthly Budget Planner: Savings Rate & Needs",
  metaDescription:
    "Set four income lines against your expense categories to see savings rate, needs vs wants, a daily spend limit, and export the plan as CSV.",
  steps: [
    "Enter Salary, Freelance / Side Income, Investment Income and Other Income under Income Sources, then set Target Monthly Savings.",
    "Adjust the eight default Expense Categories — Rent / Home, Food & Groceries, EMI / Debt and the rest — or type a name in New category and press Add Category.",
    "Read the Monthly Savings card with its savings rate, the Goal Gap card and the Daily Spend Limit figure, then use Copy Summary or Export CSV to download monthly-budget-planner.csv.",
  ],
  intro:
    "The Monthly Budget Planner adds up four income streams — salary, freelance, investment and other — against your expense categories, then reports what is left as a savings rate (savings ÷ total income × 100) and splits your spending into needs and wants as a share of income. Each category is charted by its percentage of total expenses, so the one quietly eating the month is obvious at a glance. It is built for someone sitting down with a payslip and a bank statement who wants a single page showing whether the month actually balances and how far the plan is from a savings target.",
  useCases: [
    "Your salary went up and you want to see whether the extra money is reaching savings or being absorbed by rent, EMI and grocery increases.",
    "You have set yourself a savings target for the month and need to know the daily spending limit that leaves it intact, rather than discovering the shortfall on the 28th.",
    "Two people are splitting household costs and want a printed breakdown of what each category costs as a percentage before agreeing on where to cut.",
  ],
  benefits: [
    ["Needs and wants kept separate", "Every category is tagged, so the plan reports needs and wants as separate shares of income instead of a single undifferentiated expense total."],
    ["A daily figure, not just a monthly one", "The plan converts what is left after your savings goal into a per-day spending limit over a 30-day month, which is the number you can actually act on."],
    ["Categories you control", "Add your own expense lines beyond the eight defaults, and every share, chart slice and status band recalculates immediately."],
  ],
  faqs: [
    [
      "What is a good monthly savings rate?",
      "This planner treats 20 percent of income as on track and 30 percent or more as excellent; between 10 and 20 percent it flags the budget for review, and below 10 percent it warns that the buffer is thin. The 20 percent mark comes from the 50/30/20 guideline — roughly half of income to needs, 30 percent to wants and 20 percent to savings.",
    ],
    [
      "How is the savings rate calculated?",
      "Savings are total income minus total expenses, and the rate is that figure divided by total income, expressed as a percentage. If expenses exceed income the balance goes negative and the plan is marked Over Budget regardless of the rate.",
    ],
    [
      "What does the daily spend limit mean?",
      "It is what you can spend per day while still hitting your savings goal, calculated over a 30-day month. When your savings already cover the goal it is (total income − savings goal) ÷ 30; when they fall short it drops to your actual savings ÷ 30, so the limit tightens automatically.",
    ],
    [
      "Can I keep the breakdown after I close the page?",
      "Yes — export the whole plan as a CSV with every income source, every expense category, its rupee amount and its share of total expenses, or copy a plain-text summary with the totals, savings rate, goal gap and largest expense. Nothing is stored on a server, so the export is the copy you keep.",
    ],
  ],
};

export default seo;
