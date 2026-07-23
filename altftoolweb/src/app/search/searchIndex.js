import "server-only";

import { unstable_cache } from "next/cache";

import { EXPERIENCE_CATALOG } from "@altftool/core/experiences";
import { PRODUCT_SUITE_CATALOG } from "@altftool/core/product-suites";
import { SIGNAL_CATALOG } from "@altftool/core/signals";

import { getAllBlogs } from "@/app/blogs/data";
import { getTrendingCards } from "@/app/n8n/data/service";
import { getStaticSearchSitemapEntries } from "@/app/sitemap";
import {
  EXPERIENCE_ROUTE_OPTIONS,
  PRODUCT_SUITE_ROUTE_OPTIONS,
  SITE_ROUTES,
  TOOL_CATEGORY_ROUTE_OPTIONS,
} from "@/platform/navigation/siteRoutes";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";

import {
  getDefaultRouteLabel,
  getSiteMapGroupId,
  SITE_MAP_GROUPS,
} from "../site-map/siteMapData";

const GROUPS_BY_ID = new Map(SITE_MAP_GROUPS.map((group) => [group.id, group]));
const RESULTS_PER_GROUP = 18;

function normalizeText(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizePath(value = "/") {
  try {
    const path = new URL(String(value), "https://altftool.com").pathname;
    if (path === "/") return path;
    return `/${path.replace(/^\/+|\/+$/g, "")}`;
  } catch {
    return "/";
  }
}

function canonicalizeSearchPath(path) {
  if (path === "/housingneeds") return "/bops/housingneeds";
  if (path.startsWith("/housingneeds/")) return `/bops${path}`;
  return path;
}

function joinKeywords(...values) {
  return values
    .flat(Infinity)
    .filter(Boolean)
    .join(" ");
}

function inferResultType(path) {
  if (path.startsWith("/tools/all/")) return "Tool";
  if (path.startsWith("/tools/")) return "Tool category";
  if (path.startsWith("/n8n/")) return "Workflow";
  if (path.startsWith("/blogs/")) return "Guide";
  if (path.startsWith("/extensions/")) return "Extension";
  if (path.startsWith("/apps/")) return "App";
  if (path.startsWith("/products/") || path.startsWith("/signals/")) return "Product";
  if (
    path.startsWith("/bops/") ||
    path.startsWith("/housingneeds/") ||
    path.startsWith("/homeserv/")
  ) {
    return "Business service";
  }
  if (
    path.startsWith("/deals/") ||
    path.startsWith("/exclusivedeals/") ||
    path.startsWith("/buysmart/") ||
    path.startsWith("/brandrating/")
  ) {
    return "Shopping";
  }
  if (path.startsWith("/labs/") || path.startsWith("/altfgame/")) return "Experience";
  return GROUPS_BY_ID.get(getSiteMapGroupId(path))?.title || "Page";
}

function addMetadata(metadata, path, values = {}) {
  const normalizedPath = normalizePath(path);
  const current = metadata.get(normalizedPath) || {};
  metadata.set(normalizedPath, {
    ...current,
    ...values,
    keywords: joinKeywords(current.keywords, values.keywords),
  });
}

function createKnownMetadata() {
  const metadata = new Map();

  for (const route of Object.values(SITE_ROUTES)) {
    if (!route?.href || !route?.label) continue;
    addMetadata(metadata, route.href, {
      label: route.label,
      type: inferResultType(route.href),
      keywords: route.match,
    });
  }

  for (const route of [
    ...PRODUCT_SUITE_ROUTE_OPTIONS,
    ...EXPERIENCE_ROUTE_OPTIONS,
    ...TOOL_CATEGORY_ROUTE_OPTIONS,
  ]) {
    addMetadata(metadata, route.href, {
      label: route.label,
      type: inferResultType(route.href),
      keywords: [route.group, route.match],
    });
  }

  for (const [slug, tool] of Object.entries(toolMetaMap)) {
    addMetadata(metadata, `/tools/all/${slug}`, {
      label: tool.name || getDefaultRouteLabel(slug),
      description: tool.description,
      type: "Tool",
      keywords: [tool.category, tool.topics, slug],
    });
  }

  for (const suite of PRODUCT_SUITE_CATALOG) {
    addMetadata(metadata, `/products/${suite.slug}`, {
      label: suite.name,
      description: suite.description,
      type: "Product",
      keywords: [suite.eyebrow, suite.capabilities, suite.productId],
    });
  }

  for (const experience of EXPERIENCE_CATALOG) {
    addMetadata(metadata, experience.href, {
      label: experience.name,
      description: experience.description,
      type: "Experience",
      keywords: [experience.group, experience.tags],
    });
  }

  for (const signal of SIGNAL_CATALOG) {
    addMetadata(metadata, `/signals/${signal.slug}`, {
      label: signal.name,
      description: signal.summary,
      type: "Signal",
      keywords: [signal.query, signal.category, signal.actions],
    });
  }

  for (const workflow of getTrendingCards(200)) {
    addMetadata(metadata, `/n8n/${workflow.slug}`, {
      label: workflow.title,
      description: workflow.description,
      type: "Workflow",
      keywords: [
        workflow.author?.name,
        workflow.categories?.map((category) => category.name),
        workflow.nodes?.map((node) => node.name),
      ],
    });
  }

  for (const blog of getAllBlogs()) {
    if (!blog?.slug) continue;
    addMetadata(metadata, `/blogs/${blog.slug}`, {
      label: blog.heading || blog.title || getDefaultRouteLabel(blog.slug),
      description: blog.excerpt || blog.seoDescription,
      type: "Guide",
      keywords: [blog.category, blog.tags, blog.author],
    });
  }

  return metadata;
}

function createSearchEntry(path, metadata = {}) {
  const groupId = getSiteMapGroupId(path);
  const group = GROUPS_BY_ID.get(groupId);
  const label = metadata.label || getDefaultRouteLabel(path);
  const description =
    metadata.description ||
    `Open ${label} in ${group?.title || "AltFTool"}.`;
  const type = metadata.type || inferResultType(path);
  const searchable = normalizeText(
    joinKeywords(label, description, path, type, group?.title, metadata.keywords),
  );

  return {
    path,
    label,
    description,
    type,
    groupId,
    searchable,
    normalizedLabel: normalizeText(label),
    normalizedPath: normalizeText(path),
  };
}

async function buildGlobalSearchIndex() {
  const metadata = createKnownMetadata();
  const sitemapEntries = await getStaticSearchSitemapEntries();
  const paths = new Set(metadata.keys());

  for (const entry of sitemapEntries) {
    const path = canonicalizeSearchPath(normalizePath(entry?.url || entry));
    if (path !== "/search") paths.add(path);
  }

  return [...paths]
    .map((path) => createSearchEntry(path, metadata.get(path)))
    .sort((left, right) => left.label.localeCompare(right.label) || left.path.localeCompare(right.path));
}

const getGlobalSearchIndex = unstable_cache(
  buildGlobalSearchIndex,
  ["altftool-global-search-index-v3"],
  {
    revalidate: 3600,
    tags: ["altftool-global-search"],
  },
);

function scoreEntry(entry, normalizedQuery, tokens) {
  if (!tokens.every((token) => entry.searchable.includes(token))) return null;

  let score = 0;
  const pathSegments = entry.path.split("/").filter(Boolean);
  const lastSegment = normalizeText(pathSegments.at(-1) || "");

  if (entry.normalizedLabel === normalizedQuery || lastSegment === normalizedQuery) score += 240;
  if (entry.normalizedLabel.startsWith(normalizedQuery)) score += 150;
  if (lastSegment.startsWith(normalizedQuery)) score += 125;
  if (entry.normalizedLabel.includes(normalizedQuery)) score += 100;
  if (entry.normalizedPath.includes(normalizedQuery)) score += 75;
  if (entry.searchable.includes(normalizedQuery)) score += 45;

  for (const token of tokens) {
    if (entry.normalizedLabel.split(" ").includes(token)) score += 32;
    else if (entry.normalizedLabel.includes(token)) score += 20;
    if (entry.normalizedPath.includes(token)) score += 12;
  }

  score -= Math.max(0, pathSegments.length - 2) * 2;
  return score;
}

export async function searchAltFTool(query) {
  const normalizedQuery = normalizeText(query).slice(0, 100);
  if (normalizedQuery.length < 2) return null;

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const index = await getGlobalSearchIndex();
  const matches = index
    .map((entry) => ({
      entry,
      score: scoreEntry(entry, normalizedQuery, tokens),
    }))
    .filter((result) => result.score !== null)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.entry.label.localeCompare(right.entry.label) ||
        left.entry.path.localeCompare(right.entry.path),
    );

  const matchesByGroup = new Map();
  for (const match of matches) {
    const bucket = matchesByGroup.get(match.entry.groupId) || [];
    bucket.push(match.entry);
    matchesByGroup.set(match.entry.groupId, bucket);
  }

  const groups = SITE_MAP_GROUPS.map((group) => {
    const items = matchesByGroup.get(group.id) || [];
    return {
      id: group.id,
      title: group.title,
      description: group.description,
      total: items.length,
      items: items.slice(0, RESULTS_PER_GROUP),
      hasMore: items.length > RESULTS_PER_GROUP,
    };
  }).filter((group) => group.total > 0);

  return {
    query: String(query).trim().slice(0, 100),
    total: matches.length,
    searchedRoutes: index.length,
    groups,
  };
}
