import { Star, Search, BadgeCheck } from "lucide-react";

const features = [
  {
    icon: BadgeCheck,
    title: "Trusted Ratings & Reviews",
    desc: "A gold standard for excellence, rated by our most discerning users.",
  },
  {
    icon: Star,
    title: "100+ Verified Brands",
    desc: "Verified experiences from people who have actually used the brand.",
  },
  {
    icon: Search,
    title: "Easy Brand Discovery",
    desc: "Find exactly what you need in seconds with our intuitive search.",
  },
];

export default function DiscoverBrands() {
  return (
    <div className="mx-auto px-4 text-center animate-slide-up sm:px-6">
      <h1 className="section-title text-(--foreground)">
        The Smarter Way To Discover Brands
      </h1>

      <p className="section-subtitle">
        Discover brands loved by users across all categories.
      </p>

      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-0">
        {features.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="relative flex h-full flex-col space-y-2 rounded-[var(--anslation-ds-radius)] bg-(--card) px-6 py-6 text-left shadow-[var(--anslation-ds-shadow-sm)] sm:gap-3 sm:px-8 sm:py-8 md:rounded-none md:bg-transparent md:px-10 md:py-10 md:shadow-none"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0 text-(--primary) md:h-6 md:w-6 lg:h-7 lg:w-7" />

                <h3 className="section-subtitle m-0 leading-tight">
                  {item.title}
                </h3>
              </div>

              <p className="max-w-full text-xs leading-relaxed text-(--muted-foreground) lg:text-base xl:text-lg">
                {item.desc}
              </p>

              {index !== features.length - 1 && (
                <div className="absolute right-0 top-1/2 hidden h-24 w-px -translate-y-1/2 bg-(--border) md:block md:h-28" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
