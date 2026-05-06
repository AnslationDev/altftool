"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ChevronDown, Wrench } from "lucide-react";
import Icon from "@/shared/ui/Icon";
import CTAButton from "@/shared/ui/CTAButton";
import { useAds } from "@/ads/AdsProvider";
import { injectAds } from "@/ads/adInjector";
import AdPairRow from "@/ads/layouts/tools/AdToolPairRow";
import CapabilitySlider from "../tools/CapabilitySlider";
import { usePathname, useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 10;

const slugify = (str) => String(str).toLowerCase().replace(/\s+/g, "-");
const formatLabel = (str) =>
  String(str).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

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

  // Filter tools based on category and search
  const filteredSlugs = useMemo(() => {
    const query = search.toLowerCase().trim();
    return slugs.filter((slug) => {
      const tool = meta[slug];
      if (!tool) return false;

      const toolCategories = Array.isArray(tool.category)
        ? tool.category.map((c) => slugify(c))
        : [slugify(tool.category || "")];

      const matchesCategory = categoryname === "all" || toolCategories.includes(categoryname);
      const matchesSearch =
        !query ||
        slug.replace(/-/g, " ").toLowerCase().includes(query) ||
        tool.name?.toLowerCase().includes(query);

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
    <div className="">
      {/* HERO */}
      <div className="text-center lg:py-16 py-4 px-6">
        <h1 className="heading max-w-7xl mx-auto animate-fade-up">Think Less Do More</h1>
        <p className="description max-w-2xl mx-auto mt-4 animate-fade-up">
          Explore powerful micro tools to convert, calculate, analyze, and get
          things done faster — all in one place.
        </p>
        <CapabilitySlider />
        <div className="mt-8 max-w-xl mx-auto animate-fade-up  ">
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[var(--card)]  placeholder:text-(--input-placeholder) border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 min-h-[70vh]">
        {/* SIDEBAR */}
        <aside className="">
          <h4 className="font-semibold text-xl mb-4">Categories</h4>
          {/* // mobile view */}
          <div className=" block  lg:hidden">
            {/* Button */}
            <button
              onClick={() => setOpen(!open)}
              className="w-full flex justify-between px-4 py-3 text-(--muted-foreground) rounded-lg border border-(--border) text-left bg-white "
            >
              {selectedLabel} {<ChevronDown size={20} className={open ? "rotate-180" : "rotate-0"} />}
            </button>
            {/* Dropdown */}
            {open && (
              <div className=" w-full  bg-white ">
                {categories.map((cat) => (
                  <div
                    key={cat}
                    onClick={() => handleSelect(cat)}
                    className="px-4 py-2  cursor-pointer border mt-2 border-(--border) rounded-lg "
                  >
                    {formatLabel(cat)}
                  </div>
                ))}
              </div>
            )}
          </div>


          <ul className=" hidden lg:block space-y-2">
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => handleCategoryClick(cat)}
                  className={`w-full text-left px-4 py-2 cursor-pointer rounded-lg text-sm transition ${categoryname === slugify(cat)
                    ? "bg-[var(--color-primary)] text-white shadow"
                    : "hover:bg-[var(--card-hover-bg)] hover:shadow-xl text-[var(--muted-foreground)]"
                    }`}
                >
                  {formatLabel(cat)}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* TOOLS */}
        <section className="flex flex-col items-center justify-start">
          <h2 className="flex items-center gap-3 text-2xl font-semibold mb-6 self-start">
            Explore Tools
            <span className="px-2.5 py-0.5 text-sm font-semibold rounded-full bg-[var(--card)] text-[var(--color-muted-foreground)]">
              {filteredSlugs.length}
            </span>
          </h2>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {visibleSlugs.map((item) => {
                  if (item?.type === "ad-pair") {
                    return (
                      <div key={item.id} className="md:col-span-2">
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
                      className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)/40] hover:bg-[var(--card-hover-bg)]"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl ">
                          <Icon
                            name={tool.icon ?? "wrench"}
                            className={`h-6 w-6 ${tool.iconColor ?? "text-[var(--muted-foreground)]"}`}
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold leading-tight group-hover:text-[var(--color-primary)] transition">
                            {name}
                          </h3>
                          <p className="mt-1 text-sm text-[var(--color-muted-foreground)] line-clamp-2">
                            {tool.description || "No description available."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-4">
                        {tool.category && (
                          <div className="flex flex-wrap gap-1.5 max-h-[52px] overflow-hidden">
                            {(Array.isArray(tool.category) ? tool.category : [tool.category]).map(
                              (cat) => (
                                <span
                                  key={cat}
                                  className="text-[11px] font-medium rounded-full px-2.5 py-1  text-[var(--color-muted-foreground)] "
                                >
                                  {cat}
                                </span>
                              )
                            )}
                          </div>
                        )}

                        <span className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-muted-foreground)] group-hover:text-[var(--color-primary)]">
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
