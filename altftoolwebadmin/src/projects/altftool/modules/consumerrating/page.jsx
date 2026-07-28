"use client";

import { useEffect, useState } from "react";
import Category from "./components/(category)/Category";
import HeroBanner from "./components/(Herobanner)/HeroBanner";
import Brand from "./components/(brand)/Brand";
import ProductImage from "./components/(ProductImage)/ProductImage";


export default function ConsumerRating() {
  const [data, setData] = useState(null);
  const [activeSection, setActiveSection] = useState("hero");

  const MENU_ITEMS = [
    { key: "hero", label: "Hero" },
    { key: "category", label: "Category" },
    { key: "brand", label: "Brand Detail" },
    { key: "product", label: "Product Image" },
    
  ];


  return (
    <div className="flex overflow-hidden min-h-screen bg-[var(--background)]">

      {/* LEFT SIDEBAR */}
      <div className="w-[20%] bg-[var(--surface)] border-r border-[var(--border)] shadow-sm">

        {/* Header */}
        <div className="px-4 py-5 border-b border-[var(--border)]">
          <h2 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-widest">
            BuySmart Control
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1">
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
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] border border-[var(--primary)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-soft)]"
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
         {activeSection === "category" && (
          <Category/>
        )}
         {activeSection === "brand" && (
           <Brand/>
        )}
         {activeSection === "product" && (
           <ProductImage/>
        )}

        

      </div>
    </div>
  );
}