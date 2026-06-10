"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, ListFilter, Store } from "lucide-react";
import FilterRow from "@/app/buysmart/components/FilterRow";
import FilterWithAdCard from "@/app/buysmart/components/FilterWithAd";

import { useAds } from "@/ads/AdsProvider";
import useDevice from "@/hooks/useDevice";
import {
  useBuySmartAnalytics,
  useBuySmartCategories,
} from "@/app/buysmart/hooks/useBuySmartLiveData";
import {
  normalizeBuySmartCategory,
  sortBuySmartByTrust,
} from "@altftool/core/buysmart";
import SideAd from "@/ads/layouts/buy/SideAd";

function getItemTime(item) {
  if (item.createdAt?.seconds) return item.createdAt.seconds * 1000;
  const parsed = new Date(item.createdAt || 0).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function getTimeThreshold(sortBy) {
  const day = 24 * 60 * 60 * 1000;
  if (sortBy === "today") return Date.now() - day;
  if (sortBy === "7days") return Date.now() - day * 7;
  if (sortBy === "1month") return Date.now() - day * 30;
  return 0;
}

export default function CategoriesAZ({ selectedLetter = "All", filteredCategory }) {
  const { counters } = useBuySmartAnalytics();
  const { items: categoriesData } = useBuySmartCategories();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("trusted");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const device = useDevice();

  useEffect(() => {
    const updateItems = () => {
      const width = window.innerWidth;

      if (width >= 1536) setItemsPerPage(10);
      else if (width >= 1024) setItemsPerPage(8);
      else if (width >= 768) setItemsPerPage(6);
      else setItemsPerPage(4);
    };

    updateItems();
    window.addEventListener("resize", updateItems);

    return () => window.removeEventListener("resize", updateItems);
  }, []);

  const categoryDropDown = useMemo(
    () => (categoriesData || []).map((item) => item.category).filter(Boolean),
    [categoriesData],
  );

  const searchResults = useMemo(
    () =>
      Array.isArray(filteredCategory)
        ? filteredCategory.map(normalizeBuySmartCategory)
        : null,
    [filteredCategory],
  );

  const filteredData = useMemo(() => {
    let data = (searchResults?.length ? [...searchResults] : [...(categoriesData || [])])
      .map(normalizeBuySmartCategory);

    if (!searchResults && typeof filteredCategory === "string" && filteredCategory.trim()) {
      const categorySearch = filteredCategory.trim().toLowerCase();
      data = data.filter(
        (item) =>
          (item.category || "")
            .toLowerCase()
            .includes(categorySearch),
      );
    }

    if (selectedCategory !== "All") {
      data = data.filter((item) => item.category === selectedCategory);
    }

    const threshold = getTimeThreshold(sortBy);
    if (threshold) {
      data = data.filter((item) => getItemTime(item) >= threshold);
    }

    if (sortBy === "trusted") {
      data = sortBuySmartByTrust(data, counters);
    } else if (["newest", "today", "7days", "1month"].includes(sortBy)) {
      data.sort((a, b) => getItemTime(b) - getItemTime(a));
    }

    return data;
  }, [categoriesData, counters, filteredCategory, searchResults, selectedCategory, sortBy]);

  const flatData = useMemo(() => {
    if (selectedLetter === "All") return filteredData;

    return filteredData.filter((item) => {
      const firstChar = item.title?.[0]?.toUpperCase();
      const letter = /[A-Z]/.test(firstChar) ? firstChar : "0-9";
      return letter === selectedLetter;
    });
  }, [filteredData, selectedLetter]);
  const totalPages = Math.ceil(flatData.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, Math.max(totalPages, 1));

  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return flatData.slice(start, start + itemsPerPage);
  }, [flatData, safeCurrentPage, itemsPerPage]);
  const startItem = flatData.length === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(safeCurrentPage * itemsPerPage, flatData.length);

  const rightAd = useAds({
    placement: "buysmart_right",
    layout: "sidebar",
    device,
  })[0];

  return (
    <div className="flex justify-center gap-8 bg-[var(--background)] text-[var(--foreground)]">
      <section className="flex-1 py-6">
        <div className="mb-4 flex flex-col gap-4 rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)] lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--muted) px-3 py-1 text-xs font-semibold text-(--muted-foreground)">
              <Store className="h-3.5 w-3.5 text-(--primary)" />
              {flatData.length} brands ready
            </div>
            <h2 className="mt-3 text-xl font-bold leading-tight text-(--foreground) sm:text-2xl">
              Browse verified BuySmart stores
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
              Filter by category, jump by alphabet, and open focused store pages with deal details.
            </p>
          </div>
          <Link
            href="/buysmart/view-all"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-3 text-sm font-bold text-(--foreground) transition hover:border-(--primary)"
          >
            Full directory
            <ArrowRight className="h-4 w-4 text-(--primary)" />
          </Link>
        </div>

        <div className="mb-5 rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-3 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">
            <ListFilter className="h-4 w-4 text-(--primary)" />
            Refine results
          </div>
          <FilterRow
            selectedCategory={selectedCategory}
            setSelectedCategory={(category) => {
              setCurrentPage(1);
              setSelectedCategory(category);
            }}
            sortBy={sortBy}
            setSortBy={(value) => {
              setCurrentPage(1);
              setSortBy(value);
            }}
            categoryDropDown={categoryDropDown}
          />
        </div>
        <div className="flex gap-6">
          <FilterWithAdCard displayedData={paginatedData} counters={counters} />
          <div className="hidden flex-shrink-0 xl:block">
            <SideAd ad={rightAd?.content} />
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-5 lg:gap-7">
            <button
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="flex h-10 w-auto items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 text-(--foreground) shadow-[var(--anslation-ds-shadow-sm)] transition hover:border-(--primary) disabled:opacity-50 sm:h-12 sm:w-[135px] sm:px-5"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Previous</span>
            </button>
            <div className="flex items-center gap-3 sm:gap-4">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => {
                if (page === 1 || page === totalPages || (page >= safeCurrentPage - 2 && page <= safeCurrentPage + 3)) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`flex items-center justify-center h-[28px] sm:h-[40px] md:h-[45px] min-w-[16px] sm:min-w-[20px] md:min-w-[24px] ${safeCurrentPage === page ? " text-(--foreground)" : "text-(--muted-foreground)"
                        }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === safeCurrentPage - 2 || page === safeCurrentPage + 2) {
                  return <span key={page} className="text-(--muted-foreground)">...</span>;
                }
                return null;
              })}
            </div>
            <button
              disabled={totalPages === 0 || safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))}
              className="flex h-10 w-auto items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 text-(--foreground) shadow-[var(--anslation-ds-shadow-sm)] transition hover:border-(--primary) disabled:opacity-50 sm:h-12 sm:w-[135px] sm:px-5"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center">
            <p className="text-sm leading-tight text-(--muted-foreground) sm:text-base md:leading-snug">
              Showing {startItem}–{endItem} of {flatData.length} brands
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
