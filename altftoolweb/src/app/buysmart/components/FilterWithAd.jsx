"use client";

import { BadgeCheck, Clock3, Sparkles, TicketPercent, TriangleAlert } from "lucide-react";
import { firebaseBuySmartCategoriesSource } from "../service.js/firebaseBuySmartCategories";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { SkeletonBlock } from "@/components/ui/skeleton";
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
  const href = normalizedCat.link;
  const showFallback = !imageSrc || imageError;
  const savingsText = normalizedCat.discount || normalizedCat.cashback || normalizedCat.points || "View deal";

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setImageSrc(normalizedCat.img);
  }, [normalizedCat.img]);

  const handleImageError = () => {
    if (logoFallback && imageSrc !== logoFallback) {
      setImageLoaded(false);
      setImageSrc(logoFallback);
      return;
    }

    setImageError(true);
  };

  return (
    <Link href={href} target="_blank">
      <div
        data-testid="buysmart-category-card"
        className="group w-full cursor-pointer"
        style={{ perspective: "1200px" }}
      >
        <div
          className="
            relative w-full
            h-[280px] sm:h-[300px] md:h-[320px] lg:h-[340px] xl:h-[360px]
            transition-transform duration-700 ease-in-out
            [transform-style:preserve-3d]
            group-hover:[transform:rotateY(180deg)]
          "
        >
          {/* FRONT SIDE = ORIGINAL CARD UI */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="relative flex flex-col w-full rounded-[20px] overflow-hidden">
              <div className="relative w-full h-[240px] sm:h-[260px] md:h-[280px] lg:h-[300px] xl:h-[320px] rounded-[16px] overflow-hidden flex items-center justify-center">
                {imageSrc && !imageLoaded && !imageError ? (
                  <SkeletonBlock className="absolute inset-0 rounded-[16px]" />
                ) : null}
                {!imageError && imageSrc ? (
                  <img
                    data-testid="buysmart-category-image"
                    key={imageSrc}
                    src={imageSrc}
                    alt={title}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className={`h-full w-full bg-(--card) object-contain p-8 transition-opacity duration-500 ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={handleImageError}
                  />
                ) : null}
                {showFallback ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-[16px] border border-(--border) bg-(--muted) px-4 text-center">
                    <span className="grid h-14 w-14 place-items-center rounded-[var(--anslation-ds-radius)] bg-(--primary) text-xl font-bold text-(--primary-foreground)">
                      {title.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold text-(--muted-foreground)">
                      Verified brand
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 flex-1 mt-2">
                <h3 className="font-bold text-[18px] sm:text-[20px] md:text-[22px] leading-[1.5] text-(--foreground) text-center line-clamp-2">
                  {title}
                </h3>
                <div className="mx-auto flex max-w-full flex-wrap justify-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-(--border) bg-(--muted) px-2 py-1 text-[11px] font-semibold text-(--muted-foreground)">
                    <TicketPercent className="h-3 w-3 text-(--primary)" />
                    {savingsText}
                  </span>
                  {normalizedCat.verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-(--border) bg-(--background) px-2 py-1 text-[11px] font-semibold text-(--muted-foreground)">
                      <BadgeCheck className="h-3 w-3 text-(--primary)" />
                      Verified
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* BACK SIDE = BLUE BG + CENTER WHITE TITLE */}
          <div
            className="
              absolute inset-0 rounded-[20px]
              bg-(--primary)
              flex items-center justify-center
              px-4 text-center
            "
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
            }}
          >
            <div className="space-y-3">
              <div className="flex justify-center gap-2">
                {normalizedCat.exclusive ? (
                  <Sparkles className="h-5 w-5 text-white" />
                ) : (
                  <TicketPercent className="h-5 w-5 text-white" />
                )}
                {normalizedCat.expiresAt ? (
                  <Clock3 className="h-5 w-5 text-white" />
                ) : null}
              </div>
              <h3 className="font-bold text-[20px] sm:text-[22px] md:text-[24px] text-white leading-snug">
                {title}
              </h3>
              <p className="text-sm font-semibold text-white/85">
                {normalizedCat.code || savingsText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
export default function FilterWithAdCard({
  displayedData = [],
  searchInput,
}) {
  const [liftingData, setLiftingData] = useState([]);

  useEffect(() => {
    const unsub = firebaseBuySmartCategoriesSource.subscribe((data) => {
      setLiftingData(data || []);
    });
    return () => unsub && unsub();
  }, []);
  const finalData =
    searchInput && searchInput.trim() !== ""
      ? liftingData.filter((item) =>
          item.title?.toLowerCase().includes(searchInput.toLowerCase()),
        )
      : displayedData;




  return (
    <div
      className="
        flex flex-wrap items-start justify-center
        w-full
        rounded-b-[30px]
        gap-6
      "
    >
      {/* Left: Cards */}
      {finalData.length === 0 ? (
        <div className="w-full min-h-[50vh]  flex flex-col items-center justify-center gap-3 flex-shrink-0">
          <div className="flex items-center justify-center">
            <TriangleAlert className="w-11 h-11" />
          </div>
          <h3 className="text-center font-manrope font-bold text-[22.755px] leading-[35.397px]">
            No Brands Available
          </h3>

          {/* Subtitle */}
          <p className="text-[#6B7280] text-center font-normal text-[22.755px] leading-[35.397px]">
            We couldn’t find any brands for this letter
          </p>
          <p className="text-[#2563EB]"> Try another one</p>
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
