"use client";

import "./tools-directory.css";
import Link from "next/link";
import { startTransition, useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  Code2,
  FileText,
  Grid2X2,
  History,
  Image as ImageIcon,
  Layers3,
  LockKeyhole,
  MessageCircleQuestion,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  UsersRound,
  Wrench,
} from "lucide-react";
import Icon from "@/shared/ui/Icon";
import CTAButton from "@/shared/ui/CTAButton";
import { useAds } from "@/ads/AdsProvider";
import { injectAds } from "@/ads/adInjector";
import AdPairRow from "@/ads/layouts/tools/AdToolPairRow";
import { usePathname, useRouter } from "next/navigation";
import { TOP_PRIORITY_TOOL_SLUGS } from "@altftool/core/toolHealth";
import {
  FAVORITES_STORAGE_KEY,
  RECENT_LIMIT,
  RECENT_TOOLS_STORAGE_KEY,
  TOOL_STORAGE_EVENT,
  readStoredSlugs,
  writeStoredSlugs,
} from "./toolStorage";
import { prefetchToolModule } from "./toolLoaderResolver";

const ITEMS_PER_PAGE = 24;
let fullCatalogPromise;

const loadFullToolCatalog = () => {
  if (!fullCatalogPromise) {
    fullCatalogPromise = import("@/platform/registry/toolMetaMap").then(
      (module) => module.toolMetaMap,
    );
  }
  return fullCatalogPromise;
};

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
  game: ["games", "play", "arcade", "puzzle", "fun", "entertainment"],
  games: ["game", "play", "arcade", "puzzle", "fun", "entertainment"],
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
const HERO_POPULAR_CUSTOM_LINKS = [
  { href: "/altfloveimg", label: "Image Studio" },
  { href: "/altflovepdf", label: "PDF Toolkit" },
];
const HERO_POPULAR_TOOL_SLUGS = ["json-editor", "text-to-base64", "pdf-to-base64", "curl-to-code-converter"];
const SEARCH_PLACEHOLDER_PHRASES = [
  "Search tools by name, category, or use case...",
  "Try JSON editor...",
  "Find PDF tools...",
  "Search developer utilities...",
];
const GENERIC_SEARCH_TOKENS = new Set([
  "a",
  "an",
  "and",
  "for",
  "free",
  "in",
  "not",
  "of",
  "on",
  "online",
  "or",
  "the",
  "to",
  "tool",
  "tools",
  "with",
]);
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

const TRUST_ITEMS = [
  {
    title: "Trusted & Safe",
    description: "All tools are tested and verified for security.",
    icon: ShieldCheck,
  },
  {
    title: "Always Updated",
    description: "We keep our directory fresh and accurate.",
    icon: RefreshCw,
  },
  {
    title: "Free to Use",
    description: "Most tools are completely free to use.",
    icon: Tag,
  },
  {
    title: "Community Driven",
    description: "Built for creators by productivity lovers.",
    icon: UsersRound,
  },
];

const CATEGORY_ICON_MAP = {
  "ai-tools": Sparkles,
  business: BadgeCheck,
  calculators: Calculator,
  converters: RefreshCw,
  "design-color": Sparkles,
  developer: Code2,
  "education-science": FileText,
  "finance-calculators": Calculator,
  fun: Play,
  games: Play,
  generators: Wrench,
  "health-calculators": Calculator,
  "health-fitness": BadgeCheck,
  "image-photo": ImageIcon,
  lifestyle: Tag,
  "marketing-social": Tag,
  other: Grid2X2,
  "pdf-documents": FileText,
  productivity: BadgeCheck,
  "security-privacy": LockKeyhole,
  "text-writing": FileText,
  "video-audio": Play,
};

const FEATURED_CATEGORY_CARDS = [
  {
    key: "ai",
    slug: "ai-tools",
    title: "AI Essentials",
    description: "Top AI tools to save time and work smarter",
    icon: Sparkles,
  },
  {
    key: "pdf",
    slug: "pdf-documents",
    title: "PDF Essentials",
    description: "All the tools you need for PDF files",
    icon: FileText,
  },
  {
    key: "developer",
    slug: "developer",
    title: "Developer Hub",
    description: "Essential tools for developers",
    icon: Code2,
  },
  {
    key: "creator",
    slug: "image-photo",
    fallbackSlugs: ["video-audio", "design-color"],
    title: "Content Creator",
    description: "Create, edit and publish content",
    icon: ImageIcon,
  },
  {
    key: "marketing",
    slug: "marketing-social",
    fallbackSlugs: ["business"],
    title: "Marketing Tools",
    description: "Grow your brand and audience",
    icon: Tag,
  },
];

const slugify = (str) =>
  String(str)
    .trim()
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
const useClientLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const getSearchTokens = (query) => {
  const base = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token && !GENERIC_SEARCH_TOKENS.has(token));
  return [...new Set(base.flatMap((token) => [token, ...(SEARCH_ALIASES[token] || [])]))];
};

const getSearchScore = (slug, tool, tokens, rawQuery) => {
  if (!tokens.length) return 1;

  const name = tool.name?.toLowerCase() || "";
  const description = tool.description?.toLowerCase() || "";
  const categories = getToolCategories(tool);
  const topics = (tool.topics || []).map((topic) => String(topic).toLowerCase());
  const slugText = slug.replace(/-/g, " ");
  const haystack = `${slugText} ${name} ${description} ${categories.join(" ")} ${topics.join(" ")}`;
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
    if (topics.some((topic) => topic.includes(token))) score += 10;
    if (description.includes(token)) score += 6;
    if (haystack.includes(token)) score += 2;
  });

  return score;
};

const getInitialCategory = (category, initialCategory = "all") => {
  const categorySlug = category ? slugify(category) : "";
  if (categorySlug && categorySlug !== "all") return categorySlug;

  return slugify(initialCategory || "all") || "all";
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
    <div className="space-y-4 rounded-[8px] border border-[var(--color-border)] p-6">
      <div className="flex gap-4 items-center">
        <Skeleton className="h-12 w-12 rounded-[7px]" />
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

export default function ToolsClient({
  meta: initialMeta = {},
  catalogTotal: initialCatalogTotal,
  category,
  initialCategory = "all",
  initialSearch = "",
  initialViewMode = "all",
}) {
  const [fullMeta, setFullMeta] = useState(null);
  const meta = fullMeta || initialMeta;
  const slugs = useMemo(() => Object.keys(meta), [meta]);
  const catalogTotal = Math.max(
    Number(initialCatalogTotal) || 0,
    slugs.length,
  );
  const catalogReady = slugs.length >= catalogTotal;
  const ensureCatalog = useCallback(() => {
    if (catalogReady) return Promise.resolve(meta);

    return loadFullToolCatalog().then((catalog) => {
      startTransition(() => setFullMeta(catalog));
      return catalog;
    });
  }, [catalogReady, meta]);
  const [search, setSearch] = useState(initialSearch);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState(SEARCH_PLACEHOLDER_PHRASES[0]);
  const deferredSearch = useDeferredValue(search);
  const [hydrated, setHydrated] = useState(false);
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
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(() =>
    getInitialCategory(category, initialCategory)
  );
  const initialCategoryKeyRef = useRef(`${category || ""}:${initialCategory || ""}`);
  const initialSearchRef = useRef(initialSearch);
  const initialViewModeRef = useRef(initialViewMode);
  const searchInputRef = useRef(null);
  const categoryInputRef = useRef(null);
  const contentGridRef = useRef(null);
  const categorySectionRef = useRef(null);
  const resultsSectionRef = useRef(null);
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
  const prioritySet = useMemo(() => new Set(TOP_PRIORITY_TOOL_SLUGS), []);

  useEffect(() => {
    if (catalogReady) return undefined;

    const schedule =
      window.requestIdleCallback ||
      ((callback) => window.setTimeout(callback, 1200));
    const cancel = window.cancelIdleCallback || window.clearTimeout;
    const handle = schedule(() => {
      ensureCatalog().catch(() => {
        /* the initial subset remains fully usable if the chunk cannot load */
      });
    }, { timeout: 3000 });

    return () => cancel(handle);
  }, [catalogReady, ensureCatalog]);

  useClientLayoutEffect(() => {
    const nextKey = `${category || ""}:${initialCategory || ""}`;
    if (initialCategoryKeyRef.current === nextKey) return;
    initialCategoryKeyRef.current = nextKey;
    setSelectedCategory(getInitialCategory(category, initialCategory));
  }, [category, initialCategory]);

  useClientLayoutEffect(() => {
    if (initialSearchRef.current === initialSearch) return;
    initialSearchRef.current = initialSearch;
    setSearch(initialSearch);
  }, [initialSearch]);

  useClientLayoutEffect(() => {
    if (initialViewModeRef.current === initialViewMode) return;
    initialViewModeRef.current = initialViewMode;
    setViewMode(VIEW_MODES.some((mode) => mode.id === initialViewMode) ? initialViewMode : "all");
  }, [initialViewMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const queryCategory = params.get("category");
    const querySearch = params.get("search");
    const queryView = params.get("view");

    if (!category && queryCategory) setSelectedCategory(slugify(queryCategory) || "all");
    if (querySearch !== null) setSearch(querySearch);
    if (queryView && VIEW_MODES.some((mode) => mode.id === queryView)) {
      setViewMode(queryView);
    }
  }, [category]);

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
    const counts = new Map([["all", catalogTotal]]);

    Object.values(meta).forEach((tool) => {
      getToolCategories(tool).forEach((categoryName) => {
        const slug = slugify(categoryName);
        counts.set(slug, (counts.get(slug) || 0) + 1);
      });
    });

    return categories.map((cat) => {
      const slug = slugify(cat);
      return { slug, label: formatLabel(cat), count: counts.get(slug) || 0 };
    });
  }, [catalogTotal, categories, meta]);
  const filteredCategoryStats = useMemo(() => {
    const query = categoryFilter.trim().toLowerCase();
    if (!query) return categoryStats;
    return categoryStats.filter((cat) => cat.label.toLowerCase().includes(query) || cat.slug.includes(query));
  }, [categoryFilter, categoryStats]);
  const featuredCategories = useMemo(() => {
    const used = new Set();
    const availableSlugs = new Set(categories.map((item) => slugify(item)));

    return FEATURED_CATEGORY_CARDS.map((card) => {
      const slug = [card.slug, ...(card.fallbackSlugs || [])].find((item) => availableSlugs.has(item));
      if (!slug || used.has(slug)) return null;
      used.add(slug);
      return { ...card, slug };
    }).filter(Boolean);
  }, [categories]);
  const categoryStatsBySlug = useMemo(() => new Map(categoryStats.map((cat) => [cat.slug, cat])), [categoryStats]);
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
    all: catalogTotal,
    favorites: favoriteSlugs.filter((slug) => meta[slug]).length,
    recent: recentSlugs.filter((slug) => meta[slug]).length,
  }), [catalogTotal, favoriteSlugs, meta, recentSlugs]);

  // Filter tools based on category and search
  const filteredSlugs = useMemo(() => {
    const query = deferredSearch.toLowerCase().trim();
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
  }, [categoryname, deferredSearch, favoriteSet, meta, recentSet, recentSlugs, slugs, viewMode]);

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const visibleSlugs = useMemo(() => {
    const visible = filteredSlugs.slice(0, visibleCount);

    if (viewMode === "all" && !deferredSearch.trim()) {
      return injectAds(visible, toolAds, {
        interval: toolAds[0]?.interval || 6,
        mode: "pair",
      });
    }

    return visible;
  }, [deferredSearch, filteredSlugs, toolAds, visibleCount, viewMode]);

  const hasMore = visibleCount < filteredSlugs.length;
  const isSearchMode = Boolean(search.trim());
  const searchResultSlugs = useMemo(() => filteredSlugs.filter((slug) => meta[slug]).slice(0, 12), [filteredSlugs, meta]);
  const isFiltering = search !== deferredSearch;
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

  const getToolHref = (slug, nextCategory = categoryname) => {
    const normalizedCategory = slugify(nextCategory || "all");
    return `/tools/${normalizedCategory === "all" ? "all" : normalizedCategory}/${slug}`;
  };

  const hoverTimersRef = useRef({});

  const prefetchDirectoryTool = (slug) => {
    if (!meta[slug]) return;
    prefetchToolModule(slug);
  };

  const handleToolMouseEnter = (slug) => {
    if (hoverTimersRef.current[slug]) clearTimeout(hoverTimersRef.current[slug]);
    hoverTimersRef.current[slug] = setTimeout(() => {
      prefetchDirectoryTool(slug);
      delete hoverTimersRef.current[slug];
    }, 120);
  };

  const handleToolMouseLeave = (slug) => {
    if (hoverTimersRef.current[slug]) {
      clearTimeout(hoverTimersRef.current[slug]);
      delete hoverTimersRef.current[slug];
    }
  };

  const setSearchFilter = (value) => {
    if (value && !catalogReady) {
      ensureCatalog().catch(() => {});
    }
    setSearch(value);
    setVisibleCount(ITEMS_PER_PAGE);
    replaceDirectoryUrl({ nextSearch: value });
  };

  const setViewFilter = (mode) => {
    if (mode !== "all" && !catalogReady) {
      ensureCatalog().catch(() => {});
    }
    setViewMode(mode);
    setVisibleCount(ITEMS_PER_PAGE);
    replaceDirectoryUrl({ nextViewMode: mode });
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setViewMode("all");
    setCategoryFilter("");
    setVisibleCount(ITEMS_PER_PAGE);

    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/tools/all");
      return;
    }

    router.push("/tools/all");
  };

  const getFirstResultForSearch = (rawSearch = search) => {
    const query = rawSearch.toLowerCase().trim();
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

    const exactSlug = slugify(query);
    const exactMatch = ranked.find((item) => item.slug === exactSlug);
    if (exactMatch) return exactMatch.slug;

    return ranked.sort((a, b) => b.score - a.score || a.index - b.index)[0]?.slug || null;
  };

  const openFirstSearchResult = (rawSearch = search) => {
    const targetSlug = getFirstResultForSearch(rawSearch);
    if (!targetSlug) return;
    rememberTool(targetSlug);
    prefetchDirectoryTool(targetSlug);
    router.push(getToolHref(targetSlug, "all"));
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      openFirstSearchResult(event.currentTarget.value);
      return;
    }

    if (event.key === "Escape" && search.trim()) {
      event.preventDefault();
      setSearchFilter("");
    }
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

  const scrollToDirectoryContent = () => {
    if (typeof window === "undefined") return;

    window.requestAnimationFrame(() => {
      const target = contentGridRef.current || categorySectionRef.current || resultsSectionRef.current;
      if (!target) return;

      const offset = 96;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
    });
  };

  // Handle category click without route navigation.
  const handleCategoryClick = (cat) => {
    if (!catalogReady) {
      ensureCatalog().catch(() => {});
    }
    const nextCategory = cat === "all" ? "all" : slugify(cat);
    setSelectedCategory(nextCategory);
    setVisibleCount(ITEMS_PER_PAGE);
    scrollToDirectoryContent();
  };

  const toolsHeading =
    viewMode === "favorites" ? "Saved Tools" : viewMode === "recent" ? "Recent Tools" : "Explore Tools";

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const value = searchInputRef.current?.value || "";
    if (value && value !== search) {
      setSearchFilter(value);
    }
  }, [search]);

  useEffect(() => {
    const fallbackPlaceholder = SEARCH_PLACEHOLDER_PHRASES[0];

    if (search.trim()) {
      setAnimatedPlaceholder(fallbackPlaceholder);
      return undefined;
    }

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnimatedPlaceholder(fallbackPlaceholder);
      return undefined;
    }

    let phraseIndex = 0;
    let characterIndex = 0;
    let isDeleting = false;
    let timeoutId;

    const tick = () => {
      const phrase = SEARCH_PLACEHOLDER_PHRASES[phraseIndex];
      setAnimatedPlaceholder(`${phrase.slice(0, characterIndex)}|`);

      let delay = 58;
      if (!isDeleting && characterIndex < phrase.length) {
        characterIndex += 1;
      } else if (!isDeleting) {
        isDeleting = true;
        delay = 1200;
      } else if (characterIndex > 0) {
        characterIndex -= 1;
        delay = 30;
      } else {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % SEARCH_PLACEHOLDER_PHRASES.length;
        delay = 260;
      }

      timeoutId = window.setTimeout(tick, delay);
    };

    timeoutId = window.setTimeout(tick, 240);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    const value = categoryInputRef.current?.value || "";
    if (value && value !== categoryFilter) {
      setCategoryFilter(value);
    }
  }, [categoryFilter]);




  return (
    <div
      data-testid="tools-directory"
      data-hydrated={hydrated ? "true" : "false"}
      className="route-page-shell tools-premium"
    >
      <div className="tools-shell">
        <section className="tools-hero">
          <div className="tools-hero-copy">
            <h1 className="route-title">
              Ready to find your perfect <span className="tp-accent-word">tool?</span>
            </h1>
            <p className="route-description">
              Search {Math.floor(catalogTotal / 50) * 50}+ trusted tools, utilities, and games built to help you work faster.
            </p>
            <div className="tools-search-row">
              <Search className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--tp-primary)]" />
              <input
                ref={searchInputRef}
                data-testid="tools-search-input"
                type="text"
                placeholder={animatedPlaceholder}
                value={search}
                onFocus={ensureCatalog}
                onChange={(e) => setSearchFilter(e.target.value)}
                onInput={(e) => setSearchFilter(e.currentTarget.value)}
                onKeyDown={handleSearchKeyDown}
                className="tools-search-input"
              />
            </div>
          </div>

        </section>

        {isSearchMode ? (
          <section className="tools-search-stage" aria-live="polite">
            {searchResultSlugs.length ? (
              <>
                <div className="tools-search-stage-header">
                  <span>{isFiltering ? "Searching" : "Search results"}</span>
                  <h2>
                    {searchResultSlugs.length} tools matching &ldquo;{search.trim()}&rdquo;
                  </h2>
                </div>
                <div className="tools-search-results-grid">
                  {searchResultSlugs.map((slug) => {
                    const tool = meta[slug];
                    const name = tool.name || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                    const categories = Array.isArray(tool.category) ? tool.category : [tool.category].filter(Boolean);
                    const href = getToolHref(slug, "all");

                    return (
                      <Link
                        key={slug}
                        href={href}
                        onClick={() => rememberTool(slug)}
                        onFocus={() => prefetchDirectoryTool(slug)}
                        onMouseEnter={() => handleToolMouseEnter(slug)}
                        onMouseLeave={() => handleToolMouseLeave(slug)}
                        className="tools-search-result-card"
                      >
                        <span className="tools-search-result-icon">
                          <Icon name={tool.icon ?? "wrench"} className={`h-5 w-5 ${tool.iconColor ?? ""}`} />
                        </span>
                        <span className="tools-search-result-copy">
                          <strong>{name}</strong>
                          <small>{tool.description || "Open this tool from the matching search results."}</small>
                          {categories.length ? (
                            <em>{categories.slice(0, 2).join(" / ")}</em>
                          ) : null}
                        </span>
                        <ArrowRight className="tools-search-result-arrow h-4 w-4" aria-hidden="true" />
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : (
                <div className="tools-search-empty-hero">
                  <div className="tools-search-empty-visual" aria-hidden="true">
                    <svg viewBox="0 0 220 220" role="img">
                      <path className="empty-handle" d="M142 142 191 191" />
                      <circle className="empty-lens-ring" cx="94" cy="94" r="58" />
                      <circle className="empty-lens-face" cx="94" cy="94" r="47" />
                      <path className="empty-shine" d="M71 61c12-9 29-13 45-9" />
                      <circle className="empty-eye" cx="77" cy="88" r="8" />
                      <circle className="empty-eye" cx="112" cy="88" r="8" />
                      <path className="empty-cheek" d="M62 112c6-3 12-3 18 0" />
                      <path className="empty-mouth" d="M82 124c8-9 17-9 25 0" />
                    </svg>
                  </div>
                <h2>We couldn&apos;t find anything for &ldquo;{search.trim()}&rdquo;.</h2>
                <p>Try a different keyword, category, file type, or use case.</p>
              </div>
            )}
          </section>
        ) : (
          <section className="tools-control-panel">
            <div className="tools-popular-searches">
              <span>Popular searches:</span>
              {HERO_POPULAR_CUSTOM_LINKS.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
              {HERO_POPULAR_TOOL_SLUGS.map((slug) => {
                const tool = meta[slug];
                if (!tool) return null;

                return (
                <Link
                  key={slug}
                  href={`/tools/all/${slug}`}
                  onClick={() => rememberTool(slug)}
                  onFocus={() => prefetchDirectoryTool(slug)}
                  onMouseEnter={() => handleToolMouseEnter(slug)}
                  onMouseLeave={() => handleToolMouseLeave(slug)}
                >
                  {tool.name}
                </Link>
                );
              })}
            </div>
          </section>
        )}

        {!isSearchMode && featuredCategories.length ? (
          <section className="tools-featured-section" aria-labelledby="tools-featured-heading">
            <div className="tools-section-heading">
              <div>
                <span>Featured</span>
                <h2 id="tools-featured-heading">Featured categories</h2>
              </div>
              <p>Jump into the most-used tool collections.</p>
            </div>
            <div className="tools-featured-grid">
              {featuredCategories.map((card, index) => {
                const categoryStat = categoryStatsBySlug.get(card.slug);
                const CategoryIcon = card.icon || CATEGORY_ICON_MAP[card.slug] || Grid2X2;
                const isActive = categoryname === card.slug;

                return (
                  <button
                    key={card.key}
                    type="button"
                    data-featured={card.key}
                    onClick={() => handleCategoryClick(card.slug)}
                    className={`${index === 0 ? "is-primary" : ""}${isActive ? " is-active" : ""}`}
                    aria-pressed={isActive}
                  >
                    {index === 0 ? (
                      <span className="tools-featured-badge">
                        <Star className="h-3 w-3" />
                        Featured
                      </span>
                    ) : null}
                    {index === 0 ? null : (
                      <span className="tools-featured-icon">
                        <CategoryIcon className="h-5 w-5" />
                      </span>
                    )}
                    <span className="tools-featured-copy">
                      <strong>{card.title}</strong>
                      <em>{card.description}</em>
                    </span>
                    <span className="tools-featured-divider" />
                    <span className="tools-featured-meta">
                      <small>{categoryStat?.count || 0} tools</small>
                      <span>Updated weekly</span>
                    </span>
                    <ArrowRight className="tools-featured-arrow h-4 w-4" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* CONTENT */}
        {!isSearchMode ? (
        <div ref={contentGridRef} className="tools-content-grid">
          {/* SIDEBAR */}
          <aside ref={categorySectionRef} className="tools-sidebar">
            <div className="tools-sidebar-card">
              <h4>
                <span>Categories</span>
              </h4>
              <div className="tools-category-search">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                <input
                  ref={categoryInputRef}
                  data-testid="tool-category-search"
                  value={categoryFilter}
                  onFocus={ensureCatalog}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  onInput={(e) => setCategoryFilter(e.currentTarget.value)}
                  placeholder="Search categories..."
                />
              </div>
              <ul>
                {filteredCategoryStats.length ? (
                  filteredCategoryStats.map((cat) => (
                    <li key={cat.slug}>
                      <button
                        type="button"
                        onClick={() => handleCategoryClick(cat.slug)}
                        className={categoryname === cat.slug ? "is-active" : ""}
                        aria-pressed={categoryname === cat.slug}
                      >
                        <span>
                          {(() => {
                            const CategoryIcon = CATEGORY_ICON_MAP[cat.slug] || Grid2X2;
                            return <CategoryIcon className="h-4 w-4" />;
                          })()}
                          {cat.label}
                        </span>
                        <small>{cat.count}</small>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="tools-empty-category">No categories match this filter.</li>
                )}
              </ul>
              <div className="request-tool-card">
                <strong>Can&apos;t find a tool?</strong>
                <p>Request a tool and we&apos;ll try to add it.</p>
                <button type="button">
                  Request a Tool
                  <MessageCircleQuestion className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>

          {/* TOOLS */}
          <section ref={resultsSectionRef} className="tools-results" aria-busy={isFiltering ? "true" : "false"}>
            <div className="tools-results-header">
              <h2>
                {toolsHeading}
                <span>{filteredSlugs.length}</span>
              </h2>
              <div>
                <p aria-live="polite">
                  {isFiltering
                    ? "Updating results..."
                    : `Showing ${Math.min(filteredSlugs.length, visibleCount)} of ${filteredSlugs.length}`}
                </p>
              </div>
            </div>

            {slugs.length === 0 ? (
              <ToolsGridSkeleton />
            ) : filteredSlugs.length === 0 ? (
              <div className="tools-empty-state">
                <div>
                  <Wrench className="h-6 w-6" />
                </div>
                <h3>
                  {viewMode === "favorites"
                    ? "No saved tools yet"
                    : viewMode === "recent"
                      ? "No recent tools yet"
                      : "No tools found"}
                </h3>
                <p>
                  {viewMode === "favorites"
                    ? "Save tools from the catalog to build a quick personal toolbox."
                    : viewMode === "recent"
                      ? "Open a tool once and it will appear here automatically."
                      : "Try a different keyword or category."}
                </p>
                <div>
                  {hasActiveFilters && (
                    <button type="button" onClick={clearAllFilters}>
                      Clear filters
                    </button>
                  )}
                  {POPULAR_SEARCHES.slice(0, 4).map((term) => (
                    <button key={term} type="button" onClick={() => setSearchFilter(term)}>
                      {formatLabel(term)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="tools-card-grid">
                  {visibleSlugs.map((item) => {
                    if (item?.type === "ad-pair") {
                      return (
                        <div key={item.id} className="tools-ad-row">
                          <AdPairRow
                            ads={item.ads}
                            pairIndex={item.pairIndex}
                            toolAds={toolAds}
                            categoryname={categoryname}
                          />
                        </div>
                      );
                    }

                    const slug = item;
                    const tool = meta[slug];
                    const name = tool.name || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                    const isFavorite = favoriteSet.has(slug);
                    const isPriority = prioritySet.has(slug);
                    const href = getToolHref(slug);

                    return (
                      <article
                        key={slug}
                        data-testid={`tool-card-${slug}`}
                        data-tool-slug={slug}
                        className="tool-card group"
                      >
                        <div className="tool-card-top">
                          <div className="tool-icon">
                            <Icon name={tool.icon ?? "wrench"} className={`h-6 w-6 ${tool.iconColor ?? ""}`} />
                          </div>

                          <Link
                            href={href}
                            onClick={() => rememberTool(slug)}
                            onFocus={() => prefetchDirectoryTool(slug)}
                            onMouseEnter={() => handleToolMouseEnter(slug)}
                            onMouseLeave={() => handleToolMouseLeave(slug)}
                            className="tool-card-title"
                          >
                            <h3>{name}</h3>
                            <p>{tool.description || "No description available."}</p>
                          </Link>
                          <button
                            type="button"
                            aria-pressed={isFavorite}
                            aria-label={`${isFavorite ? "Remove" : "Save"} ${name}`}
                            onClick={() => toggleFavorite(slug)}
                            className={`tool-save-button ${isFavorite ? "is-active" : ""}`}
                          >
                            <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                          </button>
                        </div>

                        <div className="tool-card-footer">
                          {tool.category && (
                            <div>
                              {isPriority ? (
                                <span className="verified-pill">
                                  <BadgeCheck className="h-3 w-3" />
                                  Verified
                                </span>
                              ) : null}
                              {(Array.isArray(tool.category) ? tool.category : [tool.category]).map((cat) => (
                                <span key={cat} className="tool-tag">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          )}

                          <Link
                            href={href}
                            onClick={() => rememberTool(slug)}
                            onFocus={() => prefetchDirectoryTool(slug)}
                            onMouseEnter={() => handleToolMouseEnter(slug)}
                            onMouseLeave={() => handleToolMouseLeave(slug)}
                            className="tool-open-link"
                          >
                            Open
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {hasMore && (
                  <div className="load-more-wrap">
                    <CTAButton
                      text="Load More Tools"
                      variant="outline"
                      onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                    />
                  </div>
                )}
              </>
            )}
          </section>
        </div>
        ) : null}

        {!isSearchMode ? (
        <section className="tools-trust-strip">
          {TRUST_ITEMS.map(({ title, description, icon: TrustIcon }) => (
            <div key={title}>
              <TrustIcon className="h-8 w-8" />
              <span>
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
            </div>
          ))}
        </section>
        ) : null}
      </div>
    </div>
  );
}
