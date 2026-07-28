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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6">
        <header className="border-b border-border pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                Deals Control
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-foreground">
                Manage Deal Surfaces
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Keep coupons, brand offers, trending deals, upcoming campaigns, and saving guides in one clean workflow.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">Sections</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{MENU_ITEMS.length}</p>
            </div>
          </div>
        </header>

        <div className="sticky top-0 z-20 border-y border-border bg-surface/95 py-3 backdrop-blur">
          <div
            role="tablist"
            aria-label="Deals sections"
            className="grid grid-cols-2 gap-2 px-1 sm:grid-cols-3 lg:grid-cols-4"
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
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-surface text-muted hover:border-primary hover:bg-surface-soft"
                  }`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${active ? "bg-primary-foreground/10" : "bg-surface-soft"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{item.label}</span>
                    <span className={`block truncate text-xs ${active ? "text-primary-foreground/80" : "text-muted"}`}>
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
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface text-muted shadow-sm">
              <ActiveIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{activeItem.label}</h2>
              <p className="text-sm text-muted">{activeItem.description}</p>
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
