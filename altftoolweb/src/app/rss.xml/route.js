import newsData from "../../../public/data/newsdata.json";
import { getSiteUrl } from "@/platform/seo/generateMetadata";
import {
  getAllBlogs,
  mergeBlogPosts,
  stripHtml,
} from "@/app/blogs/data";
import { fetchFirebaseBlogsPage } from "@/app/blogs/data/firebaseBlogs";

export const dynamic = "force-static";
export const revalidate = 3600;
const RSS_FIREBASE_PAGE_SIZE = 16;

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

function safeRssDate(value) {
  if (!value) return new Date().toUTCString();
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000).toUTCString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
}

async function fetchRssFirebaseBlogs() {
  const pageSize = RSS_FIREBASE_PAGE_SIZE;
  const posts = [];
  let offset = 0;

  while (posts.length < 200) {
    const rows = await fetchFirebaseBlogsPage({
      pageSize: Math.min(pageSize, 200 - posts.length),
      offset,
      includeDescription: false,
    }).catch(() => []);

    if (!rows.length) break;
    posts.push(...rows);
    if (rows.length < pageSize) break;
    offset += rows.length;
  }

  return posts;
}

function buildNewsItem(siteUrl, article) {
  const link = `${siteUrl}/news/${article.slug}`;
  return `
        <item>
          <title>${escapeXml(article.headline)}</title>
          <link>${escapeXml(link)}</link>
          <guid isPermaLink="true">${escapeXml(link)}</guid>
          <description>${escapeXml(article.summary)}</description>
          <pubDate>${itemDate(article)}</pubDate>
          <category>News</category>
          <source>${escapeXml(article.source || "AltFTool News")}</source>
        </item>`;
}

function buildBlogItem(siteUrl, blog) {
  const link = `${siteUrl}/blogs/${blog.slug}`;
  const description = blog.seoDescription || blog.excerpt || stripHtml(blog.description || "").slice(0, 180);

  return `
        <item>
          <title>${escapeXml(blog.heading || blog.title)}</title>
          <link>${escapeXml(link)}</link>
          <guid isPermaLink="true">${escapeXml(link)}</guid>
          <description>${escapeXml(description)}</description>
          <pubDate>${safeRssDate(blog.reviewedAt || blog.updatedAt || blog.date || blog.createdAt)}</pubDate>
          <category>${escapeXml(blog.category || "Blog")}</category>
          <author>${escapeXml(blog.author || "AltFTool Editorial")}</author>
          <source>${escapeXml("AltFTool Blog")}</source>
        </item>`;
}

export async function GET() {
  const siteUrl = getSiteUrl();
  const firebaseBlogs = await fetchRssFirebaseBlogs();
  const blogItems = mergeBlogPosts(getAllBlogs(), firebaseBlogs)
    .slice(0, 160)
    .map((blog) => buildBlogItem(siteUrl, blog));
  const newsItems = (newsData.news || [])
    .slice(0, 80)
    .map((article) => buildNewsItem(siteUrl, article));
  const items = [...blogItems, ...newsItems].join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>AltFTool Blog, Tools, and News</title>
        <link>${escapeXml(siteUrl)}</link>
        <atom:link href="${escapeXml(`${siteUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />
        <description>Latest AltFTool blogs, tool guides, and news updates.</description>
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
