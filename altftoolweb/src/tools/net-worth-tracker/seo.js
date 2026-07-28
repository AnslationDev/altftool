const seo = {
  title: "Net Worth Tracker — Free Assets & Debt Projection",
  h1: "Net Worth Tracker with Monthly Projection",
  metaDescription:
    "Free net worth tracker: enter assets and liabilities, set growth and interest rates, and project month by month up to 40 years. CSV export included.",
  intro:
    "The Net Worth Tracker subtracts total liabilities from total assets, then runs a month-by-month simulation of both sides of the balance sheet. Each asset compounds at its own annual growth rate, converted to a monthly rate with (1 + growth/100)^(1/12) − 1, and your monthly contribution is split across assets in proportion to their current value; each debt accrues rate/12 per month and is reduced by an equal share of your monthly debt payment until the balance floors at zero. Everything runs as React state in your browser — no account, no server call, no upload — with the projection charted using Recharts and downloadable as CSV. Amounts are formatted in Indian rupees via Intl.NumberFormat(\"en-IN\") with no decimal places.",
  useCases: [
    "Get one current net worth figure by listing bank balances, mutual funds, stocks, home equity and gold against home loans, personal loans and credit card balances.",
    "See what a fixed monthly investment alongside a fixed monthly EMI does to the gap between assets and debt over 1 to 40 years.",
    "Export the month-by-month assets, liabilities and net worth table as CSV to keep a record or rebuild the chart in a spreadsheet.",
  ],
  benefits: [
    [
      "Per-asset growth, not one blended rate",
      "Every asset row carries its own annual growth percentage, accepted from −50% to 100%, so cash at 3% and index funds at 12% compound separately instead of collapsing into a single average return.",
    ],
    [
      "Debt is modelled with interest, not just subtracted",
      "Each liability has its own annual rate (0–99%), grows by rate/12 every month, and is paid down by an equal share of your monthly debt payment until it reaches zero — so a 36% card and an 8.5% home loan behave differently.",
    ],
    [
      "Nothing leaves your browser",
      "All figures live in the page's React state. There is no signup, no backend request and no upload of your numbers. The trade-off: nothing is stored either, so use Copy Summary or Export CSV before closing the tab.",
    ],
    [
      "Ratios alongside the headline number",
      "Debt ratio (liabilities ÷ assets × 100) and liquidity cover (your first asset categorised as Liquid ÷ liabilities × 100) are recalculated with every keystroke, so you see composition, not just the total.",
    ],
  ],
  faqs: [
    [
      "How do you calculate net worth?",
      "Net worth is total assets minus total liabilities. This tool sums every asset row and every liability row you enter and shows the difference. It opens with a sample portfolio — ₹39,30,000 in assets across cash, mutual funds, stocks, home equity and gold, against ₹14,75,000 of home loan, personal loan and credit card debt — which you can edit, delete or reset at any time.",
    ],
    [
      "Does this net worth tracker save my data?",
      "No. Nothing is saved anywhere — your figures live only in the page's React state, so a refresh or a closed tab resets everything to the default portfolio. There is no account, no database and no local storage. Click Copy Summary for a ten-line text block, or Export CSV, before you leave the page.",
    ],
    [
      "How does the net worth projection work?",
      "It steps forward one month at a time for the number of years you choose (1 to 40, so up to 480 months). Each month, every asset grows by its annual rate converted to a monthly equivalent — (1 + growth/100)^(1/12) − 1 — and receives a share of your monthly asset addition proportional to its current value. Each liability grows by rate/12 and loses an equal share of your monthly debt payment, stopping at zero.",
    ],
    [
      "What currency does the net worth tracker use?",
      "Indian rupees. Values are formatted with Intl.NumberFormat(\"en-IN\") in INR with no decimals, so large numbers use lakh-and-crore grouping like ₹12,50,000. There is no currency selector, but the arithmetic is currency-agnostic — the same growth and interest maths applies if you read the ₹ symbol as your own currency.",
    ],
    [
      "Is this net worth tracker free and does it need a login?",
      "Yes, it is free, and the tool itself asks for no account, no email and no payment details. The whole calculator is a client-side React component: it makes no network requests with your figures and loads no third-party tracker of what you type.",
    ],
    [
      "What can I enter as an asset or a liability?",
      "Each asset takes a name, a value, an annual growth percentage and a free-text category; each liability takes a name, a balance, an annual interest rate and a category. Values are capped at 1,000,000,000 per row, asset growth at −50% to 100%, liability rates at 0–99%, and the monthly addition and monthly debt payment at ₹2,50,000 each. Categories are grouped by exact text, so typing \"Investments\" on two rows merges them in the breakdown chart.",
    ],
    [
      "Can I export my net worth data to Excel or Google Sheets?",
      "Yes. Export CSV downloads net-worth-tracker.csv with one row per projected month and four columns — Month, Assets, Liabilities, Net Worth — so a 10-year projection produces 121 rows including month 0. The file is generated in the browser with a Blob and opens directly in Excel, Numbers or Google Sheets.",
    ],
    [
      "How accurate is a net worth projection?",
      "It is arithmetic on the assumptions you type, not a forecast. The model holds every growth rate and interest rate constant for the entire period, assumes your monthly addition and debt payment never change, and ignores tax, inflation, and anything bought or sold outside those two numbers. Vary the growth rates and re-read the chart to see how sensitive the result is. This is a calculator, not financial advice.",
    ],
  ],
  steps: [
    "Edit the asset rows — name, value, annual growth % and category — and add anything missing by typing a name and clicking Add Asset. Load Sample fills in a larger example portfolio; Reset restores the defaults.",
    "Do the same for liabilities, giving each debt its outstanding balance and annual interest rate, then set your monthly asset addition, monthly debt payment (up to ₹2,50,000 each) and projection length from 1 to 40 years.",
    "Read the current net worth, projected net worth, debt ratio and liquidity cover cards along with the area and category charts, then click Copy Summary or Export CSV — nothing is stored once you leave the page.",
  ],
};

export default seo;
