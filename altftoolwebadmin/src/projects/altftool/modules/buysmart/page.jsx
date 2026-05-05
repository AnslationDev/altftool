"use client";

import { useEffect, useState } from "react";
import { buySmartDataSource } from "@/data/buySmart.datasource";
import HeroSection from "./(components)/HeroSection";
import Store from "./(components)/(store)/Store";
import Trending from "./(components)/(trends)/Trending";
import Categories from "./(components)/(categories)/Categories";
import RuleSet from "./(components)/(ruleSet)/RuleSet";
import FeatureBrand from "./(components)/(featureBrand)/FeatureBrand";

export default function BuySmart() {
  const [data, setData] = useState(null);
  const [activeSection, setActiveSection] = useState("hero");

  // ✅ STATIC MENU (FIXED) 
  const MENU_ITEMS = [
    { key: "hero", label: "Hero" },
    { key: "store", label: "Store" },
    { key: "categories", label: "Categories" },
    { key: "featurebrand", label: "Feature Brand" },
    { key: "ruleSet", label: "Rule Set" },
  ];

  useEffect(() => {
    const unsub = buySmartDataSource.subscribeAll((res) => {
      setData(res);
    });

    return () => unsub && unsub();
  }, []);

  if (!data) {
    return (
      <div className="p-10 text-xl text-gray-500">
        Loading from Firebase...
      </div>
    );
  }

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
          <HeroSection heroData={data?.hero || []} />
        )}

        {activeSection === "store" && (
          <Store storData={data?.store || []} />
        )}

        {activeSection === "categories" && (
          <Categories data={data?.categories || []} />
        )}

        {activeSection === "featurebrand" && (
          <FeatureBrand data={data?.featurebrand || []} />
        )}

        {activeSection === "ruleSet" && (
          <RuleSet data={data?.ruleSet || []} />
        )}

      </div>
    </div>
  );
}