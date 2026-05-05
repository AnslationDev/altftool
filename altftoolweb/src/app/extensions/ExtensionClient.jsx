"use client";

import { useState, useMemo, useEffect } from "react";
import { useFirebaseExtensions } from "./hooks/useFirebaseExtensions"; // 👈 NEW
import ListingCard from "./components/ListingCard";
import Image from "next/image";
import { useAds } from "@/ads/AdsProvider";
import useDevice from "@/hooks/useDevice";
import { injectRandomAds } from "@/ads/adInjector";
import AdExtensionCard from "@/ads/layouts/extension/AdExtensionCard";

import {
  Image as ImageIcon,
  FileText, Video, Music, Calculator, RefreshCcw, PenLine, Bot,
  BarChart3, Receipt, Package, Lock, Globe, Smartphone, Laptop,
  Brain, BookOpen, Palette, Satellite, Search, LayoutGrid, Gamepad2,
  Puzzle, Sparkles, Zap, MessageSquare, GraduationCap, PenTool,
  Calendar, Code
} from "lucide-react";

import { motion } from "framer-motion";

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
const IconSlider = ({ icons }) => (
  <div className="overflow-hidden relative py-6">
    <motion.div
      className="flex gap-4"
      animate={{ x: ["0%", "-50%"] }}
      transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
    >
      {icons.concat(icons).map(({ Icon, color }, index) => (
        <div
          key={index}
          className="
            flex-shrink-0 w-14 h-14 rounded-xl bg-white/5
            border border-white/10 backdrop-blur
            flex items-center justify-center
            hover:scale-105 transition
          "
        >
          <Icon className={`w-10 h-10 ${color}`} />
        </div>
      ))}
    </motion.div>
  </div>
);

export default function ExtensionsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(18);

  const device = useDevice();

  // 🔥 Firebase — replaces getSortedExtensions()
  const { extensions: allExtensions, loading } = useFirebaseExtensions();

  /* ---------------- SEARCH DEBOUNCE ---------------- */
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

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
          <div className="relative w-full py-16 md:py-25 rounded-[40px] overflow-hidden bg-[var(--muted)] border border-[var(--border)] text-center">
            <Image
              src="/extension/hero.png"
              alt="Hero background"
              fill
              className="object-cover object-center"
              priority
            />

            <div className="absolute inset-0 bg-[var(--background)]/40 " />

            <div className="relative z-10 max-w-4xl mx-auto">
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
              <div className="max-w-2xl mx-auto relative border  border-[var(--border)] rounded-full  mt-8">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--secondary-foreground)] group ">
                  <Search className="w-6 h-6" />
                </div>
                <input
                  type="text"
                  placeholder="Search extensions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-16 pr-6 rounded-full bg-[var(--card)]  placeholder:text-[var(--input-placeholder)] focus:ring-2 focus:ring-[var(--primary)]  transition focus:outline-none "
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
                key={cat.label}
                onClick={() => setSelectedCategory(cat.realCat)}
                className="h-24 animate-slide-right rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] flex items-center justify-between px-4"
              >
                <span>{cat.label}</span>
                <cat.icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>

        {/* GRID */}
        <div className="section">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 rounded-[32px] bg-[var(--muted)] animate-pulse border border-[var(--border)] overflow-hidden">
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
                    className="px-8 py-3 rounded-full border border-[var(--border)]"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <h3>No extensions found</h3>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}