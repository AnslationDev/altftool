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
        w-22 h-22 md:w-26 md:h-26 
        lg:w-30 lg:h-30 xl:w-35 xl:h-35  [@media(min-width:1700px)]:w-40 [@media(min-width:1700px)]:h-40
       
      "
      >
        <Image
          src={item.coverImage}
          width={100}
          height={100}
          alt={item.name}
          className="
          object-cover transition-transform duration-300 group-hover:scale-104
          w-20.5 h-20.5 md:w-23 md:h-23
          lg:w-27 lg:h-27
          xl:w-32 xl:h-32  [@media(min-width:1700px)]:w-36.5 [@media(min-width:1700px)]:h-36.5 rounded-full
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