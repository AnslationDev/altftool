"use client";

import Image from "next/image";
import { TriangleAlert } from "lucide-react";
import { firebaseBuySmartCategoriesSource } from "../service.js/firebaseBuySmartCategories";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SkeletonBlock } from "@/components/ui/skeleton";


function CategoryCard({ cat }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={cat.link} target="_blank">
      <div
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
                {!imageLoaded ? (
                  <SkeletonBlock className="absolute inset-0 rounded-[16px]" />
                ) : null}
                {!imageError && cat.img ? (
                  <Image
                    key={cat.img}
                    src={cat.img}
                    alt={cat.title}
                    width={300}
                    height={200}
                    className={`w-full h-full object-fill transition-opacity duration-500 ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                ) : null}
              </div>

              <div className="flex flex-col gap-2 flex-1 mt-2">
                <h3 className="font-bold text-[18px] sm:text-[20px] md:text-[22px] leading-[1.5] text-[#4A5565] text-center line-clamp-2">
                  {cat.title}
                </h3>
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
            <h3 className="font-bold text-[20px] sm:text-[22px] md:text-[24px] text-white leading-snug">
              {cat.title}
            </h3>
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
          {finalData.map((cat) => (
            <CategoryCard key={`${cat.id || cat.title}-${cat.img || ""}`} cat={cat} />
          ))}
        </div>
      )}


      {/* Right: Ad */}
      {/* <div className="flex-1 min-w-[250px] max-w-[400px] p-4 sm:p-6">
        {rightAd?.content && <AdSidebar ad={rightAd.content} />}
      </div> */}
    </div>
  );
}
