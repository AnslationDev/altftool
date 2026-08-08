const seo = {
  title: "Kirana Shop Tax Calculator: 44AD, GST and Net Profit",
  metaDescription:
    "Build the trading account from stock and purchases, then compare tax on real profit with section 44AD at 6% digital and 8% cash receipts.",
  steps: [
    "Fill the Trading account block: Annual sales (turnover), Opening stock, Purchases during the year, Closing stock and 'Collected by UPI / card / bank (%)'.",
    "Enter the Running costs lines, pick an Age category, add Section 80C and Section 80D, then tick 'Declare under section 44AD' or 'GST composition scheme' to price each route.",
    "Read Income tax payable with the cheaper regime named, the Cost of goods sold to Net profit rows and the 44AD presumptive figure, plus Compliance flags for GST registration, books and audit; press Copy result.",
  ],
  intro:
    "A kirana shop's taxable profit starts with the trading account — cost of goods sold is opening stock plus purchases minus closing stock, gross profit is sales minus that, and net profit is what survives rent, wages, electricity and delivery costs. This calculator builds that account, then computes income tax under both FY 2025-26 regimes and puts it beside the section 44AD presumptive figure of 6% on digital receipts and 8% on cash receipts, so a shopkeeper can see which basis costs less. GST registration, composition-scheme eligibility, books of account and audit thresholds are flagged from the same turnover figure.",
  useCases: [
    "A grocery shop doing 60 lakh a year wants to know whether declaring 44AD presumptive income beats filing on real profit.",
    "A shopkeeper is deciding between the regular GST scheme and the 1% composition levy and needs the rupee cost of each.",
    "A family store is preparing its first ITR and needs gross margin, net margin and the advance-tax position in one place.",
  ],
  benefits: [
    ["Real trading account", "Stock movement is handled properly, so gross margin reflects what actually sold rather than what was bought."],
    ["44AD vs actuals, side by side", "Both the presumptive income and the real profit are taxed under both regimes so the cheaper route is obvious."],
    ["Thresholds checked, not guessed", "40 lakh for GST on goods, 1.5 crore for composition, 25 lakh for books and 1 crore for audit are applied to your turnover."],
  ],
  faqs: [
    [
      "What is the tax rate for a kirana shop in India?",
      "There is no separate rate — a proprietor's shop profit is added to personal income and taxed at slab rates. Under the FY 2025-26 new regime the first 4 lakh is nil, then 5% to 8 lakh, 10% to 12 lakh, 15% to 16 lakh, 20% to 20 lakh, 25% to 24 lakh and 30% above, with a section 87A rebate of up to 60,000 that makes total income up to 12 lakh tax-free.",
    ],
    [
      "How much profit does a kirana store declare under 44AD?",
      "At least 6% of turnover collected through banking or electronic modes and 8% of cash turnover. On 60 lakh of sales with 30% digital collection that is 1,08,000 plus 3,36,000, or 4,44,000. You can declare more, but declaring less requires books under section 44AA and an audit under section 44AB(e).",
    ],
    [
      "When does a grocery shop need GST registration?",
      "Once aggregate turnover crosses 40 lakh for a shop supplying only goods — 20 lakh in the special category states. Many kirana items such as unbranded and unpackaged food grains are exempt or nil-rated, so check which of your sales count towards the taxable supply before you register.",
    ],
    [
      "Is the 1% GST composition scheme worth it for a shop?",
      "It costs 1% of turnover (0.5% CGST plus 0.5% SGST) with a quarterly payment and a single annual return, which is far simpler than monthly filing. The trade-off is real: you cannot collect GST from customers, cannot claim input tax credit on your purchases, and cannot make inter-state outward supplies. Turnover must stay within 1.5 crore. Discuss the switch with a GST practitioner before opting in.",
    ],
  ],
};

export default seo;
