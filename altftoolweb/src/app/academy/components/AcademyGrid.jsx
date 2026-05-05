"use client";

import AcademyCard from "./AcademyCard";
import { useState, useRef } from "react";
import { useAds } from "@/ads/AdsProvider";
import AdCard from "@/ads/layouts/academy/AdAcademyCard";

const ITEMS_PER_PAGE = 6;

export default function AcademyGrid({ items = [], activeCategory }) {
  const [page, setPage] = useState(0);
  const gridRef = useRef(null);

  const ads = useAds({ placement: "academy" });

  const filteredAds = !ads.length
    ? []
    : ads.filter((ad) => {
        const categories = ad.categories || [];
        if (!categories.length) return true;
        const normalized = categories.map((c) => c.toLowerCase());
        return (
          normalized.includes("all") ||
          normalized.includes(activeCategory?.toLowerCase())
        );
      });

  const mixedList = (() => {
    if (!items.length) return [];
    const list = [...items.map((i) => ({ type: "academy", data: i }))];
    if (!filteredAds.length) return list;
    const maxAds = Math.min(filteredAds.length, 4);
    for (let i = 0; i < maxAds; i++) {
      const insertionIndex = Math.min(
        list.length,
        Math.floor(((i + 1) * list.length) / (maxAds + 1))
      );
      list.splice(insertionIndex, 0, { type: "ad", data: filteredAds[i] });
    }
    return list;
  })();

  if (!items.length) return null;

  const mobileList = mixedList.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
  const hasMore = (page + 1) * ITEMS_PER_PAGE < mixedList.length;

  function handleLoadMore() {
    setPage((prev) => prev + 1);
    gridRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="overflow-hidden">
      {/* Mobile grid */}
      <div ref={gridRef} className="grid grid-cols-1 gap-3  sm:hidden">
        {mobileList.map((item, i) => (
          <div
            key={`${item.type}-${page}-${i}`}
            className="relative animate-slide-up min-w-0"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {item.type === "academy" ? (
              <AcademyCard academy={item.data} isLast={i === mobileList.length - 1} />
            ) : (
              <AdCard ad={item.data} />
            )}
          </div>
        ))}
      </div>

      {/* Mobile pagination */}
      {hasMore && (
        <div className="flex sm:hidden justify-center mt-5">
          <button
            onClick={handleLoadMore}
            className="px-5 py-2.5 rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--foreground)]transition-colors"
          >
            Next
          </button>
        </div>
      )}


      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {mixedList.map((item, i) => (
          <div
            key={`${item.type}-${i}`}
            className="relative animate-slide-up min-w-0"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {item.type === "academy" ? (
              <AcademyCard academy={item.data} isLast={i === mixedList.length - 1} />
            ) : (
              <AdCard ad={item.data} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}