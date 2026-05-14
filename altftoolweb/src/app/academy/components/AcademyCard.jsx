"use client";

import React from "react";
import Image from "next/image";
import { Star, ArrowUpRight } from "lucide-react";
import { SkeletonBlock } from "@/components/ui/skeleton";

export default function AcademyCard({ academy }) {
  if (!academy) return null;
  return (
    <a
      href={academy?.academyUrl || "#"}
      id="academy-card"
      target="_blank"
      rel="noopener noreferrer"
      className="
        group flex w-full min-w-0 flex-col justify-between
        rounded-[8px] border border-[var(--border)]
        shadow-[0px_12px_24px_0px_#0F172A05]
        p-5 sm:p-6 
      "
    >

      <div className="flex items-center justify-between mb-4">

        <div className="relative h-10 w-32 sm:h-12 sm:w-36">
          <AcademyLogoImage key={academy.image || academy.id || academy.name} academy={academy} />
        </div>

        <div className="flex h-[28px] items-center gap-[6px] rounded-[7px] border border-[#E5E7EB] bg-[#F8FAFC] px-[10px] text-sm font-medium text-[var(--foreground)]">
          <Star size={16} className="fill-yellow-500 stroke-yellow-500 " />
          {academy.rating}
        </div>
      </div>

      <span
        className="
          mb-3 w-fit rounded-[7px]
          bg-(--primary)/10 text-(--primary)
          px-3 py-1.5 lg:py-2 text-center text-[11px] font-extrabold uppercase  leading-none tracking-[0.55px]
    
        "
      >
        {academy.subCategory}
      </span>


      <div className="flex flex-col gap-1.5 lg:gap-2 mb-4 lg:mb-6">
        <h3 className="text-[17px] sm:text-[20px] leading-[1.3] sm:leading-[24px] tracking-[0px] font-extrabold ">
          {academy.name}
        </h3>

        <p className="font-semibold text-(--muted-foreground) text-[13px] sm:text-[15px] leading-[1.5] sm:leading-[22.5px] tracking-[0px] line-clamp-3">
          {academy.description}
        </p>
      </div>


      {academy.features?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 lg:mb-6 ">
          {academy.features.map((s, i) => (
            <span
              key={i}
              className="
                inline-flex items-center
                rounded-[6px]
                border border-[#E5E7EB]
                bg-[#F8FAFC]
                px-3 py-[5px]
                text-xs font-medium text-gray-600
              "
            >
              {s}
            </span>
          ))}
        </div>
      )}


      <div className="w-full h-px bg-[#E2E8F0] mb-4" />


      <div className="flex items-center justify-between">

        <div className="flex flex-col leading-tight">
          <span className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#4A5565]">
            Starting at
          </span>

          <span className="flex items-center gap-1 text-base font-extrabold text-(--foreground)">

            ₹{academy.price}
          </span>
        </div>


        <span className="academy-btn !text-sm !px-3 !py-2.5 !gap-0.75 whitespace-nowrap">
          <span>Visit Platform</span>

          <span className="academy-btn-icon overflow-visible w-4 h-4 ">
            <ArrowUpRight className="icon-out" />
            <ArrowUpRight className="icon-in" />
          </span>
        </span>
      </div>
    </a>
  );
}

function AcademyLogoImage({ academy }) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const fallbackLabel = String(academy?.name || "A").trim().slice(0, 2).toUpperCase();

  return (
    <>
      {!imageLoaded && !imageError ? (
        <SkeletonBlock className="absolute inset-0 rounded-lg" />
      ) : null}
      {!imageError && academy.image ? (
        <Image
          src={academy.image}
          alt={academy?.name || "academy"}
          fill
          sizes="96px"
          className={`object-contain transition-opacity duration-500 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-(--border) bg-(--muted) text-sm font-extrabold text-(--primary)">
          {fallbackLabel}
        </div>
      )}
    </>
  );
}
