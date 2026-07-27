"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Filter, Search } from "lucide-react";

export default function ContentComparisonTab({ diffRows = [], searchQuery = "", activeFilters = {} }) {
  const [viewMode, setViewMode] = useState("side-by-side"); // side-by-side, unified
  const [currentDiffIndex, setCurrentDiffIndex] = useState(0);

  // Filter diff rows according to active search query and filter toggles
  const filteredDiffRows = diffRows.filter((row) => {
    // Type filtering
    if (row.type === "added" && activeFilters?.added === false) return false;
    if (row.type === "removed" && activeFilters?.removed === false) return false;
    if (row.type === "changed" && activeFilters?.modified === false) return false;

    // Search query filtering
    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchBefore = (row.before || "").toLowerCase().includes(q);
      const matchAfter = (row.after || "").toLowerCase().includes(q);
      return matchBefore || matchAfter;
    }

    return true;
  });

  const changedIndices = filteredDiffRows
    .map((row, idx) => (row.type !== "equal" ? idx : -1))
    .filter((idx) => idx !== -1);

  const totalChanges = changedIndices.length;

  const goToNextDiff = () => {
    if (totalChanges === 0) return;
    setCurrentDiffIndex((prev) => (prev + 1) % totalChanges);
    scrollToRow(changedIndices[(currentDiffIndex + 1) % totalChanges]);
  };

  const goToPrevDiff = () => {
    if (totalChanges === 0) return;
    const nextIdx = (currentDiffIndex - 1 + totalChanges) % totalChanges;
    setCurrentDiffIndex(nextIdx);
    scrollToRow(changedIndices[nextIdx]);
  };

  const scrollToRow = (rowIdx) => {
    const el = document.getElementById(`diff-row-${rowIdx}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
      {/* Header & Difference Navigator Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Content Difference Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Line-by-line comparison ({filteredDiffRows.length} lines shown)
          </p>
        </div>

        {/* View Mode & Diff Navigator */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs">
            <button
              onClick={() => setViewMode("side-by-side")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === "side-by-side" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-500"
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode("unified")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === "unified" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-500"
              }`}
            >
              Unified
            </button>
          </div>

          {/* Difference Navigator Buttons */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1 text-xs font-bold">
            <span className="px-2 text-slate-500">
              Diff {totalChanges ? currentDiffIndex + 1 : 0} of {totalChanges}
            </span>
            <button
              onClick={goToPrevDiff}
              disabled={totalChanges === 0}
              className="rounded-lg p-1 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
              title="Previous Difference"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={goToNextDiff}
              disabled={totalChanges === 0}
              className="rounded-lg p-1 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
              title="Next Difference"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-Side View */}
      {viewMode === "side-by-side" ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 max-h-[600px]">
          <table className="w-full min-w-3xl border-collapse text-left font-mono text-xs">
            <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 font-sans text-slate-500 uppercase">
              <tr>
                <th className="w-12 p-2.5 text-center">L#</th>
                <th className="w-1/2 p-2.5 border-r border-slate-200 dark:border-slate-700">Original Version</th>
                <th className="w-12 p-2.5 text-center">L#</th>
                <th className="w-1/2 p-2.5">Updated Version</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
              {filteredDiffRows.map((row, idx) => {
                const isCurrentFocus = changedIndices[currentDiffIndex] === idx;
                let bgClass = "bg-white dark:bg-slate-900";

                if (row.type === "added") bgClass = "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200";
                if (row.type === "removed") bgClass = "bg-red-50/80 dark:bg-red-950/40 text-red-900 dark:text-red-200";
                if (row.type === "changed") bgClass = "bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200";

                return (
                  <tr
                    id={`diff-row-${idx}`}
                    key={idx}
                    className={`${bgClass} ${isCurrentFocus ? "ring-2 ring-indigo-500 z-10" : ""}`}
                  >
                    <td className="w-12 p-2 text-center text-slate-400 border-r border-slate-200 dark:border-slate-800 select-none">
                      {row.beforeLine || ""}
                    </td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-800 break-words whitespace-pre-wrap max-w-md">
                      {row.before || ""}
                    </td>
                    <td className="w-12 p-2 text-center text-slate-400 border-r border-slate-200 dark:border-slate-800 select-none">
                      {row.afterLine || ""}
                    </td>
                    <td className="p-2 break-words whitespace-pre-wrap max-w-md">
                      {row.after || ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Unified View */
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 max-h-[600px] p-4 font-mono text-xs space-y-1 bg-slate-950 text-slate-200">
          {filteredDiffRows.map((row, idx) => {
            if (row.type === "removed") {
              return (
                <div key={idx} id={`diff-row-${idx}`} className="bg-red-900/40 text-red-300 px-2 py-1 rounded">
                  - {row.before}
                </div>
              );
            }
            if (row.type === "added") {
              return (
                <div key={idx} id={`diff-row-${idx}`} className="bg-emerald-900/40 text-emerald-300 px-2 py-1 rounded">
                  + {row.after}
                </div>
              );
            }
            if (row.type === "changed") {
              return (
                <div key={idx} id={`diff-row-${idx}`} className="space-y-1">
                  <div className="bg-red-900/40 text-red-300 px-2 py-0.5 rounded">- {row.before}</div>
                  <div className="bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded">+ {row.after}</div>
                </div>
              );
            }
            return (
              <div key={idx} className="px-2 py-0.5 text-slate-400">
                &nbsp; {row.after}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
