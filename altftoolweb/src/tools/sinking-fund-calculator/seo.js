const seo = {
  title: "Sinking Fund Calculator – Monthly Reserve Planner",
  metaDescription:
    "List irregular bills with amount, months until due and money already saved — get each fund's catch-up and steady-state monthly deposit in one number.",
  steps: [
    "Add each irregular bill with its Expense name, 'How often it repeats' (One-off up to Every 5 years), Amount due (₹), Months until due and Already reserved (₹) — press 'Add an expense' for more rows.",
    "Enter your Monthly take-home income (₹) and optionally a 'Return on the reserve (% per year)'; the calculator warns when the combined reserves cross 25% of take-home.",
    "Read 'Set aside each month' — the catch-up rate until approaching bills are funded — beside the smaller steady-state figure, review the 'Every fund, soonest first' table, then press Copy plan.",
  ],
  intro:
    "A sinking fund converts a lumpy bill you can see coming — an insurance renewal, a school term, a service, a holiday — into a level monthly reserve. This calculator returns two separate figures for each expense: the catch-up deposit, which is the sinking-fund annuity payment that closes the gap before the next due date, and the steady-state deposit, which is the amount per month once you have a full cycle to rebuild the fund. Confusing the two is why budgets break in renewal month.",
  useCases: [
    "Four irregular bills land at different points in the year and you want one monthly transfer that covers all of them.",
    "An insurance renewal is four months away with only part of the premium set aside, and you need the catch-up amount.",
    "Checking whether your known irregular expenses are already eating more than a quarter of take-home pay.",
  ],
  benefits: [
    ["Catch-up separated from steady state", "The bill due in four months needs a much bigger monthly deposit than its annual cost implies."],
    ["Everything in one monthly number", "Several funds are summed into a single transfer you can automate."],
    ["Protects the emergency fund", "Known bills stop being emergencies, so the contingency fund stays intact for real ones."],
  ],
  faqs: [
    [
      "How do I calculate a sinking fund amount?",
      "Divide what you still need by the number of months until the due date. For an ₹18,000 insurance renewal four months away with ₹3,000 already set aside, the shortfall is ₹15,000 and the monthly deposit is ₹3,750. Once that bill is paid, the ongoing cost is only ₹1,500 a month because you then have twelve months to rebuild it.",
    ],
    [
      "What is the difference between a sinking fund and an emergency fund?",
      "A sinking fund is for expenses you already know about — dates and amounts are predictable, so you save toward them deliberately. An emergency fund covers what you cannot predict, such as a job loss or a hospitalisation, and should not be drained by a bill you could see coming.",
    ],
    [
      "What expenses should have a sinking fund?",
      "Anything large that arrives less often than monthly: insurance premiums, school and college fees, vehicle servicing and tyres, annual subscriptions, property tax and society maintenance, festival spending, travel, and appliance replacement. If it has broken your budget once, it needs a fund.",
    ],
    [
      "Where should sinking fund money be kept?",
      "Somewhere separate from your spending account but reachable on the due date without a penalty — a second savings account, a sweep-in deposit, or a recurring deposit that matures before the bill. Avoid equity for money you will spend within a year or two. Informational only, not financial advice.",
    ],
  ],
};

export default seo;
