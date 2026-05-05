"use client";

export default function AdGameCard({ ad }) {
  return (
    <a
      href={ad.redirect}
      target="_blank"
      rel="noopener noreferrer"
      className="
        relative
        w-full
        h-full
        block
      "
    >
      {/* Sponsored badge */}
      <span className="absolute top-3 right-3 z-10 text-[10px] px-2 py-1 rounded-full bg-black/70 text-white">
        Sponsored
      </span>

      {/* Banner */}
      <img
        src={ad.bannerUrl}
        alt="Sponsored"
        className="absolute inset-0 w-full h-full object-fit"
      />
    </a>
  );
}
