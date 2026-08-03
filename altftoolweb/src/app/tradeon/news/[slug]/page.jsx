// src/app/tradeon/news/[slug]/page.jsx
// News detail page — SEO-friendly slug URL (/tradeon/news/<title-slug>).
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import NewsDetailClient from "../../components/news/NewsDetailClient";

// Best-effort readable title from the slug (used for dynamic SEO metadata without
// an extra fetch); the page itself loads the real article by slug on the client.
function deslug(slug = "") {
  return decodeURIComponent(slug)
    .split("-")
    .filter(Boolean)
    .map((w) => (/^(q[1-4]|ai|ipo|ipos|rbi|rba|rbnz|ecb|fed|boe|boj|dxy|gdp|cpi|wpi|pmi|fmcg|it|us|uk|eu|usd|eur|gbp|jpy|inr|etf|etfs|sip|nfo|gst|psu|nbfc|amc|nse|bse|mcx|hdfc|icici|sbi|tcs|hcl|hul|itc|bny|bbh|ubs|jpm|hsbc|ft)$/i.test(w) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const title = deslug(slug) || "Market News";
  return createPageMetadata({
    title: `${title} | Tradeon News`,
    description: `${title} — read the full story with hero image, source, publish time, related news and market analysis on Tradeon.`,
    path: `/tradeon/news/${slug}`,
    type: "article",
    keywords: [title, "market news", "stock market news", "business news"],
  });
}

export default function TradeonNewsDetailPage() {
  return <NewsDetailClient />;
}
