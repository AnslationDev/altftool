/**
 * Bulk Domain Search & CSV Upload Modal Component
 * Location: src/app/altflinking/components/marketplace/BulkDomainSearchModal.jsx
 */

"use client";

import React, { useState } from "react";
import { X, Upload, Search, ShieldCheck, FileText, CheckCircle2, ArrowRight } from "lucide-react";

export default function BulkDomainSearchModal({ isOpen, onClose, onBulkMatch }) {
  const [inputText, setInputText] = useState("");

  if (!isOpen) return null;

  const handleProcessBulk = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const list = inputText
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    onBulkMatch(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white backdrop-blur-md">
      <div className="altf-card w-full max-w-xl p-6 space-y-5 border-indigo-500/40">

        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Bulk Domain Search & CSV Match</h3>
              <p className="text-xs text-slate-500">Paste up to 50 target domains, niches, or upload a CSV file</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleProcessBulk} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Paste Target Domains or Keywords (One per line or comma separated)
            </label>
            <textarea
              rows={6}
              placeholder="techradar-insights.com&#10;saasgrowthjournal.io&#10;Technology&#10;Finance"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="altf-input text-xs font-mono resize-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              <span>Or drag & drop your agency client inventory <strong>.CSV / .TXT</strong> file</span>
            </div>
            <button
              type="button"
              onClick={() => setInputText("techradar-insights.com\nsaasgrowthjournal.io\nfintechpulse-weekly.com\nclouddev-digest.org")}
              className="text-xs font-bold text-indigo-400 hover:underline"
            >
              Load Sample CSV
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="altf-btn-secondary py-2 px-4 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="altf-btn-primary py-2 px-5 text-xs font-bold"
            >
              <span>Match 1,400+ Inventory</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
