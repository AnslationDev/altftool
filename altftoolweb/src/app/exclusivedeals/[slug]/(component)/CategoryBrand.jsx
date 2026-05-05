"use client"
import React, { useState } from "react"
import data from "../../(data)/db.json"
import Image from "next/image"
import Link from "next/link"
import { Menu, X, HeartIcon } from "lucide-react"

function CategoryBrand({ slug }) {
  const categories = data.categories
  const [activeSlug, setActiveSlug] = useState(slug)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeCategory = categories.find(
    (c) => c.slug.toLowerCase() === activeSlug.toLowerCase()
  )

  const slugid = activeCategory?.categoryName
    ?.toLowerCase()
    ?.replace(/\s+/g, "-")

  const brands = activeCategory ? activeCategory.brands : []

  function totalOffer(offers) {
    const coupons = offers?.coupons || []
    const deals = offers?.deals || []
    return coupons.length + deals.length
  }

  const handleCategoryClick = (itemSlug) => {
    setActiveSlug(itemSlug)
    setSidebarOpen(false)
  }

  return (
    <div className="max-w-7xl mx-auto my-8 sm:my-10 md:my-12 lg:my-16 px-4 sm:px-6">
      
      {/* Breadcrumb */}
      <div className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-5 md:mb-6">
        <Link href="/exclusivedeals">
          {`Home / ${activeCategory?.categoryName}/Store`}
        </Link>
      </div>

      {/* Mobile Category Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        <span className="text-sm font-medium">
          {sidebarOpen ? "Close Categories" : "View Categories"}
        </span>
      </button>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-6 lg:gap-8">

        {/* LEFT SIDEBAR */}
        <div
          className={`
            ${sidebarOpen ? "block" : "hidden"} lg:block
            relative z-50
            w-full lg:w-[22%]
            bg-white rounded-lg sm:rounded-xl
            border shadow-sm
            p-4 sm:p-5
          `}
        >
          <h2 className="text-base text-(--muted-foreground) sm:text-lg font-bold mb-3 sm:mb-4">
            STORE CATEGORIES
          </h2>

          <div className="space-y-2 sm:space-y-3">
            {categories.map((item) => (
              <button
                key={item.id}
                onClick={() => handleCategoryClick(item.slug)}
                className={`flex items-center gap-2 sm:gap-3 text-xs sm:text-sm w-full text-left p-2 rounded-md transition
                  ${
                    activeSlug === item.slug
                      ? "bg-yellow-50 font-semibold text-black"
                      : "text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                <span
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 border rounded-sm flex items-center justify-center
                    ${
                      activeSlug === item.slug
                        ? "bg-yellow-400 border-yellow-400"
                        : "border-gray-300"
                    }
                  `}
                >
                  {activeSlug === item.slug && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white block" />
                  )}
                </span>

                <span className="truncate ">{item.categoryName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div
          className="
            w-full lg:w-[78%]
            flex flex-col items-center gap-4
            sm:flex-row sm:flex-wrap sm:items-start
            sm:gap-4 md:gap-5 lg:gap-3
          "
        >
          {brands.length > 0 ? (
            brands.map((item, index) => (
              <Link
                key={index}
                href={`${slugid}/${item.brandName}`}
                className="
                  w-full flex justify-center
                  sm:justify-start
                  sm:w-[calc(50%-0.5rem)]
                  lg:w-[calc(50%-0.375rem)]
                  xl:w-[calc(33.333%-0.5rem)]
                "
              >
                <div
                  className="
                    relative
                    flex items-center gap-8 sm:gap-4 md:gap-5
                    bg-(--background) rounded-2xl sm:rounded-3xl
                    h-28 sm:h-32 md:h-32
                    w-72 max-w-sm sm:w-64
                    border border-gray-100 drop-shadow-2xl
                    px-4 sm:px-5 md:px-6
                    py-4 sm:py-4.5 md:py-5
                  "
                >
                  {/* Logo */}
                  <div className="w-14 bg-white h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 rounded-full border  border-(--foreground) flex items-center justify-center flex-shrink-0">
                    <Image
                      src={item.brandLogo}
                      alt={item.brandName}
                      width={48}
                      height={48}
                      className="object-contain  w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                    />
                  </div>

                  {/* Wishlist */}
                  <div className="absolute top-3 right-3">
                    <HeartIcon size={22} className="text-yellow-400" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold  text-(--foreground) text-center text-sm sm:text-base md:text-lg truncate">
                      {item.brandName}
                    </h3>

                    <div className="w-36 md:w-24 h-[1px] border  border-gray-500 my-1" />

                    <p className="text-xs sm:text-sm text-center text-(--foreground)">
                      {totalOffer(item.offers)} Offers
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="w-full text-center py-12">
              <p className="text-sm sm:text-base text-gray-500">
                No brands found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default CategoryBrand
