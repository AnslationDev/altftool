"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { firebaseBuySmartFeatureBrandSource } from "@/app/buysmart/service.js/firebaseBuySmartFeature";
import Link from "next/link";
import { FeatureBrandSkeleton, SkeletonBlock } from "@/components/ui/skeleton";
import fallbackDeals from "@/app/buysmart/data/trending.json";
import useReducedMotion from "@/hooks/useReducedMotion";

const fallbackFeatureDeals = fallbackDeals
  .filter((deal) => deal.image?.trim())
  .map((deal, index) => ({
    category: "Top Deals",
    id: `fallback-${index}`,
    image: deal.image.trim(),
    imageType: index === 0 ? "square" : "landscape",
    link: "#",
    status: "active",
    title: deal.title,
  }));

export default function TrendingDeals() {
  const [trending, setTrending] = useState(null);
  const [activeCategory, setActiveCategory] = useState("");
  const scrollRef = useRef(null);
  const pauseRef = useRef(false);
  const rafRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const fallback = setTimeout(() => {
      setTrending(fallbackFeatureDeals);
    }, 1800);

    const unsub = firebaseBuySmartFeatureBrandSource.subscribe((data) => {
      const normalized = (Array.isArray(data) ? data : [])
        .filter((item) => item.status === "active")
        .map((item) => {
          const brand = item.BrandDetail?.[0] || {};
          return {
            ...item,
            link: brand.link || "#",
            image: brand.image || "",
            title: brand.title || "",
            imageType: brand.imageType || "",
            status: item.status || "",
          };
        });
      clearTimeout(fallback);
      setTrending(normalized.length ? normalized : fallbackFeatureDeals);
    });

    return () => {
      clearTimeout(fallback);
      unsub && unsub();
    };
  }, []);

  const categoryData = useMemo(
    () =>
      [...new Set((trending || []).map((i) => i.category).filter(Boolean))].slice(0, 5),
    [trending],
  );
  const currentCategory = categoryData.includes(activeCategory)
    ? activeCategory
    : (categoryData[0] ?? "");

  const getTime = (item) => {
    if (item.createdAt?.seconds) return item.createdAt.seconds * 1000;
    return new Date(item.createdAt || 0).getTime();
  };

  const sortedTrending = useMemo(
    () =>
      (trending || [])
        .filter((item) => item.category === currentCategory)
        .filter((item) => item.status === "active")
        .sort((a, b) => getTime(b) - getTime(a)),
    [trending, currentCategory],
  );

  const mainDeal = sortedTrending.find((d) => d.imageType === "square") ?? null;
  const gridDeals = sortedTrending
    .filter((d) => d.imageType === "landscape")
    .slice(0, 4);

  useEffect(() => {
    if (reducedMotion || !trending || trending.length <= 4) return;
    const el = scrollRef.current;
    if (!el) return;
    const speed = 0.4;
    const animate = () => {
      if (!pauseRef.current) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    const pause = () => (pauseRef.current = true);
    const resume = () => (pauseRef.current = false);
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    return () => {
      cancelAnimationFrame(rafRef.current);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
    };
  }, [trending, reducedMotion]);

  if (trending === null) {
    return <FeatureBrandSkeleton />;
  }

  if (!trending.length) {
    return null;
  }

  return (
    <section className="space-y-7 animate-slide-up">
      <div className="section-header">
        <h2 className="section-title">Top Featured Brands</h2>
        <p className="section-subtitle">Your Journey to Better Brands Starts Here</p>
      </div>

      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="flex gap-3 lg:justify-center sm:justify-start md:gap-12">
     
          {categoryData.map((category, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCategory(category)}
                  className={`h-10 px-5 whitespace-nowrap flex items-center justify-center text-center rounded-full border border-(--border) text-md font-medium transition cursor-pointer shrink-0
                    ${
                      currentCategory === category
                        ? "bg-(--primary) text-white"
                        : "hover:bg-(--primary) hover:text-white"
                    }`}
                >
                  {category}
                </button>
              ))}
        </div>
      </div>

      <div className="w-full flex flex-col gap-6 overflow-hidden animate-slide-right">
        <div className="flex gap-6 h-full w-full flex-row">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 w-full">

          
            <div className="col-span-1 h-full">
              {mainDeal ? (
                <DealCard
                  key={`${currentCategory}-${mainDeal.id || mainDeal.image || mainDeal.title}`}
                  deal={mainDeal}
                  aspectClass="h-full min-h-[300px]"
                />
              ) : (
                <SkeletonCard aspectClass="h-full min-h-[300px]" />
              )}
            </div>

            <div className="col-span-1 sm:col-span-2 lg:col-span-2 grid sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => {
                const deal = gridDeals[i];

                if (!deal) {
                  return <SkeletonCard key={`skeleton-${currentCategory}-${i}`} aspectClass="aspect-video" />;
                }

                return (
                  <DealCard
                    key={`${currentCategory}-${deal.id || deal.image || i}`}
                    deal={deal}
                    aspectClass="aspect-video"
                  />
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}


function SkeletonCard({ aspectClass = "aspect-video" }) {
  return (
    <SkeletonBlock className={`w-full ${aspectClass} rounded-lg`} />
  );
}

function DealCard({ deal, aspectClass = "aspect-video" }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const hasImage = !!deal.image && !imgError;

  return (
    <Link target="_blank" href={deal.link}>
  
      <div className={`relative w-full ${aspectClass} rounded-lg shadow-lg overflow-hidden bg-gray-200`}>


        <div className="absolute inset-0 flex flex-col justify-end gap-2 bg-(--muted) p-5">
          <span className="w-fit rounded-full border border-(--border) bg-(--card) px-2.5 py-1 text-xs font-semibold text-(--muted-foreground)">
            Featured
          </span>
          <p className="text-lg font-bold text-(--foreground)">
            {deal.title || "Featured deal"}
          </p>
        </div>

     
        {hasImage && (
          <img
            key={deal.image}
            src={deal.image}
            alt={deal.title}
           
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 hover:scale-105 transition-transform
              ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}

      </div>
    </Link>
  );
}
