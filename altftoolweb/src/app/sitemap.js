import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { getAllBlogs } from "@/app/blogs/data";
import { fetchFirebaseBlogsPage } from "@/app/blogs/data/firebaseBlogs";
import { getSiteUrl, normalizeSlug } from "@/platform/seo/generateMetadata";
import newsData from "../../public/data/newsdata.json";
import topicsData from "../../public/data/topics.json";

export const revalidate = 3600;

const staticRoutes = [
  { path: "/", priority: 1.0 },
  { path: "/tools", priority: 0.95 },
  { path: "/tools/all", priority: 0.90 },
  { path: "/blogs", priority: 0.90 },
  { path: "/blogs/topics", priority: 0.72 },
  { path: "/news", priority: 0.75 },
  { path: "/news/headlines", priority: 0.60 },
  { path: "/news/local", priority: 0.60 },
  { path: "/news/newsletter", priority: 0.48 },
  { path: "/news/topics", priority: 0.60 },
  { path: "/news/trending", priority: 0.60 },
  { path: "/policypages/about", priority: 0.35 },
  { path: "/policypages/affiliate", priority: 0.35 },
  { path: "/policypages/contact", priority: 0.35 },
  { path: "/policypages/cookie", priority: 0.25 },
  { path: "/policypages/disclaimer", priority: 0.25 },
  { path: "/policypages/privacy", priority: 0.25 },
  { path: "/policypages/termsandconditions", priority: 0.25 },
];

function sitemapEntry(path, options = {}) {
  // Enforce apex domain for all generated URLs
  const siteUrl = getSiteUrl().replace("www.", "");
  return {
    url: `${siteUrl}${path}`,
    lastModified: options.lastModified || new Date(),
    changeFrequency: options.changeFrequency || "weekly",
    priority: options.priority ?? 0.6,
  };
}

function pushUnique(entries, seen, path, options) {
  if (!path || seen.has(path)) return;
  seen.add(path);
  entries.push(sitemapEntry(path, options));
}

async function fetchFirebaseBlogsForSeo() {
  try {
    const rows = await fetchFirebaseBlogsPage({
      pageSize: 300,
      offset: 0,
      includeDescription: false,
    });
    return rows || [];
  } catch (error) {
    console.error("Sitemap Firebase blogs fetch error:", error);
    return [];
  }
}

function normalizeTopicSlug(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function sitemap() {
  const entries = [];
  const seen = new Set();

  // 1. Static Core, News, Blog Hubs, and Policy Pages
  for (const route of staticRoutes) {
    pushUnique(entries, seen, route.path, {
      priority: route.priority,
      changeFrequency: route.path === "/" ? "daily" : "weekly",
    });
  }

  // 2. Canonical Tool Pages (Only /tools/all/[slug])
  // We exclude duplicate category paths like /tools/[category]/[slug]
  for (const slug of Object.keys(toolMetaMap)) {
    pushUnique(entries, seen, `/tools/all/${slug}`, {
      priority: 0.85,
      changeFrequency: "monthly",
    });
  }

  // 3. Blog Posts (Static & Dynamic from Firebase)
  const staticBlogs = getAllBlogs() || [];
  let firebaseBlogs = [];
  try {
    firebaseBlogs = await fetchFirebaseBlogsForSeo();
  } catch {}

  const allBlogs = [...staticBlogs, ...firebaseBlogs];

  for (const blog of allBlogs) {
    if (blog && blog.slug) {
      const blogDate = blog.updatedAt || blog.date || new Date();
      pushUnique(entries, seen, `/blogs/${blog.slug}`, {
        lastModified: new Date(blogDate),
        priority: 0.75,
        changeFrequency: "weekly",
      });
    }
  }

  // 4. News Articles
  const newsArticles = newsData.news || [];
  for (const article of newsArticles) {
    if (article && article.slug) {
      pushUnique(entries, seen, `/news/${article.slug}`, {
        priority: 0.65,
        changeFrequency: "weekly",
      });
    }
  }

  // 5. News Topics
  const topics = topicsData.topics || [];
  for (const topic of topics.slice(0, 100)) {
    const slug = normalizeTopicSlug(topic);
    if (slug) {
      pushUnique(entries, seen, `/news/topics/${slug}`, {
        priority: 0.50,
        changeFrequency: "weekly",
      });
    }
  }

  return entries;
}
