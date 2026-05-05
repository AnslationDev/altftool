import Image from "next/image";

export default function AdToolCard({ ad }) {
  return (
    
    <a
      href={ad.redirect}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group
        relative
        w-full
        h-[220px]
        overflow-hidden
      "
    >
      {/* Sponsored badge */}
      <span className="absolute top-3 right-3 z-10 text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 bg-black/70 text-white">
        Sponsored
      </span>

      {/* Banner */}
      <Image
        src={ad.bannerUrl}
        alt="Sponsored"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 420px"
        className="
          object-cover
        "
      />
    </a>
  );
}
