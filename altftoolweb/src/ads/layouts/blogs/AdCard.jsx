"use client";
import Image from "next/image";

export default function AdCard({ src, height = "h-40" }) {
  return (
    <div className={`relative overflow-hidden shadow-md ${height}`}>
      <Image
        src={src}
        alt="Advertisement"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
        className="object-fill"
      />
      <span className="absolute top-2 left-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
        Sponsored
      </span>
    </div>
  );
}
