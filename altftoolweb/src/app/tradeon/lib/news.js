// src/app/tradeon/lib/news.js
// Config + helpers for the Tradeon News module. News is aggregated from free,
// real-time RSS feeds (no API key) covering every market the app supports, then
// auto-categorised by keyword. Shared by the /tradeon/api/news route and the UI.

// Free RSS sources → default category + display source. Server-side fetch, so no
// CORS. Each feed has a natural primary category; keyword rules refine per article.
export const NEWS_FEEDS = [
  { url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", source: "Economic Times", category: "indian-stocks" },
  { url: "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms", source: "Economic Times", category: "indian-stocks" },
  { url: "https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms", source: "Economic Times", category: "economy" },
  { url: "https://economictimes.indiatimes.com/markets/ipos/fpos/rssfeeds/14655708.cms", source: "Economic Times", category: "ipos" },
  { url: "https://economictimes.indiatimes.com/mf/rssfeeds/359241701.cms", source: "Economic Times", category: "mutual-funds" },
  { url: "https://economictimes.indiatimes.com/markets/forex/rssfeeds/1052732854.cms", source: "Economic Times", category: "forex" },
  { url: "https://www.moneycontrol.com/rss/business.xml", source: "Moneycontrol", category: "corporate" },
  { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258", source: "CNBC", category: "global-stocks" },
  { url: "https://finance.yahoo.com/news/rssindex", source: "Yahoo Finance", category: "global-stocks" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", source: "CoinDesk", category: "crypto" },
  { url: "https://cointelegraph.com/rss", source: "Cointelegraph", category: "crypto" },
  { url: "https://www.fxstreet.com/rss/news", source: "FXStreet", category: "forex" },
  { url: "https://www.investing.com/rss/news_11.rss", source: "Investing.com", category: "commodities" },
];

// Filter categories (order = display order). "all" is added in the UI.
export const NEWS_CATEGORIES = [
  { id: "indian-stocks", label: "Indian Stocks" },
  { id: "global-stocks", label: "Global Stocks" },
  { id: "indices", label: "Indices" },
  { id: "crypto", label: "Crypto" },
  { id: "forex", label: "Forex" },
  { id: "commodities", label: "Commodities" },
  { id: "etfs", label: "ETFs" },
  { id: "ipos", label: "IPOs" },
  { id: "mutual-funds", label: "Mutual Funds" },
  { id: "economy", label: "Economy" },
  { id: "rbi", label: "RBI & Central Banks" },
  { id: "corporate", label: "Corporate" },
  { id: "earnings", label: "Earnings" },
];

export const categoryLabel = (id) => NEWS_CATEGORIES.find((c) => c.id === id)?.label || "Markets";

// Keyword rules, ordered by priority — the first match becomes the primary
// category (shown on the card); ALL matches (plus the feed default) become the
// article's `categories` used for filtering.
const RULES = [
  ["rbi", ["rbi", "reserve bank", "central bank", "federal reserve", "the fed", "monetary policy", "repo rate", "rate cut", "rate hike", "fomc", " ecb ", "bank of england", "interest rate"]],
  ["ipos", ["ipo", "initial public offering", "grey market", " gmp", "listing gain", "public issue", "drhp", "subscribe to"]],
  ["earnings", ["q1 results", "q2 results", "q3 results", "q4 results", "quarterly results", "quarterly earnings", "net profit", "earnings", " revenue", "ebitda", " results:", "profit rises", "profit falls", "profit slumps", "profit jumps", "profit up", "profit down"]],
  ["mutual-funds", ["mutual fund", " sip ", " nfo", "fund house", "equity fund", "debt fund", "index fund", "elss"]],
  ["etfs", ["etf", "exchange traded fund", "exchange-traded fund"]],
  ["crypto", ["bitcoin", "ethereum", "crypto", "blockchain", " btc", " eth ", "altcoin", "dogecoin", "solana", "binance", "stablecoin", "web3", " nft", "ripple", " xrp"]],
  ["commodities", ["gold", "silver", "crude", " oil ", "commodity", "commodities", " mcx", "natural gas", "brent", "bullion", "copper"]],
  ["forex", ["forex", "rupee", "dollar index", "currency", "usd/inr", "eur/usd", "exchange rate", "greenback", " yen ", " euro "]],
  ["indices", ["nifty", "sensex", "dow jones", "nasdaq", "s&p 500", "s&p500", " bse ", " nse ", "indices", "ftse", "nikkei", "bank nifty", " index "]],
  ["economy", ["gdp", "inflation", "economy", "fiscal", "union budget", "trade deficit", "unemployment", " cpi", " wpi", " pmi", "economic growth"]],
  ["corporate", ["merger", "acquisition", "acquires", "buyback", "dividend", "board approves", "board meeting", "stake sale", "partnership", "layoff", "resigns", "appoints"]],
];

// Categorise an article from its text + the feed's default category.
export function categorize(text, feedCategory) {
  const t = ` ${String(text).toLowerCase()} `;
  const matched = [];
  for (const [cat, kws] of RULES) if (kws.some((k) => t.includes(k))) matched.push(cat);
  const primary = matched[0] || feedCategory;
  const categories = Array.from(new Set([feedCategory, ...matched]));
  return { primary, categories };
}

// Stable id for an article URL (FNV-1a → base36) — used for /tradeon/news/<id>.
export function newsId(url) {
  let h = 2166136261;
  const s = String(url);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}
