const seo = {
  title: "Net Worth Calculator: Assets Minus Liabilities in ₹",
  metaDescription:
    "Add cash, investments, property and vehicles against home loan, car loan and credit card debt for net worth plus both subtotals, in rupees.",
  steps: [
    "Fill the asset fields in ₹ — Cash & Bank Balance, Investments (Stocks, MF, etc.), Property Value, Vehicles & Other Assets and Other Assets.",
    "Enter Home Loan Outstanding, Car Loan Outstanding and Credit Card Debt, then press Calculate.",
    "Read Your Net Worth against the Total Assets, Total Liabilities and Net Worth tiles, all formatted in Indian rupees.",
  ],
  intro:
    "The Net Worth Calculator applies the standard balance-sheet identity — total assets minus total liabilities — across five asset lines (cash and bank balance, investments, property, vehicles and other assets) and four debt lines (home loan, car loan, credit card and other outstanding debt). It returns your net worth alongside the two subtotals, formatted in Indian rupees, so you can see whether a large number in the assets column is actually being cancelled out by what you owe. It is an informational snapshot, not financial advice — talk to a qualified adviser before making decisions based on it.",
  useCases: [
    "You are applying for a home loan and the lender wants a statement of assets and liabilities, so you need the two subtotals written down rather than guessed at.",
    "You paid off a car loan this year and want to see how much of the improvement in your position was real saving versus one debt line disappearing.",
    "You and your partner are merging finances and want one honest total on the table before deciding how much house you can afford.",
  ],
  benefits: [
    [
      "Separates the two subtotals",
      "Shows total assets and total liabilities as their own figures, not just the net result, so you can see which side is moving.",
    ],
    [
      "Splits debt by type",
      "Home loan, car loan and credit card are separate lines, which makes an expensive revolving balance visible instead of buried in one 'debt' number.",
    ],
    [
      "Counts illiquid assets honestly",
      "Property and vehicles sit in their own fields, so you can rerun the calculation without them and see your liquid position.",
    ],
  ],
  faqs: [
    [
      "How do you calculate net worth?",
      "Net worth is total assets minus total liabilities. Here that means cash and bank balances, investments, property value, vehicles and other assets, less your outstanding home loan, car loan, credit card balance and any other debt. Use current market values for assets and current outstanding balances for loans, not the original purchase price or loan amount.",
    ],
    [
      "Should I include my house and my home loan?",
      "Yes, include both — the house at its current market value on the asset side and the outstanding loan balance on the liability side. Leaving out either one distorts the result badly; a house counted without its mortgage can inflate net worth by tens of lakhs.",
    ],
    [
      "Is a negative net worth bad?",
      "Not necessarily, and it is common early on — a recent graduate with an education loan or a new homeowner in the first years of a mortgage will often be negative. What matters is the direction over time; if the figure improves each time you rerun it, the plan is working.",
    ],
    [
      "How often should I recalculate my net worth?",
      "Quarterly is the usual recommendation. Monthly tends to be noise, since market movements swamp your actual saving, while checking only once a year means you miss a trend you could have corrected two quarters earlier.",
    ],
  ],
};

export default seo;
