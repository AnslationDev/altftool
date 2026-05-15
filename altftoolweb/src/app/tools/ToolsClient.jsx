"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  ChevronDown,
  Code2,
  FileText,
  Filter,
  History,
  Image as ImageIcon,
  Layers3,
  Search,
  Sparkles,
  Star,
  Wrench,
} from "lucide-react";
import Icon from "@/shared/ui/Icon";
import CTAButton from "@/shared/ui/CTAButton";
import { useAds } from "@/ads/AdsProvider";
import { injectAds } from "@/ads/adInjector";
import AdPairRow from "@/ads/layouts/tools/AdToolPairRow";
import { usePathname } from "next/navigation";
import { TOP_PRIORITY_TOOL_SLUGS } from "@altftool/core/toolHealth";
import {
  FAVORITES_STORAGE_KEY,
  RECENT_LIMIT,
  RECENT_TOOLS_STORAGE_KEY,
  TOOL_STORAGE_EVENT,
  readStoredSlugs,
  writeStoredSlugs,
} from "./toolStorage";

const ITEMS_PER_PAGE = 24;
const LABEL_OVERRIDES = {
  ai: "AI",
  api: "API",
  css: "CSS",
  csv: "CSV",
  devops: "DevOps",
  html: "HTML",
  js: "JS",
  json: "JSON",
  pdf: "PDF",
  sql: "SQL",
  svg: "SVG",
  url: "URL",
  yaml: "YAML",
};
const QUICK_TOOL_SLUGS = [
  "json-editor",
  "text-to-base64",
  "base64-to-image",
  "pdf-to-base64",
  "curl-to-code-converter",
  "yaml-formatter",
  "regex-tester",
  "qr-generator",
  "password-generator",
  "image-to-base64",
  "crontab-evaluator",
  "diff-checker",
];
const SEARCH_ALIASES = {
  code: ["developer", "json", "html", "css", "javascript", "sql", "regex"],
  compare: ["diff", "checker", "merge"],
  convert: ["converter", "encode", "decode", "base64", "format"],
  decode: ["decoder", "base64", "url", "jwt"],
  dev: ["developer", "api", "code", "json"],
  encode: ["encoder", "base64", "url", "escape"],
  image: ["photo", "png", "jpg", "jpeg", "svg", "compress", "resize"],
  schedule: ["cron", "crontab", "time"],
  secure: ["password", "hash", "encrypt", "jwt"],
  text: ["case", "diff", "markdown", "word", "character"],
};
const VIEW_MODES = [
  { id: "all", label: "All" },
  { id: "favorites", label: "Saved" },
  { id: "recent", label: "Recent" },
];
const POPULAR_SEARCHES = ["json", "base64", "pdf", "image", "regex", "seo", "password", "cron"];
const WORKFLOW_GROUPS = [
  {
    title: "Developer Desk",
    label: "Code, API, debug",
    icon: Code2,
    slugs: ["json-editor", "regex-tester", "jwt-decoder", "diff-checker"],
  },
  {
    title: "PDF & Base64",
    label: "Files, encode, decode",
    icon: FileText,
    slugs: ["pdf-merger", "pdf-split-tool", "pdf-to-base64", "base64-to-pdf"],
  },
  {
    title: "Image Studio",
    label: "Compress, crop, resize",
    icon: ImageIcon,
    slugs: ["image-compressor", "image-resizer", "image-cropper", "svg-to-image"],
  },
  {
    title: "Finance Quick Math",
    label: "GST, EMI, SIP",
    icon: Calculator,
    slugs: ["gst-calculator", "loan-emi-calculator", "sip-calculator", "percentage-calculator"],
  },
];

const slugify = (str) => String(str).toLowerCase().replace(/\s+/g, "-");
const formatLabel = (str) =>
  String(str)
    .replace(/[_-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => LABEL_OVERRIDES[part.toLowerCase()] || part.replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" ");

const getToolCategories = (tool) =>
  Array.isArray(tool?.category)
    ? tool.category.map((item) => slugify(item))
    : [slugify(tool?.category || "")].filter(Boolean);

const subscribeToToolStorage = (callback) => {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", callback);
  window.addEventListener(TOOL_STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(TOOL_STORAGE_EVENT, callback);
  };
};

const createStorageSnapshot = (key) => () => readStoredSlugs(key).join("\n");
const getFavoriteStorageSnapshot = createStorageSnapshot(FAVORITES_STORAGE_KEY);
const getRecentStorageSnapshot = createStorageSnapshot(RECENT_TOOLS_STORAGE_KEY);

const getSearchTokens = (query) => {
  const base = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  return [...new Set(base.flatMap((token) => [token, ...(SEARCH_ALIASES[token] || [])]))];
};

const getSearchScore = (slug, tool, tokens, rawQuery) => {
  if (!tokens.length) return 1;

  const name = tool.name?.toLowerCase() || "";
  const description = tool.description?.toLowerCase() || "";
  const categories = getToolCategories(tool);
  const slugText = slug.replace(/-/g, " ");
  const haystack = `${slugText} ${name} ${description} ${categories.join(" ")}`;
  let score = 0;

  if (name === rawQuery || slugText === rawQuery) score += 150;
  if (name.startsWith(rawQuery) || slugText.startsWith(rawQuery)) score += 80;
  if (name.includes(rawQuery)) score += 48;
  if (slugText.includes(rawQuery)) score += 44;

  tokens.forEach((token) => {
    if (name.split(/\s+/).includes(token)) score += 28;
    else if (name.includes(token)) score += 20;
    if (slugText.includes(token)) score += 18;
    if (categories.some((cat) => cat.includes(token))) score += 14;
    if (description.includes(token)) score += 6;
    if (haystack.includes(token)) score += 2;
  });

  return score;
};

const getInitialCategory = (category) => {
  const categorySlug = category ? slugify(category) : "";
  if (categorySlug && categorySlug !== "all") return categorySlug;
  if (typeof window === "undefined") return "all";

  return new URLSearchParams(window.location.search).get("category") || "all";
};

const getDeviceSnapshot = () =>
  typeof window !== "undefined" && window.innerWidth < 1024
    ? "mobile"
    : "desktop";

const subscribeToDevice = (callback) => {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
};

function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-md bg-[var(--color-muted)] ${className}`} />
  );
}

function ToolCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--color-border)] p-6 space-y-4">
      <div className="flex gap-4 items-center">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

function ToolsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <ToolCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function ToolsClient({ meta = {}, category, initialSearch = "", initialViewMode = "all" }) {
  const slugs = useMemo(() => Object.keys(meta), [meta]);
  const [search, setSearch] = useState(initialSearch);
  const [viewMode, setViewMode] = useState(() =>
    VIEW_MODES.some((mode) => mode.id === initialViewMode) ? initialViewMode : "all"
  );
  const [categoryFilter, setCategoryFilter] = useState("");
  const favoriteSnapshot = useSyncExternalStore(
    subscribeToToolStorage,
    getFavoriteStorageSnapshot,
    () => ""
  );
  const recentSnapshot = useSyncExternalStore(
    subscribeToToolStorage,
    getRecentStorageSnapshot,
    () => ""
  );
  const device = useSyncExternalStore(
    subscribeToDevice,
    getDeviceSnapshot,
    () => "desktop"
  );
  const pathname = usePathname();
  const [selectedCategory, setSelectedCategory] = useState(() =>
    getInitialCategory(category)
  );
  const categoryname = selectedCategory;
  const favoriteSlugs = useMemo(
    () => favoriteSnapshot.split("\n").filter((slug) => meta[slug]),
    [favoriteSnapshot, meta]
  );
  const recentSlugs = useMemo(
    () => recentSnapshot.split("\n").filter((slug) => meta[slug]),
    [meta, recentSnapshot]
  );
  const favoriteSet = useMemo(() => new Set(favoriteSlugs), [favoriteSlugs]);
  const recentSet = useMemo(() => new Set(recentSlugs), [recentSlugs]);

  useEffect(() => {
    setSelectedCategory(getInitialCategory(category));
  }, [category]);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setViewMode(VIEW_MODES.some((mode) => mode.id === initialViewMode) ? initialViewMode : "all");
  }, [initialViewMode]);

  // Ads setup
  const toolAds = useAds({ placement: "tools_listing", layout: "tool_card", device });

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(["all"]);
    Object.values(meta).forEach((tool) => {
      if (Array.isArray(tool.category)) {
        tool.category.forEach((c) => set.add(c.toLowerCase()));
      } else if (tool.category) {
        set.add(tool.category.toLowerCase());
      }
    });
    return Array.from(set);
  }, [meta]);
  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const slug = slugify(cat);
      const count =
        slug === "all"
          ? slugs.length
          : slugs.filter((toolSlug) => getToolCategories(meta[toolSlug]).includes(slug)).length;
      return { slug, label: formatLabel(cat), count };
    });
  }, [categories, meta, slugs]);
  const filteredCategoryStats = useMemo(() => {
    const query = categoryFilter.trim().toLowerCase();
    if (!query) return categoryStats;
    return categoryStats.filter((cat) => cat.label.toLowerCase().includes(query) || cat.slug.includes(query));
  }, [categoryFilter, categoryStats]);
  const categoryCount = Math.max(categories.length - 1, 0);
  const featuredCategories = useMemo(() => {
    const preferred = ["all", "converter", "developer", "pdf", "media", "data", "web", "calculator", "network", "image"];
    return preferred.filter((item) => categories.includes(item));
  }, [categories]);
  const quickTools = useMemo(
    () =>
      [...new Set([...QUICK_TOOL_SLUGS, ...TOP_PRIORITY_TOOL_SLUGS.slice(0, 6)])]
        .filter((slug) => meta[slug])
        .slice(0, 14)
        .map((slug) => [slug, meta[slug]]),
    [meta]
  );
  const workflowGroups = useMemo(
    () =>
      WORKFLOW_GROUPS.map((group) => ({
        ...group,
        tools: group.slugs.filter((slug) => meta[slug]).map((slug) => [slug, meta[slug]]),
      })).filter((group) => group.tools.length),
    [meta],
  );
  const viewModeStats = useMemo(() => ({
    all: slugs.length,
    favorites: favoriteSlugs.filter((slug) => meta[slug]).length,
    recent: recentSlugs.filter((slug) => meta[slug]).length,
  }), [favoriteSlugs, meta, recentSlugs, slugs.length]);

  // Filter tools based on category and search
  const filteredSlugs = useMemo(() => {
    const query = search.toLowerCase().trim();
    const tokens = getSearchTokens(query);
    const baseSlugs = viewMode === "recent" ? recentSlugs.filter((slug) => meta[slug]) : slugs;
    const ranked = [];

    baseSlugs.forEach((slug, index) => {
      const tool = meta[slug];
      if (!tool) return;

      const toolCategories = getToolCategories(tool);
      const matchesCategory = categoryname === "all" || toolCategories.includes(categoryname);
      const matchesCollection =
        viewMode === "all" ||
        (viewMode === "favorites" && favoriteSet.has(slug)) ||
        (viewMode === "recent" && recentSet.has(slug));
      const score = getSearchScore(slug, tool, tokens, query);

      if (matchesCategory && matchesCollection && (!tokens.length || score > 0)) {
        ranked.push({ slug, score, index });
      }
    });

    if (!tokens.length && viewMode === "recent") return ranked.map((item) => item.slug);
    if (!tokens.length) return ranked.sort((a, b) => a.index - b.index).map((item) => item.slug);

    return ranked.sort((a, b) => b.score - a.score || a.index - b.index).map((item) => item.slug);
  }, [categoryname, favoriteSet, meta, recentSet, recentSlugs, search, slugs, viewMode]);

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const visibleSlugs =
    viewMode === "all" && !search.trim()
      ? injectAds(
          filteredSlugs.slice(0, visibleCount),
          toolAds,
          toolAds[0]?.interval || 6
        )
      : filteredSlugs.slice(0, visibleCount);

  const hasMore = visibleCount < filteredSlugs.length;
  const searchSuggestions = useMemo(() => {
    if (!search.trim()) return [];

    return filteredSlugs.slice(0, 6).map((slug) => {
      const tool = meta[slug];
      const categories = Array.isArray(tool?.category) ? tool.category : [tool?.category].filter(Boolean);
      return {
        slug,
        name: tool?.name || formatLabel(slug),
        category: categories[0] || "Tool",
      };
    });
  }, [filteredSlugs, meta, search]);
  const hasActiveFilters = Boolean(search.trim()) || categoryname !== "all" || viewMode !== "all";

  const getDirectoryHref = ({
    nextCategory = categoryname,
    nextSearch = search,
    nextViewMode = viewMode,
  } = {}) => {
    const normalizedCategory = slugify(nextCategory || "all");
    const normalizedView = VIEW_MODES.some((mode) => mode.id === nextViewMode) ? nextViewMode : "all";
    const params = new URLSearchParams();
    const trimmedSearch = nextSearch.trim();

    if (trimmedSearch) params.set("search", trimmedSearch);
    if (normalizedView !== "all") params.set("view", normalizedView);

    let targetPath = pathname;
    if (category) {
      targetPath = `/tools/${normalizedCategory === "all" ? "all" : normalizedCategory}`;
    } else if (normalizedCategory !== "all") {
      params.set("category", normalizedCategory);
    }

    const query = params.toString();
    return query ? `${targetPath}?${query}` : targetPath;
  };

  const replaceDirectoryUrl = (nextState = {}) => {
    if (typeof window === "undefined") return;
    window.history.replaceState(null, "", getDirectoryHref(nextState));
  };

  const setSearchFilter = (value) => {
    setSearch(value);
    setVisibleCount(ITEMS_PER_PAGE);
    replaceDirectoryUrl({ nextSearch: value });
  };

  const setViewFilter = (mode) => {
    setViewMode(mode);
    setVisibleCount(ITEMS_PER_PAGE);
    replaceDirectoryUrl({ nextViewMode: mode });
  };

  const clearFilters = () => {
    setSearch("");
    setViewMode("all");
    setSelectedCategory("all");
    setCategoryFilter("");
    setVisibleCount(ITEMS_PER_PAGE);
    replaceDirectoryUrl({ nextCategory: "all", nextSearch: "", nextViewMode: "all" });
  };

  const rememberTool = (slug) => {
    const next = [slug, ...recentSlugs.filter((item) => item !== slug)]
      .filter((item) => meta[item])
      .slice(0, RECENT_LIMIT);
    writeStoredSlugs(RECENT_TOOLS_STORAGE_KEY, next);
  };

  const toggleFavorite = (slug) => {
    const next = favoriteSlugs.includes(slug)
      ? favoriteSlugs.filter((item) => item !== slug)
      : [slug, ...favoriteSlugs].filter((item) => meta[item]);
    writeStoredSlugs(FAVORITES_STORAGE_KEY, next);
  };

  // Handle category click (updates URL without reload)
  const handleCategoryClick = (cat) => {
    const nextCategory = cat === "all" ? "all" : slugify(cat);
    setSelectedCategory(nextCategory);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const [open, setOpen] = useState(false);
  const selectedLabel = categoryname ? formatLabel(categoryname) : "Select Category";

  const handleSelect = (cat) => {
    handleCategoryClick(cat);
    setOpen(false);
  };
  const toolsHeading =
    viewMode === "favorites" ? "Saved Tools" : viewMode === "recent" ? "Recent Tools" : "Explore Tools";




  return (
    <div className="min-h-screen bg-(--background)">
      {/* DIRECTORY HEADER */}
      <div className="border-b border-(--border) bg-[color-mix(in_srgb,var(--card)_92%,var(--background))]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--background) px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-(--primary)">
                <Sparkles className="h-3.5 w-3.5" />
                ToolFK-style microtool directory
              </div>
              <h1 className="text-3xl font-semibold leading-tight tracking-normal text-(--foreground) sm:text-4xl">
                All Online Tools
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
                Fast converters, developer helpers, PDF tools, media utilities, and browser-safe microtools in one compact workspace.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:w-[390px]">
              {[
                ["Tools", slugs.length],
                ["Categories", categoryCount],
                ["Showing", filteredSlugs.length],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[8px] border border-(--border) bg-(--background) px-3 py-3 text-center shadow-[var(--anslation-ds-shadow-sm)]">
                  <p className="text-xl font-semibold text-(--foreground)">{value}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--primary)" />
              <input
                data-testid="tools-search-input"
                type="text"
                placeholder="Select directly or search tools, converters, code utilities..."
                value={search}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="h-[52px] w-full rounded-[8px] border border-[var(--border)] bg-[var(--background)] px-11 text-sm text-(--foreground) shadow-[var(--anslation-ds-shadow-sm)] placeholder:text-(--input-placeholder) transition focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_24%,transparent)]"
              />
            </div>
            {search.trim() ? (
              <div data-testid="tool-search-suggestions" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {searchSuggestions.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/tools/all/${item.slug}`}
                    onClick={() => rememberTool(item.slug)}
                    className="flex items-center justify-between gap-3 rounded-[7px] border border-(--border) bg-(--background) px-3 py-2.5 text-left text-xs transition hover:border-(--primary) hover:bg-(--card) hover:text-(--foreground)"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-(--foreground)">{item.name}</span>
                      <span className="block truncate text-[11px] text-(--muted-foreground)">{item.category}</span>
                    </span>
                    <span className="shrink-0 text-(--muted-foreground)">Open</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">Popular</span>
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSearchFilter(term)}
                    className="rounded-[7px] border border-(--border) bg-(--background) px-2.5 py-1.5 text-xs font-semibold text-(--muted-foreground) transition hover:border-(--primary) hover:bg-(--card) hover:text-(--foreground)"
                  >
                    {formatLabel(term)}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {VIEW_MODES.map((mode) => {
                const IconComponent = mode.id === "favorites" ? Star : mode.id === "recent" ? History : Sparkles;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setViewFilter(mode.id)}
                    className={`inline-flex items-center gap-2 rounded-[7px] border px-3 py-2 text-xs font-semibold transition ${
                      viewMode === mode.id
                        ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                        : "border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary) hover:bg-(--card) hover:text-(--foreground)"
                    }`}
                  >
                    <IconComponent className="h-3.5 w-3.5" />
                    {mode.label}
                    <span className={viewMode === mode.id ? "text-white/80" : "text-(--muted-foreground)"}>
                      {viewModeStats[mode.id]}
                    </span>
                  </button>
                );
              })}
              {hasActiveFilters ? (
                <Link
                  href="/tools/all"
                  data-testid="clear-tool-filters"
                  onClick={clearFilters}
                  className="rounded-[7px] border border-(--border) bg-(--background) px-3 py-2 text-xs font-semibold text-(--muted-foreground) transition hover:border-(--primary) hover:bg-(--card) hover:text-(--foreground)"
                >
                  Clear
                </Link>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {featuredCategories.map((cat) => (
                <Link
                  key={cat}
                  href={getDirectoryHref({ nextCategory: cat })}
                  onClick={() => handleCategoryClick(cat)}
                  className={`rounded-[7px] border px-3 py-2 text-xs font-semibold transition ${
                    categoryname === slugify(cat)
                      ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                      : "border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary) hover:bg-(--card) hover:text-(--foreground)"
                  }`}
                >
                  {formatLabel(cat)}
                </Link>
              ))}
            </div>
          </div>

          {quickTools.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {quickTools.map(([slug, tool]) => (
                <Link
                  key={slug}
                  href={`/tools/all/${slug}`}
                  onClick={() => rememberTool(slug)}
                  className="rounded-[7px] border border-(--border) bg-(--background) px-3 py-1.5 text-xs font-semibold text-(--muted-foreground) transition hover:border-(--primary) hover:bg-(--card) hover:text-(--foreground)"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          )}

          {workflowGroups.length > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {workflowGroups.map(({ title, label, icon: GroupIcon, tools }) => {
                const firstToolSlug = tools[0][0];

                return (
                  <div
                    key={title}
                    className="rounded-[8px] border border-(--border) bg-(--background) p-3 shadow-[var(--anslation-ds-shadow-sm)] transition hover:border-(--primary)"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[7px] bg-(--muted) text-(--primary)">
                        <GroupIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-(--foreground)">{title}</p>
                        <p className="mt-1 text-xs text-(--muted-foreground)">{label}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {tools.slice(0, 3).map(([slug, tool]) => (
                        <Link
                          key={slug}
                          href={`/tools/all/${slug}`}
                          onClick={() => rememberTool(slug)}
                          className="rounded-[6px] border border-(--border) bg-(--card) px-2 py-1 text-[11px] font-semibold text-(--muted-foreground) transition hover:border-(--primary) hover:text-(--foreground)"
                        >
                          {tool.name}
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/tools/all/${firstToolSlug}`}
                      onClick={() => rememberTool(firstToolSlug)}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-(--primary)"
                    >
                      Start
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 pb-20 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        {/* SIDEBAR */}
        <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto">
          <div className="rounded-[8px] border border-(--border) bg-[color-mix(in_srgb,var(--card)_86%,var(--background))] p-3 shadow-[var(--anslation-ds-shadow-sm)]">
          <h4 className="mb-3 flex items-center justify-between gap-2 text-sm font-semibold text-(--foreground)">
            <span className="inline-flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-(--primary)" />
              Categories
            </span>
            <Filter className="h-3.5 w-3.5 text-(--muted-foreground)" />
          </h4>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-(--muted-foreground)" />
            <input
              data-testid="tool-category-search"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="Filter categories"
              className="h-10 w-full rounded-[8px] border border-(--border) bg-(--background) px-9 text-xs text-(--foreground) outline-none transition placeholder:text-(--muted-foreground) focus:border-(--primary) focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_18%,transparent)]"
            />
          </div>
          {/* // mobile view */}
          <div className=" block  lg:hidden">
            {/* Button */}
            <button
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              className="flex w-full justify-between rounded-[8px] border border-(--border) bg-(--background) px-4 py-3 text-left text-(--muted-foreground)"
            >
              {selectedLabel} {<ChevronDown size={20} className={open ? "rotate-180" : "rotate-0"} />}
            </button>
            {/* Dropdown */}
            {open && (
              <div className="mt-2 max-h-[360px] w-full overflow-auto rounded-[8px] border border-(--border) bg-(--background) p-2">
                {filteredCategoryStats.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={getDirectoryHref({ nextCategory: cat.slug })}
                    onClick={() => handleSelect(cat.slug)}
                    className={`flex cursor-pointer items-center justify-between rounded-[7px] px-3 py-2 text-sm transition ${
                      categoryname === cat.slug
                        ? "bg-(--primary) text-(--primary-foreground)"
                        : "text-(--muted-foreground) hover:bg-(--card) hover:text-(--foreground)"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-xs">{cat.count}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>


          <ul className="hidden space-y-1 lg:block">
            {filteredCategoryStats.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={getDirectoryHref({ nextCategory: cat.slug })}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-[7px] px-3 py-2 text-left text-sm transition ${categoryname === cat.slug
                    ? "bg-[var(--color-primary)] text-(--primary-foreground) shadow-[var(--anslation-ds-shadow-sm)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--background)] hover:text-(--foreground)"
                    }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-xs ${categoryname === cat.slug ? "text-white/80" : "text-(--muted-foreground)"}`}>
                    {cat.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          </div>
        </aside>

        {/* TOOLS */}
        <section className="flex flex-col items-center justify-start">
          <div className="mb-4 flex w-full flex-col gap-2 border-b border-(--border) pb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-3 text-xl font-semibold">
              {toolsHeading}
              <span className="rounded-full border border-(--border) bg-[var(--card)] px-2.5 py-0.5 text-sm font-semibold text-[var(--color-muted-foreground)]">
                {filteredSlugs.length}
              </span>
            </h2>
            <p className="text-sm text-(--muted-foreground)">
              Showing {Math.min(filteredSlugs.length, visibleCount)} of {filteredSlugs.length}
            </p>
          </div>

          {slugs.length === 0 ? (
            <ToolsGridSkeleton />
          ) : filteredSlugs.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[var(--color-muted)] flex items-center justify-center">
                <Wrench className="h-6 w-6 text-[var(--color-muted-foreground)]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {viewMode === "favorites" ? "No saved tools yet" : viewMode === "recent" ? "No recent tools yet" : "No tools found"}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                {viewMode === "favorites"
                  ? "Save tools from the catalog to build a quick personal toolbox."
                  : viewMode === "recent"
                    ? "Open a tool once and it will appear here automatically."
                    : "Try a different keyword or category."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {visibleSlugs.map((item) => {
                  if (item?.type === "ad-pair") {
                    return (
                      <div key={item.id} className="sm:col-span-2 xl:col-span-3">
                        <AdPairRow ads={item.ads} pairIndex={item.pairIndex} toolAds={toolAds} categoryname={categoryname} />
                      </div>
                    );
                  }

                  const slug = item;
                  const tool = meta[slug];
                  const name =
                    tool.name ||
                    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                  const isFavorite = favoriteSet.has(slug);
                  const href = `/tools/${categoryname}/${slug}`;

                  return (
                    <article
                      key={slug}
                      className="group relative flex min-h-[156px] flex-col justify-between rounded-[8px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--card-hover-bg)_72%,var(--card))] hover:shadow-[var(--anslation-ds-shadow-md)] focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--primary)_24%,transparent)]"
                    >
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[7px] border border-(--border) bg-(--muted)">
                          <Icon
                            name={tool.icon ?? "wrench"}
                            className={`h-5 w-5 ${tool.iconColor ?? "text-[var(--muted-foreground)]"}`}
                          />
                        </div>

                        <Link
                          href={href}
                          onClick={() => rememberTool(slug)}
                          className="min-w-0 flex-1 focus:outline-none"
                        >
                          <h3 className="truncate text-[15px] font-semibold leading-tight transition group-hover:text-[var(--color-primary)]">
                            {name}
                          </h3>
                          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--color-muted-foreground)]">
                            {tool.description || "No description available."}
                          </p>
                        </Link>
                        <button
                          type="button"
                          aria-pressed={isFavorite}
                          aria-label={`${isFavorite ? "Remove" : "Save"} ${name}`}
                          onClick={() => toggleFavorite(slug)}
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] border transition ${
                            isFavorite
                              ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                              : "border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)"
                          }`}
                        >
                          <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                        </button>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3">
                        {tool.category && (
                          <div className="flex max-h-[28px] flex-wrap gap-1 overflow-hidden">
                            {(Array.isArray(tool.category) ? tool.category : [tool.category]).map(
                              (cat) => (
                                <span
                                  key={cat}
                                  className="rounded-full border border-(--border) bg-(--background) px-2 py-1 text-[10px] font-medium text-[var(--color-muted-foreground)]"
                                >
                                  {cat}
                                </span>
                              )
                            )}
                          </div>
                        )}

                        <Link
                          href={href}
                          onClick={() => rememberTool(slug)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-[6px] px-1.5 py-1 text-xs font-semibold text-[var(--color-muted-foreground)] transition group-hover:bg-(--background) group-hover:text-[var(--color-primary)]"
                        >
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Open
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <CTAButton
                    text="Load More"
                    variant="outline"
                    onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                  />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
