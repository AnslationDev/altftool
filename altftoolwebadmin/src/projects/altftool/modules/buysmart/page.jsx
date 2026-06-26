"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Image,
  ShieldAlert,
  SlidersHorizontal,
  Star,
  Store as StoreIcon,
  Tags,
  TrendingUp,
} from "lucide-react";
import AdminDataState, { AdminDataSkeleton } from "@/components/admin/AdminDataState";
import { buySmartDataSource } from "@/data/buySmart.datasource";
import HeroSection from "./(components)/HeroSection";
import Store from "./(components)/(store)/Store";
import Categories from "./(components)/(categories)/Categories";
import RuleSet from "./(components)/(ruleSet)/RuleSet";
import FeatureBrand from "./(components)/(featureBrand)/FeatureBrand";
import Trending from "./(components)/(trends)/Trending";
import BuySmartInsights from "./(components)/BuySmartInsights";

const MENU_ITEMS = [
  { key: "insights", label: "Insights", description: "Live analytics", icon: BarChart3, dataKey: "analytics" },
  { key: "quality", label: "Quality Queue", description: "Fix issues first", icon: ShieldAlert, dataKey: "categories" },
  { key: "hero", label: "Hero", description: "Homepage banners", icon: Image, dataKey: "hero" },
  { key: "store", label: "Store", description: "Store cards", icon: StoreIcon, dataKey: "store" },
  { key: "categories", label: "Categories", description: "Offers and coupons", icon: Tags, dataKey: "categories" },
  { key: "featurebrand", label: "Feature Brand", description: "Featured brands", icon: Star, dataKey: "featurebrand" },
  { key: "trending", label: "Trending", description: "Trending banners", icon: TrendingUp, dataKey: "trending" },
  { key: "ruleSet", label: "Rule Set", description: "Rules and guidance", icon: SlidersHorizontal, dataKey: "ruleSet" },
];

function getRecordCount(value, key) {
  if (key === "insights") return value?.events?.length || Object.keys(value?.counters || {}).length || 0;
  if (key === "quality") return value?.banner?.length || 0;
  if (Array.isArray(value)) return value.length;
  if (value?.banner && Array.isArray(value.banner)) return value.banner.length;
  if (value?.features && Array.isArray(value.features)) return value.features.length;
  if (value && typeof value === "object") return Object.keys(value).length;
  return 0;
}

export default function BuySmart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [activeSection, setActiveSection] = useState("insights");

  useEffect(() => {
    setLoading(true);
    setError("");

    const unsub = buySmartDataSource.subscribeAll(
      (res) => {
        setData(res || {});
        setLoading(false);
      },
      (err) => {
        console.error("BuySmart Firebase subscription failed", err);
        setError("BuySmart data could not be loaded from Firebase. Check network access and Firebase rules, then retry.");
        setLoading(false);
      },
    );

    return () => unsub && unsub();
  }, [retryKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <AdminDataState
          title="Loading BuySmart data"
          message="Connecting to Firebase and preparing hero banners, stores, categories, feature brands, trending banners, and rules."
        >
          <AdminDataSkeleton rows={6} />
        </AdminDataState>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <AdminDataState
          type="error"
          title="BuySmart data unavailable"
          message={error}
          onRetry={() => setRetryKey((value) => value + 1)}
        />
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <AdminDataState
          type="empty"
          title="No BuySmart records found"
          message="Firebase returned an empty BuySmart dataset. Add a banner, store, category, feature brand, trending banner, or rule to start managing this module."
          onRetry={() => setRetryKey((value) => value + 1)}
        />
      </div>
    );
  }

  const activeItem = MENU_ITEMS.find((item) => item.key === activeSection) || MENU_ITEMS[0];
  const ActiveIcon = activeItem.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6">
        <header className="border-b border-gray-200 pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                BuySmart Control
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-gray-900">
                Manage Banners Across BuySmart
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Keep hero banners, stores, categories, featured brands, trending banners, and rules in one clean working view.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[720px] xl:grid-cols-8">
              {MENU_ITEMS.map((item) => (
                <div key={item.key} className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                  <p className="text-xs font-medium text-gray-500">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-gray-900">
                    {getRecordCount(data?.[item.dataKey], item.key)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="sticky top-0 z-20 border-y border-gray-200 bg-white/95 py-3 backdrop-blur">
          <div
            role="tablist"
            aria-label="BuySmart sections"
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
                  aria-controls={`buysmart-panel-${item.key}`}
                  onClick={() => setActiveSection(item.key)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
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
          id={`buysmart-panel-${activeItem.key}`}
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

          {activeSection === "insights" && (
            <BuySmartInsights data={data} mode="analytics" />
          )}

          {activeSection === "quality" && (
            <BuySmartInsights data={data} mode="quality" />
          )}

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

          {activeSection === "trending" && (
            <Trending data={data?.trending || []} />
          )}

          {activeSection === "ruleSet" && (
            <RuleSet data={data?.ruleSet || []} />
          )}

        </main>
      </div>
    </div>
  );
}
