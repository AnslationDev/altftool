"use client";

import { useEffect, useState } from "react";
import { SORT_OPTIONS } from "@/app/buysmart/constants/categories";
import { firebaseBuySmartCategoriesSource } from "@/app/buysmart/service.js/firebaseBuySmartCategories";
import { ChevronDown } from "lucide-react";

export default function FilterRow({
  popularOnly,
  setPopularOnly,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  categoryDropDown
  
}) 
{
  const [categories, setCategories] = useState([]);
useEffect(() => {
  const unsubscribe = firebaseBuySmartCategoriesSource.subscribe((data) => {
    const formatted = data
    .filter((cat)=> cat && cat.category && cat.title)
    .map((cat) => ({
      value: cat.category.trim(),
      label: cat.category.trim(),
    }));

    const uniqueCategories=Object.values(
      formatted.reduce((acc,val)=>{
        acc[val.value]=val; 
        return acc;
      },{})
    );

    setCategories([
      { value: "All", label: "All Categories" },
      ...uniqueCategories,
    ]);
  });

  return () => unsubscribe(); 
}, []);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full ">
      
      {/* LEFT FILTERS */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">

        {/* Category Filter */}
        <div className="relative w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="
              appearance-none
              px-4 py-2.5 pr-10
              rounded-full
              border border-gray-300
              bg-(--background)
              text-(--muted-foreground)
              text-sm sm:text-base font-medium
              shadow-sm
              cursor-pointer
              outline-none
              w-full sm:w-auto
            "
          > 

            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* RIGHT SIDE SORT */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
        
        <span className="text-sm sm:text-base font-medium text-gray-500 whitespace-nowrap">
          Sort by:
        </span>

        <div className="relative w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="
              appearance-none
              px-4 py-2.5 pr-10
              rounded-full
              border border-gray-300
              bg-white
              text-(--muted-foreground)
              text-sm sm:text-base font-medium
              shadow-sm
              cursor-pointer
              outline-none
              w-full sm:w-auto
            "
          >
            {SORT_OPTIONS.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}