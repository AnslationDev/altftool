"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ThumbsUp, Star, StarHalf, Truck, ShieldCheck, Home, ArrowUpRight } from "lucide-react";

function HeroSection({ brand, category }) {
  const normalizeBenefits = (benefits) => {
    if (!benefits) return [];
    if (Array.isArray(benefits)) return benefits;
    if (typeof benefits === "object") return Object.values(benefits);
    return [];
  };

  const benefitsData = normalizeBenefits(
    brand?.additionalBenefits || brand?.additionalBenefit
  );
  const safeRating = Math.max(0, Math.min(5, Number(brand?.rating ?? 0)));

  const fullStars = Math.floor(safeRating);
  const hasHalf = safeRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);


  return (
    <section className="section animate-slide-up">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 sm:gap-8 md:gap-10 lg:gap-16 items-start">

        {/* LEFT SIDE */}
        <div className="animate-slide-right">

          {/* MAIN IMAGE */}
          <div className="relative h-[220px] sm:h-[300px] md:h-[360px] lg:h-[480px] rounded-2xl overflow-hidden shadow-lg ">
            <Image
              src={brand.images?.[0]}
              alt={brand.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* THUMBNAILS */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-2 w-full">
            {[...Array(3)].map((_, index) => {
              const img = brand.images?.[index + 1] || brand.images?.[0];

              return (
                <div
                  key={index}
                  className="relative w-full h-[70px] sm:h-[90px] md:h-[110px] rounded-xl overflow-hidden border border-gray-200"
                >
                  <Image
                    src={img || "/placeholder.jpg"}
                    alt="product"
                    fill
                    sizes="(max-width: 1024px) 33vw, 180px"
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="pt-2 flex flex-col gap-3 sm:gap-4 lg:gap-4 animate-slide-left" style={{ animationDelay: "140ms" }}>

          <h1 className="section-title">
            {brand.name} {brand.subCategory || category?.category}
          </h1>

          <p className="text-base font-semibold mb-2">
            {brand?.updatedAt?.toDate?.()?.toLocaleDateString?.() ||
              brand?.createdAt?.toDate?.()?.toLocaleDateString?.() ||
              "Recently Updated"}
          </p>

          <div className="flex items-center gap-2 text-(--muted-foreground) mb-4 font-semibold">
            <ThumbsUp className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            {brand?.visits ?? 4101}  People Visited This Week
          </div>

          <p className="text-(--muted-foreground) mb-6 leading-relaxed">
            {brand?.description}
          </p>

        
          {/* ADDITIONAL BENEFITS */}
          {benefitsData.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-6 lg:mb-8">
              {benefitsData.map((benefit, i) => (
                <div key={i} className="flex flex-col items-center text-center">

                  <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-full bg-(--primary)/10 flex items-center justify-center mb-2">
                    {benefit?.icon ? (
                      <span
                        className="text-(--primary) w-7 h-7"
                        dangerouslySetInnerHTML={{ __html: benefit.icon }}
                      />
                    ) : (
                      <ShieldCheck className="text-(--primary) w-7 h-7" />
                    )}
                  </div>

                  <p className="text-xs sm:text-sm lg:text-base text-(--muted-foreground)">
                    {benefit?.text || benefit?.title || benefit?.heading}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6 pt-4 lg:pt-6">

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex">
                  {[...Array(fullStars)].map((_, i) => (
                    <Star key={`f-${i}`} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}

                  {hasHalf && <StarHalf className="w-6 h-6 fill-yellow-400 text-yellow-400" />}

                  {[...Array(emptyStars)].map((_, i) => (
                    <Star key={`e-${i}`} className="w-6 h-6 text-gray-300" />
                  ))}
                </div>

                <span className="text-2xl font-semibold">
                  {Number.isInteger(safeRating) ? safeRating : safeRating.toFixed(1)}/5
                </span>
              </div>

              <p className="text-lg">
                Trusted By {brand?.visits ?? 1200}+ Customers
              </p>
            </div>

            <Link
              href={brand?.brandLink}
              target="_blank"
              className="group w-full sm:w-auto h-[48px] sm:h-[52px] lg:h-[60px] px-5 sm:px-6 lg:px-7 rounded-full flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg font-semibold bg-[var(--primary)] text-white"
            >
              View Site
              <ArrowUpRight className="w-4 h-4 md:w-6 md:h-6 transition-transform duration-300 group-hover:[transform:rotate(45deg)]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
