// src/app/tradeon/news/page.jsx
// Full Market News page — reached from the home "Market News" View All button and
// the dashboard news widget.
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import NewsClient from "../components/news/NewsClient";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Market News — Stocks, Crypto, Forex, Commodities & More | Tradeon",
    description:
      "Live, real-time market news across Indian & global stocks, indices, crypto, forex, commodities, ETFs, IPOs, mutual funds, the economy and central banks — auto-categorised on Tradeon.",
    path: "/tradeon/news",
    keywords: ["market news", "stock market news", "crypto news", "forex news", "commodity news", "IPO news", "RBI news", "business news"],
  });
}

export default function TradeonNewsPage() {
  return <NewsClient />;
}
