"use client";
import Image from "next/image";
import data from "../(data)/db.json";
import Link from "next/link";

function Categories() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-y-10">
        {data.categories.map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-center text-center group cursor-pointer"
          >
            <Link href={`exclusivedeals/${item.slug}`}>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-yellow-400 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={item.image}
                  alt={item.categoryName}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            </Link>

            <p className="mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2">
              {item.categoryName}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;