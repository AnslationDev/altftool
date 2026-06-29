"use client";

import Image from "next/image";
import Link from "next/link";

export default function StoryCard({ item }) {
  const coverImage = item.coverImage || item.image;
  const author = item.authorId || item.author || "AltFTool Picks";
  const slug = item.slug || item.id || "";

  return (
    <Link href={`/wattpad/book/${slug}`} className="block wp-story-card">
      <div className="wp-story-card-cover">
        <Image
          src={coverImage}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 140px, (max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
          className="object-cover transition-transform duration-300 group-hover/story:scale-103"
        />
        <div className="wp-story-card-shimmer" />
      </div>
      <div className="wp-story-card-title">{item.title}</div>
      <div className="wp-story-card-author">{author}</div>
    </Link>
  );
}
