"use client";

import Image from "next/image";

export default function ProductBanner({ brand }) {
  return (
    <div className="w-full flex justify-center section animate-slide-up">
      <div className="w-full  px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden w-full h-[200px] xs:h-[240px] sm:h-[300px] md:h-[360px] lg:h-[432px] rounded-2xl sm:rounded-[24px] lg:rounded-[30px] border border-(--border)">
          <Image
            src={
              brand?.bannerImage ||
              brand?.images?.[0] 
         
            }
            alt={`${brand?.name || "product"} banner`}
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover transition-transform duration-500 hover:scale-105"
            priority
          />
        </div>
      </div>
    </div>
  );
}
