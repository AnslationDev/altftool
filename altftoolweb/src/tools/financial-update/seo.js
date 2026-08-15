const seo = {
  title: "Stock Price & Volume Dashboard: Last 30 Daily Closes",
  metaDescription:
    "Chart a ticker's last 30 daily closes and volume side by side, with day-over-day change and the 30-day high and low. End-of-day data, not live quotes.",
  steps: [
    "Type a ticker such as AAPL or TSLA into the 'Search your stock (e.g. AAPL, TSLA)' box — the input is uppercased as you type.",
    "Click 'Search' — the dashboard fetches the last 30 daily bars for the symbol; a bad symbol or exhausted quota shows 'Invalid stock symbol or API limit reached'.",
    "Read the 'Current Price' tile with its day-over-day change, the 'Volume', 'Day High' and 'Day Low' tiles, and the 'Price Trend (30 Days)' and 'Volume Analysis' charts, which refresh every 5 seconds.",
  ],
  intro:
    "Type a ticker such as AAPL or TSLA and this dashboard pulls the last 30 daily bars from Alpha Vantage's TIME_SERIES_DAILY feed and charts the closing price and traded volume side by side. Above the charts it shows the latest close, the change and percentage change against the previous session, that day's volume, and the highest and lowest close inside the 30-day window. An AI summary of the symbol is generated alongside the numbers, and the view refreshes on a five-second timer.",
  useCases: [
    "You saw a headline about a stock and want to see the last 30 sessions of closes before deciding whether the move is new or part of a longer slide",
    "You want to check whether today's volume is unusual for a ticker by comparing it against the volume bars for the previous month",
    "You are tracking a handful of symbols and want one screen that shows the last close, the day-over-day change and the month's high and low without opening a brokerage account",
  ],
  benefits: [
    [
      "Price and volume on the same 30-day window",
      "The line chart and the volume area chart share one date axis, so a price move on thin volume is visible at a glance.",
    ],
    [
      "Change is computed against the previous close",
      "The percentage shown is (latest close − previous close) ÷ previous close, the same day-over-day basis quote pages use, rather than an intraday tick.",
    ],
    [
      "Server-side key and caching",
      "Requests go through a cached endpoint with a five-minute revalidation window, so repeated lookups of the same ticker do not burn through the data provider's quota.",
    ],
  ],
  faqs: [
    [
      "How much history does it show?",
      "The 30 most recent daily bars from the provider's daily time series, oldest to newest. Each point carries that session's close, high, low and volume, so the high and low tiles reflect the 30-day range rather than an intraday range.",
    ],
    [
      "Is the data live or delayed?",
      "It is end-of-day daily data, and responses are cached for five minutes before being refetched, so treat the latest point as the most recent completed session rather than a real-time quote. Use your broker's feed if you need live prices for a decision.",
    ],
    [
      "Why did my search return an error?",
      "Either the symbol is not recognised by the provider or its request limit was hit. The endpoint allows 60 stock lookups per minute per client and passes through the provider's own throttle message, so waiting a minute and retrying usually clears it.",
    ],
    [
      "Can I use this to decide what to buy?",
      "No — it is an informational chart, not advice. It shows historical closes and volume with no fundamentals, no risk model and no account context; talk to a licensed financial adviser before acting on anything you see here.",
    ],
  ],
};

export default seo;
