/**
 * Head-to-Head Comparison Matrix Component
 * Location: src/app/altflinking/components/landing/FeatureHighlights.jsx
 */

"use client";

import React from "react";
import { Check, X, ShieldCheck, Zap } from "lucide-react";

export default function FeatureHighlights() {
  const comparisonRows = [
    { feature: "Automated DNS Ownership Verification", altf: true, brokers: false, fiverr: false },
    { feature: "100% Escrow Fund Protection", altf: true, brokers: false, fiverr: false },
    { feature: "Continuous 24/7 Dofollow & Indexation Bots", altf: true, brokers: false, fiverr: false },
    { feature: "Guaranteed Turnaround Time (1-5 Days)", altf: true, brokers: false, fiverr: false },
    { feature: "0% Commission Penalty on Publishers", altf: true, brokers: false, fiverr: false },
    { feature: "Direct Publisher Contact (Zero Brokers)", altf: true, brokers: false, fiverr: false },
    { feature: "Transparent Organic Traffic & DR Data", altf: true, brokers: false, fiverr: false },
  ];

  return (
    <div className="altf-card p-8 space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
          HEAD-TO-HEAD COMPARISON
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">How ALTFTool Outperforms Alternatives</h2>
        <p className="text-xs text-slate-500">Why top agencies switch from manual email brokers and marketplace gig sites</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold">
              <th className="p-3 w-1/2">Feature Comparison</th>
              <th className="p-3 text-center text-indigo-400 font-bold bg-indigo-500/10 rounded-t-xl">ALTFTool Marketplace</th>
              <th className="p-3 text-center text-slate-500">Manual Email Brokers</th>
              <th className="p-3 text-center text-slate-500">Fiverr / Freelancers</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {comparisonRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-white">
                <td className="p-3 font-semibold text-white">{row.feature}</td>
                <td className="p-3 text-center bg-indigo-500/5 font-bold">
                  {row.altf ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : (
                    <X className="h-4 w-4 text-rose-500 mx-auto" />
                  )}
                </td>
                <td className="p-3 text-center">
                  {row.brokers ? <Check className="h-4 w-4 text-emerald-400 mx-auto" /> : <X className="h-4 w-4 text-slate-600 mx-auto" />}
                </td>
                <td className="p-3 text-center">
                  {row.fiverr ? <Check className="h-4 w-4 text-emerald-400 mx-auto" /> : <X className="h-4 w-4 text-slate-600 mx-auto" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
