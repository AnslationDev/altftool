"use client";

import { Volume2, FileText, Heading, Image as ImageIcon, Table, List, FormInput, HelpCircle } from "lucide-react";

const TAG_ICON_MAP = {
  h1: Heading,
  h2: Heading,
  h3: Heading,
  paragraph: FileText,
  image: ImageIcon,
  figure: ImageIcon,
  table: Table,
  caption: FileText,
  list: List,
  form: FormInput,
  artifact: HelpCircle,
};

export default function ScreenReaderStream({
  items = [],
  issues = [],
  selectedBlockId,
  onSelectBlock,
  animationIndex = -1,
}) {
  const speakText = (text) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Screen Reader Stream</h3>
        </div>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
          {items.length} Blocks
        </span>
      </div>

      {/* Stream Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {items.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
            No extracted reading blocks for this page. Open a text-based PDF or load the sample demo.
          </div>
        ) : (
          items.map((item, index) => {
            const Icon = TAG_ICON_MAP[item.tagType] || FileText;
            const isSelected = selectedBlockId === item.id;
            const isAnimated = animationIndex === index;
            const itemIssues = issues.filter((i) => i.blockId === item.id);
            const hasHighIssue = itemIssues.some((i) => i.severity === "high");

            return (
              <div
                key={`stream-${item.id}`}
                onClick={() => onSelectBlock(item)}
                className={`p-3 rounded-xl border text-xs transition cursor-pointer relative ${
                  isAnimated
                    ? "bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-slate-900 dark:text-slate-100 ring-2 ring-indigo-500 shadow-md"
                    : isSelected
                      ? "bg-slate-100 dark:bg-slate-800 border-indigo-500/80 text-slate-900 dark:text-slate-100 shadow-sm"
                      : hasHighIssue
                        ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/80 text-slate-900 dark:text-slate-200 hover:bg-rose-100 dark:hover:bg-rose-950/50"
                        : "bg-slate-50/60 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isAnimated
                          ? "bg-indigo-600 dark:bg-indigo-400 text-white dark:text-slate-950"
                          : isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-400">
                      <Icon className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />
                      {item.tagType}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {itemIssues.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 text-[10px] font-bold">
                        {itemIssues.length} Issue{itemIssues.length > 1 ? "s" : ""}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(item.text);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                      title="Speak block text"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-900 dark:text-slate-200 font-medium leading-relaxed break-words pl-7">
                  {item.text}
                </p>

                {item.hasCoordinates && (
                  <div className="mt-2 pl-7 flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    <span>X: {item.x.toFixed(0)}</span>
                    <span>Y: {item.y.toFixed(0)}</span>
                    <span>W: {item.width.toFixed(0)}</span>
                    <span>H: {item.height.toFixed(0)}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
