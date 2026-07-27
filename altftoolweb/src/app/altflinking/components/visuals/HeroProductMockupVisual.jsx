/**
 * Hero Product Mockup Visual (Pure Light Theme)
 * Location: src/app/altflinking/components/visuals/HeroProductMockupVisual.jsx
 */
"use client";

import React from "react";
import { ShieldCheck, TrendingUp, Globe, Lock, CheckCircle2, Zap } from "lucide-react";

const sample = [
  { domain: "techcrunch.com",  dr: 91, traffic: "8.2M/mo",  price: "$480", niche: "Technology" },
  { domain: "forbes.com",      dr: 94, traffic: "92M/mo",   price: "$890", niche: "Finance"    },
  { domain: "hubspot.com",     dr: 92, traffic: "14M/mo",   price: "$560", niche: "Marketing"  },
];

export default function HeroProductMockupVisual() {
  return (
    <div className="relative altf-card p-5 space-y-4 bg-white border border-slate-200 shadow-xl rounded-3xl">

      {/* App Chrome Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
          </div>
          <span className="text-[10px] font-mono text-slate-400">altftool.com/marketplace</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          LIVE
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="text-center">
          <p className="text-sm font-black text-slate-900 font-mono">1,420</p>
          <p className="text-[10px] text-slate-500">Publishers</p>
        </div>
        <div className="text-center border-x border-slate-200">
          <p className="text-sm font-black text-slate-900 font-mono">DR 68+</p>
          <p className="text-[10px] text-slate-500">Avg Rating</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-black text-slate-900 font-mono">98.8%</p>
          <p className="text-[10px] text-slate-500">Indexed</p>
        </div>
      </div>

      {/* Domain Cards */}
      <div className="space-y-2">
        {sample.map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-black flex items-center justify-center border border-indigo-100">
                {s.domain.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-[11px] font-black text-slate-900">{s.domain}</p>
                  <ShieldCheck className="h-3 w-3 text-indigo-500" />
                </div>
                <p className="text-[10px] text-slate-500">{s.niche} · {s.traffic}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-indigo-600 font-mono px-2 py-0.5 bg-indigo-50 rounded-lg border border-indigo-100">
                DR {s.dr}
              </span>
              <span className="text-[10px] font-black text-slate-900 font-mono">{s.price}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <Lock className="h-3 w-3 text-indigo-500" />
          <span className="font-semibold">100% Escrow Protected</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-amber-500" />
          <span className="font-semibold">24/7 Link Monitoring</span>
        </div>
      </div>
    </div>
  );
}
