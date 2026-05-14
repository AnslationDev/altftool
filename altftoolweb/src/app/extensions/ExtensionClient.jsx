"use client";

import { useState, useMemo, useEffect } from "react";
import { useFirebaseExtensions } from "./hooks/useFirebaseExtensions"; // 👈 NEW
import ListingCard from "./components/ListingCard";
import Image from "next/image";
import { useAds } from "@/ads/AdsProvider";
import useDevice from "@/hooks/useDevice";
import { injectRandomAds } from "@/ads/adInjector";
import AdExtensionCard from "@/ads/layouts/extension/AdExtensionCard";
import DataStateNotice from "@/components/ui/DataStateNotice";

import {
  Image as ImageIcon,
  FileText, Video, Music, Calculator, RefreshCcw, PenLine, Bot,
  BarChart3, Receipt, Package, Lock, Globe, Smartphone, Laptop,
  Brain, BookOpen, Palette, Satellite, Search, LayoutGrid, Gamepad2,
  Puzzle, Sparkles, Zap, MessageSquare, GraduationCap, PenTool,
  Calendar, Code
} from "lucide-react";

/* ---------------- ICON SLIDER DATA ---------------- */
const icons = [
  { Icon: FileText, color: "text-blue-400" },
  { Icon: ImageIcon, color: "text-pink-400" },
  { Icon: Video, color: "text-purple-400" },
  { Icon: Music, color: "text-emerald-400" },
  { Icon: Calculator, color: "text-yellow-400" },
  { Icon: RefreshCcw, color: "text-cyan-400" },
  { Icon: PenLine, color: "text-orange-400" },
  { Icon: Bot, color: "text-indigo-400" },
  { Icon: BarChart3, color: "text-lime-400" },
  { Icon: Receipt, color: "text-rose-400" },
  { Icon: Package, color: "text-violet-400" },
  { Icon: Lock, color: "text-red-400" },
  { Icon: Globe, color: "text-sky-400" },
  { Icon: Smartphone, color: "text-fuchsia-400" },
  { Icon: Laptop, color: "text-teal-400" },
  { Icon: Brain, color: "text-amber-400" },
  { Icon: Zap, color: "text-green-400" },
  { Icon: BookOpen, color: "text-blue-300" },
  { Icon: Palette, color: "text-pink-300" },
  { Icon: Satellite, color: "text-purple-300" },
];

/* ---------------- ICON SLIDER COMPONENT ---------------- */
const IconSlider = ({ icons }) => {
  return (
    <div className="relative overflow-hidden py-4 sm:py-6" aria-hidden="true">
      <div className="altftool-marquee-track flex w-max">
        {[0, 1].map((group) => (
          <div key={group} className="flex shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4">
            {icons.map(({ Icon, color }, index) => (
              <div
                key={`${group}-${index}`}
                className="
                  flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[8px]
                  border border-white/10 bg-white/5 backdrop-blur
                  transition hover:scale-105 motion-reduce:transform-none
                  sm:h-14 sm:w-14
                "
              >
                <Icon className={`h-8 w-8 sm:h-10 sm:w-10 ${color}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ExtensionsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(18);

  const device = useDevice();

  // 🔥 Firebase — replaces getSortedExtensions()
  const {
    extensions: allExtensions,
    loading,
    error,
    refresh,
  } = useFirebaseExtensions();

  /* ---------------- SEARCH DEBOUNCE ---------------- */
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setVisibleCount(18);
  }, [selectedCategory, debouncedSearchQuery]);

  /* ---------------- FILTERING ---------------- */
  const filteredExtensions = useMemo(() => {
    let result = allExtensions;

    if (selectedCategory !== "All") {
      result = result.filter((e) => e.category === selectedCategory);
    }

    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.name?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [selectedCategory, debouncedSearchQuery, allExtensions]);

  /* ---------------- ADS ---------------- */
  const extensionAds = useAds({
    placement: "extensions_listing",
    layout: "extension_card",
    device,
  });

  const extensionsWithAds = useMemo(() => {
    const sliced = filteredExtensions.slice(0, visibleCount);
    return injectRandomAds(sliced, extensionAds, 4);
  }, [filteredExtensions, visibleCount, extensionAds]);

  /* ---------------- TOP CATEGORIES ---------------- */
  const topCategories = [
    { label: "Communication", icon: MessageSquare, realCat: "Productivity & Focus" },
    { label: "Education", icon: GraduationCap, realCat: "Text, Writing & Content" },
    { label: "Tools", icon: PenTool, realCat: "Utilities & Calculators" },
    { label: "Workflow & Planning", icon: Calendar, realCat: "Forms, Data & Automation" },
    { label: "Developer Tools", icon: Code, realCat: "File, Data & Formatter Tools" },
  ];

  return (
    <div className=" bg-[var(--background)] text-[var(--foreground)] ">

      <main className="pb-20">

        {/* HERO */}
        <div className="section animate-slide-up">
          <div className="relative w-full overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--muted)] py-10 text-center sm:py-12 md:py-16">
            <Image
              src="/extension/hero.jpg"
              alt="Soft blue abstract extension browser hero background"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center"
              quality={82}
              priority
            />

            <div className="absolute inset-0 bg-[var(--background)]/40 " />

            <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
              <h1 className="section-title">
                {selectedCategory === "All"
                  ? "Browser with Smart Extensions"
                  : `${selectedCategory} Extensions`}
              </h1>
              {selectedCategory === "All" && (
                <div className="w-full">
                  <IconSlider icons={icons} />
                </div>
              )}
              <p className="section-subtitle animate-fade-up">
                Explore high-quality extensions and themes for productivity and workflows.
              </p>
              <div className="relative mx-auto mt-6 max-w-2xl overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--card)] sm:mt-8">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--secondary-foreground)] sm:left-5">
                  <Search className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <input
                  type="text"
                  placeholder="Search extensions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full rounded-[8px] bg-transparent pl-12 pr-4 placeholder:text-[var(--input-placeholder)] transition focus:outline-none focus:ring-2 focus:ring-[var(--primary)] sm:h-14 sm:pl-16 sm:pr-6"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TOP CATEGORIES */}
        <div className="section">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ">
            {topCategories.map((cat) => (
              <button
                type="button"
                key={cat.label}
                onClick={() => setSelectedCategory(cat.realCat)}
                className={`flex h-20 items-center justify-between gap-3 rounded-[8px] border px-3 text-left transition hover:bg-[var(--card-hover)] sm:h-24 sm:px-4 ${
                  selectedCategory === cat.realCat
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--card)]"
                }`}
              >
                <span className="min-w-0 text-sm font-semibold leading-5 sm:text-base">{cat.label}</span>
                <cat.icon className="h-5 w-5 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* GRID */}
        <div className="section">
          {error ? (
            <DataStateNotice
              className="mb-6"
              title="Live extensions could not refresh"
              message="The extension catalog is temporarily using any cached content available on this device. Retry once the connection is stable."
              actionLabel="Retry"
              onAction={() => refresh()}
            />
          ) : null}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--muted)] animate-pulse">
                   <div className="h-40 bg-[var(--card)]/50 mb-4" />
                   <div className="px-6 space-y-3">
                      <div className="h-6 bg-[var(--card)]/80 rounded-lg w-3/4" />
                      <div className="h-4 bg-[var(--card)]/60 rounded-lg w-1/2" />
                   </div>
                </div>
              ))}
            </div>
          ) : extensionsWithAds.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
                {extensionsWithAds.map((item) => {
                  if (item.type === "ad-single") {
                    return <AdExtensionCard key={item.id} ad={item.ad} />;
                  }
                  const { slug, ...ext } = item;
                  return <ListingCard key={slug} slug={slug} extension={ext} />;
                })}
              </div>
              {visibleCount < filteredExtensions.length && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="rounded-[8px] border border-[var(--border)] px-8 py-3 font-semibold transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-[8px] border border-[var(--border)] bg-[var(--card)] px-4 py-14 text-center">
              <h3 className="text-lg font-semibold">No extensions found</h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Try another keyword or switch back to all categories.
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
