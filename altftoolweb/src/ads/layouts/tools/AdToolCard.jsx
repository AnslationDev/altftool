import ManagedImage from "@/components/ui/ManagedImage";

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
      <ManagedImage
        src={ad.bannerUrl}
        alt="Sponsored"
        fill
        loading="eager"
        className="
          object-cover
        "
      />
    </a>
  );
}
