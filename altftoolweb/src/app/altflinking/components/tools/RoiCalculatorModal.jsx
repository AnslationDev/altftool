/**
 * Backlink ROI Calculator & Traffic Growth Simulator Modal Component
 * Location: src/app/altflinking/components/tools/RoiCalculatorModal.jsx
 */

"use client";

import React, { useState } from "react";
import { X, Calculator, TrendingUp, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

export default function RoiCalculatorModal({ isOpen, onClose, onApplyTarget }) {
  const [targetDr, setTargetDr] = useState("70");
  const [linkQuantity, setLinkQuantity] = useState("5");

  if (!isOpen) return null;

  const drValue = Number(targetDr);
  const qty = Number(linkQuantity);

  // Projected metrics formula
  const projectedTrafficGrowth = Math.min(180, qty * (drValue >= 75 ? 12 : 6));
  const estimatedCost = qty * (drValue >= 75 ? 240 : 160);
  const projectedRoiMultiplier = (projectedTrafficGrowth * 1.8).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white backdrop-blur-md">
      <div className="altf-card w-full max-w-lg p-6 space-y-5 border-indigo-500/40">

        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Backlink ROI & Growth Simulator</h3>
              <p className="text-xs text-slate-500">Calculate projected Ahrefs organic traffic increase</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Target Publisher DR</label>
              <select
                value={targetDr}
                onChange={(e) => setTargetDr(e.target.value)}
                className="altf-input text-xs font-bold"
              >
                <option value="50">DR 50 - 65 (Standard Media)</option>
                <option value="70">DR 70 - 79 (Authority Media)</option>
                <option value="80">DR 80 - 92+ (Top Tech Press)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Link Quantity</label>
              <select
                value={linkQuantity}
                onChange={(e) => setLinkQuantity(e.target.value)}
                className="altf-input text-xs font-bold"
              >
                <option value="3">3 Placements</option>
                <option value="5">5 Placements (Recommended)</option>
                <option value="10">10 Placements (Agency Push)</option>
                <option value="20">20 Placements (Scale Package)</option>
              </select>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Projected Organic Traffic Growth</span>
              <span className="text-xl font-black text-emerald-400 font-mono flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +{projectedTrafficGrowth}% / mo
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Estimated Escrow Cost</span>
                <p className="text-base font-extrabold text-white font-mono">${estimatedCost.toLocaleString()}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Est. ROI Multiplier</span>
                <p className="text-base font-extrabold text-cyan-400 font-mono">{projectedRoiMultiplier}x ROI</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="altf-btn-secondary py-2 px-4 text-xs">
              Close
            </button>
            <button
              onClick={() => {
                onApplyTarget({ minDr: drValue, maxPrice: estimatedCost / qty });
                onClose();
              }}
              className="altf-btn-primary py-2 px-5 text-xs font-bold"
            >
              <span>Filter Inventory For This ROI</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
