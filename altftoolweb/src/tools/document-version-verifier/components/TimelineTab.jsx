"use client";

import { Clock, ArrowRight, UserCheck, Edit3 } from "lucide-react";

export default function TimelineTab({ docA, docB, versionAI }) {
  const dateA = docA?.metadata?.modifiedDate ? new Date(docA.metadata.modifiedDate).toLocaleString() : "Initial Version";
  const dateB = docB?.metadata?.modifiedDate ? new Date(docB.metadata.modifiedDate).toLocaleString() : "Latest Version";

  const authorA = docA?.metadata?.author || "Initial Author";
  const authorB = docB?.metadata?.author || "Revision Author";

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <Clock className="h-5 w-5 text-indigo-500" />
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Interactive Document Timeline
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Version history lineage graph (Version 1 → Version 2 → Current)
          </p>
        </div>
      </div>

      <div className="relative border-l-2 border-indigo-500/40 ml-4 space-y-8 pl-6">
        {/* Node 1: Version A */}
        <div className="relative">
          <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full bg-indigo-600 ring-4 ring-indigo-500/20" />
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-indigo-600 dark:text-indigo-400">
                Version 1.0 (Original Draft)
              </span>
              <span className="text-xs font-mono text-slate-400">{dateA}</span>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">{docA?.name || "Document A"}</h4>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <UserCheck className="h-3.5 w-3.5" /> Author: {authorA}
            </p>
          </div>
        </div>

        {/* Node 2: Version B */}
        <div className="relative">
          <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
          <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/40 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
                Version 2.0 (Active Revision - {versionAI?.confidence || 95}% Confidence)
              </span>
              <span className="text-xs font-mono text-slate-400">{dateB}</span>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">{docB?.name || "Document B"}</h4>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <UserCheck className="h-3.5 w-3.5" /> Editor: {authorB}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
