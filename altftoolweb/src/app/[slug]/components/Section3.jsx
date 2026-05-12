"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BrandCard from "./BrandCard";
import { useFirebaseData } from "../hooks/data.service";

/* =========================
   FEATURED AUTO CAROUSEL
========================= */
function FeaturedCarousel({ brands = [] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!brands.length) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % brands.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [brands]);

  const brand = brands[index];
  if (!brand) return null;

  const dealLabel = brand.cashback
    ? `${String(brand.cashback).replace(/^0+/, "")}% Cash Back`
    : brand.discount
    ? `Up to ${String(brand.discount).replace(/^0+/, "")}%`
    : null;

  return (
    <Link
      href={brand.redirect || "#"}
      className="group block relative rounded-2xl overflow-hidden border border-(--border) bg-(--card) shadow-sm hover:shadow-lg transition"
    >
      {/* Banner */}
      <div className="relative w-full h-[340px]">
        <Image
          src={brand.banner}
          alt={brand.title}
          fill
          className="object-cover group-hover:scale-105 transition duration-500"
          priority
        />

        {/* Logo circle */}
        {brand.logo && (
          <div className="absolute top-5 left-5 bg-(--card) rounded-full p-3 shadow-md">
            <Image
              src={brand.logo}
              alt=""
              width={45}
              height={45}
              className="object-contain"
            />
          </div>
        )}
      </div>

      {/* Bottom content */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-semibold text-(--foreground)">
          {brand.title}
        </h3>

        {dealLabel && (
          <p className="text-pink-600 font-bold text-sm mt-1">
            {dealLabel}
          </p>
        )}
      </div>
    </Link>
  );
}

/* =========================
   MAIN SECTION
========================= */
export function Section3({ title, tagline, brands = [] }) {
  if (!brands.length) return null;

  return (
    <div className="w-full section space-y-6">
      
      {/* Header */}
      {(title || tagline) && (
        <div className="bg-pink-400 rounded-2xl px-6 py-4">
          {title && (
            <h2 className="text-white text-4xl font-bold uppercase">
              {title}
            </h2>
          )}
          {tagline && (
            <p className="text-pink-100 text-sm mt-1">
              {tagline}
            </p>
          )}
        </div>
      )}

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT — Featured Auto Slider */}
        <div className="">
          <FeaturedCarousel brands={brands.slice(0, 5)} />
        </div>

        {/* RIGHT — Grid (matches screenshot) */}
        <div className="grid grid-cols-2 grid-rows-2 gap-4">
          {brands.slice(0, 4).map((brand) => (
            <BrandCard
              key={brand.id}
              logo={brand.logo}
              name={brand.title}
              percentage={brand.cashback ?? brand.discount}
              prefix={brand.cashback ? "" : "Up to"}
            />
          ))}
        </div>
      </div>

      {/* Bottom row (remaining brands like screenshot) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {brands.slice(4).map((brand) => (
          <BrandCard
            key={brand.id}
            logo={brand.logo}
            name={brand.title}
            percentage={brand.cashback ?? brand.discount}
            prefix={brand.cashback ? "" : "Up to"}
          />
        ))}
      </div>
    </div>
  );
}

/* =========================
   WRAPPER
========================= */
export default function Section3Wrapper() {
  const { sections, brands } = useFirebaseData();
  const section = sections?.[2];

  return (
    <Section3
      title={section?.title}
      tagline={section?.tagline}
      brands={brands}
    />
  );
}