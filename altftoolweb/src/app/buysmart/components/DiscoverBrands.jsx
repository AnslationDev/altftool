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
    <div className="   mx-auto px-4 sm:px-6 animate-slide-up  text-center">
      <h1 className="section-title  text-(--foreground)">
        The Smarter Way To  Discover Brands
      </h1>

      <p className=" section-subtitle">
        Discover brands loved by users across all categories.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-0 items-stretch">
        {features.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="relative h-full px-6 sm:px-8 md:px-10 py-6 sm:py-8 md:py-10 flex flex-col text-left 
          bg-(--card) md:bg-transparent rounded-xl md:rounded-none shadow-sm md:shadow-none sm:gap-3 space-y-2"
            >
              <div className="flex items-center gap-3 ">
                <Icon className="text-(--primary) w-4 h-4 md:w-6 md:h-6 lg:w-7 lg:h-7 shrink-0" />

                <h3 className="section-subtitle  leading-tight m-0">
                  {item.title}
                </h3>
              </div>

              <p className=" text-[10px] sm:text-[10px]  lg:text-[16px] xl:text-[18px]   text-(--muted-foreground) leading-relaxed max-w-full">
                {item.desc}
              </p>


              {index !== features.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-24 md:h-28 w-px bg-gray-300"></div>
              )}


            </div>
          );
        })}
      </div>
    </div>
  );
}