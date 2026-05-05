"use client";

import Image from "next/image";

export default function StoryCard({ item }) {
  return (
    <div className="group min-w-[120px] sm:min-w-[140px] md:min-w-[160px] lg:min-w-[180px] cursor-pointer">
      
      {/* IMAGE */}
      <div className="relative w-full aspect-2/3 rounded-lg overflow-hidden shadow-sm">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover hover:scale-103 transition-transform duration-300"
        />
        {/* shimmer */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
      </div>

      {/* TEXT */}
      <div className="mt-2 px-1">
        <h3 className="text-sm font-semibold text-(--foreground) line-clamp-1">
          {item.title}
        </h3>
        <p className="text-xs text-(--muted-foreground) line-clamp-1">
          {item.author}
        </p>
      </div>
    </div>
  );
}