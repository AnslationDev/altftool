import { getAllCategories, getLatestArticles } from "./data/factNetData";

export const dynamic = "force-dynamic";

const SITE_URL = "https://altftool.com";

export default function sitemap() {
  const baseRoutes = ["", "/categories", "/listings", "/search"].map((path) => ({
    url: `${SITE_URL}/fact-net${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path ? 0.7 : 0.9,
  }));

  const categoryRoutes = getAllCategories().map((category) => ({
    url: `${SITE_URL}${category.href}`,
    lastModified: category.lastmod ? new Date(category.lastmod) : new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const articleRoutes = getLatestArticles(1000).map((article) => ({
    url: `${SITE_URL}${article.href}`,
    lastModified: article.lastmod ? new Date(article.lastmod) : new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...baseRoutes, ...categoryRoutes, ...articleRoutes];
}
