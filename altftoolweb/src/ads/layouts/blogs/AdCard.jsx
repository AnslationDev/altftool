"use client";
import ManagedImage from "@/components/ui/ManagedImage";

export default function AdCard({ src, height = "h-40" }) {
  return (
    <div className={`relative overflow-hidden shadow-md ${height}`}>
      <ManagedImage
        src={src}
        alt="Advertisement"
        fill
        className="object-fill"
      />
      <span className="absolute top-2 left-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
        Sponsored
      </span>
    </div>
  );
}
