/**
 * Recent Backlink Opportunities Table Component (Reference Match)
 * Location: src/app/altflinking/components/landing/RecentOpportunitiesTable.jsx
 */

"use client";

import React, { useState } from "react";
import { ArrowRight, Heart, ChevronDown } from "lucide-react";

export default function RecentOpportunitiesTable({ onSelectSite, onExploreMarketplace }) {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (domain) => {
    if (favorites.includes(domain)) {
      setFavorites(favorites.filter((d) => d !== domain));
    } else {
      setFavorites([...favorites, domain]);
    }
  };

  const opportunities = [
    {
      id: "opp_1",
      name: "TheVerge.com",
      logo: "V",
      logoColor: "bg-purple-600 text-white font-black",
      dr: 90,
      traffic: "3.5M/mo",
      category: "Technology",
      categoryColor: "text-blue-500 bg-blue-500/10",
      type: "Guest Post",
      price: 220,
    },
    {
      id: "opp_2",
      name: "Investing.com",
      logo: "inv",
      logoColor: "bg-white text-white font-extrabold",
      dr: 89,
      traffic: "7.1M/mo",
      category: "Finance",
      categoryColor: "text-emerald-500 bg-emerald-500/10",
      type: "Link Insertion",
      price: 190,
    },
    {
      id: "opp_3",
      name: "CoinDesk.com",
      logo: "C",
      logoColor: "bg-amber-500 text-slate-950 font-black",
      dr: 88,
      traffic: "2.2M/mo",
      category: "Crypto",
      categoryColor: "text-amber-500 bg-amber-500/10",
      type: "Guest Post",
      price: 210,
    },
    {
      id: "opp_4",
      name: "Healthline.com",
      logo: "H",
      logoColor: "bg-rose-500 text-white font-bold",
      dr: 91,
      traffic: "4.8M/mo",
      category: "Health",
      categoryColor: "text-rose-500 bg-rose-500/10",
      type: "Guest Post",
      price: 230,
    },
    {
      id: "opp_5",
      name: "TravelAwaits.com",
      logo: "T",
      logoColor: "bg-cyan-500 text-white font-bold",
      dr: 87,
      traffic: "1.6M/mo",
      category: "Travel",
      categoryColor: "text-cyan-500 bg-cyan-500/10",
      type: "Link Insertion",
      price: 160,
    },
  ];

  return (
    <div className="altf-card p-6 space-y-5 my-8 rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Recent Backlink Opportunities
          </h2>
          <p className="text-xs text-slate-500 ">
            Handpicked opportunities from high authority websites.
          </p>
        </div>

        <button
          onClick={onExploreMarketplace}
          className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <span>View All Opportunities</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Opportunities Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <th className="p-3">Website</th>
              <th className="p-3 cursor-pointer">
                <span className="flex items-center gap-1">DR <ChevronDown className="h-3 w-3" /></span>
              </th>
              <th className="p-3 cursor-pointer">
                <span className="flex items-center gap-1">Traffic <ChevronDown className="h-3 w-3" /></span>
              </th>
              <th className="p-3">Category</th>
              <th className="p-3">Type</th>
              <th className="p-3">Price</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {opportunities.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white transition">
                {/* Website Logo + Name */}
                <td className="p-3 font-bold text-slate-900 font-mono flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs shrink-0 ${item.logoColor}`}>
                    {item.logo}
                  </div>
                  <span>{item.name}</span>
                </td>

                {/* DR */}
                <td className="p-3 font-mono font-extrabold text-slate-900 ">
                  {item.dr}
                </td>

                {/* Traffic */}
                <td className="p-3 font-mono text-slate-600 ">
                  {item.traffic}
                </td>

                {/* Category */}
                <td className="p-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.categoryColor}`}>
                    {item.category}
                  </span>
                </td>

                {/* Type */}
                <td className="p-3 text-slate-600 font-medium">
                  {item.type}
                </td>

                {/* Price */}
                <td className="p-3 font-mono font-black text-indigo-600 text-sm">
                  ${item.price}
                </td>

                {/* Action (View Details + Heart) */}
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onSelectSite && onSelectSite(item)}
                      className="py-1 px-3 rounded-lg border border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-600 text-xs font-bold transition"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => toggleFavorite(item.name)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-500 transition"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          favorites.includes(item.name) ? "fill-rose-500 text-rose-500" : ""
                        }`}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Centered Load More Button */}
      <div className="text-center pt-2">
        <button
          onClick={onExploreMarketplace}
          className="altf-btn-secondary py-2.5 px-6 text-xs font-bold rounded-xl border border-slate-200 hover:border-indigo-500 transition"
        >
          Load More Opportunities
        </button>
      </div>
    </div>
  );
}
