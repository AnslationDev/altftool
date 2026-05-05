"use client";

import { useEffect, useState } from "react";
import HeroBanner from "./component/(hero-Banner)/HeroBanner";
import TopCoupon from "./component/(top-Coupon)/TopCoupon";
import Category from "./component/(deal-category)/Category";
import Brand from "./component/(deal-brand)/Brand";
import Saving from "./component/(smart-Saving)/Saving";
import Trending from "./component/(trending-deal)/Trending";
import UpcomingDeal from "./component/(upcoming-deal)/UpcomingDeal";
import BestCoupon from "./component/(best-coupon)/BestCoupon";
import GetBrand from "./component/(brand-Edit)/GetBrand";






export default function ConsumerRating() {
  const [data, setData] = useState(null);
  const [activeSection, setActiveSection] = useState("hero");

  const MENU_ITEMS = [
    { key: "hero", label: "Hero" },
    { key: "topcoupon", label: "Top Coupon" },
    { key: "categories", label: "Categories" },
    { key: "brand", label: " Add Brand Detail" },
    {key : "brandedit" , label : "Brand Edit & Del"},
    { key: "trending", label: "Trending Deals" },
    {key : "bestcoupon" , label : "Best Coupon"},
    { key: "upcoming", label: "Upcoming Deal" },
    { key: "saving", label: "Saving Tips & Guide " },
  ];


  return (
    <div className="flex overflow-hidden min-h-screen bg-gray-50">

      {/* LEFT SIDEBAR */}
      <div className="w-[20%] bg-white border-r border-gray-200 shadow-sm">

        {/* Header */}
        <div className="px-4 py-5 border-b border-gray-100">
          <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-widest">
            BuySmart Control
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Manage Banners Across BuySmart
          </p>
        </div>

        {/* Menu */}
        <div className="p-3 space-y-2">
          {MENU_ITEMS.map((item) => (
            <div
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`px-3 py-2.5 cursor-pointer text-sm font-medium rounded-sm transition-all duration-150
              ${
                activeSection === item.key
                  ? "text-white bg-black border border-blue-100"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="w-[80%] p-6">

        {activeSection === "hero" && (
           <HeroBanner/>
        )}
        {activeSection == "brandedit" && (
          <GetBrand/>
        )}
        {activeSection === "topcoupon" && (
            <TopCoupon/>
        )}
        {activeSection === "categories" && (
                <Category/>
        )}
        {activeSection === "brand" && (
                <Brand/>
        )}
        {activeSection === "saving" && (
                 <Saving/>
        )}
        {activeSection === "trending" && (
                 <Trending/>
        )}
        {activeSection === "upcoming" && (
                 <UpcomingDeal/>
        )}
        {activeSection === "bestcoupon" && (
                 <BestCoupon/>
        )}
      </div>
    </div>
  );
}