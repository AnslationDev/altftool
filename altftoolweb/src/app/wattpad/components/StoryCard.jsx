"use client";

import Image from "next/image";
import Link from "next/link";

export default function StoryCard({ item }) {
  const coverImage = item.coverImage || item.image;
  const author = item.authorId || item.author || "AltFTool Picks";
  const slug = item.slug || item.id || "";

  return (

    <Link
      href={`/wattpad/book/${slug}`}
      className="block"
    >

      <div className="group/story min-w-30 sm:min-w-35 md:min-w-40 lg:min-w-45 [@media(min-width:1700px)]:w-55 cursor-pointer">

        {/* IMAGE */}
        <div className="relative w-full aspect-2/3 rounded-lg overflow-hidden shadow-sm">

          {/* IMAGE */}
          <Image
            src={coverImage}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, (max-width: 1024px) 160px, 180px"
            className="object-cover transition-transform duration-300 group-hover/story:scale-103"
          />

          {/* SHIMMER */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">

            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/story:translate-x-full transition-transform duration-700 ease-in-out" />

          </div>

        </div>

        {/* TEXT */}
        <div className="mt-2 px-1">

          <h3 className="text-sm font-semibold text-(--foreground) line-clamp-1">
            {item.title}
          </h3>

          <p className="text-xs text-(--muted-foreground) line-clamp-1">
            {author}
          </p>

        </div>

      </div>

    </Link>

  );

}
