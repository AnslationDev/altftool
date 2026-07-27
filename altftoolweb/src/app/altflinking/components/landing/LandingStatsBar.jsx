/**
 * 4-Metric Bar Cards matching Reference Image
 * Location: src/app/altflinking/components/landing/LandingStatsBar.jsx
 */

"use client";

import React from "react";
import { Link2, Users, Globe, Star } from "lucide-react";

export default function LandingStatsBar() {
  const stats = [
    {
      value: "100K+",
      label: "Backlinks Delivered",
      icon: Link2,
      color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    },
    {
      value: "20K+",
      label: "Verified Publishers",
      icon: Users,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    {
      value: "150+",
      label: "Countries Covered",
      icon: Globe,
      color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    },
    {
      value: "98%",
      label: "Positive Reviews",
      icon: Star,
      color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="altf-card p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-500/30 transition shadow-sm"
          >
            <div className={`p-3 rounded-xl border ${item.color} shrink-0`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono leading-none">
                {item.value}
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                {item.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
