"use client";

import { ArrowRight, BadgeCheck, Sparkles, TicketPercent, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { SkeletonBlock } from "@/components/ui/skeleton";
import ManagedImage from "@/components/ui/ManagedImage";
import {
  getBrandLogoUrl,
  normalizeBuySmartCategory,
} from "@altftool/core/buysmart";


function CategoryCard({ cat }) {
  const normalizedCat = useMemo(() => normalizeBuySmartCategory(cat), [cat]);
  const logoFallback = useMemo(() => getBrandLogoUrl(normalizedCat), [normalizedCat]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(normalizedCat.img);
  const title = normalizedCat.title;
  const href = normalizedCat.storePath || normalizedCat.link || "#";
  const showFallback = !imageSrc || imageError;
  const savingsText = normalizedCat.discount || normalizedCat.cashback || normalizedCat.points || "View deal";

  const handleImageError = () => {
    if (logoFallback && imageSrc !== logoFallback) {
      setImageLoaded(false);
      setImageSrc(logoFallback);
      return;
    }

    setImageError(true);
  };

  return (
    <Link
      href={href}
      data-testid="buysmart-category-card"
      className="group flex min-h-[282px] flex-col overflow-hidden rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) shadow-[var(--anslation-ds-shadow-sm)] transition hover:-translate-y-0.5 hover:border-(--primary) motion-reduce:transform-none"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-(--muted)">
        {imageSrc && !imageLoaded && !imageError ? (
          <SkeletonBlock className="absolute inset-0 rounded-none" />
        ) : null}
        {!imageError && imageSrc ? (
          <ManagedImage
            data-testid="buysmart-category-image"
            key={imageSrc}
            src={imageSrc}
            alt={title}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            referrerPolicy="no-referrer"
            className={`h-full w-full bg-(--card) object-contain p-6 transition duration-300 group-hover:scale-[1.02] motion-reduce:transform-none ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
        ) : null}
        {showFallback ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-[var(--anslation-ds-radius)] bg-(--primary) text-lg font-bold text-(--primary-foreground)">
              {title.slice(0, 1).toUpperCase()}
            </span>
            <span className="text-xs font-semibold text-(--muted-foreground)">
              Verified brand
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <div className="min-h-[48px]">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-(--foreground) sm:text-base">
            {title}
          </h3>
          {normalizedCat.category ? (
            <p className="mt-1 truncate text-xs font-semibold text-(--primary)">
              {normalizedCat.category}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-(--border) bg-(--muted) px-2 py-1 text-[11px] font-semibold text-(--muted-foreground)">
            <TicketPercent className="h-3 w-3 text-(--primary)" />
            <span className="max-w-[120px] truncate">{savingsText}</span>
          </span>
          {normalizedCat.verified ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-(--border) bg-(--background) px-2 py-1 text-[11px] font-semibold text-(--muted-foreground)">
              <BadgeCheck className="h-3 w-3 text-(--primary)" />
              Verified
            </span>
          ) : null}
          {normalizedCat.exclusive ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-(--border) bg-(--background) px-2 py-1 text-[11px] font-semibold text-(--muted-foreground)">
              <Sparkles className="h-3 w-3 text-(--primary)" />
              Exclusive
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-3 py-2 text-xs font-semibold text-(--muted-foreground)">
          <span className="truncate">{normalizedCat.code || "Open deal"}</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-(--primary) transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
export default function FilterWithAdCard({
  displayedData = [],
}) {
  const finalData = displayedData;

  return (
    <div
      className="
        flex flex-wrap items-start justify-center
        w-full
        rounded-[var(--anslation-ds-radius)]
        gap-6
      "
    >
      {/* Left: Cards */}
      {finalData.length === 0 ? (
        <div className="flex min-h-[45vh] w-full flex-shrink-0 flex-col items-center justify-center gap-3 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-4 text-center shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex items-center justify-center">
            <TriangleAlert className="h-10 w-10 text-(--muted-foreground)" />
          </div>
          <h3 className="text-lg font-bold leading-snug text-(--foreground)">
            No Brands Available
          </h3>

          <p className="max-w-sm text-sm text-(--muted-foreground)">
            We couldn’t find any brands for this letter
          </p>
          <p className="text-sm font-semibold text-(--primary)">Try another one</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-5 flex-1 min-w-[280px]">
          {finalData.map((cat) => {
            const normalizedCat = normalizeBuySmartCategory(cat);

            return (
              <CategoryCard
                key={`${normalizedCat.id || normalizedCat.title}-${normalizedCat.img || normalizedCat.link}`}
                cat={normalizedCat}
              />
            );
          })}
        </div>
      )}


      {/* Right: Ad */}
      {/* <div className="flex-1 min-w-[250px] max-w-[400px] p-4 sm:p-6">
        {rightAd?.content && <AdSidebar ad={rightAd.content} />}
      </div> */}
    </div>
  );
}
