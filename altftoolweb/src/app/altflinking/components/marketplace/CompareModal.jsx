/**
 * Domain Comparison Modal for ALTFTool Backlink Marketplace
 * Location: src/app/altflinking/components/marketplace/CompareModal.jsx
 */

"use client";

import React from "react";
import { X, ShieldCheck, Check, Trash2 } from "lucide-react";

export default function CompareModal({ compareList, onClose, onRemove, onOrder }) {
  if (!compareList || compareList.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white backdrop-blur-sm">
      <div className="altf-card w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Domain Comparison Matrix</h2>
            <p className="text-xs text-slate-500">Comparing {compareList.length} selected publisher domains</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-3 text-slate-500 font-semibold w-1/4">Metric</th>
                {compareList.map((site) => (
                  <th key={site.id} className="p-3 text-white font-bold w-1/4">
                    <div className="flex items-center justify-between">
                      <span className="truncate max-w-[140px]">{site.name || site.domain}</span>
                      <button
                        onClick={() => onRemove(site.id)}
                        className="text-slate-500 hover:text-rose-400"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="p-3 text-slate-500 font-medium">Domain Rating (DR)</td>
                {compareList.map((site) => (
                  <td key={site.id} className="p-3 font-mono font-bold text-indigo-400">
                    DR {site.dr}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-slate-500 font-medium">Domain Authority (DA)</td>
                {compareList.map((site) => (
                  <td key={site.id} className="p-3 font-mono text-slate-600">
                    DA {site.da}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-slate-500 font-medium">Organic Traffic</td>
                {compareList.map((site) => (
                  <td key={site.id} className="p-3 font-mono font-bold text-emerald-400">
                    {site.traffic.toLocaleString()}/mo
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-slate-500 font-medium">Turnaround Time (TAT)</td>
                {compareList.map((site) => (
                  <td key={site.id} className="p-3 font-mono text-cyan-400">
                    {site.tatDays} Days
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-slate-500 font-medium">Spam Score</td>
                {compareList.map((site) => (
                  <td key={site.id} className="p-3 font-mono text-slate-600">
                    {site.spamScore}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-slate-500 font-medium">Guest Post Price</td>
                {compareList.map((site) => (
                  <td key={site.id} className="p-3 font-mono font-extrabold text-white text-sm">
                    ${site.prices.guestPost}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-slate-500 font-medium">Action</td>
                {compareList.map((site) => (
                  <td key={site.id} className="p-3">
                    <button
                      onClick={() => {
                        onClose();
                        onOrder(site);
                      }}
                      className="altf-btn-primary py-1 px-3 text-xs w-full"
                    >
                      Select
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
