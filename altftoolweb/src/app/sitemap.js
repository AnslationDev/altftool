import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import {
  blogTaxonomySlug,
  getAllBlogTags,
  getAllBlogs,
  getBlogAuthors,
  getBlogCategories,
  getBlogTopicClusters,
} from "@/app/blogs/data";
import { fetchFirebaseBlogsPage } from "@/app/blogs/data/firebaseBlogs";
import buySmartStores from "@/app/buysmart/data/stores.json";
import dealData from "@/app/exclusivedeals/(data)/db.json";
import top11Categories from "@/app/top11/data/categoryData";
import { getTop9Items } from "@/app/top9/data/getTop9Items";
import wattpadBooks from "@/app/wattpad/data/books.json";
import wattpadCategories from "@/app/wattpad/data/categories.json";
import { getSiteUrl, normalizeSlug } from "@/platform/seo/generateMetadata";
import newsData from "../../public/data/newsdata.json";
import topicsData from "../../public/data/topics.json";

export const revalidate = 3600;

const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/tools", priority: 0.95 },
  { path: "/blogs", priority: 0.9 },
  { path: "/blogs/topics", priority: 0.72 },
  { path: "/buysmart", priority: 0.85 },
  { path: "/buysmart/view-all", priority: 0.75 },
  { path: "/extensions", priority: 0.8 },
  { path: "/desktop", priority: 0.7 },
  { path: "/fullscrn", priority: 0.65 },
  { path: "/search-eng", priority: 0.65 },
  { path: "/smartlink", priority: 0.65 },
  { path: "/top11", priority: 0.7 },
  { path: "/top9", priority: 0.68 },
  { path: "/personality", priority: 0.66 },
  { path: "/wattpad", priority: 0.66 },
  { path: "/altpintrest", priority: 0.62 },
  { path: "/trendingvids", priority: 0.7 },
  { path: "/news", priority: 0.7 },
  { path: "/news/headlines", priority: 0.6 },
  { path: "/news/local", priority: 0.6 },
  { path: "/news/newsletter", priority: 0.48 },
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

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";
const FIREBASE_PROJECT_ROOT = "projects/altftool";
const SEO_FIREBASE_BLOG_LIMIT = 500;
const SEO_FIREBASE_PAGE_SIZE = 16;

function safeDate(value) {
  if (!value) return undefined;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  if (typeof value?.seconds === "number") {
    const date = new Date(value.seconds * 1000);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function sitemapEntry(path, options = {}) {
  return {
    url: `${getSiteUrl()}${path}`,
    lastModified: safeDate(options.lastModified) || new Date(),
    changeFrequency: options.changeFrequency || "weekly",
    priority: options.priority ?? 0.6,
  };
}

function pushUnique(entries, seen, path, options) {
  if (!path || seen.has(path)) return;
  seen.add(path);
  entries.push(sitemapEntry(path, options));
}

function normalizeTopicSlug(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function firestoreCollectionUrl(path, pageSize = 100) {
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`,
  );
  url.searchParams.set("key", FIREBASE_API_KEY);
  url.searchParams.set("pageSize", String(pageSize));
  return url.toString();
}

function firestoreValueToJs(value) {
  if (!value) return undefined;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) {
    return (value.arrayValue.values || []).map(firestoreValueToJs);
  }
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields || {}).map(([key, nestedValue]) => [
        key,
        firestoreValueToJs(nestedValue),
      ]),
    );
  }
  return undefined;
}

function decodeFirestoreDocument(document) {
  return {
    id: document.name?.split("/").pop() || "",
    ...Object.fromEntries(
      Object.entries(document.fields || {}).map(([key, value]) => [
        key,
        firestoreValueToJs(value),
      ]),
    ),
  };
}

async function listPublicFirestoreDocs(path, pageSize = 100) {
  try {
    const response = await fetch(firestoreCollectionUrl(path, pageSize), {
      next: { revalidate },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return [];
    return (payload.documents || []).map(decodeFirestoreDocument);
  } catch {
    return [];
  }
}

async function fetchFirebaseBlogsForSeo(maxPosts = SEO_FIREBASE_BLOG_LIMIT) {
  const pageSize = SEO_FIREBASE_PAGE_SIZE;
  const posts = [];
  let offset = 0;

  while (posts.length < maxPosts) {
    const rows = await fetchFirebaseBlogsPage({
      pageSize: Math.min(pageSize, maxPosts - posts.length),
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

async function getLiveSitemapCollections() {
  const [
    firebaseBlogs,
    extensions,
    brandCategories,
    brandSubcategories,
    brands,
  ] = await Promise.all([
    fetchFirebaseBlogsForSeo(),
    listPublicFirestoreDocs(`${FIREBASE_PROJECT_ROOT}/extensions`, 100),
    listPublicFirestoreDocs(`${FIREBASE_PROJECT_ROOT}/consumerrating/data/categories`, 100),
    listPublicFirestoreDocs(`${FIREBASE_PROJECT_ROOT}/consumerrating/data/subcategories`, 100),
    listPublicFirestoreDocs(`${FIREBASE_PROJECT_ROOT}/consumerrating/data/brands`, 100),
  ]);

  return {
    firebaseBlogs,
    extensions,
    brandCategories,
    brandSubcategories,
    brands,
  };
}

export default async function sitemap() {
  const entries = [];
  const seen = new Set();
  const liveCollections = await getLiveSitemapCollections();
  const sitemapBlogs = [...getAllBlogs(), ...liveCollections.firebaseBlogs];

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

  for (const blog of liveCollections.firebaseBlogs) {
    if (blog?.slug) {
      pushUnique(entries, seen, `/blogs/${blog.slug}`, {
        lastModified: blog.updatedAt || blog.date ? new Date(blog.updatedAt || blog.date) : undefined,
        priority: 0.72,
        changeFrequency: "weekly",
      });
    }
  }

  for (const category of getBlogCategories(sitemapBlogs).filter((item) => item !== "All")) {
    const categorySlug = blogTaxonomySlug(category);
    if (categorySlug) {
      pushUnique(entries, seen, `/blogs/category/${categorySlug}`, {
        priority: 0.66,
        changeFrequency: "weekly",
      });
    }
  }

  for (const tag of getAllBlogTags(sitemapBlogs)) {
    const tagSlug = blogTaxonomySlug(tag);
    if (tagSlug) {
      pushUnique(entries, seen, `/blogs/tag/${tagSlug}`, {
        priority: 0.54,
        changeFrequency: "weekly",
      });
    }
  }

  for (const author of getBlogAuthors(sitemapBlogs)) {
    if (author?.slug) {
      pushUnique(entries, seen, `/blogs/author/${author.slug}`, {
        lastModified: author.lastUpdated ? new Date(author.lastUpdated) : undefined,
        priority: 0.56,
        changeFrequency: "weekly",
      });
    }
  }

  for (const cluster of getBlogTopicClusters(sitemapBlogs).filter((item) => item.postCount > 0)) {
    pushUnique(entries, seen, `/blogs/topics/${cluster.slug}`, {
      priority: 0.62,
      changeFrequency: "weekly",
    });
  }

  for (const extension of liveCollections.extensions) {
    const slug = normalizeSlug(extension.slug || extension.id);
    if (slug) {
      pushUnique(entries, seen, `/extensions/${slug}`, {
        lastModified: extension.updatedAt || extension.createdAt
          ? new Date(extension.updatedAt || extension.createdAt)
          : undefined,
        priority: 0.62,
        changeFrequency: "weekly",
      });
    }
  }

  const brandCategoryById = new Map(
    liveCollections.brandCategories
      .filter((category) => category?.id && category?.name)
      .map((category) => [category.id, category]),
  );
  const brandSubcategoryById = new Map(
    liveCollections.brandSubcategories
      .filter((subcategory) => subcategory?.id && subcategory?.name)
      .map((subcategory) => [subcategory.id, subcategory]),
  );

  for (const subcategory of liveCollections.brandSubcategories) {
    const category = brandCategoryById.get(subcategory.categoryId);
    const categorySlug = normalizeSlug(category?.name);
    const subcategorySlug = normalizeSlug(subcategory?.name);

    if (categorySlug && subcategorySlug) {
      pushUnique(entries, seen, `/brandrating/${categorySlug}/${subcategorySlug}`, {
        lastModified: subcategory.updatedAt || subcategory.createdAt
          ? new Date(subcategory.updatedAt || subcategory.createdAt)
          : undefined,
        priority: 0.62,
        changeFrequency: "weekly",
      });
    }
  }

  for (const brand of liveCollections.brands) {
    const category = brandCategoryById.get(brand.categoryId);
    const subcategory = brandSubcategoryById.get(brand.subCategoryId);
    const categorySlug = normalizeSlug(category?.name);
    const subcategorySlug = normalizeSlug(subcategory?.name);
    const brandSlug = normalizeSlug(brand?.name);

    if (categorySlug && subcategorySlug && brandSlug) {
      pushUnique(entries, seen, `/brandrating/${categorySlug}/${subcategorySlug}/${brandSlug}`, {
        lastModified: brand.updatedAt || brand.createdAt ? new Date(brand.updatedAt || brand.createdAt) : undefined,
        priority: 0.58,
        changeFrequency: "weekly",
      });
    }
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

  for (const item of getTop9Items()) {
    pushUnique(entries, seen, `/top9/${item.slug}`, {
      lastModified: item.date ? new Date(item.date) : undefined,
      priority: 0.58,
      changeFrequency: "monthly",
    });
  }

  for (const category of wattpadCategories) {
    if (category?.slug) {
      pushUnique(entries, seen, `/wattpad/category/${category.slug}`, {
        lastModified: category.createdAt ? new Date(category.createdAt) : undefined,
        priority: 0.54,
        changeFrequency: "monthly",
      });
    }
  }

  for (const book of wattpadBooks) {
    if (book?.slug) {
      pushUnique(entries, seen, `/wattpad/book/${book.slug}`, {
        lastModified: book.createdAt ? new Date(book.createdAt) : undefined,
        priority: 0.56,
        changeFrequency: "monthly",
      });
    }
  }

  for (const article of newsData.news || []) {
    if (article?.slug) {
      pushUnique(entries, seen, `/news/${article.slug}`, {
        priority: 0.55,
        changeFrequency: "weekly",
      });
    }
  }

  for (const topic of (topicsData.topics || []).slice(0, 200)) {
    const slug = normalizeTopicSlug(topic);
    if (slug) {
      pushUnique(entries, seen, `/news/topics/${slug}`, {
        priority: 0.42,
        changeFrequency: "weekly",
      });
    }
  }

  return entries;
}
