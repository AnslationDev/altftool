"use client";

import { ListTree, FolderTree, AlertCircle, Plus, Minus, Edit2 } from "lucide-react";

export default function StructureTab({ structureData }) {
  if (!structureData) return null;

  const { addedHeadings = [], removedHeadings = [], modifiedHeadings = [], structureSimilarity = 100 } = structureData;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <ListTree className="h-5 w-5 text-indigo-500" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Document Structure Analyzer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Heading hierarchy, section delta, table & image node changes
            </p>
          </div>
        </div>

        <div className="rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-4 py-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
          Structure Similarity: {structureSimilarity}%
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Added Headings */}
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 space-y-3">
          <h4 className="font-extrabold text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Added Headings ({addedHeadings.length})
          </h4>
          {addedHeadings.length ? (
            <ul className="space-y-2">
              {addedHeadings.map((h, i) => (
                <li key={i} className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="font-mono text-[10px] text-emerald-500 mr-2">H{h.level}</span>
                  {h.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">No new headings added.</p>
          )}
        </div>

        {/* Removed Headings */}
        <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 p-5 space-y-3">
          <h4 className="font-extrabold text-sm text-red-700 dark:text-red-300 flex items-center gap-1.5">
            <Minus className="h-4 w-4" /> Removed Headings ({removedHeadings.length})
          </h4>
          {removedHeadings.length ? (
            <ul className="space-y-2">
              {removedHeadings.map((h, i) => (
                <li key={i} className="text-xs font-semibold text-red-900 dark:text-red-200 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-red-200 dark:border-red-800">
                  <span className="font-mono text-[10px] text-red-500 mr-2">H{h.level}</span>
                  {h.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">No headings removed.</p>
          )}
        </div>

        {/* Modified Headings */}
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-5 space-y-3">
          <h4 className="font-extrabold text-sm text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <Edit2 className="h-4 w-4" /> Modified Level Headings ({modifiedHeadings.length})
          </h4>
          {modifiedHeadings.length ? (
            <ul className="space-y-2">
              {modifiedHeadings.map((m, i) => (
                <li key={i} className="text-xs font-semibold text-amber-900 dark:text-amber-200 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                  {m.before.title} (H{m.before.level} → H{m.after.level})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">No headings re-leveled.</p>
          )}
        </div>
      </div>
    </div>
  );
}
