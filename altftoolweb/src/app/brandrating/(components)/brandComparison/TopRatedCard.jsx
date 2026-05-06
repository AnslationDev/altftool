"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Check, ArrowUpRight, Trophy, Star, StarHalf } from "lucide-react";
import mattress from "../../(assets)/Hero-2.jpg";
import ManagedImage from "@/components/ui/ManagedImage";

function getURlLink(str) {
  return str
    ?.toLowerCase()
    ?.trim()
    ?.replace(/&/g, "and")
    ?.replace(/\s+/g, "-");
}

export default function TopRated({
  brands = [],
  activeFeature,
  setActiveFeature,
  features = [],
}) {
  const sortedBrands = [...brands].sort((a, b) => a.rank - b.rank);
  const scrollRef = React.useRef(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [visibleCount, setVisibleCount] = React.useState(6);
  const pathname = usePathname();
  const categorySlug = pathname.split("/").pop();
  const cards = sortedBrands.slice(0, visibleCount);
  const hasMore = visibleCount < sortedBrands.length;

  React.useEffect(() => {
    setVisibleCount(6);
    setActiveIndex(0);

    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [brands]);

  const normalizeFeatures = (features) => {
    if (!features) return [];
    if (Array.isArray(features)) return features;
    if (typeof features === "object") return Object.values(features);
    return [];
  };

  const getImage = (brand) => {
    if (brand?.images?.length) return brand.images[0];
    if (brand?.logo) return brand.logo;
    if (brand?.img) return brand.img;
    return mattress;
  };

  const renderStars = (rating = 0) => {
    const safeRating = Math.max(0, Math.min(5, Number(rating)));

    const fullStars = Math.floor(safeRating);
    const hasHalf = safeRating % 1 >= 0.5;

    return (
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`f-${i}`} className="w-5 h-5 fill-yellow-400" />
        ))}

        {hasHalf && <StarHalf className="w-5 h-5 fill-yellow-400" />}

        {[...Array(5 - fullStars - (hasHalf ? 1 : 0))].map((_, i) => (
          <Star key={`e-${i}`} className="w-5 h-5 text-gray-300" />
        ))}
      </div>
    );
  };

  if (!brands.length) {
    return (
      <div className="text-center py-10 text-(--muted-foreground)">
        No results found
      </div>
    );
  }

  return (
    <section id="top-rated" className="section w-full flex justify-center animate-slide-up">
      <div className="w-full flex flex-col gap-4 sm:gap-6">

        {/* HEADER */}
        <div className="text-center animate-slide-right">
          <h2 className="section-title">Top rated picks</h2>
          <p className="section-subtitle">
            Based on thousands of verified buyer reviews and performance tests.
          </p>
        </div>

        {/* FILTER */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 animate-slide-left" style={{ animationDelay: "120ms" }}>
          <span className="text-xs sm:text-sm md:text-lg text-(--muted-foreground)">Filter by:</span>
          <div className="relative w-full sm:w-auto">
            <select
              value={activeFeature}
              onChange={(e) => setActiveFeature(e.target.value)}
              className="w-full sm:w-[177px] h-[33px] px-[10px] pr-8 appearance-none
                      text-(--muted-foreground)
                     text-[17.7px] leading-[25.28px] font-medium
                      border border-(--border) rounded-[30px]
                    text-center cursor-pointer"
            >
              <option value="">All</option>
              {features.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--muted-foreground) pointer-events-none" />
          </div>
        </div>

        {/* CARDS */}
        <div
          ref={scrollRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            const index = Math.round(el.scrollLeft / el.offsetWidth);
            setActiveIndex(Math.min(cards.length - 1, Math.max(0, index)));
          }}
          className="flex lg:flex-col gap-4 sm:gap-6 overflow-x-auto lg:overflow-visible no-scrollbar snap-x snap-mandatory pb-3 lg:px-0"
        >
          {cards.map((brand, index) => {
            const isTop = index === 0;
            const rank = index + 1;
            const showRankBadge = index < 3;

            return (
              <div
                key={brand.id}
                style={{ animationDelay: `${index * 90}ms` }}
                className={`relative w-[calc(100vw-2rem)] min-w-[calc(100vw-2rem)] sm:w-[90%] sm:min-w-[90%] lg:w-full lg:min-w-0
                  snap-start rounded-[18px] sm:rounded-[24px] p-3 sm:p-5 lg:p-6 group transition-all duration-300
                  animate-slide-up
                  ${isTop
                    ? "bg-gradient-to-b from-blue-600 to-white sm:from-blue-600 sm:to-white"
                    : "bg-(--background) border border-(--border)"}
                  hover:shadow-[0_14px_40px_rgba(37,99,235,0.22)]`}
              >

                {/* TOP BADGE */}
                {showRankBadge && (
                  <div className={`flex items-center gap-2 px-2 ${!isTop ? "mb-3 min-h-[32px]" : ""}`}>
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <p className={`text-[16px] font-bold ${isTop ? "text-white" : "text-[#2563EB]"}`}>
                      #{rank} Top Pick
                    </p>
                  </div>
                )}

                {/* TOP CARD */}
                {isTop ? (
                  <div className="bg-(--background) rounded-2xl p-3 sm:p-6 lg:p-8 mt-3 sm:mt-6 overflow-hidden">

                    <div className="flex flex-col xl:flex-row items-center xl:items-stretch gap-5 sm:gap-8 xl:gap-12">

                      <div className="w-full xl:w-auto xl:flex-shrink-0 min-w-0">
                        <ManagedImage
                          src={getImage(brand)}
                          alt={brand.name}
                          className="w-full max-w-full xl:max-w-[480px] 2xl:max-w-[560px] aspect-[4/3] sm:aspect-[16/10] object-cover rounded-[14px] sm:rounded-[20px]"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between gap-3 sm:gap-5 w-full">
                        <div>
                          <div className="flex items-center justify-between gap-2 sm:gap-3">
                            <h3 className="text-lg md:text-xl lg:text-2xl xl:text-[28px] font-bold truncate">
                              {brand.name}
                            </h3>
                            <div className="flex sm:hidden items-center gap-1 flex-shrink-0">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold">{brand.rating}/5</span>
                            </div>
                          </div>

                          <p className="text-sm md:text-base text-(--muted-foreground) mt-2 mb-4">
                            {brand.review || brand.trust || "Trusted by 27,000+ customers"}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                            {normalizeFeatures(brand.features).map((feat, i) => {
                              const label =
                                typeof feat === "string"
                                  ? feat
                                  : feat?.heading || feat?.description || "";

                              if (!label) return null;

                              return (
                                <div
                                  key={i}
                                  className={`flex items-center gap-2 text-[13px] sm:text-[14px] lg:text-[15px] ${i >= 3 ? "hidden sm:flex" : ""
                                    }`}
                                >
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                                  {label}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mt-4 sm:mt-5">
                          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                            {renderStars(brand.rating)}
                            <span className="font-semibold text-sm sm:text-base">{brand.rating}/5</span>
                          </div>

                          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 sm:ml-auto">
                            <Link
                              href={`/brandrating/categories/${categorySlug}/${getURlLink(brand.name)}`}
                              className="w-full sm:w-auto text-center px-4 sm:px-6 py-2.5 rounded-full border text-sm group-hover:border-(--primary) group-hover:text-(--primary) whitespace-nowrap"
                            >
                              Review Details
                            </Link>

                            <a
                              href={brand.weblink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto justify-center px-4 sm:px-6 py-2.5 rounded-full bg-(--primary) text-white flex items-center gap-2 whitespace-nowrap"
                            >
                              View Site
                              <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:[transform:rotate(45deg)]" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-4 sm:gap-6 lg:gap-8 mt-6">
                    <div className="w-full lg:w-[40%] xl:w-[38%] flex-shrink-0 min-w-0">
                      <ManagedImage
                        src={getImage(brand)}
                        alt={brand.name}
                        className="w-full max-w-full lg:max-w-[420px] xl:max-w-[480px] aspect-[16/10] object-cover rounded-[20px]"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-3 sm:gap-4 w-full">
                      <div className="flex items-center justify-between sm:justify-start gap-2">
                        <h3 className="text-lg md:text-xl lg:text-2xl xl:text-[26px] font-bold truncate">
                          {brand.name}
                        </h3>
                        <div className="flex sm:hidden items-center gap-1 flex-shrink-0">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{brand.rating}</span>
                        </div>
                      </div>

                      <p className="text-sm md:text-base text-(--muted-foreground)">
                        {brand.review || brand.trust || "Trusted by 27,000+ customers"}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                        {normalizeFeatures(brand.features).map((feat, i) => {
                          const label =
                            typeof feat === "string"
                              ? feat
                              : feat?.heading || feat?.description || "";

                          if (!label) return null;

                          return (
                            <div
                              key={i}
                              className={`flex items-center gap-2 text-[13px] sm:text-[14px] lg:text-[15px] ${i >= 3 ? "hidden sm:flex" : ""
                                }`}
                            >
                              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                              {label}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mt-2">
                        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                         {renderStars(brand.rating)}
                          <span className="font-semibold text-sm sm:text-base sm:ml-1">
                            {brand.rating}/5
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 sm:ml-auto">
                          <Link
                            href={`/brandrating/categories/${categorySlug}/${getURlLink(brand.name)}`}
                            className="w-full sm:w-auto text-center px-4 sm:px-6 py-2.5 rounded-full border text-sm group-hover:border-(--primary) group-hover:text-(--primary) whitespace-nowrap"
                          >
                            Review Details
                          </Link>

                          <a
                            href={brand.weblink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto justify-center px-4 sm:px-6 py-2.5 rounded-full bg-(--primary) text-white flex items-center gap-2 whitespace-nowrap"
                          >
                            View Site
                            <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:[transform:rotate(45deg)]" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {hasMore && (
          <div className="flex justify-center pt-2 sm:pt-4">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + 6, sortedBrands.length))}
              className="h-11 px-6 sm:px-8 rounded-full border border-(--border) text-sm sm:text-base font-medium text-(--foreground) bg-(--background) transition-all duration-300 hover:border-(--primary) hover:text-(--primary)"
            >
              Load More
            </button>
          </div>
        )}

        {/* DOTS */}
        <div className="flex lg:hidden justify-center mt-4 gap-2">
          {cards.map((_, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${activeIndex === i ? "bg-[var(--primary)] scale-110" : "bg-gray-300"
                }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}