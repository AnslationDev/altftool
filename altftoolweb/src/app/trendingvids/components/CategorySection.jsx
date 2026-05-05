"use client";

import { ArrowRight } from "lucide-react";
export default function CategorySection({ onCategoryClick, categories = [] }) {
  const visibleCategories = categories.slice(0, 4);

  if (visibleCategories.length === 0) {
    return null;
  }

  return (
    <section className="section  aniamte-slide-up ">
      {/* HEADER */}
      <div className="items-center text-center">
        <h2 className="section-title  ">Explore Categories</h2>
        <p className="section-subtitle ">
          Find content tailored to your goals — from AI tools to productivity
          and business strategies
        </p>
      </div>

      {/* CARDS */}
      <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-3">
        {visibleCategories.map((category, index) => (
          <button
            type="button"
            key={category}
            onClick={() => {
              onCategoryClick(category);
            }}
            className="group animate-slide-right text-left rounded-2xl border border-(--border) bg-(--card) p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#2563EB] hover:shadow-[0_18px_40px_rgba(37,99,235,0.12)]"
          >
            <div className="flex h-full flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl text-(--foreground) font-semibold leading-snug">
                    {category}
                  </h3>
                  <p className="pt-2 text-sm text-[#64748B] leading-6">
                    Explore curated videos and discover relevant content in this
                    category.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[#2563EB]">
                <span className="text-sm font-semibold">Explore category</span>
                <div className="rounded-full bg-[#E8F2FF] p-2 transition group-hover:translate-x-1">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
