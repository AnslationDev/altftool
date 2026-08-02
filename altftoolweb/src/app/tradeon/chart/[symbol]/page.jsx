// src/app/tradeon/chart/[symbol]/page.jsx
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import FullChartClient from "../../components/chart/FullChartClient";
import { assetHref, chartHref } from "../../lib/format";
import {
  ASSET_CLASSES,
  INSTRUMENTS,
  instrumentBySymbol,
  symbolFromSlug,
  symbolToSlug,
} from "../../lib/instruments";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

export const dynamic = "force-static";

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return INSTRUMENTS.map(({ symbol }) => ({ symbol: symbolToSlug(symbol) }));
}

function assetClassLabel(assetClass) {
  return ASSET_CLASSES.find((item) => item.id === assetClass)?.label || "";
}

// See the matching note in ../../asset/[symbol]/page.jsx: crypto is anchored to
// Binance's public feed, every other asset class is simulated, so the schema
// states the data source and asserts no price or market value of its own.
function dataProvenance(instrument) {
  return instrument.binance
    ? "Prices are anchored to Binance's public market feed and update live in the browser."
    : "Prices for this market are simulated for education and are not real market data.";
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

export default async function TradeonFullChartPage({ params }) {
  const { symbol: raw } = await params;
  const symbol = symbolFromSlug(raw);
  const instrument = instrumentBySymbol(symbol);
  const name = instrument?.name || symbol;
  const path = chartHref(symbol);

  return (
    <>
      {/* The entity describes the free charting workspace itself — timeframes,
          chart types, indicators and the drawing rail that FullChartClient
          actually renders — not the instrument being charted. No price, volume
          or market cap is published. Its USD 0 Offer describes free access to
          this software workspace, and unknown symbols get no entity. */}
      {instrument ? (
        <JsonLd
          id={`tradeon-chart-schema-${symbolToSlug(symbol)}`}
          data={[
            createToolJsonLd({
              slug: symbolToSlug(symbol),
              path,
              tool: {
                name: `Tradeon ${name} (${symbol}) Chart Workspace`,
                description: `Full-screen ${name} (${symbol}) chart workspace with multiple timeframes, candlestick, line, area and bar chart types, technical indicators and drawing tools. ${dataProvenance(instrument)}`,
                category: ["FinanceApplication", assetClassLabel(instrument.assetClass)].filter(Boolean),
                topics: [symbol, name, `${symbol} chart`],
              },
            }),
            createBreadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Tradeon", path: "/tradeon" },
              { name: `${name} (${symbol})`, path: assetHref(symbol) },
              { name: "Full Chart", path },
            ]),
          ]}
        />
      ) : null}
      <h1 className="sr-only">
        {name} ({symbol}) interactive market chart
      </h1>
      <FullChartClient />
    </>
  );
}
