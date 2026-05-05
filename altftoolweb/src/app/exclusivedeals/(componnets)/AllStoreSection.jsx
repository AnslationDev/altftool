"use client";

import React from "react";
import Image from "next/image";
import data from "../(data)/db.json";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

function AllStoreSection() {
  const store = data.store.slice(0, 7);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:items-center lg:gap-6 xl:gap-10 gap-4 py-4 sm:py-6">

        {/* Stores */}
        {store.map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-center text-center cursor-pointer group"
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

            <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-gray-900 line-clamp-2">
              {item.categoryName}
            </p>
          </div>
        ))}

        {/* View All */}
        <Link href="/exclusivedeals/store">
          <div className="flex flex-col items-center text-center cursor-pointer group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-gray-700" />
            </div>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-gray-900">
              View all
            </p>
          </div>
        </Link>

      </div>
    </div>
  );
}

export default AllStoreSection;