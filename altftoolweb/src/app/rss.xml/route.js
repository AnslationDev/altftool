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
const RSS_FIREBASE_PAGE_SIZE = 100;

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// News items carry no absolute timestamp, only `published_hours_ago` relative
// to the build. Missing or non-numeric means we do not know when it ran, so the
// item is dropped rather than dated "now" — a fabricated pubDate would also sort
// the item to the top of the feed.
function newsDate(article) {
  const hoursAgo = Number(article?.published_hours_ago);
  if (!Number.isFinite(hoursAgo) || hoursAgo < 0) return null;
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
}

// Returns a Date or null. Previously this fell back to `new Date()`, which gave
// undated posts a pubDate of the build time — invented freshness, and in a
// date-sorted feed it would rank them above everything real.
function toRssDate(value) {
  if (!value) return null;
  if (typeof value?.seconds === "number") {
    const fromTimestamp = new Date(value.seconds * 1000);
    return Number.isNaN(fromTimestamp.getTime()) ? null : fromTimestamp;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// The published date, mirroring how the blog pages resolve it.
function blogDate(blog) {
  return toRssDate(blog?.reviewedAt || blog?.updatedAt || blog?.date || blog?.createdAt);
}

// Newest first, which is what every reader and every feed-reading crawler
// assumes. RSS has no ordering guarantee in the spec, so consumers take the
// document order at face value.
function sortRecordsNewestFirst(records) {
  return records.sort((a, b) => b.date.getTime() - a.date.getTime());
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

// Each builder returns a { date, xml } record, or null when the item has no
// real date. Carrying the date alongside the markup is what lets blogs and news
// be merged into one date-ordered sequence.
function buildNewsItem(siteUrl, article) {
  const date = newsDate(article);
  if (!date) return null;

  const link = `${siteUrl}/news/${article.slug}`;
  return {
    date,
    xml: `
        <item>
          <title>${escapeXml(article.headline)}</title>
          <link>${escapeXml(link)}</link>
          <guid isPermaLink="true">${escapeXml(link)}</guid>
          <description>${escapeXml(article.summary)}</description>
          <pubDate>${date.toUTCString()}</pubDate>
          <category>News</category>
          <source>${escapeXml(article.source || "AltFTool News")}</source>
        </item>`,
  };
}

function buildBlogItem(siteUrl, blog) {
  const date = blogDate(blog);
  if (!date) return null;

  const link = `${siteUrl}/blogs/${blog.slug}`;
  const description = blog.seoDescription || blog.excerpt || stripHtml(blog.description || "").slice(0, 180);

  return {
    date,
    xml: `
        <item>
          <title>${escapeXml(blog.heading || blog.title)}</title>
          <link>${escapeXml(link)}</link>
          <guid isPermaLink="true">${escapeXml(link)}</guid>
          <description>${escapeXml(description)}</description>
          <pubDate>${date.toUTCString()}</pubDate>
          <category>${escapeXml(blog.category || "Blog")}</category>
          <author>${escapeXml(blog.author || "AltFTool Editorial")}</author>
          <source>${escapeXml("AltFTool Blog")}</source>
        </item>`,
  };
}

export async function GET() {
  const siteUrl = getSiteUrl();
  const firebaseBlogs = await fetchRssFirebaseBlogs();

  // Sort each source by its own emitted pubDate before applying the per-source
  // cap, so the cap keeps the genuinely newest items. mergeBlogPosts() orders by
  // `date`, but the pubDate we emit prefers reviewedAt/updatedAt, and those
  // disagree for most posts — slicing on the wrong key dropped recent ones.
  const blogRecords = sortRecordsNewestFirst(
    mergeBlogPosts(getAllBlogs(), firebaseBlogs)
      .map((blog) => buildBlogItem(siteUrl, blog))
      .filter(Boolean),
  ).slice(0, 160);
  const newsRecords = sortRecordsNewestFirst(
    (newsData.news || []).map((article) => buildNewsItem(siteUrl, article)).filter(Boolean),
  ).slice(0, 80);

  // One feed, newest first across both sources. Concatenating blogs then news
  // put every news item — the freshest content on the site — behind 160 older
  // blog posts, so the first item a reader or crawler saw was never the newest.
  const items = sortRecordsNewestFirst([...blogRecords, ...newsRecords])
    .map((record) => record.xml)
    .join("");

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
