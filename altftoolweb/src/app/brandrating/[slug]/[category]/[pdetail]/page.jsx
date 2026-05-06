"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
// import data from "../../../(data)/data.json";
import Image from "next/image";
import reviews from "../../../(data)/reviews";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ChevronDown, ThumbsUp, Star, StarHalf, Truck, ShieldCheck, Home } from "lucide-react";
// import { categoriesConfig } from "@/app/brandrating/config/category";
import WhyYoullLoveIt from "@/app/brandrating/(components)/detail/WhyYouLoveIt";
import ProductBanner from "@/app/brandrating/(components)/detail/ProductBanner";
import ComparisonCard from "@/app/brandrating/(components)/detail/ComparisonCard";
import HeroSection from "@/app/brandrating/(components)/detail/HeroSection"
import Reviews from "../../../(components)/brandComparison/Reviews";
import Faq from "../../../(components)/brandComparison/FAQ";
import Details from "@/app/brandrating/(components)/detail/Details";
import { categoryService } from "../../../service/service";

function getURlLink(value) {
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

function Page() {
  const pathname = usePathname();
  const router = useRouter();

  // const CategoryData = data?.brandRating?.categories || [];
  const [categories, setCategories] = useState([]);
  const filters = React.useMemo(() => {
    return (categories || []).map((cat) => ({
      id: cat?.id,
      label: cat?.name || cat?.category || "Category",
      subCategories: cat?.subcategories || [],
    }));
  }, [categories]);


  useEffect(() => {
    const unsubscribe = categoryService.subscribeMerged(
      (res) => {


        const categoriesData = Array.isArray(res) ? res : [];
        setCategories(categoriesData);
      },
      () => { }
    );



    return () => unsubscribe?.();
  }, []);

  const segments = (pathname || "").split("/").filter(Boolean);

  const categoryName = segments.at(-3) || "";
  const subCategoryName = segments.at(-2) || "";
  const brandName = segments.at(-1) || "";
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [faqs, setFaqs] = useState([]);
  const filterRef = useRef(null);
  const buttonRefs = useRef({});
  const { categoryData, subCategoryData } = React.useMemo(() => {
    if (!categories.length) {
      return { categoryData: null, subCategoryData: null };
    }

    const foundCategory = categories.find(
      (item) => getURlLink(item.category || item.name) === categoryName
    );

    const foundSubCategory = foundCategory?.subcategories?.find(
      (sub) => getURlLink(sub.name) === subCategoryName
    );

    return {
      categoryData: foundCategory || null,
      subCategoryData: foundSubCategory || null,
    };
  }, [categories, categoryName, subCategoryName]);
  const activeCategory = filters.find(
    (f) => f.id === activeCategoryId
  );
  const isLoading =
  !categories.length || !categoryData;
useEffect(() => {
  if (!categoryData?.id) return;

  const unsub = categoryService.subscribeFaqs((data) => {
    const filtered = data.filter((faq) => {
      if (subCategoryData?.id) {
        return faq.subcategoryId === subCategoryData.id;
      }
      return (
        faq.categoryId === categoryData.id &&
        (!faq.subcategoryId || faq.subcategoryId === "")
      );
    });

    

    setFaqs(filtered);
  });

  return () => unsub?.();
}, [categoryData?.id, subCategoryData?.id]);


  const allBrands = React.useMemo(() => {
    if (!categoryData || typeof categoryData !== "object") return [];

    const directBrands = Array.isArray(categoryData?.brands)
      ? categoryData.brands
      : categoryData?.brands && typeof categoryData.brands === "object"
        ? Object.values(categoryData.brands)
        : [];

    const subcategoryBrands = Array.isArray(categoryData?.subcategories)
      ? categoryData.subcategories.flatMap((sub) => {
        if (Array.isArray(sub?.brands)) return sub.brands;
        if (sub?.brands && typeof sub.brands === "object")
          return Object.values(sub.brands);
        return [];
      })
      : [];

    return [...directBrands, ...subcategoryBrands]
      .filter(Boolean)
      .map((b, index) => ({
        ...b,
        name: (b?.name || "Unnamed").trim(),
        rank:
          b?.rank !== undefined && b?.rank !== null && b?.rank !== ""
            ? Number(b.rank)
            : index + 1,
        features: (() => {
          if (Array.isArray(b?.features)) return b.features;
          if (b?.features && typeof b.features === "object") return Object.values(b.features);
          if (Array.isArray(b?.feature)) return b.feature;
          if (typeof b?.feature === "string") return [b.feature];
          return [];
        })(),
        images: Array.isArray(b?.images) ? b.images : [],
        weblink: b?.weblink || b?.url || b?.link || "",
        rating: Number(b?.rating) || 0,
      }));
  }, [categoryData]);

  const brand = React.useMemo(() => {
    if (!brandName || !allBrands.length) return null;

    return allBrands.find((b) => {
      const nameSlug = getURlLink((b?.name || "").trim());
      const urlSlug = getURlLink(brandName || "");
      return nameSlug === urlSlug;
    }) || null;
  }, [allBrands, brandName]);

  const calcPos = useCallback((idx) => {
    const btn = buttonRefs.current[idx];
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 8,
      left: Math.min(rect.left, window.innerWidth - 232),
    });
  }, []);

  function handleFilterClick(catId, idx) {
    if (activeCategoryId === catId) {
      setActiveCategoryId(null);
      return;
    }

    calcPos(idx);
    setActiveCategoryId(catId);
  }

  useEffect(() => {
    function handleClickOutside(e) {
      const isInsideFilter = filterRef.current?.contains(e.target);
      const isInsideDropdown = e.target.closest("[data-dropdown-portal]");
      if (!isInsideFilter && !isInsideDropdown) {
        setActiveCategoryId(null);
      }
    }
    function handleScroll() {
      if (activeCategoryId !== null) {
        const idx = filters.findIndex(
          (f) => f.id === activeCategoryId
        );
        if (idx !== -1) calcPos(idx);
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [activeCategoryId, calcPos, filters]);


  const featureIcons = {
    trial: Home,
    shipping: Truck,
    warranty: ShieldCheck,
  };

  const isCategoriesLoading = !categories.length;
  const safeBrand = brand || null;
  const rating = Number(brand?.rating) || 0;
  const fullStars = Math.floor(rating / 2);
  const hasHalf = rating % 2 >= 1;


  return (
    <>
      <div className="flex flex-col relative animate-slide-up">
        <style>{`.filter-pills::-webkit-scrollbar{display:none}.dropdown-inner::-webkit-scrollbar{display:none}`}</style>

        {/* TOP BAR */}
        <section className="section animate-slide-right">
          <div className="w-full flex flex-col lg:flex-row lg:items-center xl:justify-between">

            {/* Back arrow */}
            <div className="flex-shrink-0 mb-2 sm:mb-3 lg:mb-0 lg:mr-3">
              <Link href="/brandrating" className="flex items-center gap-3 group">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-(--primary) flex items-center justify-center transition group-hover:bg-blue-50">
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-(--primary)" />
                </div>
              </Link>
            </div>


            {/* Category filter strip */}
            <div className="flex-1 min-w-0 xl:flex xl:justify-end">
              <div
                ref={filterRef}
                className="filter-pills flex flex-nowrap overflow-x-auto pb-2 justify-start xl:justify-end gap-2 sm:gap-3 min-w-0 px-0 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none]"
              >
                {filters.map((filter, idx) => {
                  const isActive = activeCategoryId === filter.id;
                  return (

                    <div key={filter.id} className="snap-start flex-shrink-0">
                      <button
                        ref={(el) => { buttonRefs.current[idx] = el; }}
                        onClick={() => handleFilterClick(filter.id, idx)}
                        className={`
                        flex items-center justify-between gap-[6px]
                        h-[34px] sm:h-[38px] lg:h-[40px]
                        px-3 sm:px-4 lg:px-5
                        text-xs sm:text-sm
                        font-medium
                        rounded-full border
                        whitespace-nowrap shrink-0
                        transition-colors duration-200
                        cursor-pointer
                        ${isActive
                            ? "bg-(--primary) text-white border-(--primary)"
                            : "bg-(--background) text-(--muted-foreground) border-(--border) hover:bg-(--primary) hover:text-white hover:border-(--primary)"
                          }
                      `}
                      >
                        {filter.label}
                        <ChevronDown
                          size={13}
                          className={`transition-transform duration-300 ease-in-out ${isActive ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>


          </div>
        </section>

        {typeof document !== "undefined" &&
          activeCategoryId !== null &&
          activeCategory?.subCategories?.length > 0 &&
          createPortal(
            <div
              data-dropdown-portal="true"
              style={{ top: dropdownPos.top, left: dropdownPos.left }}
              className="dropdown-inner fixed w-[220px] bg-(--background) border border-(--border) rounded-[12px] shadow-xl py-2 max-h-[260px] overflow-y-auto z-[9999]"
            >
              {activeCategory.subCategories.map((option, i) => (
                <button
                  key={`${activeCategory.id}-${option}-${i}`}
                  onClick={() => {
                    setActiveCategoryId(null);
                    router.push(
                      `/brandrating/categories/${getURlLink(option)}`
                    );
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-(--foreground) hover:bg-(--muted-foreground)/20"
                >
                  {option.name}
                </button>
              ))}
            </div>,
            document.body
          )}
        <div className="flex flex-col ">
       {isLoading ? (
    <div className="py-10 text-center text-gray-400">
      Loading...
    </div>
  ) : (
    <>
      {brand && <HeroSection brand={brand} category={categoryData} />}
      {brand && <WhyYoullLoveIt brand={brand} category={categoryData} />}
      {brand && <ProductBanner brand={brand} />}
      {brand && <Details brand={brand} category={categoryData} />}

      <ComparisonCard brands={allBrands} />

      <Reviews reviews={reviews} />
      <Faq faqs={faqs || []} />
    </>
  )}
        </div>


      </div>
    </>
  );
}

export default Page;
