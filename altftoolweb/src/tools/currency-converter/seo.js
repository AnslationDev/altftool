const seo = {
  title: "Currency Converter — Live Rates for 160+ Currencies",
  h1: "Currency Converter",
  metaDescription:
    "Convert between 160+ currencies using a live USD-base rate table, with 7/30/90-day trend charts, transfer-fee math and bulk conversion. Free, no signup.",
  intro:
    "The Currency Converter fetches a live USD-base rate table from open.er-api.com — around 166 currencies in a single request — and converts every pair as a cross rate: rates[to] ÷ rates[from], then amount × rate. The result is shown to two decimals with the exact rate underneath to six. Rate history is separate: the 7/30/90-day trend chart and the past-date simulator call a same-origin endpoint that proxies Frankfurter's European Central Bank reference rates and caches responses for an hour. The amount you type never leaves your browser — only three-letter currency codes and dates are sent to the history endpoint — and the last rate table is kept in localStorage so conversion still works if the network drops.",
  useCases: [
    "Checking what a foreign price, invoice or hotel rate actually comes to in your own currency",
    "Estimating what lands in a recipient's account after a bank margin and a transfer fee are taken off the converted amount",
    "Converting a whole list of amounts in one pass — paste \"250 USD\", \"80 EUR\", one per line, into the bulk box",
  ],
  benefits: [
    [
      "Real cross-rate math for every pair",
      "Each conversion is computed from one USD-base table as rates[to] ÷ rates[from], so USD→INR and SEK→THB are handled identically. The exact rate is printed to six decimals under the result, and the converted figure to two.",
    ],
    [
      "Fees and bank margin built in",
      "Enter a bank margin percentage and a transfer fee (fixed amount or percentage) and the tool subtracts the margin first, then the fee, showing the net amount you would actually receive instead of the headline rate.",
    ],
    [
      "Rate history over 7, 30 or 90 days",
      "The trend chart marks the period high, low and percent change ((last − first) ÷ first × 100), and a date picker converts your amount at any past day's rate — both drawn from European Central Bank reference rates.",
    ],
    [
      "Your amounts stay on your device",
      "Free, no signup. The rate-table request is a fixed URL with no parameters, the history request carries only two currency codes and a date range, and your recent conversions and pairs are stored in your browser's localStorage.",
    ],
  ],
  faqs: [
    [
      "How accurate is this currency converter?",
      "It gives reference rates, not the rate a bank or card will charge you. The live table comes from open.er-api.com's free USD-base endpoint, which republishes on the provider's own cadence (roughly once a day) rather than tick by tick, and every pair is derived from it by dividing the two USD rates. Retail providers typically add a margin on top, which is what the Fees & Real Amount panel is for.",
    ],
    [
      "Does this converter use real-time exchange rates?",
      "It uses the latest published rates, refreshed when the page loads — not a per-second market feed. The \"Last updated\" line under the result shows when your browser last fetched the table; reload the page to pull a fresh one. If the request fails, the tool falls back to the copy cached in localStorage so conversion keeps working offline.",
    ],
    [
      "What rate will my bank actually give me for a transfer?",
      "Almost always worse than the reference rate shown here, because providers add a margin and a fee. The Fees & Real Amount calculator lets you model that: enter your provider's margin as a percentage and the transfer fee as either a fixed amount in the target currency or a percentage. It subtracts the margin from the converted amount first, then the fee, and shows what remains.",
    ],
    [
      "Why is the rate trend chart empty for my currency pair?",
      "Because history covers fewer currencies than conversion. The chart and the past-date simulator use European Central Bank reference rates via Frankfurter, which publishes 30 currencies (USD, EUR, GBP, INR, JPY, CNY, AUD, CAD, CHF, SGD and 20 more) and only on trading days — so weekends and holidays have no data points. Live conversion still works for every currency in the table.",
    ],
    [
      "How many currencies can I convert between?",
      "About 166 — the dropdown is built from whatever the live rate table returns, and each entry is searchable by code or full name, so typing \"rupee\", \"INR\" or \"dirham\" narrows the list. Rate history is the narrower set of 30 ECB-published currencies.",
    ],
    [
      "Can I convert a list of amounts at once?",
      "Yes. The bulk box takes one entry per line in the format amount then currency code — for example \"250 USD\" on one line, \"80 EUR\" on the next — and converts every line into the currently selected target currency. Lines that don't parse as a number plus a supported code are skipped.",
    ],
    [
      "Is anything I type uploaded or stored?",
      "No. The amount is converted locally in your browser using the downloaded rate table; the rate-table request is a fixed URL carrying no parameters, and the history request sends only the two three-letter currency codes and a date range. Your last 10 conversions, last 5 currency pairs and any rate alert are saved in your own browser's localStorage, not on a server.",
    ],
    [
      "Can I set an exchange rate alert?",
      "Yes, but only while the page stays open. Enter a target value and the tool checks the current rate every 5 seconds, popping a browser alert when the rate reaches or exceeds it. It's an on-page reminder — there are no emails or push notifications, and it triggers on upward moves only, so it won't fire if the rate falls below your target.",
    ],
  ],
  steps: [
    "Type an amount, then pick the From and To currencies — the dropdown searches by code or full currency name, and the swap button reverses the pair.",
    "The converted total appears about 300 ms after you stop typing, with the exact cross rate shown to six decimals beneath it.",
    "Optionally add a bank margin and transfer fee to see the net amount received, or switch the trend chart to 7, 30 or 90 days for rate history.",
  ],
};

export default seo;
