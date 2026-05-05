"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import data from "../(data)/db.json";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CouponModal from "./CouponModal";
import { outletDeals } from "../service/firebaseoutletdealscard";
import { OutletDealsSkeleton } from "../DealsPageSkeleton";

function OutletDealsCard() {
  const selectedBrands = useMemo(
    () =>
      data.categories
        .slice(0, 8)
        .map((cat) => cat.brands?.[0])
        .filter(Boolean),
    [],
  );

  const [topdeals, setTopdeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const topbrands = topdeals.slice(0, 8);

  useEffect(() => {
    const unsubscribe = outletDeals((data) => {
      setTopdeals(data);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  const scrollRef = useRef(null);

  const [activeCoupon, setActiveCoupon] = useState("");

  // Auto scroll carousel
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const interval = setInterval(() => {
      const cardWidth = el.querySelector(".card-slide")?.offsetWidth || 300;
      const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
      if (isAtEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <OutletDealsSkeleton />;

  return (
    <section className="section animate-slide-up">
      <div className="lg:mb-12 mb-6">
        <h2 className="section-title">Top Coupons from Trusted Brands</h2>
        <p className="section-subtitle mx-0! text-left ">
          Verified deals. Updated daily. No expired coupons
        </p>
      </div>

      {/* CAROUSEL — Untill 1400px */}
      <div className="[@media(min-width:1400px)]:hidden">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-3 pt-6 px-2 scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {topbrands.length > 0 &&
            topbrands?.map((brand, i) => (
              <div key={i} className="card-slide snap-start shrink-0 px-1 sm:px-2 md:px-4">
                <Card
                  brand={brand}
                  onClick={() => {
                    setActiveLink(brand.link);
                    setActiveCoupon(brand.code);
                    setShowModal(true);
                  }}
                />
              </div>
            ))}
        </div>
      </div>

      <div className="hidden [@media(min-width:1400px)]:grid [@media(min-width:1400px)]:grid-cols-4  gap-6 ">
        {topbrands.length > 0 &&
          topbrands?.map((brand, i) => (
            <Card
              key={i}
              brand={brand}
              onClick={() => {
                setActiveLink(brand.link);
                setActiveCoupon(brand.code);
                setShowModal(true);
              }}
              className="w-full mb-10 animate-scale-in"
            />
          ))}
      </div>
      <CouponModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        link={activeLink}
        couponCode={activeCoupon}
      />
    </section>
  );
}

export default OutletDealsCard;

function Card({ brand, className = "w-55 sm:w-62 md:w-72 mb-6 md:mb-10", onClick }) {
    const formatDiscount = (discount) => {
  if (!discount) return "";

  const str = discount.toString().trim();

  // if already contains %, return as it is
  if (str.includes("%")) return str;

  // if it's a number, add %
  if (!isNaN(str)) return `${str}%`;
  return str;
};
  return (
    <div className={className}>
      <div className="relative group  cursor-pointer w-full h-57 md:h-70 [@media(min-width:1650px)]:h-80">
        <svg
          viewBox="0 0 412 412"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          <path
            d="M412 258C412 280.091 394.091 298 372 298H345C322.909 298 305 315.909 305 338V372C305 394.091 287.091 412 265 412H40C17.9086 412 0 394.091 0 372V40C0 17.9086 17.9086 0 40 0H372C394.091 0 412 17.9086 412 40V258Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1"
            filter="url(#shadow)"
          />
        </svg>

        <div className="relative z-20 h-full flex flex-col justify-between">
          <div className="flex z-10 items-center justify-between h-14 md:h-18 bg-(--primary) rounded-t-2xl px-3">
            <div className="h-19 md:h-24 mb-5 md:mb-6 z-10 relative w-17 md:w-20">
              <Image
                src={brand.brandimage}
                alt={brand.brandname}
                fill
                sizes="(max-width: 768px) 68px, 80px"
                className="object-cover  "
              />
            </div>

            <div className="text-right  text-xl [@media(min-width:1650px)]:text-[26px] text-white font-bold">
              Up to {formatDiscount(brand.discount)}
            </div>
          </div>

          <div className="px-4 py-4 flex-1">
            <h2 className="text-base md:text-lg font-bold text-gray-800 [@media(min-width:1650px)]:text-[22px] ">
              Coupon on {brand.brandname}
            </h2>

            <p className="text-sm text-gray-700 mt-2 line-clamp-2 [@media(min-width:1650px)]:line-clamp-3 [@media(min-width:1650px)]:text-base">
              {brand.description}
            </p>
          </div>

          <div className="flex items-center justify-between px-3 pb-3 ">
            <div className="w-29 sm:w-30 py-5 relative [@media(min-width:1650px)]:w-40">
              <Image
                src={brand.brandlogo}
                alt="samraat"
                fill
                sizes="(max-width: 640px) 116px, (max-width: 1650px) 120px, 160px"
                className="object-contain"
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation(); // optional but safer

                onClick?.();
              }}
              className="w-10 h-10 md:w-14 md:h-14 [@media(min-width:1650px)]:w-17 [@media(min-width:1650px)]:h-17  bg-(--primary) text-white rounded-full flex items-center justify-center text-xl hover:scale-110 transition"
            >
              <ArrowRight
                size={30}
                className="-rotate-45 group-hover:rotate-0 transition-transform duration-150"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
