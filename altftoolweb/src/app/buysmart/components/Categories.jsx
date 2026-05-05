"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FilterRow from "@/app/buysmart/components/FilterRow";
import FilterWithAdCard from "@/app/buysmart/components/FilterWithAd";

import { useAds } from "@/ads/AdsProvider";
import useDevice from "@/hooks/useDevice";
import { useBuySmartCategories } from "@/app/buysmart/hooks/useBuySmartLiveData";
import { normalizeBuySmartCategory } from "@altftool/core/buysmart";
import SideAd from "@/ads/layouts/buy/SideAd";

export default function CategoriesAZ({ selectedLetter = "All", filteredCategory }) {
  const { items: categoriesData } = useBuySmartCategories();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
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
    let data = searchResults?.length ? [...searchResults] : [...(categoriesData || [])];

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

    if (sortBy === "newest") {
      data.sort((a, b) => {
        const bTime = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        const aTime = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        return bTime - aTime;
      });
    }

    return data;
  }, [categoriesData, filteredCategory, searchResults, selectedCategory, sortBy]);

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
    <div className="z-1 flex justify-center gap-8 bg-[var(--background)] text-[var(--foreground)]">
      <section className="flex-1 py-10">
        <div className="mb-6">
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
          <FilterWithAdCard displayedData={paginatedData} />
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
