"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { useBuySmartFeaturedDeals } from "@/app/buysmart/hooks/useBuySmartLiveData";
import ManagedImage from "@/components/ui/ManagedImage";

function getTime(item) {
  if (item.createdAt?.seconds) return item.createdAt.seconds * 1000;
  return new Date(item.createdAt || 0).getTime();
}

export default function TrendingDeals() {
  const { items: trending } = useBuySmartFeaturedDeals();
  const [activeCategory, setActiveCategory] = useState("");

  const categoryData = useMemo(
    () =>
      [...new Set((trending || []).map((i) => i.category).filter(Boolean))].slice(0, 5),
    [trending],
  );
  const currentCategory = categoryData.includes(activeCategory)
    ? activeCategory
    : (categoryData[0] ?? "");

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
              className={`flex h-10 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-[var(--anslation-ds-radius)] border border-(--border) px-5 text-center text-sm font-semibold transition ${
                currentCategory === category
                  ? "bg-(--primary) text-(--primary-foreground)"
                  : "bg-(--card) text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col gap-6 overflow-hidden animate-slide-right">
        <div className="flex h-full w-full flex-row gap-6">
          <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-3">
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

            <div className="col-span-1 grid gap-3 sm:col-span-2 sm:grid-cols-2 lg:col-span-2">
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
    <SkeletonBlock className={`w-full ${aspectClass} rounded-[var(--anslation-ds-radius)]`} />
  );
}

function DealCard({ deal, aspectClass = "aspect-video" }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const hasImage = !!deal.image && !imgError;

  return (
    <Link href={deal.link} target="_blank" rel="noopener noreferrer">
      <div className={`relative w-full ${aspectClass} overflow-hidden rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--muted) shadow-[var(--anslation-ds-shadow-sm)]`}>
        <div className="absolute inset-0 flex flex-col justify-end gap-2 bg-(--muted) p-5">
          <span className="w-fit rounded-full border border-(--border) bg-(--card) px-2.5 py-1 text-xs font-semibold text-(--muted-foreground)">
            Featured
          </span>
          <p className="text-lg font-bold text-(--foreground)">
            {deal.title || "Featured deal"}
          </p>
        </div>

        {hasImage && (
          <ManagedImage
            key={deal.image}
            src={deal.image}
            alt={deal.title}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className={`absolute inset-0 h-full w-full object-cover transition duration-300 hover:scale-[1.02] motion-reduce:transform-none
              ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}
      </div>
    </Link>
  );
}
