// src/app/tradeon/predictions/[slug]/page.jsx
// Prediction detail — SEO-friendly slug URL (e.g. /tradeon/predictions/
// tcs-share-price-prediction). Resolves the slug to a symbol and opens the asset's
// AI Prediction & Analysis view.
import { notFound } from "next/navigation";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import AssetDetailClient from "../../components/asset/AssetDetailClient";
import { symbolFromPredictionSlug, stockName } from "../../lib/slug";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const symbol = symbolFromPredictionSlug(slug);
  if (!symbol) {
    return createPageMetadata({ title: "Stock Prediction | Tradeon", path: `/tradeon/predictions/${slug}` });
  }
  const name = stockName(symbol);
  return createPageMetadata({
    title: `${name} Share Price Prediction — AI Buy/Sell/Hold Forecast | Tradeon`,
    description: `AI-powered ${name} (${symbol}) share price prediction: Buy / Sell / Hold signal with confidence, factor scorecard, price targets and technical analysis on Tradeon.`,
    path: `/tradeon/predictions/${slug}`,
    type: "article",
    keywords: [`${name} prediction`, `${symbol} share price prediction`, `${name} forecast`, `${symbol} buy sell hold`, "AI stock prediction"],
  });
}

export default async function PredictionDetailPage({ params }) {
  const { slug } = await params;
  const symbol = symbolFromPredictionSlug(slug);
  if (!symbol) notFound();
  return <AssetDetailClient symbol={symbol} defaultTab="Predictions" />;
}
