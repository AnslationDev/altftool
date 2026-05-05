"use client";

import Image from "next/image";

export default function FanficCard({ item }) {
  return (
    <div className="min-w-[120px] sm:min-w-[140px] md:min-w-[160px] lg:min-w-[180px]  cursor-pointer">
      <div className="relative w-full aspect-2/3 rounded-lg overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, (max-width: 1024px) 160px, 180px"
          className="object-cover transition-all duration-300 hover:scale-103"
        />
      </div>
    </div>
  );
}
