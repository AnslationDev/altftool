import newsData from "../../../public/data/newsdata.json";
import { getSiteUrl } from "@/platform/seo/generateMetadata";

export const dynamic = "force-static";
export const revalidate = 3600;

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function itemDate(article) {
  const hoursAgo = Number(article.published_hours_ago || 0);
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toUTCString();
}

export function GET() {
  const siteUrl = getSiteUrl();
  const items = (newsData.news || [])
    .map((article) => {
      const link = `${siteUrl}/news/${article.slug}`;
      return `
        <item>
          <title>${escapeXml(article.headline)}</title>
          <link>${escapeXml(link)}</link>
          <guid isPermaLink="true">${escapeXml(link)}</guid>
          <description>${escapeXml(article.summary)}</description>
          <pubDate>${itemDate(article)}</pubDate>
          <source>${escapeXml(article.source || "AltFTool News")}</source>
        </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>AltFTool News</title>
        <link>${escapeXml(`${siteUrl}/news`)}</link>
        <description>Latest stories and updates from AltFTool News.</description>
        <language>en</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${items}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
