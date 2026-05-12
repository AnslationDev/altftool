"use client";

import Image from "next/image";
import BrandCard from "./BrandCard";
import { useFirebaseData } from "../hooks/data.service";

export function Section2({ title, tagline, image, brands }) {
  // Show first 4 brands
  const featured = brands.slice(0, 4);

  return (
    <div className="w-full section space-y-10">
      {/* Top: image left, title/tagline right */}
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Image */}
        <div className="bg-(--card  ) rounded-xl shadow-lg p-4">
          {image ? (
            <Image
              src={image}
              alt={title || "Section image"}
              width={700}
              height={400}
              className="rounded-lg object-cover w-full"
            />
          ) : (
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
              No Image
            </div>
          )}
        </div>

        {/* Title + tagline */}
        <div className="text-center md:text-left space-y-4">
          <h2 className="text-4xl md:text-5xl font-semibold text-pink-500 text-center">
            {title || "Featured Stores"}
          </h2>
          <div className="w-full h-[2px] bg-pink-400" />
          <p className="text-pink-400 text-xl tracking-wide text-center">
            {tagline || ""}
          </p>
        </div>
      </div>

      {/* Brand cards grid */}
      {featured.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((brand) => (
            <BrandCard
              key={brand.id}
              logo={brand.logo}
              name={brand.title}
              percentage={brand.cashback ?? brand.discount}
              prefix={brand.cashback ? "" : "Up to"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Section2Wrapper() {
  const { sections, brands } = useFirebaseData();
  const section = sections?.[1];

  return (
    <Section2
      title={section?.title}
      tagline={section?.tagline}
      image={section?.image}
      brands={brands}
    />
  );
}