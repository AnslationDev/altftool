/**
 * Marketplace Categories Component (Reference Match)
 * Location: src/app/altflinking/components/landing/MarketplaceCategories.jsx
 */

"use client";

import React from "react";
import {
  Laptop,
  TrendingUp,
  Coins,
  Heart,
  Plane,
  GraduationCap,
  Briefcase,
  Bot,
  ArrowRight,
} from "lucide-react";

export default function MarketplaceCategories({ onSelectCategory }) {
  const categories = [
    { name: "Technology", icon: Laptop, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    { name: "Finance", icon: TrendingUp, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { name: "Crypto", icon: Coins, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    { name: "Health", icon: Heart, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
    { name: "Travel", icon: Plane, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
    { name: "Education", icon: GraduationCap, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
    { name: "Business", icon: Briefcase, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
    { name: "AI & Tools", icon: Bot, color: "text-teal-500 bg-teal-500/10 border-teal-500/20" },
  ];

  return (
    <div className="space-y-4 my-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Marketplace Categories
          </h2>
          <p className="text-xs text-slate-500 ">
            Explore backlinks opportunities across top niches.
          </p>
        </div>

        <button
          onClick={() => onSelectCategory("All")}
          className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectCategory(cat.name)}
              className="flex items-center gap-2 py-2 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-bold hover:border-indigo-500/40 hover:shadow-sm transition shrink-0"
            >
              <div className={`p-1 rounded-md border ${cat.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
