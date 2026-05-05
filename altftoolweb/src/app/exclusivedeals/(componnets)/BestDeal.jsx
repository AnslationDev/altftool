"use client";

import React, { useMemo } from "react";
import Slider from "react-slick";
import Image from "next/image";
import Link from "next/link";
import data from "../(data)/db.json";


function BestDeal() {
  const bestDealCategories = useMemo(
    () => data.categories.slice(0, 12),
    []
  );

  const selectedBrands = useMemo(() => {
    return bestDealCategories
      .map((category) => category.brands?.[0])
      .filter(Boolean);
  }, [bestDealCategories]);

  /* ---------- SLIDER SETTINGS ---------- */
  const sliderSettings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: true,
    swipeToSlide: true,

    slidesToShow: 1,
    slidesToScroll: 1,

    responsive: [
      {
        breakpoint: 1024, // tablet
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 640, // large mobile
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480, // small mobile
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="my-8 mx-4 bg-(--background) text-(--foreground) md:my-12">
      <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-semibold my-6 px-4">
        Best Deals, Coupons & Discounts – Save Big with My Exclusive Deals
      </h1>

      {/* ---------- MOBILE + TABLET SLIDER ---------- */}
      <div className="block lg:hidden px-4">
        <Slider {...sliderSettings}>
          {selectedBrands.map((brand, index) => (
            <div key={index} className="px-2">
              <div className="bg-[#F7D777] rounded-xl shadow-lg relative overflow-hidden">
                <Card brand={brand} />
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* ---------- DESKTOP GRID ---------- */}
      <div className="hidden lg:grid grid-cols-4 gap-6 w-[92%]   mx-auto">
        {selectedBrands.map((brand, index) => (
          <div
            key={index}
            className="bg-[#F7D777]  rounded-2xl shadow-lg hover:shadow-xl transition relative overflow-hidden"
          >
            <Card brand={brand} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default BestDeal;

/* ---------- CARD COMPONENT ---------- */
function Card({ brand }) {
  return (
    <>
      {/* Image */}
      <div className="relative h-32  sm:h-40 bg-[#8B7A4A] rounded-t-xl overflow-hidden">
        <Image
          src={brand.imagedeal}
          alt={brand.brandName}
          fill
          className="object-cover grayscale"
        />
        <div className="absolute right-3 top-8 text-white text-lg font-bold text-right">
          Upto 50% <br /> Off
        </div>
      </div>

      {/* Content */}
      <div className="p-3 pb-14 relative">
        <h3 className="text-sm sm:text-lg font-bold text-[#5A4A2F] line-clamp-1">
          Discount at {brand.brandName}
        </h3>

        <p className="mt-1 text-xs sm:text-sm text-[#6B5B3E] line-clamp-2">
          {brand.about}
        </p>

        {/* Brand */}
        <div className="absolute bottom-3 left-3 bg-(--background) px-2 py-1 rounded-md shadow">
          <p className="text-xs">{brand.brandName}</p>
        </div>

        {/* CTA */}
        <Link
          href={brand.website}
          target="_blank"
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-lg shadow-lg hover:scale-110 transition"
        >
          →
        </Link>
      </div>
    </>
  );
}
