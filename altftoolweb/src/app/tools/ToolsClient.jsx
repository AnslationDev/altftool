"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ChevronDown, Layers3, Search, Sparkles, Wrench } from "lucide-react";
import Icon from "@/shared/ui/Icon";
import CTAButton from "@/shared/ui/CTAButton";
import { useAds } from "@/ads/AdsProvider";
import { injectAds } from "@/ads/adInjector";
import AdPairRow from "@/ads/layouts/tools/AdToolPairRow";
import { usePathname, useRouter } from "next/navigation";

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
  "text-diff-tool",
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

const getInitialCategory = (category) => {
  if (category) return slugify(category);
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

export default function ToolsClient({ meta = {}, category }) {
  const slugs = useMemo(() => Object.keys(meta), [meta]);
  const [search, setSearch] = useState("");
  const device = useSyncExternalStore(
    subscribeToDevice,
    getDeviceSnapshot,
    () => "desktop"
  );
  const router = useRouter();
  const pathname = usePathname();
  const [selectedCategory, setSelectedCategory] = useState(() =>
    getInitialCategory(category)
  );
  const categoryname = category ? slugify(category) : selectedCategory;

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
  const categoryCount = Math.max(categories.length - 1, 0);
  const featuredCategories = useMemo(() => {
    const preferred = ["all", "converter", "developer", "pdf", "media", "data", "web", "calculator", "network", "image"];
    return preferred.filter((item) => categories.includes(item));
  }, [categories]);
  const quickTools = useMemo(
    () => QUICK_TOOL_SLUGS.filter((slug) => meta[slug]).map((slug) => [slug, meta[slug]]),
    [meta]
  );

  // Filter tools based on category and search
  const filteredSlugs = useMemo(() => {
    const query = search.toLowerCase().trim();
    return slugs.filter((slug) => {
      const tool = meta[slug];
      if (!tool) return false;

      const toolCategories = getToolCategories(tool);

      const matchesCategory = categoryname === "all" || toolCategories.includes(categoryname);
      const matchesSearch =
        !query ||
        slug.replace(/-/g, " ").toLowerCase().includes(query) ||
        tool.name?.toLowerCase().includes(query) ||
        tool.description?.toLowerCase().includes(query) ||
        toolCategories.some((cat) => cat.includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [slugs, meta, categoryname, search]);

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const visibleSlugs = injectAds(
    filteredSlugs.slice(0, visibleCount),
    toolAds,
    toolAds[0]?.interval || 6
  );

  const hasMore = visibleCount < filteredSlugs.length;

  // Handle category click (updates URL without reload)
  const handleCategoryClick = (cat) => {
    const nextCategory = cat === "all" ? "all" : slugify(cat);

    if (category) {
      router.replace(nextCategory === "all" ? "/tools" : `/tools/${nextCategory}`, {
        scroll: false,
      });
      setSelectedCategory(nextCategory);
      setVisibleCount(ITEMS_PER_PAGE);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (nextCategory === "all") params.delete("category");
    else params.set("category", nextCategory);

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    setSelectedCategory(nextCategory);
    setVisibleCount(ITEMS_PER_PAGE); // reset pagination
  };

  const [open, setOpen] = useState(false);
  const selectedLabel = categoryname ? formatLabel(categoryname) : "Select Category";

  const handleSelect = (cat) => {
    handleCategoryClick(cat);
    setOpen(false);
  };




  return (
    <div className="bg-(--background)">
      {/* DIRECTORY HEADER */}
      <div className="border-b border-(--border) bg-(--card)">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-(--primary)">
                <Sparkles className="h-3.5 w-3.5" />
                ToolFK-style microtool directory
              </div>
              <h1 className="text-3xl font-semibold tracking-normal text-(--foreground) sm:text-4xl">
                All Online Tools
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
                Fast converters, developer helpers, PDF tools, media utilities, and browser-safe microtools in one compact workspace.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:w-[360px]">
              {[
                ["Tools", slugs.length],
                ["Categories", categoryCount],
                ["Showing", filteredSlugs.length],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[8px] border border-(--border) bg-(--background) px-3 py-2 text-center">
                  <p className="text-lg font-semibold text-(--foreground)">{value}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
              <input
                type="text"
                placeholder="Select directly or search tools, converters, code utilities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-[8px] border border-[var(--border)] bg-[var(--background)] px-11 text-sm placeholder:text-(--input-placeholder) transition focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {featuredCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={`rounded-[7px] border px-3 py-2 text-xs font-semibold transition ${
                    categoryname === slugify(cat)
                      ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                      : "border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)"
                  }`}
                >
                  {formatLabel(cat)}
                </button>
              ))}
            </div>
          </div>

          {quickTools.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {quickTools.map(([slug, tool]) => (
                <Link
                  key={slug}
                  href={`/tools/all/${slug}`}
                  className="rounded-[7px] border border-(--border) bg-(--background) px-3 py-1.5 text-xs font-semibold text-(--muted-foreground) transition hover:border-(--primary) hover:text-(--foreground)"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-5 pb-20 sm:px-6 lg:grid-cols-[230px_1fr] lg:px-8">
        {/* SIDEBAR */}
        <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Layers3 className="h-4 w-4 text-(--primary)" />
            Categories
          </h4>
          {/* // mobile view */}
          <div className=" block  lg:hidden">
            {/* Button */}
            <button
              onClick={() => setOpen(!open)}
              className="w-full flex justify-between px-4 py-3 text-(--muted-foreground) rounded-[8px] border border-(--border) text-left bg-(--card)"
            >
              {selectedLabel} {<ChevronDown size={20} className={open ? "rotate-180" : "rotate-0"} />}
            </button>
            {/* Dropdown */}
            {open && (
              <div className="mt-2 w-full rounded-[8px] border border-(--border) bg-(--card) p-2">
                {categoryStats.map((cat) => (
                  <div
                    key={cat.slug}
                    onClick={() => handleSelect(cat.slug)}
                    className="flex cursor-pointer items-center justify-between rounded-[7px] px-3 py-2 text-sm text-(--muted-foreground) hover:bg-(--background)"
                  >
                    <span>{cat.label}</span>
                    <span className="text-xs">{cat.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>


          <ul className="hidden space-y-1 lg:block">
            {categoryStats.map((cat) => (
              <li key={cat.slug}>
                <button
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-[7px] px-3 py-2 text-left text-sm transition ${categoryname === cat.slug
                    ? "bg-[var(--color-primary)] text-white shadow"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--card-hover-bg)] hover:text-(--foreground)"
                    }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-xs ${categoryname === cat.slug ? "text-white/80" : "text-(--muted-foreground)"}`}>
                    {cat.count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* TOOLS */}
        <section className="flex flex-col items-center justify-start">
          <div className="mb-4 flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-3 text-xl font-semibold">
              Explore Tools
              <span className="rounded-full bg-[var(--card)] px-2.5 py-0.5 text-sm font-semibold text-[var(--color-muted-foreground)]">
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
              <h3 className="text-xl font-semibold mb-2">No tools found</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Try a different keyword or category.
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

                  return (
                    <Link
                      key={slug}
                      href={`/tools/${categoryname}/${slug}`}
                      className="group relative flex min-h-[136px] flex-col justify-between rounded-[8px] border border-[var(--border)] bg-[var(--card)] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-[var(--card-hover-bg)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)/40]"
                    >
                      <div className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] bg-(--muted)">
                          <Icon
                            name={tool.icon ?? "wrench"}
                            className={`h-5 w-5 ${tool.iconColor ?? "text-[var(--muted-foreground)]"}`}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold leading-tight transition group-hover:text-[var(--color-primary)]">
                            {name}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-muted-foreground)]">
                            {tool.description || "No description available."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        {tool.category && (
                          <div className="flex max-h-[28px] flex-wrap gap-1 overflow-hidden">
                            {(Array.isArray(tool.category) ? tool.category : [tool.category]).map(
                              (cat) => (
                                <span
                                  key={cat}
                                  className="rounded-full bg-(--background) px-2 py-1 text-[10px] font-medium text-[var(--color-muted-foreground)]"
                                >
                                  {cat}
                                </span>
                              )
                            )}
                          </div>
                        )}

                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--color-muted-foreground)] group-hover:text-[var(--color-primary)]">
                          Open
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                      </div>
                    </Link>
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
