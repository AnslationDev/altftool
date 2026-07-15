import { getDomain, getDomainCategory, isHttp, normalizeUrl, isLikelyBroken, generateId, estimateMemory } from "./helpers";

export function parseSessionData(input, format = "auto") {
  let rawUrls = [];

  if (format === "auto" || format === "json") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        rawUrls = parsed.map((item) => {
          if (typeof item === "string") return item;
          if (item.url) return item.url;
          return "";
        }).filter(Boolean);
      } else if (parsed.tabs) {
        rawUrls = parsed.tabs.map((t) => t.url || t).filter(Boolean);
      } else if (parsed.urls) {
        rawUrls = parsed.urls.filter(Boolean);
      } else if (parsed.bookmarks) {
        rawUrls = extractBookmarkUrls(parsed.bookmarks);
      }
    } catch {}
  }

  if (rawUrls.length === 0 && (format === "auto" || format === "csv")) {
    rawUrls = input.split("\n").map((l) => l.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  }

  if (rawUrls.length === 0 && format === "auto") {
    rawUrls = input.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("http"));
  }

  const tabs = rawUrls.map((url, i) => {
    const domain = getDomain(url);
    return {
      id: generateId(),
      url,
      domain,
      title: extractTitle(url, i),
      category: getDomainCategory(domain),
      isHttps: isHttp(url),
      isBroken: isLikelyBroken(url),
      normalizedUrl: normalizeUrl(url),
      openOrder: i,
    };
  });

  const stats = computeStats(tabs);
  return { tabs, stats };
}

function extractTitle(url, index) {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/^\/|\/$/g, "").split("/").filter(Boolean);
    if (path.length > 0) {
      return path[path.length - 1].replace(/[-_]/g, " ").replace(/\.[a-z0-9]+$/i, "").replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return u.hostname.replace("www.", "");
  } catch {
    return `Tab ${index + 1}`;
  }
}

function extractBookmarkUrls(bookmarks) {
  const urls = [];
  function walk(node) {
    if (node.url) urls.push(node.url);
    if (node.children) node.children.forEach(walk);
    if (Array.isArray(node)) node.forEach(walk);
  }
  walk(bookmarks);
  return urls;
}

function computeStats(tabs) {
  const domains = {};
  const categories = {};
  const normalizedMap = {};
  const titleMap = {};

  tabs.forEach((tab) => {
    domains[tab.domain] = (domains[tab.domain] || 0) + 1;
    categories[tab.category] = (categories[tab.category] || 0) + 1;
    normalizedMap[tab.normalizedUrl] = (normalizedMap[tab.normalizedUrl] || 0) + 1;
    if (tab.title) {
      titleMap[tab.title.toLowerCase()] = (titleMap[tab.title.toLowerCase()] || 0) + 1;
    }
  });

  const duplicateUrls = tabs.filter((t) => normalizedMap[t.normalizedUrl] > 1);
  const duplicateTitles = tabs.filter((t) => t.title && titleMap[t.title.toLowerCase()] > 1);
  const brokenUrls = tabs.filter((t) => t.isBroken);
  const httpUrls = tabs.filter((t) => !t.isHttps);

  const topDomains = Object.entries(domains)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([domain, count]) => ({ domain, count }));

  const categoryBreakdown = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / tabs.length) * 100) }));

  const estimatedMemory = estimateMemory(tabs.map((t) => t.url));
  const healthScore = computeHealthScore(tabs, duplicateUrls.length, brokenUrls.length);
  const focusScore = computeFocusScore(categories);
  const clutterScore = computeClutterScore(duplicateUrls.length, tabs.length);

  return {
    totalTabs: tabs.length,
    uniqueDomains: Object.keys(domains).length,
    duplicateUrls: duplicateUrls.length,
    duplicateTitles: duplicateTitles.length,
    brokenUrls: brokenUrls.length,
    httpUrls: httpUrls.length,
    topDomains,
    categoryBreakdown,
    estimatedMemory,
    healthScore,
    focusScore,
    clutterScore,
  };
}

function computeHealthScore(tabs, duplicates, broken) {
  let score = 100;
  score -= duplicates * 5;
  score -= broken * 10;
  if (tabs.length > 50) score -= (tabs.length - 50) * 0.5;
  if (tabs.length > 100) score -= (tabs.length - 100) * 0.3;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function computeFocusScore(categories) {
  const productive = ["Development", "Productivity", "Education", "Research"];
  const distracting = ["Entertainment", "Social Media", "Shopping", "Gaming"];
  const total = Object.values(categories).reduce((a, b) => a + b, 0) || 1;
  const prodCount = Object.entries(categories)
    .filter(([cat]) => productive.includes(cat))
    .reduce((a, [, c]) => a + c, 0);
  const distCount = Object.entries(categories)
    .filter(([cat]) => distracting.includes(cat))
    .reduce((a, [, c]) => a + c, 0);
  return Math.round(((prodCount - distCount * 0.5) / total) * 50 + 50);
}

function computeClutterScore(duplicates, total) {
  if (total === 0) return 0;
  return Math.min(100, Math.round((duplicates / total) * 100));
}
