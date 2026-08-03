// src/app/tradeon/components/landing/LandingClient.jsx
"use client";

import { useMarketData } from "../../hooks/useMarketData";
import TradeonHeader from "./TradeonHeader";
import Hero from "./Hero";
import MarketMovers from "./MarketMovers";
import GlobalMarkets from "./GlobalMarkets";
import MarketInsights from "./MarketInsights";
import SectorOutlook from "./SectorOutlook";
import NewsSection from "../news/NewsSection";
import TradeonFooter from "./TradeonFooter";

export default function LandingClient() {
  const { data, status } = useMarketData();

  return (
    <div id="top" className="tradeon-root">
      {/* Sticky header carries the market tape at its very top */}
      <TradeonHeader data={data} status={status} />
      {/* Content surface — tdn-paper: white in light theme, app dark in dark theme (header/footer keep the app theme) */}
      <main className="tdn-paper pt-3">
        <Hero data={data} status={status} />
        <MarketMovers data={data} />
        <GlobalMarkets data={data} />
        <MarketInsights data={data} />
        <NewsSection />
        <SectorOutlook />
      </main>
      <TradeonFooter status={status} />
    </div>
  );
}
