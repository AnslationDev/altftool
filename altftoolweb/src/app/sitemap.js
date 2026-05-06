import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { getAllBlogs } from "@/app/blogs/data";
import buySmartStores from "@/app/buysmart/data/stores.json";
import dealData from "@/app/exclusivedeals/(data)/db.json";
import top11Categories from "@/app/top11/data/categoryData";
import { getSiteUrl, normalizeSlug } from "@/platform/seo/generateMetadata";
import newsData from "../../public/data/newsdata.json";

export const revalidate = 3600;

const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/tools", priority: 0.95 },
  { path: "/blogs", priority: 0.9 },
  { path: "/buysmart", priority: 0.85 },
  { path: "/buysmart/view-all", priority: 0.75 },
  { path: "/extensions", priority: 0.8 },
  { path: "/desktop", priority: 0.7 },
  { path: "/fullscrn", priority: 0.65 },
  { path: "/search-eng", priority: 0.65 },
  { path: "/smartlink", priority: 0.65 },
  { path: "/top11", priority: 0.7 },
  { path: "/trendingvids", priority: 0.7 },
  { path: "/news", priority: 0.7 },
  { path: "/news/headlines", priority: 0.6 },
  { path: "/news/local", priority: 0.6 },
  { path: "/news/topics", priority: 0.6 },
  { path: "/news/trending", priority: 0.6 },
  { path: "/brandrating", priority: 0.7 },
  { path: "/exclusivedeals", priority: 0.85 },
  { path: "/exclusivedeals/all-stores", priority: 0.75 },
  { path: "/exclusivedeals/store", priority: 0.7 },
  { path: "/academy", priority: 0.6 },
  { path: "/sale", priority: 0.7 },
  { path: "/policypages/about", priority: 0.35 },
  { path: "/policypages/affiliate", priority: 0.35 },
  { path: "/policypages/contact", priority: 0.35 },
  { path: "/policypages/cookie", priority: 0.25 },
  { path: "/policypages/disclaimer", priority: 0.25 },
  { path: "/policypages/privacy", priority: 0.25 },
  { path: "/policypages/termsandconditions", priority: 0.25 },
];

function sitemapEntry(path, options = {}) {
  return {
    url: `${getSiteUrl()}${path}`,
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

export default function sitemap() {
  const entries = [];
  const seen = new Set();

  for (const route of staticRoutes) {
    pushUnique(entries, seen, route.path, {
      priority: route.priority,
      changeFrequency: route.path === "/" ? "daily" : "weekly",
    });
  }

  const toolCategories = new Set(["all"]);
  for (const tool of Object.values(toolMetaMap)) {
    const categories = Array.isArray(tool.category) ? tool.category : [tool.category];
    categories.filter(Boolean).forEach((category) => toolCategories.add(normalizeSlug(category)));
  }

  for (const category of [...toolCategories].sort()) {
    pushUnique(entries, seen, `/tools/${category}`, {
      priority: category === "all" ? 0.9 : 0.72,
      changeFrequency: "weekly",
    });
  }

  for (const [slug, tool] of Object.entries(toolMetaMap)) {
    pushUnique(entries, seen, `/tools/all/${slug}`, {
      priority: 0.78,
      changeFrequency: "monthly",
    });

    const categories = Array.isArray(tool.category) ? tool.category : [tool.category];
    const primaryCategory = normalizeSlug(categories.find(Boolean) || "all");
    if (primaryCategory && primaryCategory !== "all") {
      pushUnique(entries, seen, `/tools/${primaryCategory}/${slug}`, {
        priority: 0.68,
        changeFrequency: "monthly",
      });
    }
  }

  for (const blog of getAllBlogs()) {
    pushUnique(entries, seen, `/blogs/${blog.slug}`, {
      lastModified: blog.date ? new Date(blog.date) : undefined,
      priority: 0.7,
      changeFrequency: "monthly",
    });
  }

  for (const store of buySmartStores) {
    if (store?.slug) {
      pushUnique(entries, seen, `/buysmart/stores/${store.slug}`, {
        priority: 0.68,
        changeFrequency: "weekly",
      });
    }
  }

  for (const category of dealData.categories || []) {
    if (!category?.slug) continue;

    pushUnique(entries, seen, `/exclusivedeals/${category.slug}`, {
      priority: 0.72,
      changeFrequency: "weekly",
    });

    for (const brand of category.brands || []) {
      if (!brand?.id) continue;
      pushUnique(entries, seen, `/exclusivedeals/${category.slug}/${brand.id}`, {
        priority: 0.64,
        changeFrequency: "weekly",
      });
      pushUnique(entries, seen, `/exclusivedeals/store/${category.slug}/${brand.id}`, {
        priority: 0.58,
        changeFrequency: "weekly",
      });
    }
  }

  for (const slug of Object.keys(top11Categories)) {
    pushUnique(entries, seen, `/top11/${slug}`, {
      priority: 0.65,
      changeFrequency: "monthly",
    });
  }

  for (const article of newsData.news || []) {
    if (article?.slug) {
      pushUnique(entries, seen, `/news/${article.slug}`, {
        priority: 0.55,
        changeFrequency: "weekly",
      });
    }
  }

  return entries;
}
