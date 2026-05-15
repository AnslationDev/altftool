"use client";

import Image from "next/image";
import Link from "next/link";

export default function FanficCard({ item }) {
  const coverImage = item.coverImage || item.image;
  const slug = item.slug || item.id || "";

  return (

    <Link
      href={`/wattpad/book/${slug}`}
      className="block"
    >

      <div className="group/card min-w-30 sm:min-w-35 md:min-w-40 lg:min-w-45 [@media(min-width:1700px)]:w-55 cursor-pointer">

        <div className="relative w-full aspect-2/3 rounded-lg overflow-hidden">

          {/* IMAGE */}
          <Image
            src={coverImage}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, (max-width: 1024px) 160px, 180px"
            className="object-cover transition-transform duration-300 group-hover/card:scale-103"
          />

          {/* SHIMMER */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">

            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-700 ease-in-out" />

          </div>

        </div>

      </div>

    </Link>

  );
}
