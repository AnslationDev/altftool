"use client";

import { motion } from "framer-motion";
import Image from "next/image";

/**
 * @param {{ onCategorySelect?: (query: string, label: string) => void }} props
 */
export default function ExploreCategories({ onCategorySelect }) {
  const categories = [
    {
      id: 1,
       image: "/sale-locator/category-section/cat-fashion.png",
      alt: "Fashion",
       query: "fashion",
    },
    {
      id: 2,
       image: "/sale-locator/category-section/cat-electronics.png",
      alt: "Electronics",
       query: "electronics",
    },
    {
      id: 3,
      image: "/sale-locator/category-section/cat-homeKitchen.png",
      alt: "Home and Kitchen",
       query: "home and kitchen",
    },
    {
      id: 4,
      image: "/sale-locator/category-section/cat-travel.png",
      alt: "Travel",
       query: "travel",
    },
    {
      id: 5,
      image: "/sale-locator/category-section/cat-beauty.png",
      alt: "Beauty",
       query: "beauty",
    },
    {
      id: 6,
       image: "/sale-locator/category-section/cat-toys.png",
      alt: "Kids and Toys",
       query: "kids toys",
    },
    {
      id: 7,
      image: "/sale-locator/category-section/cat-furniture.png",
      alt: "Furniture",
       query: "furniture",
    },
  ];

  return (
   <section className="section bg-(--background)">
  {/* Heading */}
  <div className="mb-6 md:mb-8">
    <h2 className="section-title text-left! mb-2">
      Explore Categories
    </h2>

    <p className="text-(--muted-foreground) text-sm md:text-lg font-secondary">
      Find The Best Sales Across What You Love
    </p>
  </div>

  {/* Category Images */}
  <div className="overflow-x-auto xl:overflow-visible overflow-y-hidden no-scrollbar">
    <div
      className="flex xl:grid xl:grid-cols-7 gap-3 md:gap-5 min-w-max xl:min-w-0 xl:w-full  2xl:max-w-[1600px]"
    >
      {categories.map((item, index) => (
        <motion.button
          key={item.id}
          type="button"
          onClick={() => onCategorySelect?.(item.query, item.alt)}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ y: -6, scale: 1.02 }}
          transition={{
            duration: 0.35,
            delay: index * 0.04,
          }}
          viewport={{ once: true }}
          className="shrink-0 xl:shrink w-29 sm:w-31.5 md:w-34 lg:w-37 xl:w-full group appearance-none bg-transparent border-0 p-0 m-0 text-left cursor-pointer
          "
        >
          <div
           className="w-full h-41.5 md:h-45 lg:h-48 2xl:h-53 [@media(min-width:1700px)]:h-62 relative rounded-2xl [@media(min-width:1700px)]:rounded-3xl overflow-hidden  "
          >
            <Image
              src={item.image}
              alt={item.alt}
              fill
              sizes="(max-width: 640px) 116px, (max-width: 768px) 126px, (max-width: 1024px) 136px, (max-width: 1280px) 148px, 100vw"
              priority={index < 3}
              className="object-cover transition-transform duration-500 group-hover:scale-101 "
            />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
          </div>
        </motion.button>
      ))}
    </div>
  </div>
</section>
  );
}
