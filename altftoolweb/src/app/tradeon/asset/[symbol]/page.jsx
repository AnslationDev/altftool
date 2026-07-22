// src/app/tradeon/asset/[symbol]/page.jsx
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import AssetDetailClient from "../../components/asset/AssetDetailClient";
import { assetHref } from "../../lib/format";
import { INSTRUMENTS, instrumentBySymbol, symbolFromSlug, symbolToSlug } from "../../lib/instruments";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return INSTRUMENTS.map(({ symbol }) => ({ symbol: symbolToSlug(symbol) }));
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

export default function TradeonAssetPage() {
  return <AssetDetailClient />;
}
