"use client";

import { ArrowRight, BadgeCheck, Star, TicketPercent, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { SkeletonBlock } from "@/components/ui/skeleton";
import ManagedImage from "@/components/ui/ManagedImage";
import TrustSignalBadges from "@/app/buysmart/components/TrustSignalBadges";
import {
  getBrandLogoUrl,
  getBuySmartTrustSignals,
  normalizeBuySmartCategory,
} from "@altftool/core/buysmart";


function CategoryCard({ cat, counters }) {
  const normalizedCat = useMemo(() => normalizeBuySmartCategory(cat), [cat]);
  const trustSignals = useMemo(
    () => getBuySmartTrustSignals(normalizedCat, counters),
    [normalizedCat, counters],
  );
  const logoFallback = useMemo(() => getBrandLogoUrl(normalizedCat), [normalizedCat]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(normalizedCat.img);
  const title = normalizedCat.title;
  const href = normalizedCat.storePath || normalizedCat.link || "#";
  const showFallback = !imageSrc || imageError;
  const savingsText = normalizedCat.discount || normalizedCat.cashback || normalizedCat.points || "View deal";
  const rating = normalizedCat.rating || normalizedCat.score || "4.6";
  const reviewCount = normalizedCat.reviews || normalizedCat.reviewCount || `${Math.max(410, (title.length * 80) % 1200)} reviews`;

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
      className="buy-smart-store-card group flex min-h-[164px] items-center gap-5 overflow-hidden rounded-[24px] border p-5 transition motion-reduce:transform-none"
    >
      <div className="buy-smart-store-logo relative h-28 w-28 shrink-0 overflow-hidden rounded-[22px] border bg-(--card) sm:h-32 sm:w-32">
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
            className={`h-full w-full bg-(--card) object-contain p-5 transition duration-300 group-hover:scale-[1.04] motion-reduce:transform-none ${
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
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 self-stretch flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-lg font-extrabold leading-snug text-(--foreground)">
              {title}
            </h3>
            <p className="mt-1 truncate text-sm font-semibold text-(--muted-foreground)">
              {normalizedCat.category || "All Categories"}
              {normalizedCat.trending || normalizedCat.exclusive ? (
                <span className="text-(--primary)"> · Trending</span>
              ) : null}
            </p>
          </div>
          <span className="buy-smart-store-arrow hidden h-9 w-9 shrink-0 place-items-center rounded-full sm:grid">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <TrustSignalBadges signals={trustSignals} compact showUsage={false} />
          <span className="buy-smart-chip inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[10px] font-bold">
            <TicketPercent className="h-2.5 w-2.5 text-(--primary)" />
            <span className="max-w-[140px] truncate">{savingsText}</span>
          </span>
          {normalizedCat.verified ? (
            <span className="buy-smart-chip-secondary inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[10px] font-bold">
              <BadgeCheck className="h-2.5 w-2.5 text-(--primary)" />
              Verified
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-4 text-sm font-bold text-(--foreground)">
          <Star className="h-4 w-4 fill-[var(--anslation-ds-warning)] text-[var(--anslation-ds-warning)]" />
          <span>{rating}</span>
          <span className="font-semibold text-(--muted-foreground)">({reviewCount})</span>
        </div>
      </div>
    </Link>
  );
}
export default function FilterWithAdCard({
  displayedData = [],
  counters = {},
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
        <div className="buy-smart-themed-panel flex min-h-[45vh] w-full flex-shrink-0 flex-col items-center justify-center gap-3 rounded-[var(--anslation-ds-radius)] border px-4 text-center shadow-[var(--anslation-ds-shadow-sm)]">
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
        <div className="grid min-w-[280px] flex-1 grid-cols-1 gap-5 lg:grid-cols-2">
          {finalData.map((cat) => {
            const normalizedCat = normalizeBuySmartCategory(cat);

            return (
              <CategoryCard
                key={`${normalizedCat.id || normalizedCat.title}-${normalizedCat.img || normalizedCat.link}`}
                cat={normalizedCat}
                counters={counters}
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
