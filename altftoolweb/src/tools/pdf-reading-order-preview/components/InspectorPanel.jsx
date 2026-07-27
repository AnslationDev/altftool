"use client";

import { Info, AlertTriangle, AlertCircle, Lightbulb, MapPin, Tag, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function InspectorPanel({ selectedBlock, issues = [] }) {
  const [copied, setCopied] = useState(false);

  if (!selectedBlock) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 backdrop-blur-md shadow-lg">
        <Info className="h-8 w-8 text-indigo-500 dark:text-indigo-400 mb-3" />
        <p className="text-sm font-bold text-slate-900 dark:text-slate-200">No Block Selected</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
          Click any numbered box on the PDF canvas or select an item in the Stream to view details.
        </p>
      </div>
    );
  }

  const blockIssues = issues.filter((i) => i.blockId === selectedBlock.id);

  const copyText = () => {
    if (selectedBlock?.text) {
      navigator.clipboard.writeText(selectedBlock.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            #{selectedBlock.estimatedIndex + 1}
          </span>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Block Inspector</h3>
        </div>
        <span className="uppercase text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
          {selectedBlock.tagType}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
        {/* Geometry Metrics Grid */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <MapPin className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
              Spatial Bounding Box
            </span>
            <span className="font-mono text-[10px] text-slate-400">ID: {selectedBlock.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono pt-1 text-slate-700 dark:text-slate-300">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 block text-[9px]">X OFFSET</span>
              <span className="font-bold">{selectedBlock.x?.toFixed(1) ?? "N/A"} pt</span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 block text-[9px]">Y OFFSET</span>
              <span className="font-bold">{selectedBlock.y?.toFixed(1) ?? "N/A"} pt</span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 block text-[9px]">WIDTH</span>
              <span className="font-bold">{selectedBlock.width?.toFixed(1) ?? "N/A"} pt</span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 block text-[9px]">HEIGHT</span>
              <span className="font-bold">{selectedBlock.height?.toFixed(1) ?? "N/A"} pt</span>
            </div>
          </div>
        </div>

        {/* Text Content Snippet */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Tag className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
              Extracted Text Payload
            </span>
            <button
              type="button"
              onClick={copyText}
              className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 leading-relaxed font-medium text-xs break-words">
            &quot;{selectedBlock.text}&quot;
          </p>
        </div>

        {/* Detected Accessibility Issues */}
        {blockIssues.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Detected Issues ({blockIssues.length})
            </h4>

            {blockIssues.map((iss) => (
              <div
                key={iss.id}
                className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/80 space-y-1.5 text-slate-900 dark:text-rose-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-rose-900 dark:text-rose-200">{iss.title}</span>
                  <span className="uppercase text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
                    {iss.severity}
                  </span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] text-slate-700 dark:text-rose-200">
                    <strong className="text-rose-600 dark:text-rose-400">Problem:</strong> {iss.message}
                  </div>

                  {/* Smart Suggestion */}
                  <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2 text-emerald-900 dark:text-emerald-200 text-[11px]">
                    <Lightbulb className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    <div>
                      <strong className="text-emerald-800 dark:text-emerald-300 font-bold block mb-0.5">Remediation Suggestion:</strong>
                      <span>{iss.suggestion}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs font-medium">
            <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>No accessibility defects detected on this block.</span>
          </div>
        )}
      </div>
    </div>
  );
}
