"use client";

import Image from "next/image";
import Link from "next/link";
import categories from "../data/categories.json"; 

export default function BrowseCategory() {
  return (
    <div className="section animate-slide-up">
      <h2 className="section-title">Browse Categories</h2>

      <p className="section-subtitle mx-0! text-left">
        Explore stories across romance, fantasy, thriller & more
      </p>

      {/* Mobile: scroll | Desktop: grid */}
      <div
        className="
        flex gap-4 overflow-x-auto pb-2 scrollbar-hide
        lg:grid lg:grid-cols-6 lg:gap-2 lg:overflow-visible no-scrollbar
      "
      >
        {categories.map((item) => (
          <div
            key={item.id}
            className="shrink-0 lg:shrink animate-slide-right"
          >
            <Link href={`/wattpad/category/${item.slug}`}>
              <CatCard item={item} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

/*  CARD COMPONENT  */

function CatCard({ item }) {
  return (
    <div className="flex justify-center items-center cursor-pointer flex-col min-h-35 py-4 ">
      
      {/* Circle Image */}
      <div
        className="
        rounded-full flex justify-center items-center overflow-hidden bg-[#f4f2f2] group
        w-22 h-22 sm:w-24 sm:h-24 md:w-26 md:h-26
        lg:w-30 lg:h-30 xl:w-36 xl:h-36 2xl:w-40 2xl:h-40
       
      "
      >
        <Image
          src={item.coverImage}
          width={100}
          height={100}
          alt={item.name}
          className="
          object-cover transition-transform duration-300 group-hover:scale-105
          w-19.5 h-19.5 sm:w-21 sm:h-21 md:w-23 md:h-23
          lg:w-27 lg:h-27
          xl:w-33 xl:h-33 2xl:w-37 2xl:h-37 rounded-full
        "
        />
      </div>

      {/* Category Name */}
      <div className="text-center mt-2 text-xs sm:text-sm font-bold">
        {item.name}
      </div>
    </div>
  );
}