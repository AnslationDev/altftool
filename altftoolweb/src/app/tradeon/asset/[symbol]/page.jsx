// src/app/tradeon/asset/[symbol]/page.jsx
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import AssetDetailClient from "../../components/asset/AssetDetailClient";
import { assetHref } from "../../lib/format";
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

// Where the numbers on this page come from, stated in the markup because the
// markup outlives the render: marketData.js anchors crypto to Binance's public
// REST feed and simulates every other asset class with a bounded random walk
// (and fundamentals.js seeds the earnings/dividends tabs the same way). Every
// figure on screen is therefore a moving value that no static claim can freeze,
// so the schema below names the workspace and its data source and asserts NO
// price, change, volume or market cap — instruments.js `base`/`mcap` are seed
// constants, not quotes.
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
    title: `${symbol} — Price, Chart, Prediction & Analysis | Tradeon`,
    description: `Explore ${name} (${symbol}) with an interactive chart, market snapshot, explainable model signal and educational analysis. Crypto prices use a public market feed; other markets are illustrative.`,
    path: assetHref(symbol),
    keywords: [`${symbol} price`, `${symbol} chart`, `${symbol} prediction`, `${symbol} analysis`, "stock detail"],
    type: "website",
  });
}

export default async function TradeonAssetPage({ params }) {
  const { symbol: raw } = await params;
  const symbol = symbolFromSlug(raw);
  const instrument = instrumentBySymbol(symbol);
  const name = instrument?.name || symbol;
  const path = assetHref(symbol);

  return (
    <>
      {/* These 36 asset URLs shipped only the root layout's Organization and
          WebSite nodes — nothing describing the page itself. The entity below
          describes the free browser workspace (the thing AltFTool actually
          owns), not the traded instrument: no Product, no FinancialProduct, no
          offer for the asset, no rating. Unknown symbols get no entity at all,
          because there is nothing in instruments.js to describe truthfully. */}
      {instrument ? (
        <JsonLd
          id={`tradeon-asset-schema-${symbolToSlug(symbol)}`}
          data={[
            createToolJsonLd({
              slug: symbolToSlug(symbol),
              path,
              tool: {
                name: `${name} (${symbol}) Chart & Analysis`,
                description: `Interactive ${name} (${symbol}) chart with multiple timeframes, indicators and an explainable, deterministic signal model. ${dataProvenance(instrument)}`,
                category: ["FinanceApplication", assetClassLabel(instrument.assetClass)].filter(Boolean),
                topics: [symbol, name, `${symbol} chart`],
              },
            }),
            createBreadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Tradeon", path: "/tradeon" },
              { name: `${name} (${symbol})`, path },
            ]),
          ]}
        />
      ) : null}
      <h1 className="sr-only">
        {name} ({symbol}) price, chart, prediction and analysis
      </h1>
      <AssetDetailClient />
    </>
  );
}
