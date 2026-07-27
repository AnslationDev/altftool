/**
 * Global Search Dialog Modal (Cmd+K)
 * Location: src/app/altflinking/components/navigation/SearchModal.jsx
 */

"use client";

import React, { useState } from "react";
import { Search, X, ShieldCheck, ArrowRight, Globe, Store, FileText, Zap } from "lucide-react";

export default function SearchModal({ isOpen, onClose, websites = [], onSelectDomain }) {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const filtered = query.trim()
    ? websites.filter(
        (s) =>
          s.domain.toLowerCase().includes(query.toLowerCase()) ||
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.niche.toLowerCase().includes(query.toLowerCase())
      )
    : websites.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/20 backdrop-blur-sm">
      <div className="altf-card w-full max-w-xl p-4 space-y-4 border-indigo-500/40 shadow-2xl animate-in fade-in zoom-in duration-150">

        {/* Search Input Box */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <Search className="h-5 w-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search domain, DR 50+, traffic, niche..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="space-y-1.5 max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-xs text-slate-500">No websites match your search query.</p>
          ) : (
            filtered.map((site) => (
              <div
                key={site.id}
                onClick={() => {
                  onSelectDomain(site);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-500/40 hover:bg-white cursor-pointer transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                      {site.domain}
                      {site.verified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
                    </h4>
                    <p className="text-[11px] text-slate-500">{site.niche} • DR {site.dr} • {site.traffic.toLocaleString()}/mo</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-400">${site.prices.guestPost}</span>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-600 transition" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-[10px] text-slate-500">
          <span>Tip: Press ESC to close</span>
          <span>Showing verified marketplace publishers</span>
        </div>
      </div>
    </div>
  );
}
