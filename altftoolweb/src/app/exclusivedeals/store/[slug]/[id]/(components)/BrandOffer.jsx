"use client"

import React, { useEffect, useState } from "react"
import AllBrand from "@/app/exclusivedeals/[slug]/[id]/(components)/AllBrand"
import Link from "next/link"
import { bestCouponfirebase, brandsfirebase } from "../../../../service/firebasebrand"

// ─── Slugify ──────────────────────────────────────────────────────────────────
// Must stay byte-compatible with the inline copies in BrandDetail.jsx /
// BrandNotFound.jsx / lib/brandSlug.js — see that file's header comment.
const slugify = (text) =>
  text?.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-")

function BrandOffer({ id }) {
  const [allData, setAllData] = useState([])
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let best = [], brandsData = []
    let bestLoaded = false, brandsLoaded = false

    const updateAll = () => {
      if (bestLoaded && brandsLoaded) {
        setAllData([...best, ...brandsData])
        setLoading(false)
      }
    }

    const unsubBest = bestCouponfirebase((data) => { best = data || []; bestLoaded = true; updateAll() })
    const unsubBrands = brandsfirebase((data) => { brandsData = data || []; brandsLoaded = true; updateAll() })
    return () => { unsubBest?.(); unsubBrands?.() }
  }, [])

  const brand = allData.find((b) => slugify(b.name) === slugify(id))

  const offers = (brand?.offers || []).map((offer) => ({
    ...offer, brandName: brand.name, link: brand.link, logo: brand.logo, highestDiscount: brand.highestDiscount,
  }))

  const coupons = offers.filter((o) => o.type === "coupon" && o.code?.trim())
  const deals = offers.filter((o) => o.type === "deal")
  const totalOffers = coupons.length + deals.length

  return (
    <div>
      {/* HEADER */}
      <h1 className="bg-amber-400 py-4 sm:py-5 text-center capitalize text-lg sm:text-xl md:text-2xl font-semibold">
        {id} Coupon Codes & Deals
      </h1>

      {/* BREADCRUMB */}
      <div className="max-w-7xl mx-auto px-4 text-xs sm:text-sm text-gray-400 my-4">
        <Link href="/exclusivedeals/store">
          {`Home / Stores / ${id}`}
        </Link>
      </div>

      {/* MAIN LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-6">
        
        {/* LEFT SIDEBAR */}
        <div className="w-full lg:w-[30%] space-y-6">
          
          {/* STORE CARD */}
          {loading ? (
            <div className="rounded-xl shadow border overflow-hidden p-5 space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-2/3 mx-auto rounded bg-gray-200 animate-pulse" />
              <div className="h-16 rounded bg-gray-200 animate-pulse" />
            </div>
          ) : (
            <div className="rounded-xl shadow border overflow-hidden">
              <div className="bg-black text-white p-5 sm:p-6 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 flex items-center justify-center rounded-full border bg-white text-black font-bold text-sm sm:text-base">
                  {brand?.name?.charAt(0)}
                </div>
                <h3 className="font-semibold text-sm sm:text-base">
                  {brand?.name}
                </h3>
              </div>

              <div className="p-4 sm:p-5 text-xs sm:text-sm text-gray-600">
                <p className="font-semibold mb-2">More About This Store</p>
                <div className="border-b mb-3" />
                <p>{brand?.about}</p>
              </div>
            </div>
          )}

          {/* RELATED STORES */}
          <div className="rounded-xl shadow border p-4">
            <h4 className="font-semibold mb-3 text-sm sm:text-base">
              Related Stores
            </h4>
            <div className="text-xs sm:text-sm text-gray-500">
              Coming soon…
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="w-full lg:w-[70%]">
          
          {/* TABS */}
          <div className="flex gap-6 sm:gap-8 border-b mb-5 overflow-x-auto no-scrollbar">
            {[
              { key: "all", label: `All (${totalOffers})` },
              { key: "coupon", label: `Coupons (${coupons.length})` },
              { key: "deal", label: `Deals (${deals.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-2 whitespace-nowrap text-sm sm:text-base ${
                  activeTab === tab.key
                    ? "border-b-2 border-amber-400 font-semibold"
                    : "text-gray-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* OFFERS LIST */}
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-gray-200 animate-pulse" />
              ))
            ) : (
              <>
                {activeTab === "all" &&
                  [...coupons, ...deals].map((item, i) => (
                    <AllBrand key={i} data={item} />
                  ))}

                {activeTab === "coupon" &&
                  coupons.map((item, i) => (
                    <AllBrand key={i} data={item} />
                  ))}

                {activeTab === "deal" &&
                  deals.map((item, i) => (
                    <AllBrand key={i} data={item} />
                  ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrandOffer
