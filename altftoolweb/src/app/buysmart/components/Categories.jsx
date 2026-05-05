"use client";

import { useMemo, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FilterRow from "@/app/buysmart/components/FilterRow";
import FilterWithAdCard from "@/app/buysmart/components/FilterWithAd";

import { firebaseBuySmartCategoriesSource } from "@/app/buysmart/service.js/firebaseBuySmartCategories";
import { useAds } from "@/ads/AdsProvider";
import useDevice from "@/hooks/useDevice";
import { CategoriesSkeleton } from "@/components/ui/skeleton";
import fallbackBrands from "@/app/buysmart/data/categories.json";

// import AdSidebar from "@/ads/layouts/shared/AdSidebar";
import SideAd from "@/ads/layouts/buy/SideAd";

const fallbackCategories = fallbackBrands.map((brand) => ({
  category: "Popular",
  id: `fallback-${brand.slug}`,
  link: brand.url,
  status: "active",
  title: brand.name,
}));

export default function CategoriesAZ({ selectedLetter = "All" ,filteredCategory , searchInput , SetSearchInput }) {
  //  const containerRef = useRef(null);
  const [categoriesData, setCategoriesData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
    const device = useDevice();
    const [itemsPerPage, setItemsPerPage] = useState(4);
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
  

  // useEffect(() => {
  //   const unsub = firebaseBuySmartCategoriesSource.subscribe((data) => {
  //     setCategoriesData(data || []);
  //   });
  //   return () => unsub && unsub();
  // }, []);

  useEffect(() => {
    const fallback = setTimeout(() => {
      setCategoriesData(fallbackCategories);
    }, 1800);

    const unsub = firebaseBuySmartCategoriesSource.subscribe((data) => {
      const activeData = (data || []).filter(
        (item) => item.status === "active"
      );
  
      clearTimeout(fallback);
      setCategoriesData(activeData.length ? activeData : fallbackCategories);
    });
  
    return () => {
      clearTimeout(fallback);
      unsub && unsub();
    };
  }, []);


  const loading = categoriesData === null;

  let categoryDropDown = (categoriesData || []).map((item) => item.category).filter(Boolean)
  const filteredData = useMemo(() => {
if (!categoriesData) {
    return [];
  }

if (filteredCategory && filteredCategory.length > 0) {
    return filteredCategory;
  }

  


    let data = [...categoriesData];

    
    if (filteredCategory) {
      data = data.filter(
        (item) =>
          (item.category || "")
            .toLowerCase()
            .includes(filteredCategory)
      );
    }

    if (selectedCategory !== "All") {
      data = data.filter((item) => item.category === selectedCategory);
    }


    if (sortBy === "newest") {
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return data;
  }, [categoriesData, selectedCategory, sortBy, filteredCategory]);

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
  }, [flatData, safeCurrentPage,itemsPerPage]);
  const startItem = flatData.length === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage+ 1;
  const endItem = Math.min(safeCurrentPage * itemsPerPage, flatData.length);

  const rightAd = useAds({
    placement: "buysmart_right",
    layout: "sidebar",
    device,
  })[0];

  return (
    loading ? (
      <CategoriesSkeleton cards={Math.max(4, itemsPerPage)} />
    ) : (
    <div className="flex justify-center gap-8  bg-[var(--background)] text-[var(--foreground)] z-1">

      {/* MAIN CONTENT */}
      <section className="flex-1  py-10 ">
        <div className="mb-6 ">
          <FilterRow
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            categoryDropDown={categoryDropDown}
          />
        </div>
        <div className="flex gap-6  ">
          <FilterWithAdCard
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            SetSearchInput={SetSearchInput}

            displayedData={paginatedData}
            searchInput={searchInput}
          />
          <div className="hidden xl:block  flex-shrink-0">
            <SideAd ad={rightAd?.content} />
          </div>
        </div>


        <div className="flex flex-col items-center  mt-6 gap-3">
          <div className="flex items-center justify-center gap-2 sm:gap-[20px] md:gap-[24px] lg:gap-[30px] flex-wrap">
            <button
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="flex items-center justify-center w-auto sm:w-[135px] h-[40px] sm:h-[48px] px-3 sm:px-[20px] gap-[10px] rounded-[63px] border border-[#E5E7EB] bg-white text-gray-800 disabled:opacity-50">
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Previous</span>
            </button>
            {/* Page Numbers */}
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
              disabled={safeCurrentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))}
              className="flex items-center justify-center w-auto sm:w-[135px] h-[40px] sm:h-[48px] px-3 sm:px-[20px] gap-[10px] rounded-[63px] border border-[#E5E7EB] bg-white text-gray-800  disabled:opacity-50"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex justify-center items-center mt-3">
            <p className=" text-sm sm:text-base leading-tight md:leading-snug lg:leading-[75px] tracking-[0.5px]">
              Showing {startItem}–{endItem} of {flatData.length} brands
            </p>
          </div>
        </div>
    
       
      </section>
    </div >
    )
  );
}
