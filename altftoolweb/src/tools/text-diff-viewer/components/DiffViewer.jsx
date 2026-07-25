"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

export default function DiffViewer({ diffResult, viewMode, stats, searchQuery }) {
  if (viewMode === "side-by-side") {
    return <SideBySideView diff={diffResult} stats={stats} searchQuery={searchQuery} />;
  }
  return <InlineView diff={diffResult} searchQuery={searchQuery} />;
}

function SideBySideView({ diff, stats, searchQuery }) {
  const { leftLines, rightLines } = useMemo(() => {
    const original = diff
      .filter((part) => !part.added)
      .map((part) => part.value)
      .join("")
      .split("\n");
    const modified = diff
      .filter((part) => !part.removed)
      .map((part) => part.value)
      .join("")
      .split("\n");
    const maxLines = Math.max(original.length, modified.length);

    return {
      leftLines: Array.from({ length: maxLines }, (_, index) => {
        const content = original[index];
        return {
          type:
            content !== undefined && content === modified[index]
              ? "unchanged"
              : "removed",
          content: content ?? "",
          lineNum: content === undefined ? null : index + 1,
        };
      }),
      rightLines: Array.from({ length: maxLines }, (_, index) => {
        const content = modified[index];
        return {
          type:
            content !== undefined && content === original[index]
              ? "unchanged"
              : "added",
          content: content ?? "",
          lineNum: content === undefined ? null : index + 1,
        };
      }),
    };
  }, [diff]);

  return (
    <div className="grid grid-cols-2 gap-0 border border-(--border) rounded-xl overflow-hidden">
      <div className="border-r border-(--border)">
        <div className="px-3 py-2 text-xs font-semibold text-(--muted-foreground) bg-(--muted) border-b border-(--border)">
          Original ({leftLines.length} lines)
        </div>
        <div className="overflow-auto max-h-[400px] text-sm font-mono leading-relaxed">
          {leftLines.map((line, i) => (
            <div
              key={i}
              className={`flex ${
                line.type === "removed"
                  ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                  : ""
              }`}
            >
              <span className="w-10 shrink-0 text-right pr-2 text-[10px] text-(--muted-foreground) select-none border-r border-(--border) py-0.5">
                {line.lineNum ?? ""}
              </span>
              <span className="px-2 py-0.5 flex-1 whitespace-pre-wrap break-all">{line.content}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="px-3 py-2 text-xs font-semibold text-(--muted-foreground) bg-(--muted) border-b border-(--border)">
          Modified ({rightLines.length} lines)
        </div>
        <div className="overflow-auto max-h-[400px] text-sm font-mono leading-relaxed">
          {rightLines.map((line, i) => (
            <div
              key={i}
              className={`flex ${
                line.type === "added"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  : ""
              }`}
            >
              <span className="w-10 shrink-0 text-right pr-2 text-[10px] text-(--muted-foreground) select-none border-r border-(--border) py-0.5">
                {line.lineNum ?? ""}
              </span>
              <span className="px-2 py-0.5 flex-1 whitespace-pre-wrap break-all">{line.content}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InlineView({ diff, searchQuery }) {
  return (
    <div className="border border-(--border) rounded-xl overflow-hidden">
      <div className="px-3 py-2 text-xs font-semibold text-(--muted-foreground) bg-(--muted) border-b border-(--border)">
        Inline Diff
      </div>
      <div className="overflow-auto max-h-[500px] text-sm font-mono leading-relaxed">
        {diff.map((part, i) => {
          const bgColor = part.added
            ? "bg-green-50 dark:bg-green-900/20"
            : part.removed
            ? "bg-red-50 dark:bg-red-900/20"
            : "";
          const textColor = part.added
            ? "text-green-700 dark:text-green-300"
            : part.removed
            ? "text-red-700 dark:text-red-300"
            : "text-(--foreground)";
          const prefix = part.added ? "+ " : part.removed ? "- " : "  ";
          return (
            <div key={i} className={`flex ${bgColor} ${textColor} px-3 py-0.5`}>
              <span className="w-5 shrink-0 text-(--muted-foreground) select-none">{prefix}</span>
              <span className="flex-1 whitespace-pre-wrap break-all">{part.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
