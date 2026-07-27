"use client";

import { Table as TableIcon } from "lucide-react";

export default function TablesTab({ docA, docB }) {
  const countA = docA?.metadata?.tableCount || 0;
  const countB = docB?.metadata?.tableCount || 0;
  const delta = countB - countA;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <TableIcon className="h-5 w-5 text-indigo-500" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Table Difference Engine
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rows, columns, merged cells, totals, headers, and CSV/DOCX table comparison
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/40">
          <span className="text-xs font-bold text-slate-400 uppercase">Doc A Tables</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{countA}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/40">
          <span className="text-xs font-bold text-slate-400 uppercase">Doc B Tables</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{countB}</p>
        </div>
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 p-4 bg-indigo-50/50 dark:bg-indigo-950/30">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Table Count Delta</span>
          <p className="text-2xl font-black text-indigo-900 dark:text-indigo-200 mt-1">
            {delta > 0 ? `+${delta}` : delta}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 text-center space-y-2">
        <TableIcon className="h-8 w-8 text-slate-400 mx-auto" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {delta === 0
            ? "No table count delta observed between versions."
            : `Table count shifted by ${delta > 0 ? `+${delta}` : delta} tables.`}
        </p>
        <p className="text-xs text-slate-500">
          CSV header/cell matrices & DOCX XML table nodes analyzed locally.
        </p>
      </div>
    </div>
  );
}
