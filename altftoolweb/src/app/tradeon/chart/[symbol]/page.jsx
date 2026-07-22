// src/app/tradeon/chart/[symbol]/page.jsx
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import FullChartClient from "../../components/chart/FullChartClient";
import { chartHref } from "../../lib/format";
import { INSTRUMENTS, instrumentBySymbol, symbolFromSlug, symbolToSlug } from "../../lib/instruments";

export function generateStaticParams() {
  return INSTRUMENTS.map(({ symbol }) => ({ symbol: symbolToSlug(symbol) }));
}

export async function generateMetadata({ params }) {
  const { symbol: raw } = await params;
  const symbol = symbolFromSlug(raw);
  const instrument = instrumentBySymbol(symbol);
  const name = instrument?.name || symbol;
  return createPageMetadata({
    title: `${symbol} Full Chart — Interactive Market Workspace | Tradeon`,
    description: `Full-screen chart workspace for ${name} (${symbol}) with multiple timeframes, indicators, drawing tools and educational market analysis.`,
    path: chartHref(symbol),
    keywords: [`${symbol} chart`, `${symbol} live chart`, "full chart", "trading chart", "candlestick chart"],
    type: "website",
  });
}

export default function TradeonFullChartPage() {
  return <FullChartClient />;
}
