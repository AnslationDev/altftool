"use client";

import { FileCheck, Search, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

export default function AIInsightsTab({ versionAI, semanticData }) {
  if (!versionAI) return null;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <FileCheck className="h-5 w-5 text-indigo-500" />
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Insights & Verification Panel
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Intelligent local NLP heuristics, semantic equivalence, and version reasoning
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Version Reasoning Box */}
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 p-5 space-y-4">
          <h4 className="font-extrabold text-sm text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-indigo-500" /> Version Lineage Reasoning
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {(versionAI.reasoning || []).map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Semantic Sentence Equivalence Box */}
        <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30 p-5 space-y-4">
          <h4 className="font-extrabold text-sm text-purple-900 dark:text-purple-200 flex items-center gap-2">
            <Search className="h-4 w-4 text-purple-500" /> Sentence Meaning Equivalence
          </h4>
          {semanticData?.sentenceEquivalences?.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {semanticData.sentenceEquivalences.map((eq, idx) => (
                <div key={idx} className="rounded-xl bg-white dark:bg-slate-900 p-3 text-xs space-y-1 border border-purple-100 dark:border-purple-900/40">
                  <div className="flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400">
                    <span>{eq.status}</span>
                    <span>{eq.similarity}% Similar</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-mono">Original: "{eq.original}"</p>
                  <p className="text-slate-900 dark:text-white font-mono font-semibold">Match: "{eq.comparison}"</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No paraphrased or semantic sentence matches extracted.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
