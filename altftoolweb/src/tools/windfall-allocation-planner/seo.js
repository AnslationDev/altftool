const seo = {
  title: "Windfall Planner: Tax, Emergency Fund, Debt, Then Split",
  metaDescription:
    "Runs a bonus, inheritance or sale proceeds through a waterfall — tax, emergency cover, then debt in avalanche order — to what is genuinely free.",
  steps: [
    "Enter Windfall amount, before tax (INR) and Marginal tax rate on it (%) — set 0 for money already taxed, such as an inheritance — then Monthly essential expenses (INR), Emergency fund you already hold (INR) and Months of cover to target.",
    "Under Debts you owe press Add debt and give each row an Outstanding balance (INR) and an Interest rate (% a year), or tap a preset chip, then set Clear debt above this rate (% a year), which starts at 10.",
    "Read the headline Free to invest, allocate or spend and the numbered waterfall from 1 · Tax set aside through 3 · High-interest debt cleared to 4 · Guilt-free spending, check the Payoff order (highest rate first) table, then press Copy result.",
  ],
  intro:
    "A windfall allocation planner runs a lump sum — an annual bonus, an inheritance, ESOP or property sale proceeds, salary arrears — through a priority waterfall instead of an arbitrary percentage split: tax set-aside first, then an emergency fund topped up to a chosen number of months of essential expenses, then high-interest debt cleared in avalanche order (highest interest rate first, which minimises total interest paid), and only the survivor is divided between investing, a named goal and guilt-free spending. It is built for anyone who has just received more money at once than a normal month brings and does not want it absorbed by lifestyle before a decision is made. Because paying off a loan is a risk-free, tax-free return equal to its interest rate, the planner uses an editable rate cut-off to decide which debts get cleared ahead of any investment.",
  useCases: [
    "Deciding what to do with a March performance bonus once TDS at the marginal slab rate is set aside",
    "Allocating an inheritance when a credit card revolve at 42% a year is running alongside a home loan at 8.5%",
    "Splitting property or ESOP sale proceeds between rebuilding six months of emergency cover and investing the rest",
  ],
  benefits: [
    ["Order, not just percentages", "Tax, emergency cover and expensive debt are settled before any split is applied."],
    ["Avalanche payoff", "Debts are cleared highest rate first, the order that minimises total interest paid."],
    ["Shows what is truly free", "One headline figure for the money left after every obligation is met."],
  ],
  faqs: [
    [
      "How should I split a bonus between debt, savings and spending?",
      "Work in order rather than in percentages: set aside tax at your marginal rate, top the emergency fund up to three to six months of essential expenses, clear any debt costing more than roughly 10% a year, and only then split what is left. A credit card at 36-48% a year is the single highest-return use of the money and should always come before investing.",
    ],
    [
      "Is a performance bonus taxed differently from salary in India?",
      "No. A bonus, incentive or ex-gratia payment is salary income under the Income-tax Act and is taxed at your applicable slab rate, with the employer deducting TDS in the month it is paid. That deduction often looks larger than expected because the bonus pushes that month's annualised income into a higher slab; the excess is adjusted across the remaining months or refunded when you file.",
    ],
    [
      "Is an inheritance taxable in India?",
      "India abolished estate duty in 1985 and has no inheritance tax, so money or property received under a will or by succession is not taxed as income in the recipient's hands. Income the inherited asset later generates — rent, interest, dividends — is taxable, and capital gains apply when you sell, with the previous owner's holding period and cost counted as yours. Set the tax rate to 0 for an inheritance and consult a chartered accountant on the asset's cost basis.",
    ],
    [
      "Should I pay off my home loan with a windfall or invest instead?",
      "It depends on the rate. A home loan at 8-9% a year, with interest deductible under section 24(b) and the effective cost lower still, sits below the cut-off most planners use, so it usually loses to investing over a long horizon. An unsecured personal loan at 15% or a card revolve at 40% is a different question entirely — clearing those is a guaranteed return no investment reliably matches.",
    ],
  ],
};

export default seo;
