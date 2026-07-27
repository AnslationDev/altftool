"use client";

import { Layout, CheckCircle } from "lucide-react";

export default function HeadersFootersTab({ docA, docB }) {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <Layout className="h-5 w-5 text-indigo-500" />
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Headers & Footers Analyzer
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page headers, footers, margins, page numbers, and repeating text blocks
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-950 space-y-2">
          <span className="text-xs font-bold uppercase text-indigo-500">Document A (Original)</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{docA?.name || "Document A"}</p>
          <div className="rounded-xl bg-white dark:bg-slate-900 p-3 text-xs font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            {docA?.metadata?.headerText || "Standard header text layer"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-950 space-y-2">
          <span className="text-xs font-bold uppercase text-emerald-500">Document B (Updated)</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{docB?.name || "Document B"}</p>
          <div className="rounded-xl bg-white dark:bg-slate-900 p-3 text-xs font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            {docB?.metadata?.headerText || "Standard header text layer"}
          </div>
        </div>
      </div>
    </div>
  );
}
