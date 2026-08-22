const seo = {
  title: "Digital Wallet Manager: Totals & HHI Score",
  metaDescription:
    "Total cash, crypto, funds, stocks and gold, see each holding's share, and score concentration on the HHI scale — no login, no API keys, nothing sent.",
  steps: [
    "For each row enter a Holding name, choose an Asset class, and type Quantity / units and Price per unit (₹); press Add holding for anything kept on another app, bank or exchange.",
    "Each row shows its own Value as you type, and Target share for the largest holding (%) — 25 by default — turns into a Sell about figure in rupees.",
    "Read Wallet value, Concentration (HHI), Effective holdings, Largest holding and Smallest holding, plus the Allocation tables of value and share by holding and by asset class; Copy result copies that summary as text.",
  ],
  intro:
    "The Digital Wallet Manager totals every asset you hold — cash, crypto, funds, stocks, gold — and reports what share of the wallet each one carries, using value = quantity x unit price and share = value / total. It then scores how concentrated the wallet is with the Herfindahl-Hirschman Index, the sum of squared percentage shares defined in the US DOJ/FTC Horizontal Merger Guidelines, so you can see at a glance whether one position is quietly running your whole portfolio. It is built for anyone who keeps assets across several apps and exchanges and has never seen them added up in one place; every figure is typed in by you and never leaves the browser tab.",
  useCases: [
    "Add a savings balance, a Nifty index fund, some bitcoin and a gold bond in one list to see the real total and each one's share.",
    "Check whether a single crypto position has drifted past 40% of your wallet after a run-up.",
    "Work out how much of the largest holding to sell to bring it back down to a 25% target share.",
  ],
  benefits: [
    ["One total across apps", "Adds holdings from any exchange, bank or broker into a single value with per-asset shares."],
    ["Concentration, not just totals", "Scores the wallet on the HHI scale and converts it into an effective number of holdings."],
    ["Nothing is transmitted", "All arithmetic runs in the browser; no keys, no logins, no server, no stored balances."],
  ],
  faqs: [
    [
      "How do I calculate the total value of a crypto and stock wallet together?",
      "Multiply each holding's quantity by its current unit price, then add the results. 0.08 BTC at Rs 58,00,000 is Rs 4,64,000, and 40 gold bonds at Rs 7,200 is Rs 2,88,000, so those two together are Rs 7,52,000. Convert everything to one currency first, otherwise the total is meaningless.",
    ],
    [
      "What is a good concentration score for a personal portfolio?",
      "Below 1500 on the HHI scale counts as well spread, 1500 to 2500 as moderately concentrated and above 2500 as highly concentrated — the same cut-offs the DOJ and FTC use for markets. Four equally sized holdings score exactly 2500; ten equal holdings score 1000.",
    ],
    [
      "What does 'effective number of holdings' mean?",
      "It is 10,000 divided by the HHI, and it tells you how many equally sized positions would produce the same concentration. A wallet of 70/10/10/10 scores 5200, so its effective number of holdings is 1.92 — it behaves almost like a single-asset wallet despite having four entries.",
    ],
    [
      "Does this tool connect to my exchange or bank account?",
      "No. There is no login, no API key field and no network request — you type in quantities and prices, and the arithmetic runs in your browser. Refreshing the page clears the wallet, so keep your own copy of the numbers.",
    ],
  ],
};

export default seo;
