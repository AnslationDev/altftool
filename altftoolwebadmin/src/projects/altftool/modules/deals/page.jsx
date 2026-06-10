"use client";

import { useState } from "react";
import { Calendar, Image, Layers, Lightbulb, Pencil, Star, Tag, Tags, TrendingUp } from "lucide-react";
import HeroBanner from "./component/(hero-Banner)/HeroBanner";
import TopCoupon from "./component/(top-Coupon)/TopCoupon";
import Category from "./component/(deal-category)/Category";
import Brand from "./component/(deal-brand)/Brand";
import Saving from "./component/(smart-Saving)/Saving";
import Trending from "./component/(trending-deal)/Trending";
import UpcomingDeal from "./component/(upcoming-deal)/UpcomingDeal";
import BestCoupon from "./component/(best-coupon)/BestCoupon";
import GetBrand from "./component/(brand-Edit)/GetBrand";

const MENU_ITEMS = [
  { key: "hero", label: "Hero", description: "Deal hero banners", icon: Image },
  { key: "topcoupon", label: "Top Coupon", description: "Primary coupon slots", icon: Tag },
  { key: "categories", label: "Categories", description: "Deal categories", icon: Tags },
  { key: "brand", label: "Add Brand", description: "Brand details and offers", icon: Star },
  { key: "brandedit", label: "Brand Edit", description: "Edit and delete brands", icon: Pencil },
  { key: "trending", label: "Trending Deals", description: "Trending deal rows", icon: TrendingUp },
  { key: "bestcoupon", label: "Best Coupon", description: "Best coupon placements", icon: Layers },
  { key: "upcoming", label: "Upcoming Deal", description: "Upcoming campaign cards", icon: Calendar },
  { key: "saving", label: "Saving Tips", description: "Saving tips and guides", icon: Lightbulb },
];

export default function DealsControl() {
  const [activeSection, setActiveSection] = useState("hero");
  const activeItem = MENU_ITEMS.find((item) => item.key === activeSection) || MENU_ITEMS[0];
  const ActiveIcon = activeItem.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6">
        <header className="border-b border-gray-200 pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Deals Control
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-gray-900">
                Manage Deal Surfaces
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Keep coupons, brand offers, trending deals, upcoming campaigns, and saving guides in one clean workflow.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Sections</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">{MENU_ITEMS.length}</p>
            </div>
          </div>
        </header>

        <div className="sticky top-0 z-20 border-y border-gray-200 bg-white/95 py-3 backdrop-blur">
          <div
            role="tablist"
            aria-label="Deals sections"
            className="flex gap-2 overflow-x-auto px-1"
          >
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`deals-panel-${item.key}`}
                  onClick={() => setActiveSection(item.key)}
                  className={`flex min-w-[180px] items-center gap-3 rounded-lg border px-3 py-2 text-left transition ${
                    active
                      ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${active ? "bg-white/10" : "bg-gray-100"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{item.label}</span>
                    <span className={`block truncate text-xs ${active ? "text-gray-300" : "text-gray-500"}`}>
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <main
          id={`deals-panel-${activeItem.key}`}
          role="tabpanel"
          aria-label={activeItem.label}
          className="min-w-0 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm">
              <ActiveIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{activeItem.label}</h2>
              <p className="text-sm text-gray-500">{activeItem.description}</p>
            </div>
          </div>

          {activeSection === "hero" && (
            <HeroBanner />
          )}
          {activeSection === "brandedit" && (
            <GetBrand />
          )}
          {activeSection === "topcoupon" && (
            <TopCoupon />
          )}
          {activeSection === "categories" && (
            <Category />
          )}
          {activeSection === "brand" && (
            <Brand />
          )}
          {activeSection === "saving" && (
            <Saving />
          )}
          {activeSection === "trending" && (
            <Trending />
          )}
          {activeSection === "upcoming" && (
            <UpcomingDeal />
          )}
          {activeSection === "bestcoupon" && (
            <BestCoupon />
          )}
        </main>
      </div>
    </div>
  );
}
