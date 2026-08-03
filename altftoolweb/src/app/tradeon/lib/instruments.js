// src/app/tradeon/lib/instruments.js
// The Tradeon instrument universe across asset classes. Crypto symbols map to
// Binance tickers for genuinely live data; everything else is seeded and
// simulated with a bounded random walk (see marketData.js).

export const ASSET_CLASSES = [
  { id: "stocks", label: "Stocks", icon: "LineChart" },
  { id: "crypto", label: "Crypto", icon: "Bitcoin" },
  { id: "forex", label: "Forex", icon: "DollarSign" },
  { id: "indices", label: "Indices", icon: "Activity" },
  { id: "commodities", label: "Commodities", icon: "Gem" },
  { id: "etf", label: "ETFs", icon: "Layers" },
];

// binance: the Binance USDT pair used to anchor the price to reality.
export const INSTRUMENTS = [
  // ---- Crypto (LIVE via Binance) ----
  { symbol: "BTC", name: "Bitcoin", assetClass: "crypto", binance: "BTCUSDT", base: 67650, mcap: 1.33e12 },
  { symbol: "ETH", name: "Ethereum", assetClass: "crypto", binance: "ETHUSDT", base: 3520, mcap: 4.2e11 },
  { symbol: "SOL", name: "Solana", assetClass: "crypto", binance: "SOLUSDT", base: 168, mcap: 7.6e10 },
  { symbol: "BNB", name: "BNB", assetClass: "crypto", binance: "BNBUSDT", base: 585, mcap: 8.7e10 },
  { symbol: "XRP", name: "XRP", assetClass: "crypto", binance: "XRPUSDT", base: 0.52, mcap: 2.9e10 },
  { symbol: "DOGE", name: "Dogecoin", assetClass: "crypto", binance: "DOGEUSDT", base: 0.145, mcap: 2.1e10 },
  { symbol: "ADA", name: "Cardano", assetClass: "crypto", binance: "ADAUSDT", base: 0.44, mcap: 1.5e10 },
  { symbol: "AVAX", name: "Avalanche", assetClass: "crypto", binance: "AVAXUSDT", base: 36.2, mcap: 1.4e10 },

  // ---- Stocks (simulated) ----
  { symbol: "AAPL", name: "Apple Inc.", assetClass: "stocks", base: 224.3, mcap: 3.4e12 },
  { symbol: "NVDA", name: "NVIDIA Corp.", assetClass: "stocks", base: 128.7, mcap: 3.1e12 },
  { symbol: "MSFT", name: "Microsoft Corp.", assetClass: "stocks", base: 447.1, mcap: 3.3e12 },
  { symbol: "TSLA", name: "Tesla Inc.", assetClass: "stocks", base: 251.4, mcap: 8.0e11 },
  { symbol: "AMZN", name: "Amazon.com", assetClass: "stocks", base: 186.9, mcap: 1.9e12 },
  { symbol: "GOOGL", name: "Alphabet Inc.", assetClass: "stocks", base: 178.2, mcap: 2.2e12 },
  { symbol: "META", name: "Meta Platforms", assetClass: "stocks", base: 512.6, mcap: 1.3e12 },
  { symbol: "AMD", name: "Advanced Micro Devices", assetClass: "stocks", base: 158.4, mcap: 2.6e11 },
  { symbol: "NFLX", name: "Netflix Inc.", assetClass: "stocks", base: 685.2, mcap: 2.9e11 },
  { symbol: "JPM", name: "JPMorgan Chase", assetClass: "stocks", base: 208.7, mcap: 6.0e11 },

  // ---- Indian sector stocks (simulated) — power the home "Sector Outlook" grid ----
  { symbol: "ICICIBANK", name: "ICICI Bank", assetClass: "stocks", sector: "Banking", base: 1180, mcap: 8.3e11 },
  { symbol: "SBIN", name: "State Bank of India", assetClass: "stocks", sector: "Banking", base: 825, mcap: 7.4e11 },
  { symbol: "HDFCBANK", name: "HDFC Bank", assetClass: "stocks", sector: "Banking", base: 1660, mcap: 1.26e12 },
  { symbol: "AXISBANK", name: "Axis Bank", assetClass: "stocks", sector: "Banking", base: 1180, mcap: 3.6e11 },
  { symbol: "WIPRO", name: "Wipro", assetClass: "stocks", sector: "IT", base: 470, mcap: 2.5e11 },
  { symbol: "TCS", name: "Tata Consultancy Services", assetClass: "stocks", sector: "IT", base: 3850, mcap: 1.39e12 },
  { symbol: "INFY", name: "Infosys", assetClass: "stocks", sector: "IT", base: 1650, mcap: 6.9e11 },
  { symbol: "HCLTECH", name: "HCL Technologies", assetClass: "stocks", sector: "IT", base: 1420, mcap: 3.9e11 },
  { symbol: "ITC", name: "ITC Ltd", assetClass: "stocks", sector: "FMCG", base: 430, mcap: 5.4e11 },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", assetClass: "stocks", sector: "FMCG", base: 2450, mcap: 5.8e11 },
  { symbol: "DABUR", name: "Dabur India", assetClass: "stocks", sector: "FMCG", base: 620, mcap: 1.1e11 },
  { symbol: "COLPAL", name: "Colgate-Palmolive India", assetClass: "stocks", sector: "FMCG", base: 2750, mcap: 7.5e10 },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical", assetClass: "stocks", sector: "Pharma", base: 1500, mcap: 3.6e11 },
  { symbol: "CIPLA", name: "Cipla", assetClass: "stocks", sector: "Pharma", base: 1480, mcap: 1.2e11 },
  { symbol: "LUPIN", name: "Lupin", assetClass: "stocks", sector: "Pharma", base: 1650, mcap: 7.5e10 },
  { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories", assetClass: "stocks", sector: "Pharma", base: 6200, mcap: 1.0e11 },

  // ---- Forex (simulated) ----
  { symbol: "EUR/USD", name: "Euro / US Dollar", assetClass: "forex", base: 1.0842, mcap: null },
  { symbol: "GBP/USD", name: "Pound / US Dollar", assetClass: "forex", base: 1.2715, mcap: null },
  { symbol: "USD/JPY", name: "US Dollar / Yen", assetClass: "forex", base: 157.32, mcap: null },
  { symbol: "USD/INR", name: "US Dollar / Rupee", assetClass: "forex", base: 83.54, mcap: null },
  { symbol: "AUD/USD", name: "Aussie / US Dollar", assetClass: "forex", base: 0.6634, mcap: null },

  // ---- Indices (simulated) ----
  { symbol: "SPX", name: "S&P 500", assetClass: "indices", base: 5460.5, mcap: null },
  { symbol: "NDX", name: "Nasdaq 100", assetClass: "indices", base: 19420.3, mcap: null },
  { symbol: "DJI", name: "Dow Jones", assetClass: "indices", base: 39150.2, mcap: null },
  { symbol: "NIFTY", name: "Nifty 50", assetClass: "indices", base: 23557.9, mcap: null },
  { symbol: "FTSE", name: "FTSE 100", assetClass: "indices", base: 8164.1, mcap: null },
  { symbol: "N225", name: "Nikkei 225", assetClass: "indices", base: 38596.4, mcap: null },

  // ---- Commodities (simulated) ----
  { symbol: "XAU", name: "Gold (oz)", assetClass: "commodities", base: 2331.4, mcap: null },
  { symbol: "XAG", name: "Silver (oz)", assetClass: "commodities", base: 29.42, mcap: null },
  { symbol: "WTI", name: "Crude Oil WTI", assetClass: "commodities", base: 80.85, mcap: null },
  { symbol: "NG", name: "Natural Gas", assetClass: "commodities", base: 2.71, mcap: null },

  // ---- ETFs (simulated) ----
  { symbol: "SPY", name: "SPDR S&P 500 ETF", assetClass: "etf", base: 544.2, mcap: 5.3e11 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", assetClass: "etf", base: 472.9, mcap: 2.9e11 },
  { symbol: "VTI", name: "Vanguard Total Market", assetClass: "etf", base: 268.1, mcap: 4.1e11 },
];

export const SECTORS = [
  "Technology",
  "Financials",
  "Healthcare",
  "Energy",
  "Consumer",
  "Industrials",
  "Materials",
  "Utilities",
  "Real Estate",
  "Communication",
];

// Per-asset-class volatility (fraction of price per tick) for the simulator.
export const VOLATILITY = {
  crypto: 0.0016,
  stocks: 0.0009,
  forex: 0.0003,
  indices: 0.0005,
  commodities: 0.0011,
  etf: 0.0006,
};

export function instrumentBySymbol(symbol) {
  return INSTRUMENTS.find((i) => i.symbol === symbol) || null;
}

export function symbolToSlug(symbol) {
  return String(symbol || "").trim().replaceAll("/", "-");
}

export function symbolFromSlug(slug) {
  let normalized = String(slug || "").trim();

  try {
    normalized = decodeURIComponent(normalized);
  } catch {
    // Keep the original segment when a malformed escape sequence is supplied.
  }

  const upper = normalized.toUpperCase();
  const instrument = INSTRUMENTS.find(
    (item) =>
      item.symbol.toUpperCase() === upper ||
      symbolToSlug(item.symbol).toUpperCase() === upper,
  );

  return instrument?.symbol || upper;
}
