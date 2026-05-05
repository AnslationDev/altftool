"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import data from "../(data)/db.json";
import { Menu, X } from "lucide-react";


// slug helper


export default function Page() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const slugify = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

  const itemsPerPage = 9;

  // categories
  const categories = data.store.map((c) => c.categoryName);

  // flatten brands
  const allBrands = useMemo(() => {
    return data.store.flatMap((category) =>
      category.brands.map((brand) => ({
        ...brand,
        categoryName: category.categoryName,
      }))
    );
  }, []);

  // filter brands
  const filteredBrands =
    activeCategory === "all"
      ? allBrands
      : allBrands.filter((b) => b.categoryName === activeCategory);

  // pagination
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBrands = filteredBrands.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
    setSidebarOpen(false); // close sidebar on mobile
  };

  return (
    <div className="max-w-7xl mx-auto my-8 sm:my-10 md:my-12 px-4 sm:px-6">
    
    <div className=" lg:hidden " >
      <Link href={"/exclusivedeals"}>Home</Link>
      </div>
      
      {/* Mobile Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        <span className="text-sm font-medium">
          {sidebarOpen ? "Close Categories" : "View Categories"}
        </span>
      </button>

      <div className="flex flex-col lg:flex-row gap-6 relative">
        
        {/* SIDEBAR */}
        <aside
          className={`
            ${sidebarOpen ? "block" : "hidden"} lg:block
            relative z-50
            w-full lg:w-[22%]
            bg-white border rounded-xl shadow-sm
            p-4 sm:p-5
          `}
        >
          <h3 className="font-bold text-base sm:text-lg mb-4">
            STORE CATEGORIES
          </h3>

          <div className="space-y-2">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`w-full text-left p-2 rounded-md text-sm transition
                ${
                  activeCategory === "all"
                    ? "bg-yellow-50 font-semibold text-black"
                    : "text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              All Stores
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`w-full text-left p-2 rounded-md text-sm transition
                  ${
                    activeCategory === cat
                      ? "bg-yellow-50 font-semibold text-black"
                      : "text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        {/* CONTENT */}
        <section className="w-full lg:w-[78%]">
          <div className="flex flex-wrap gap-4 mb-8">
            {currentBrands.map((brand) => {
              const offerCount =
                brand.offers.coupons.length +
                brand.offers.deals.length;

              const categorySlug = slugify(brand.categoryName);
              const brandSlug = slugify(brand.brandName);

              return (
                <Link
                  key={`${brand.id}-${brand.brandName}`}
                  href={`store/${categorySlug}/${brandSlug}`}
                  className="w-full sm:w-[calc(50%-0.5rem)] xl:w-[calc(33.333%-0.7rem)]"
                >
                  <div className="
                  flex items-center gap-8 sm:gap-4 md:gap-5
                    bg-(--background) rounded-2xl sm:rounded-3xl
                    h-28 sm:h-32 md:h-32
                    w-72 max-w-sm sm:w-64
                    border border-gray-100 drop-shadow-2xl
                    px-4 sm:px-5 md:px-6
                    py-4 sm:py-4.5 md:py-5
                                  ">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border
                                    flex items-center justify-center bg-gray-50">
                      <img
                        src={brand.brandLogo}
                        alt={brand.brandName}
                        className="object-contain w-8 h-8 sm:w-10 sm:h-10"
                      />
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm sm:text-base">
                        {brand.brandName}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {offerCount} Offers
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.max(p - 1, 1))
                }
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm
                    ${
                      currentPage === i + 1
                        ? "bg-yellow-400 text-black font-semibold"
                        : "border hover:bg-gray-50"
                    }
                  `}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
