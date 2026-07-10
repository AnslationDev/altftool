"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Gift,
  ListFilter,
} from "lucide-react";
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
      <section className="flex-1 py-0">
        <div className="mb-6 text-center">
          <div className="section-header buy-smart-section-header-plain">
            <h2 className="section-title">
              Browse Verified <span>BuySmart Stores</span>
            </h2>
            <p className="section-subtitle mx-auto mt-3 max-w-2xl">
              Handpicked brands offering the best deals and trusted shopping experience.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {[
                { icon: BadgeCheck, label: "Verified & Trusted" },
                { icon: CircleDollarSign, label: "Best Prices Guaranteed" },
                { icon: Gift, label: "Exclusive Offers" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="buy-smart-trust-badge inline-flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-bold sm:text-sm"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="buy-smart-filter-bar mb-6 flex flex-col gap-4 rounded-[var(--anslation-ds-radius-lg)] border p-3 shadow-[var(--anslation-ds-shadow-sm)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">
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

        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="buy-smart-page-nav flex h-10 w-auto items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] px-3 text-sm font-bold transition disabled:opacity-50 sm:h-11 sm:w-[124px] sm:px-5"
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
                      className={`buy-smart-page-number flex h-10 min-w-10 items-center justify-center rounded-[var(--anslation-ds-radius)] px-3 text-sm font-bold transition ${safeCurrentPage === page ? "is-active" : ""
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
              className="buy-smart-page-nav flex h-10 w-auto items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] px-3 text-sm font-bold transition disabled:opacity-50 sm:h-11 sm:w-[124px] sm:px-5"
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
