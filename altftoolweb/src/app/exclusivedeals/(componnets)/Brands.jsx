"use client"

import data from "../(data)/db.json"
import ManagedImage from "@/components/ui/ManagedImage";

const   Brands = () => {
  const brands = data.brands || []
  const perRow = Math.ceil(brands.length / 3)

  const row1 = [...brands.slice(0, perRow), ...brands.slice(0, perRow)]
  const row2 = [
    ...brands.slice(perRow, perRow * 2),
    ...brands.slice(perRow, perRow * 2),
  ]
  const row3 = [...brands.slice(perRow * 2), ...brands.slice(perRow * 2)]

  return (
    <section className="bg-(--deals-background) my-8 overflow-hidden animate-slide-up">
      {/* Heading */}
      {/* <div className="mb-8 md:mb-20 max-w-7xl mx-auto"> */}
      <div className="section">
        <h2 className="section-title">
          Our Most Popular Brands
        </h2>
      </div>

      {/* Rows */}
      <div className="space-y-8  sm:space-y-10">
        {/* Row 1 */}
        <div className="overflow-hidden">
          <div className="flex gap-8  sm:gap-5 animate-left hover:[animation-play-state:paused]">
            {row1.map((brand, i) => (
              <BrandItem key={`r1-${i}`} brand={brand} />
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div className="overflow-hidden">
          <div className="flex gap-8  sm:gap-5 animate-right hover:[animation-play-state:paused]">
            {row2.map((brand, i) => (
              <BrandItem key={`r2-${i}`} brand={brand} />
            ))}
          </div>
        </div>

        {/* Row 3 */}
        <div className="overflow-hidden">
          <div className="flex gap-8  sm:gap-5 animate-left-fast hover:[animation-play-state:paused]">
            {row3.map((brand, i) => (
              <BrandItem key={`r3-${i}`} brand={brand} />
            ))}
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes scroll-left {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @keyframes scroll-right {
          from {
            transform: translateX(-50%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-left {
          animation: scroll-left 30s linear infinite;
        }

        .animate-right {
          animation: scroll-right 35s linear infinite;
        }

        .animate-left-fast {
          animation: scroll-left 20s linear infinite;
        }

        @media (max-width: 640px) {
          .animate-left {
            animation-duration: 22s;
          }
          .animate-right {
            animation-duration: 26s;
          }
          .animate-left-fast {
            animation-duration: 16s;
          }
        }
      `}</style>
    </section>
  )
}

/* Single Brand Item */
const BrandItem = ({ brand }) => (
  <div
    className="min-w-[120px] sm:min-w-[140px] md:min-w-[160px]
               flex items-center justify-center
               transition-transform duration-300
               hover:scale-110 cursor-pointer"
  >
    <ManagedImage
      src={brand.logo}
      alt={brand.name}
      className="h-8 sm:h-10 md:h-14 object-contain"
      loading="lazy"
    />
  </div>
)

export default Brands
