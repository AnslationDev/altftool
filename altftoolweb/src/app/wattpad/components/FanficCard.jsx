"use client";

import Image from "next/image";
import Link from "next/link";

export default function FanficCard({ item }) {
  const coverImage = item.coverImage || item.image;
  const slug = item.slug || item.id || "";

  return (
    <Link href={`/wattpad/book/${slug}`} className="block wp-story-card">
      <div className="wp-story-card-cover">
        <Image
          src={coverImage}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, (max-width: 1024px) 160px, 180px"
          className="object-cover transition-transform duration-300"
        />
        <div className="wp-story-card-shimmer" />
      </div>
    </Link>
  );
}
