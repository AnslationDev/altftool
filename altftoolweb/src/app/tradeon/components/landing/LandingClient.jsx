// src/app/tradeon/components/landing/LandingClient.jsx
"use client";

import { useMarketData } from "../../hooks/useMarketData";
import TradeonHeader from "./TradeonHeader";
import Hero from "./Hero";
import MarketMovers from "./MarketMovers";
import AIPredictions from "./AIPredictions";
import WorkspacePreview from "./WorkspacePreview";
import GlobalMarkets from "./GlobalMarkets";
import MarketInsights from "./MarketInsights";
import TradeonFooter from "./TradeonFooter";

export default function LandingClient() {
  const { data, status } = useMarketData();

  return (
    <div id="top" className="tradeon-root">
      {/* Sticky header carries the market tape at its very top */}
      <TradeonHeader data={data} status={status} />
      <main className="pt-3">
        <Hero data={data} status={status} />
        <MarketMovers data={data} />
        <AIPredictions data={data} />
        <WorkspacePreview data={data} />
        <GlobalMarkets data={data} />
        <MarketInsights data={data} />
      </main>
      <TradeonFooter status={status} />
    </div>
  );
}
