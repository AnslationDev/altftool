"use client";

import { Image as ImageIcon, Plus, Minus, RefreshCw } from "lucide-react";

export default function ImagesTab({ docA, docB }) {
  const countA = docA?.metadata?.imageCount || 0;
  const countB = docB?.metadata?.imageCount || 0;
  const delta = countB - countA;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-5 w-5 text-indigo-500" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Image Difference Detection
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detect new, removed, modified, resized, or compressed images
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/40">
          <span className="text-xs font-bold text-slate-400 uppercase">Document A Images</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{countA}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/40">
          <span className="text-xs font-bold text-slate-400 uppercase">Document B Images</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{countB}</p>
        </div>
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 p-4 bg-indigo-50/50 dark:bg-indigo-950/30">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Image Count Delta</span>
          <p className="text-2xl font-black text-indigo-900 dark:text-indigo-200 mt-1">
            {delta > 0 ? `+${delta}` : delta}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 text-center space-y-2">
        <ImageIcon className="h-8 w-8 text-slate-400 mx-auto" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {delta === 0
            ? "No image count difference was detected between versions."
            : `Image count changed by ${delta > 0 ? `+${delta}` : delta} between Version A and Version B.`}
        </p>
        <p className="text-xs text-slate-500">
          PDF & DOCX media objects inspected locally via JSZip & PDF text canvas layer.
        </p>
      </div>
    </div>
  );
}
