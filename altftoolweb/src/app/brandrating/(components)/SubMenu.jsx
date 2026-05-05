"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import jsondata from "../(data)/data.json";
import Link from "next/link";

function SubMenu({ handleClick , data }) {
  const CategoryData = data?.categories || [];

  const brandsPerCategory = CategoryData
  .slice(0, 20) // first 10 categories
  .map((item) => ({
    category: item.category,
    brands: item.brands?.slice(0, 5) // first 5 brands
  }));

  function getURlLink(category) {
    return category
      ?.toLowerCase()
      ?.trim()
      ?.replace(/\s+/g, "-")
  }




  return (
    <motion.div
      initial={{ y: -200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -200, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="min-h-screen  bg-white "
    >
      
      {/* Close Button */}
      <div className="flex justify-end p-6">
        <X
          onClick={handleClick}
          className="cursor-pointer text-red-500 w-10 h-10"
        />
      </div>

      {/* Header */}
      <div className="flex flex-col items-center gap-2">
        <Search size={45} className="text-red-500" />
        <h1 className="text-3xl text-(--muted-foreground) font-semibold">Top Categories</h1>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto mt-12 px-6 pb-20">

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12">

          {brandsPerCategory.map((item, index) => (
            <div
              key={index}
              className="border-t-2 border-gray-300 pt-4"
            >
              
              <h2 className="text-lg text-(--muted-foreground) font-semibold mb-3">
                Best {item.category}
              </h2>

              <div className="space-y-2">
                {item.brands.map((brand, i) => (
                  <Link
                    key={`${item.category}-${brand.name || i}`}
                    href={`/brandrating/categories/${getURlLink(item.category)}/${getURlLink(brand.name)}`}
                  >
                  <p className="text-gray-700 hover:text-black cursor-pointer transition">
                    {brand.name}
                  </p>
                  </Link>
                ))}
              </div>

            </div>
          ))}

        </div>

      </div>
    </motion.div>
  );
}

export default SubMenu;
