"use client";

export default function AdBottomBanner({ ad }) {
  if (!ad) return null;

  return (
    <div className="mt-12 w-full">
      <a
        href={ad.redirect}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block w-full h-[200px] overflow-hidden"
      >
        <span className="absolute top-2 right-2 z-10 text-[10px] px-2 py-1 bg-black/70 text-white rounded-full">
          Sponsored
        </span>

        <img
          src={ad.bannerUrl}
          alt="Sponsored"
          className="absolute inset-0 w-full h-full object-fit"
        />
      </a>
    </div>
  );
}
