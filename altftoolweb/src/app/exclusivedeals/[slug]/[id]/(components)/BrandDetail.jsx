"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import AllBrand from "./AllBrand";
import { Star, X, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import EmptyState from "./EmptyState";
import BrandNotFound from "./BrandNotFound"; // ✅ import
import { bestCouponfirebase, brandsfirebase } from "../../../service/firebasebrand";
import { subscribeAllBrands } from "../../../service/firebaseallbrands";

// ─── Slugify ──────────────────────────────────────────────────────────────────
const slugify = (text) =>
  text?.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const SidebarContent = ({
  brands, visibleCount, selectedBrand, handleBrandSelect, handleLoadMore,
  activeDiscounts, toggleDiscount, activeUser, setActiveUser, resetFilters, activeFilterCount,
}) => {
  const discountRanges = ["0% - 10%", "10% - 30%", "30% - 50%", "50% - 70%", "70% and above"];

  return (
    <>
      <div className="border border-(--border) rounded-xl shadow-sm overflow-hidden">
        <div className={`p-2 space-y-1 ${visibleCount >= 7 ? "max-h-[400px] overflow-y-auto no-scrollbar" : ""}`}>
          <button
            onClick={() => handleBrandSelect("all")}
            className={`w-full flex items-center justify-center gap-3 px-2 py-2 rounded cursor-pointer ${
              selectedBrand === "all"
                ? "bg-(--primary)/10 border border-(--primary)"
                : "hover:bg-(--primary)/10"
            }`}
          >
            <span className="text-sm font-semibold">All Top Brands</span>
          </button>

          {(visibleCount === 5 ? brands.slice(0, 5) : brands).map((b) => {
            const slugName = slugify(b.name);
            const isActive = selectedBrand === slugName;
            return (
              <button
                key={b.id}
                onClick={() => handleBrandSelect(slugName)}
                title={b.name}
                className={`w-full h-15 flex items-center justify-center border-b border-(--border) transition-all cursor-pointer ${
                  isActive
                    ? "bg-(--primary)/10 border border-(--primary) rounded"
                    : "hover:bg-(--primary)/10"
                }`}
              >
                <div className="relative w-20 h-20 flex-shrink-0">
                  {b.logo ? (
                    <Image
                      src={b.logo}
                      alt={b.name}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-xs font-bold rounded">
                      {b.name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {visibleCount === 5 && brands.length > 5 && (
            <button onClick={handleLoadMore} className="w-full text-sm text-(--primary) py-2 hover:underline font-medium">
              Show all brands
            </button>
          )}
        </div>
      </div>

      <div className="border border-(--border) rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-(--border) bg-(--dealspage-background) flex items-center justify-between">
          <h3 className="text-sm font-semibold text-(--foreground) tracking-tight">Filters</h3>
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="text-xs text-(--primary) hover:underline font-medium">
              Clear all
            </button>
          )}
        </div>

        <div className="p-4 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground) mb-3">Discount</p>
            <ul className="space-y-2.5">
              {discountRanges.map((range) => (
                <li key={range}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => toggleDiscount(range)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                        activeDiscounts.includes(range)
                          ? "bg-(--primary) border-(--primary)"
                          : "border-(--border) group-hover:border-(--primary)"
                      }`}
                    >
                      {activeDiscounts.includes(range) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                          <path d="M1.5 5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span onClick={() => toggleDiscount(range)} className="text-sm text-(--foreground) select-none">
                      {range}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-(--border)" />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground) mb-3">Users</p>
            <ul className="space-y-2.5">
              {[{ label: "All Users", value: "all" }, { label: "New Users", value: "new" }].map((u) => (
                <li key={u.value}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => setActiveUser(u.value)}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                        activeUser === u.value ? "border-(--primary)" : "border-(--border) group-hover:border-(--primary)"
                      }`}
                    >
                      {activeUser === u.value && <div className="w-2 h-2 rounded-full bg-(--primary)" />}
                    </div>
                    <span onClick={() => setActiveUser(u.value)} className="text-sm text-(--foreground) select-none">
                      {u.label}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
function BrandDetail() {
  const pathname = usePathname();
  const urlBrand = pathname.split("/").pop();

  // ── All hooks first — NO early returns before this block ──────────────────
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [visibleCount, setVisibleCount] = useState(5);
  const [activeTab, setActiveTab] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeUser, setActiveUser] = useState("all");
  const [activeDiscounts, setActiveDiscounts] = useState([]);
  const [brandNotFound, setBrandNotFound] = useState(false); // ✅

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  useEffect(() => {
    const resetState = setTimeout(() => {
      setLoading(true);
      setBrandNotFound(false);
    }, 0);
    let best = [], brandsData = [];
    let bestLoaded = false, brandsLoaded = false;

    const updateAll = () => {
      if (bestLoaded && brandsLoaded) {
        const combined = [...best, ...brandsData];
        setAllData(combined);

        // ✅ Check if urlBrand exists in Firebase
        const brandExists = combined.some(
          (item) => slugify(item.name) === slugify(urlBrand)
        );
        if (!brandExists) setBrandNotFound(true);

        setLoading(false);
      }
    };

    const unsubBest = bestCouponfirebase((data) => { best = data || []; bestLoaded = true; updateAll(); });
    const unsubBrands = brandsfirebase((data) => { brandsData = data || []; brandsLoaded = true; updateAll(); });
    return () => { clearTimeout(resetState); unsubBest?.(); unsubBrands?.(); };
  }, [urlBrand]);

  useEffect(() => {
    const unsub = subscribeAllBrands((data) => setBrands(data || []));
    return () => unsub?.();
  }, []);

  const handleBrandSelect = useCallback((slug) => {
    const scrollY = window.scrollY;
    setSelectedBrand(slug);
    setSidebarOpen(false);
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: "instant" });
    });
  }, []);

  const handleLoadMore = useCallback(() => setVisibleCount(7), []);

  const offers = useMemo(() => {
    if (selectedBrand === "all") {
      return allData.flatMap((b) =>
        (b.offers || []).map((offer) => ({
          ...offer, brandName: b.name, link: b.link, logo: b.logo, highestDiscount: b.highestDiscount,
        }))
      );
    }
    const selected = allData.find((b) => slugify(b.name) === slugify(selectedBrand));
    return (selected?.offers || []).map((offer) => ({
      ...offer, brandName: selected.name, link: selected.link, logo: selected.logo, highestDiscount: selected.highestDiscount,
    }));
  }, [selectedBrand, allData]);

  const couponItems = offers.filter((o) => o.type === "coupon" && o.code?.trim());
  const dealItems = offers.filter((o) => o.type === "deal");
  const totalOffers = offers.length;

  const activeFilterCount = activeDiscounts.length + (activeUser !== "all" ? 1 : 0);

  const resetFilters = useCallback(() => {
    setActiveUser("all");
    setActiveDiscounts([]);
  }, []);

  const toggleDiscount = useCallback((range) => {
    setActiveDiscounts((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  }, []);

  const matchesDiscount = useCallback((item) => {
    if (activeDiscounts.length === 0) return true;
    const val = parseFloat(item.discount) || 0;
    return activeDiscounts.some((range) => {
      if (range === "0% - 10%") return val >= 0 && val <= 10;
      if (range === "10% - 30%") return val > 10 && val <= 30;
      if (range === "30% - 50%") return val > 30 && val <= 50;
      if (range === "50% - 70%") return val > 50 && val <= 70;
      if (range === "70% and above") return val > 70;
      return false;
    });
  }, [activeDiscounts]);

  const filteredCoupons = useMemo(() =>
    couponItems.filter((item) => activeUser === "all" || item.userType === "new").filter(matchesDiscount),
    [couponItems, activeUser, matchesDiscount]
  );

  const filteredDeals = useMemo(() =>
    dealItems.filter((item) => activeUser === "all" || item.userType === "new").filter(matchesDiscount),
    [dealItems, activeUser, matchesDiscount]
  );

  // ✅ Early return AFTER all hooks — this is the correct placement
  if (!loading && brandNotFound) {
    return <BrandNotFound urlBrand={urlBrand} />;
  }

  const sidebarProps = {
    brands, visibleCount, selectedBrand, handleBrandSelect, handleLoadMore,
    activeDiscounts, toggleDiscount, activeUser, setActiveUser, resetFilters, activeFilterCount,
  };

  return (
    <div className="section bg-(--dealspage-background) pt-5 min-h-screen relative">
      {/* BREADCRUMB */}
      <div className="hidden lg:block text-sm text-(--muted-foreground) mb-8">
        <Link href="/exclusivedeals" className="hover:text-(--primary) font-medium">Home</Link>
        <span className="mx-1">/</span>
        <span className="font-semibold text-(--foreground) capitalize">{selectedBrand}</span>
      </div>

      {/* ── Mobile drawer backdrop ─────────────────────────────────────────── */}
      <div
        className={`lg:hidden fixed left-0 right-0 bottom-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ top: "var(--header-height, 64px)" }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Mobile drawer panel ───────────────────────────────────────────── */}
      <div
        className={`lg:hidden fixed left-0 bottom-0 z-50 w-[85vw] max-w-[300px] bg-(--dealspage-background) shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ top: "var(--header-height, 64px)" }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-(--border) bg-(--dealspage-background)">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-(--primary)" />
            <span className="font-semibold text-sm text-(--foreground)">Brands &amp; Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-(--primary) text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-(--border) transition-colors">
            <X className="w-4 h-4 text-(--foreground)" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <SidebarContent {...sidebarProps} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-[20%] gap-4">
          <SidebarContent {...sidebarProps} />
        </div>

        {/* RIGHT CONTENT */}
        <div className="w-full lg:w-[80%]">
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-(--foreground)">
                  {loading
                    ? <span className="inline-block w-64 h-8 bg-gray-200 animate-pulse rounded" />
                    : <>{selectedBrand} Coupons &amp; Promo Codes - April 2026</>
                  }
                </h1>
                <p className="text-sm text-(--foreground) mt-2 font-normal">
                  {loading
                    ? <span className="inline-block w-48 h-4 bg-gray-200 animate-pulse rounded" />
                    : <>Best {totalOffers} Coupons &amp; Offers last validated on April 20th, 2026</>
                  }
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="hidden lg:flex gap-3">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <span className="text-xs text-(--foreground) font-medium">5 / 5 · (2,000 Rating)</span>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-2 rounded-t-lg overflow-x-auto no-scrollbar">
              {[
                { key: "all", label: `All (${totalOffers})` },
                { key: "coupon", label: `Coupons (${filteredCoupons.length})` },
                { key: "deal", label: `Deals (${filteredDeals.length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`text-sm font-medium whitespace-nowrap rounded-t-lg px-1.5 sm:px-5 py-3 transition-colors ${
                    activeTab === tab.key
                      ? "border-b-2 border-(--primary) bg-(--primary)/10 text-(--primary) -mb-px"
                      : "text-(--foreground) hover:text-(--foreground)/70"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden relative bg-(--primary) flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-white text-sm font-medium shadow-sm"
            >
              <SlidersHorizontal size={14} />
              <span className="hidden md:block">Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* LIST */}
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-gray-200 animate-pulse" />
              ))
            ) : (
              <>
                {activeTab === "all" && (() => {
                  const items = [...filteredCoupons, ...filteredDeals].sort((a, b) => {
                    const aMatch = slugify(a.brandName) === slugify(urlBrand);
                    const bMatch = slugify(b.brandName) === slugify(urlBrand);
                    if (aMatch && !bMatch) return -1;
                    if (!aMatch && bMatch) return 1;
                    return 0;
                  });
                  return items.length > 0
                    ? items.map((item, i) => <AllBrand key={i} data={item} />)
                    : <EmptyState user={activeUser} />;
                })()}
                {activeTab === "coupon" && (
                  filteredCoupons.length > 0
                    ? filteredCoupons.map((item, i) => <AllBrand key={i} data={item} />)
                    : <EmptyState user={activeUser} />
                )}
                {activeTab === "deal" && (
                  filteredDeals.length > 0
                    ? filteredDeals.map((item, i) => <AllBrand key={i} data={item} />)
                    : <EmptyState user={activeUser} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrandDetail;
