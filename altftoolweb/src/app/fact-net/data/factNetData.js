import { readdirSync } from "node:fs";
import path from "node:path";
import { factNetArticles, factNetCategories, factNetSettings } from "./aiFactsData.js";

export const FACT_NET_BASE_PATH = "/fact-net";
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 48;

let cachedArticles;
let cachedCategories;
let cachedArticleBySlug;
let cachedCategoryByPath;
let cachedSortedArticles = {};
let cachedImageFiles;

function cleanPath(value = "") {
  return String(value).replace(/^\/+|\/+$/g, "");
}

function normalizeText(value = "") {
  return String(value).toLowerCase().replace(/\s+/g, " ").trim();
}

function titleFromSlug(slug = "") {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) =>
      word.length <= 2 ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1),
    )
    .join(" ");
}

function getLocalImageFiles() {
  if (!cachedImageFiles) {
    try {
      cachedImageFiles = new Set(
        readdirSync(path.join(process.cwd(), "public/fact-net-images")).filter(Boolean),
      );
    } catch {
      cachedImageFiles = new Set();
    }
  }
  return cachedImageFiles;
}

function getImageCandidates(article) {
  const configured = article.image ? [article.image] : [];
  const generated = [
    `/fact-net-images/${article.slug}.webp`,
    `/fact-net-images/${article.slug}.png`,
    `/fact-net-images/${article.slug}.jpg`,
    `/fact-net-images/${article.slug}.jpeg`,
  ];
  const candidates = [...configured, ...generated].filter(Boolean);
  const imageFiles = getLocalImageFiles();
  const seen = new Set();

  return candidates.filter((candidate) => {
    const filename = candidate.split("/").at(-1);
    if (!filename || seen.has(candidate) || !imageFiles.has(filename)) return false;
    seen.add(candidate);
    return true;
  });
}

function getContentSource() {
  return {
    settings: factNetSettings,
    categories: factNetCategories,
    articles: factNetArticles,
  };
}

function normalizeCategory(category) {
  const categoryPath = cleanPath(category.categoryPath);

  return {
    ...category,
    categoryPath,
    href: `${FACT_NET_BASE_PATH}/categories/${categoryPath}`,
    sourceUrl: null,
    lastmod: getContentSource().settings.generatedAt,
  };
}

function normalizeArticle(article) {
  const categoryPath = cleanPath(article.categoryPath);
  const imageCandidates = getImageCandidates(article);
  const facts = Array.isArray(article.facts) ? article.facts : [];

  return {
    ...article,
    categoryPath,
    primaryCategory: article.primaryCategory || titleFromSlug(categoryPath),
    href: `${FACT_NET_BASE_PATH}/articles/${article.slug}`,
    sourcePath: `${FACT_NET_BASE_PATH}/articles/${article.slug}`,
    sourceUrl: null,
    image: imageCandidates[0] || null,
    imageCandidates,
    facts,
    factCount: facts.length,
    ownedContent: true,
    dataProvider: "local-original-catalog",
  };
}

function getArticles() {
  if (!cachedArticles) {
    cachedArticles = getContentSource().articles.map(normalizeArticle);
  }
  return cachedArticles;
}

function getCategories() {
  if (!cachedCategories) {
    const counts = new Map();
    const latest = new Map();

    for (const article of getArticles()) {
      counts.set(article.categoryPath, (counts.get(article.categoryPath) || 0) + 1);
      const currentLatest = latest.get(article.categoryPath);
      if (!currentLatest || new Date(article.lastmod) > new Date(currentLatest)) {
        latest.set(article.categoryPath, article.lastmod);
      }
    }

    cachedCategories = getContentSource().categories.map((category) => {
      const normalized = normalizeCategory(category);
      return {
        ...normalized,
        count: counts.get(normalized.categoryPath) || 0,
        lastmod: latest.get(normalized.categoryPath) || getContentSource().settings.generatedAt,
      };
    });
  }
  return cachedCategories;
}

function getArticleBySlugMap() {
  if (!cachedArticleBySlug) {
    cachedArticleBySlug = new Map(getArticles().map((article) => [article.slug, article]));
  }
  return cachedArticleBySlug;
}

function getCategoryByPathMap() {
  if (!cachedCategoryByPath) {
    cachedCategoryByPath = new Map(
      getCategories().map((category) => [category.categoryPath, category]),
    );
  }
  return cachedCategoryByPath;
}

function clampPage(value) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function clampPageSize(value) {
  const pageSize = Number(value);
  if (!Number.isFinite(pageSize) || pageSize <= 0) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.floor(pageSize), MAX_PAGE_SIZE);
}

function sortArticles(articles, sort = "latest") {
  const items = [...articles];

  if (sort === "slug") return items.sort((a, b) => a.slug.localeCompare(b.slug));
  if (sort === "title") return items.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "count") return items.sort((a, b) => b.factCount - a.factCount);

  return items.sort((a, b) => new Date(b.lastmod || 0) - new Date(a.lastmod || 0));
}

function getSortedArticles(sort = "latest") {
  const safeSort = ["latest", "title", "count", "slug"].includes(sort) ? sort : "latest";

  if (!cachedSortedArticles[safeSort]) {
    cachedSortedArticles[safeSort] = sortArticles(getArticles(), safeSort);
  }

  return cachedSortedArticles[safeSort];
}

function matchesSearch(article, query) {
  if (!query) return true;
  const haystack = normalizeText(
    `${article.title} ${article.deck} ${article.slug} ${article.primaryCategory} ${article.categoryPath} ${article.description} ${article.facts.join(" ")}`,
  );
  return haystack.includes(query);
}

export function getInventoryStats() {
  const articles = getArticles();
  const categories = getCategories();
  const factCount = articles.reduce((total, article) => total + article.factCount, 0);

  return {
    generatedAt: getContentSource().settings.generatedAt,
    postCount: articles.length,
    categoryCount: categories.length,
    pageCount: 4,
    factCount,
    imageCount: articles.filter((article) => article.image).length,
    byCategoryPath: categories.map((category) => ({
      key: category.categoryPath,
      count: category.count,
    })),
    failedPostSitemaps: [],
  };
}

export function getHomepageSnapshot() {
  return {
    canonical: getContentSource().settings.canonical,
    description: getContentSource().settings.description,
    brandName: getContentSource().settings.brandName,
    internalLinks: getFeaturedHomepageArticles(6).map((article) => ({
      title: article.title,
      url: article.href,
    })),
  };
}

export function getAllCategories() {
  return getCategories();
}

export function getTopCategories(limit = 12) {
  return getCategories()
    .map((category) => ({
      key: category.categoryPath,
      count: category.count,
      category,
    }))
    .sort((a, b) => b.count - a.count || a.category.name.localeCompare(b.category.name))
    .slice(0, limit);
}

export function getCategoryByPath(categoryPath) {
  const pathKey = cleanPath(categoryPath);
  return getCategoryByPathMap().get(pathKey) || null;
}

export function getArticleBySlug(slug) {
  return getArticleBySlugMap().get(slug) || null;
}

export function getArticlesPage({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  query = "",
  categoryPath,
  sort = "latest",
  factCount,
} = {}) {
  const normalizedQuery = normalizeText(query);
  const normalizedCategory = categoryPath ? cleanPath(categoryPath) : "";
  const hasFactCount = factCount !== undefined && factCount !== null && factCount !== "";
  const normalizedFactCount = hasFactCount ? Number(factCount) : null;
  const sortedArticles = getSortedArticles(sort);

  const filtered = sortedArticles.filter((article) => {
    if (normalizedCategory && article.categoryPath !== normalizedCategory) return false;
    if (Number.isFinite(normalizedFactCount) && article.factCount !== normalizedFactCount) {
      return false;
    }
    return matchesSearch(article, normalizedQuery);
  });

  const safePageSize = clampPageSize(pageSize);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(clampPage(page), totalPages);
  const start = (safePage - 1) * safePageSize;

  return {
    items: filtered.slice(start, start + safePageSize),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
    query,
    categoryPath: normalizedCategory,
    sort,
  };
}

export function getLatestArticles(limit = 12) {
  return getArticlesPage({ pageSize: limit }).items;
}

export function getFeaturedHomepageArticles(limit = 12) {
  const featured = getSortedArticles("latest").filter((article) => article.featured);
  return (featured.length ? featured : getSortedArticles("latest")).slice(0, limit);
}

export function getRelatedArticles(article, limit = 8) {
  return sortArticles(
    getArticles().filter(
      (item) => item.slug !== article.slug && item.categoryPath === article.categoryPath,
    ),
  ).slice(0, limit);
}

export function getNeighborArticles(article) {
  const sorted = getSortedArticles("slug");
  const index = sorted.findIndex((item) => item.slug === article.slug);

  return {
    previous: index > 0 ? sorted[index - 1] : null,
    next: index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : null,
  };
}

export function getValidFactCountStats(limit = 12) {
  const counts = new Map();
  for (const article of getArticles()) {
    counts.set(article.factCount, (counts.get(article.factCount) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([key, count]) => ({ key: String(key), count }))
    .sort((a, b) => Number(a.key) - Number(b.key))
    .slice(0, limit);
}

export function getSearchSuggestions(limit = 100) {
  return getSortedArticles("count")
    .slice(0, limit)
    .map((article) => ({
      title: article.title,
      href: article.href,
      categoryPath: article.categoryPath,
      description: article.description,
    }));
}

export function getRandomFactPool(limit = 24) {
  const facts = [];
  for (const article of getFeaturedHomepageArticles(100)) {
    for (const fact of article.facts.slice(0, 5)) {
      facts.push({
        title: article.title,
        href: article.href,
        fact,
        categoryPath: article.categoryPath,
        image: article.image,
        imageCandidates: article.imageCandidates,
      });
    }
  }
  return facts.slice(0, limit);
}

export function getSourcePages() {
  return [
    { title: "Fact Hub Home", url: "/fact-net" },
    { title: "Fact Hub Categories", url: "/fact-net/categories" },
    { title: "Fact Hub Listings", url: "/fact-net/listings" },
    { title: "Fact Hub Search", url: "/fact-net/search" },
  ];
}

export function getFailedSitemaps() {
  return [];
}

export function createPageUrl(pathname, params = {}) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const search = searchParams.toString();
  return search ? `${pathname}?${search}` : pathname;
}

export function formatCount(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

export function formatDate(value) {
  if (!value) return "Not listed";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not listed";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatFactCount(value) {
  const count = Number(value);
  if (!Number.isFinite(count) || count < 1) return null;
  return `${count} facts`;
}
