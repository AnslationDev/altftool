const seo = {
  intro:
    "Crypto Price Alarm pulls the current spot price for any coin by its CoinGecko asset ID and reports the price, the 24-hour change as a percentage, and the exact timestamp the source last updated that figure. It is for anyone watching a target level on an asset and wanting a clean, on-demand reading rather than a chart-heavy exchange page. Enter an ID such as `bitcoin` or `ethereum`, request a reading, and you get a four-row result plus the named source it came from.",
  useCases: [
    "You set yourself a mental target on ethereum and want to check where it is right now, along with whether the 24-hour move is up or down, without opening an exchange account.",
    "You are reconciling a portfolio spreadsheet and need a price with a trustworthy last-updated timestamp so you know how stale the number you are pasting in actually is.",
    "You are testing an integration and need to confirm the exact CoinGecko asset ID for a coin — a wrong ID returns a clear 'asset ID was not found' error rather than a silent zero.",
  ],
  benefits: [
    [
      "Every reading is timestamped",
      "The result shows the source's own last-updated time in ISO format, so you can tell a live quote from one that has been sitting still for minutes.",
    ],
    [
      "Price and 24-hour move together",
      "The 24-hour change is returned to three decimal places alongside the price, which is enough to see direction and size in one line.",
    ],
    [
      "Named source, no hidden aggregation",
      "Readings come from the CoinGecko simple price API and the result says so, so you always know which provider's number you are quoting.",
    ],
  ],
  faqs: [
    [
      "What do I type into the lookup box?",
      "A CoinGecko asset ID, not a ticker symbol — `bitcoin` rather than BTC, `ethereum` rather than ETH. Spaces are converted to hyphens and the text is lowercased, so 'Binance Coin' resolves to `binance-coin`; if the ID does not exist the tool reports that the asset was not found.",
    ],
    [
      "Does it actually alarm me when a price crosses my target?",
      "No — readings are fetched on demand when you request them, so nothing runs in the background and no notification fires on its own. Use it to check a level, not as an unattended watcher.",
    ],
    [
      "Which currency is the price shown in?",
      "US dollars by default. The request also accepts a currency parameter, and whichever currency is used is printed next to the figure so the unit is never ambiguous.",
    ],
    [
      "Why did my lookup fail or time out?",
      "Requests are cut off after 9 seconds, and the upstream price API applies its own rate limits, so a rapid burst of lookups or a slow provider will surface an error instead of a stale figure. Waiting a moment and requesting again usually clears it.",
    ],
  ],
};

export default seo;
