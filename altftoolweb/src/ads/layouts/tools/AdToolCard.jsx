import AdBannerCard from "@/ads/layouts/shared/AdBannerCard";

// In-feed card for the tools listing. Height is reserved (h-[220px]) so the
// injected row never shifts the grid.
//
// The creative is intentionally NOT eager: these cards are injected every 6
// tiles into a grid that is a single column below 700px, so `loading: "eager"`
// pulled every ad image down the wire ahead of the tool tiles the visitor came
// for. ManagedImage defaults to lazy, which still loads the slot immediately
// when it is on screen.
export default function AdToolCard({ ad }) {
  return (
    <AdBannerCard
      ad={ad}
      className="group relative w-full h-[220px] overflow-hidden"
      imageClassName="object-cover"
      fill
      badgeClassName="absolute top-3 right-3 z-10 text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 bg-black/70 text-white"
    />
  );
}
