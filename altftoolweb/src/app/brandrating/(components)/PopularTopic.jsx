"use client";
import React from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import satvikImage from "../(assets)/saatvahero.webp";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown,ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { categoryService } from "../service/service";

function PopularTopic({ data }) {
  const fallbackCategories = useMemo(() => {
    return Array.isArray(data?.categories) ? data.categories : [];
  }, [data]);
  const [firebaseCategories, setFirebaseCategories] = useState(fallbackCategories);
  const [loading, setLoading] = useState(fallbackCategories.length === 0);
  const [activeFilter, setActiveFilter] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [categoryIndex, setCategoryIndex] = useState(0);
  const router = useRouter();
  const filterRef = useRef(null);
  const buttonRefs = useRef({});
  const mounted = typeof document !== "undefined";

  useEffect(() => {
    const unsubscribe = categoryService.subscribeMerged(
      (response) => {
        setFirebaseCategories(Array.isArray(response) ? response : []);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );

    return () => unsubscribe?.();
  }, []);

  const normalizedCategoryTree = useMemo(() => {
    return Array.isArray(firebaseCategories) ? firebaseCategories : [];
  }, [firebaseCategories]);

  const filters = useMemo(() => {
    return normalizedCategoryTree.map((category) => ({
      label: category?.name || category?.category || "Category",
      options: [
        ...new Set(
          (Array.isArray(category?.subcategories) ? category.subcategories : [])
            .map((sub) => sub?.name || "")
            .filter(Boolean),
        ),
      ],
    }));
  }, [normalizedCategoryTree]);
 

  useEffect(() => {
    if (!normalizedCategoryTree.length) return;

    const interval = setInterval(() => {
      setCategoryIndex((prev) => (prev + 1) % normalizedCategoryTree.length);
    }, 3600000);

    return () => clearInterval(interval);
  }, [normalizedCategoryTree]);

  const currentCategoryData =
    normalizedCategoryTree[categoryIndex] ||
    normalizedCategoryTree[0] ||
    null;

  const activeCategory =
    currentCategoryData?.category ||
    currentCategoryData?.name ||
    "Category";

  const popularData = useMemo(() => {
    if (!currentCategoryData) return [];

    const directBrands = Array.isArray(currentCategoryData?.brands)
      ? currentCategoryData.brands
      : [];

    const subcategoryBrands = Array.isArray(currentCategoryData?.subcategories)
      ? currentCategoryData.subcategories.flatMap((sub) =>
        Array.isArray(sub?.brands) ? sub.brands : []
      )
      : [];

    const merged = [...directBrands, ...subcategoryBrands].filter(Boolean);

    return merged.length ? merged.slice(0, 2) : [];
  }, [currentCategoryData]);

function getUrlLink(value) {
  if (!value) return "";

  const str =
    typeof value === "string"
      ? value
      : value?.name || value?.label || "";

  return str
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-");
}

  function calcPos(idx) {
    const btn = buttonRefs.current[idx];
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 8,
      left: Math.min(rect.left, window.innerWidth - 232),
    });
  }

  function handleFilterClick(idx) {
    if (activeFilter === idx) {
      setActiveFilter(null);
      return;
    }
    calcPos(idx);
    setActiveFilter(idx);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      const isInsideFilter = filterRef.current?.contains(event.target);
      const isInsideDropdown = event.target.closest("[data-dropdown-portal]");
      if (!isInsideFilter && !isInsideDropdown) {
        setActiveFilter(null);
      }
    }
    function handleScroll() {
      if (activeFilter !== null) {
        calcPos(activeFilter);
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [activeFilter]);

  return (
    <div className="w-full section animate-slide-up">
      <style>{`.filter-pills::-webkit-scrollbar{display:none}.dropdown-inner::-webkit-scrollbar{display:none}`}</style>

      <div className="flex flex-col text-center items-center gap-2 pb-8 sm:pb-10 animate-slide-right">
        <h2 className="section-title">Most Popular Products Right Now</h2>
        <p className="section-subtitle">Discover the key differences and choose the one that fits your needs best.</p>
      </div>

      <div className="w-full flex justify-center mb-8 sm:mb-10 animate-slide-left" style={{ animationDelay: "120ms" }}>
        <div
          ref={filterRef}
          className="filter-pills w-full flex flex-nowrap overflow-x-auto pb-2 justify-start xl:justify-center gap-2 sm:gap-4 min-w-0 px-4 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none]"
        >
          {filters.map((filter, idx) => (
            <div key={`${filter.label}-${idx}`} className="snap-start flex-shrink-0">
              <button
                ref={(el) => {
                  buttonRefs.current[idx] = el;
                }}
                onClick={() => handleFilterClick(idx)}
                className={`
                  flex items-center justify-between gap-[6px]
                  h-[34px] sm:h-[42px]
                  px-3 sm:px-5
                  text-[12px] sm:text-[14px]
                  font-medium
                  rounded-full border
                  whitespace-nowrap shrink-0
                  transition-colors duration-200
                  cursor-pointer
                  ${activeFilter === idx
                    ? "bg-(--primary) text-white border-(--primary)"
                    : "border-(--border) text-(--muted-foreground) bg-(--background) hover:bg-(--primary) hover:text-white hover:border-(--primary) hover:scale-[1.03]"
                  }
                `}
              >
                {filter.label}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ease-in-out ${activeFilter === idx ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {mounted && activeFilter !== null && filters[activeFilter]?.options?.length > 0 && createPortal(
        <div
          data-dropdown-portal="true"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
          className="dropdown-inner fixed w-[220px] bg-(--background)  border border-(--border) rounded-[12px] shadow-xl py-2 max-h-[260px] overflow-y-auto z-[9999] [scrollbar-width:none] [-ms-overflow-style:none]"
        >
          {filters[activeFilter].options.map((option, i) => (
            <button
              key={`${filters[activeFilter].label}-${option}-${i}`}
              onClick={() => {
                router.push(`/brandrating/categories/${getUrlLink(option)}`);
                setActiveFilter(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-(--foreground) hover:bg-(--muted-foreground)/20 truncate transition-all duration-200 ease-in-out hover:pl-5"
              title={option}
            >
              {option}
            </button>
          ))}
        </div>,
        document.body,
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {loading ? (
          <div className="col-span-2 text-center py-10 text-gray-500">
            Loading...
          </div>
        ) : popularData.length === 0 ? (
          <div className="col-span-2 text-center py-10 text-gray-500">
            No products added yet in this category
          </div>
        ) : (
          popularData.map((brand, index) => (
            <div
              key={brand?.id || `${brand?.name}-${index}`}
              className="flex-1 rounded-[20px] border border-(--border) p-[16px] sm:p-[20px] flex flex-col gap-5 group transition-all duration-300 ease-in-out hover:border-(--primary) hover:shadow-[0_10px_30px_rgba(37,99,235,0.15)] hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="relative w-full h-[200px] sm:h-[240px] md:h-[280px] lg:h-[320px] rounded-[12px] overflow-hidden flex-shrink-0">
                <Image
                  src={brand?.images?.[0] || satvikImage}
                  alt={brand?.name || "Brand"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 520px"
                  className="object-cover transition-all duration-700 group-hover:scale-105"
                />

                <div className="absolute top-3 sm:top-[41px] left-0 h-[28px] sm:h-[42px] px-3 sm:px-5 bg-(--primary) rounded-tr-[30px] rounded-br-[30px] flex items-center">
                  <span className="font-semibold text-[11px] sm:text-sm text-white truncate">
                    {activeCategory}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mt-1 sm:mt-2">
                <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                  <Link
                    href={`/brandrating/${getUrlLink(activeCategory)}/${getUrlLink(brand?.name)}`}
                  >
                    <span className="font-semibold text-[1.1rem] sm:text-[1.3rem] md:text-[1.6rem] text-(--foreground)">
                      {brand?.name}
                    </span>
                  </Link>

                  <span className="text-(--muted-foreground)">
                    {brand?.subCategory || brand?.category || activeCategory}
                  </span>

                  <span className="text-(--muted-foreground) text-sm">
                    4,786 People Visited This Week
                  </span>
                </div>
                <Link href={`/brandrating/${getUrlLink(activeCategory)}/pdetail/${getUrlLink(brand?.name)}`} className="w-full sm:w-auto"> 
                <button className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-[5px] h-[36px] sm:h-[44px] px-3 sm:px-5 text-[12px] sm:text-sm 
                rounded-full bg-(--primary) text-white font-medium whitespace-nowrap flex-shrink-0 transition-all duration-200 cursor-pointer">
                   View Details
                    <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:[transform:rotate(45deg)]" /> 
                   </button> 
                   </Link>
            </div>
            </div>
      ))
        )}
    </div>
    </div >
  );
}

export default PopularTopic;
