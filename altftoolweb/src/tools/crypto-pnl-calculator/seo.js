const seo = {
  title: "Crypto P&L Calculator — Profit After Fees and Tax",
  h1: "Crypto P&L Calculator",
  metaDescription:
    "Work out net crypto profit or loss from buy price, sell price, quantity, exchange fees, slippage and tax — with break-even price, ROI and a CSV export.",
  intro:
    "The Crypto P&L Calculator works out what a single spot trade actually returns once costs are taken out. Your buy fee is added to the entry, the sell fee and slippage are subtracted from the exit, flat network and extra charges come off on top, and your tax rate is applied to whatever profit is left — so net P&L is exit value minus the total capital deployed, and ROI is that figure over entry cost plus fees. The break-even sell price is solved directly rather than searched for: total capital ÷ (quantity × (1 − sell fee % − slippage %)). The same arithmetic is then re-run across a ladder of sell prices from 70% of your buy price upward and plotted as a Recharts bar curve. Every number is computed in a React useMemo inside your browser tab — the tool makes no network requests, fetches no live prices, and stores nothing.",
  useCases: [
    "Seeing what a 0.08 BTC trade bought at ₹52,00,000 and sold at ₹61,00,000 is really worth after a 0.2% buy fee, a 0.2% sell fee, 0.15% slippage, a ₹450 network fee and a 30% tax rate",
    "Finding the exact exit price at which a position stops losing money once the entry fee, exit fee and slippage are all counted against it",
    "Understanding why a 17.31% move in price does not become a 17.31% return — the sample trade lands at 11.53% ROI on capital deployed",
  ],
  benefits: [
    [
      "Entry and exit costs modelled separately",
      "The buy fee loads the entry, the sell fee and slippage come off the exit, and the network fee plus extra charges are deducted as flat amounts — so trading costs and the price move are never blended into one figure.",
    ],
    [
      "Break-even price, solved not guessed",
      "Break-even sell price is total capital ÷ (quantity × (1 − sell fee % − slippage %)), and the risk buffer beside it is simply your sell price minus that number, showing how much room the trade has before it goes underwater.",
    ],
    [
      "A profit curve across exit prices",
      "The full calculation is repeated over roughly a dozen sell prices spanning 70% to 140% of your buy price, drawn as green and red bars against a zero line, with up to nine of those outcomes also listed as cards.",
    ],
    [
      "Runs in your browser, free",
      "Nothing is uploaded: there is no network request, no account and no signup, and the CSV and clipboard summary are both generated locally from the numbers already on screen.",
    ],
  ],
  faqs: [
    [
      "How do you calculate profit and loss on a crypto trade?",
      "Net P&L = exit value − total capital − tax. Exit value is (sell price × quantity) minus the sell fee and slippage; total capital is (buy price × quantity) plus the buy fee, network fee and extra charges. On the sample trade — 0.08 BTC from ₹52,00,000 to ₹61,00,000 with 0.2% fees each side, 0.15% slippage and ₹700 in flat costs — that is ₹68,760 before tax, ₹20,628 tax at 30%, and ₹48,132 net.",
    ],
    [
      "How do I find my break-even price in crypto?",
      "Divide the total capital you put in by the quantity you hold, adjusted for the costs of getting out: total capital ÷ (quantity × (1 − sell fee % − slippage %)). For the sample trade that is ₹52,37,481 — above the ₹52,00,000 entry, because the exit fee and slippage still have to be covered. The tool shows it as Break-even Sell alongside the buffer between it and your current sell price.",
    ],
    [
      "Does this calculator use live crypto prices?",
      "No. You type both the buy price and the sell price yourself. The asset dropdown — BTC, ETH, SOL, BNB, XRP, DOGE, ADA and MATIC — only labels the quantity and the summary; it does not connect to an exchange, call a price API, or read a wallet.",
    ],
    [
      "What currency does the crypto P&L calculator use?",
      "Indian rupees. All amounts are formatted with Intl.NumberFormat in en-IN with INR, so figures appear in lakh grouping with a ₹ symbol, and there is no currency switcher. The arithmetic itself is unit-agnostic — enter dollars consistently across every field and the profit, ROI and break-even figures are still correct, just labelled with a ₹.",
    ],
    [
      "How is tax applied to the profit here?",
      "The tax rate is applied only after every cost, and only to a positive result: tax = max(0, profit before tax × rate). A losing trade therefore shows zero tax rather than a negative one. The field defaults to 30% and accepts anything from 0 to 100. This is an arithmetic estimate for the numbers you enter, not tax advice or a filing calculation.",
    ],
    [
      "Does it handle leverage, futures or multiple buys?",
      "No — it models one spot entry and one spot exit at a single price each. There is no averaging across multiple lots, no leverage or margin, no funding rates, and no holding-period logic. Slippage is charged on the exit only (sell price × quantity × slippage %), so entry slippage has to be folded into the buy price you type.",
    ],
    [
      "Can I export or share the results?",
      "Yes, both offline. Copy Summary puts a twelve-line plain-text block on your clipboard — asset, prices, quantity, gross values, total fees, tax, net P&L, ROI and break-even. Export CSV downloads crypto-pnl-summary.csv, which carries the trade header plus a three-column scenario table: Scenario Sell Price, Net P&L Before Tax, Net P&L After Tax.",
    ],
    [
      "Is the crypto P&L calculator free?",
      "Yes — free, with no signup, no account and no cap on how many trades you run. Every figure, chart, clipboard summary and CSV is produced by JavaScript in your own tab, so there is no backend to meter and no trade data leaves your device or gets saved.",
    ],
  ],
  steps: [
    "Pick the asset label, then enter your buy price, sell price and quantity — quantity steps in units of 0.000001, so fractional positions are fine.",
    "Set the cost assumptions: buy fee %, sell fee %, slippage %, tax rate %, plus the flat network fee and extra charges, and a target ROI. Load Sample or Simple Trade fills in a working set if you want to see the shape first.",
    "Read Net P&L, ROI and break-even sell price at the top, scan the scenario curve for where the bars turn from red to green, then Copy Summary or Export CSV.",
  ],
};

export default seo;
