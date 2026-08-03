// src/app/tradeon/weekly-outlook/[slug]/page.jsx
// Weekly Outlook detail — SEO-friendly slug URL (e.g. /tradeon/weekly-outlook/
// hdfc-bank-weekly-outlook). Resolves the slug back to a stock symbol.
import { notFound } from "next/navigation";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import OutlookClient from "../../components/outlook/OutlookClient";
import { symbolFromOutlookSlug, stockName } from "../../lib/slug";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const symbol = symbolFromOutlookSlug(slug);
  if (!symbol) {
    return createPageMetadata({ title: "Weekly Stock Outlook | Tradeon", path: `/tradeon/weekly-outlook/${slug}` });
  }
  const name = stockName(symbol);
  return createPageMetadata({
    title: `${name} Weekly Outlook — Support, Resistance & Analysis | Tradeon`,
    description: `Weekly outlook for ${name} (${symbol}): pivot support & resistance levels, previous-week OHLC, projected trading range and technical analysis on Tradeon.`,
    path: `/tradeon/weekly-outlook/${slug}`,
    type: "article",
    keywords: [`${name} weekly outlook`, `${symbol} support resistance`, `${name} share price`, `${symbol} weekly analysis`, "weekly stock outlook"],
  });
}

export default async function WeeklyOutlookDetailPage({ params }) {
  const { slug } = await params;
  const symbol = symbolFromOutlookSlug(slug);
  if (!symbol) notFound();
  return <OutlookClient symbol={symbol} />;
}
