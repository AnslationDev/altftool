import { getAllCategories, getLatestArticles } from "./data/factNetData";
import { getSiteUrl } from "@/platform/seo/generateMetadata";
import { toXmlSafeSitemap } from "@/platform/seo/sitemapXml";

export const dynamic = "force-dynamic";

export default function sitemap() {
  const siteUrl = getSiteUrl();
  const baseRoutes = ["", "/categories", "/listings"].map((path) => ({
    url: `${siteUrl}/fact-net${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path ? 0.7 : 0.9,
  }));

  const categoryRoutes = getAllCategories().map((category) => ({
    url: `${siteUrl}${category.href}`,
    lastModified: category.lastmod ? new Date(category.lastmod) : new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const articleRoutes = getLatestArticles(1000).map((article) => ({
    url: `${siteUrl}${article.href}`,
    lastModified: article.lastmod ? new Date(article.lastmod) : new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return toXmlSafeSitemap([...baseRoutes, ...categoryRoutes, ...articleRoutes]);
}
