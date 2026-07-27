/**
 * Stats Ribbon Ticker Banner
 * Location: src/app/altflinking/components/common/StatsRibbon.jsx
 */

"use client";

import React from "react";
import { ShieldCheck, TrendingUp, Zap, Clock, Lock } from "lucide-react";

export default function StatsRibbon() {
  const stats = [
    { label: "Verified Domains",     value: "1,420+",   icon: ShieldCheck, color: "text-indigo-700  border-indigo-200  bg-indigo-50"  },
    { label: "Average Domain Rating", value: "DR 68+",   icon: TrendingUp,  color: "text-blue-700   border-blue-200    bg-blue-50"    },
    { label: "Confirmed Index Rate",  value: "98.8%",    icon: Zap,         color: "text-amber-800  border-amber-200   bg-amber-50"   },
    { label: "Average Turnaround",   value: "2.4 Days", icon: Clock,        color: "text-cyan-700   border-cyan-200    bg-cyan-50"    },
  ];

  return (
    <div className="w-full border-b border-slate-200 bg-white py-2.5 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-left">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200 hover:border-slate-200 transition">
                <div className={`p-2 rounded-lg border shrink-0 ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight font-mono leading-tight">{stat.value}</p>
                  <p className="text-[11px] font-medium text-slate-500 truncate">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
