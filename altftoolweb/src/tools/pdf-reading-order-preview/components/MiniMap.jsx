"use client";

import { Eye } from "lucide-react";

export default function MiniMap({
  pageSize = { width: 595, height: 842 },
  items = [],
  issues = [],
  selectedBlockId,
  onSelectBlock,
  animationIndex = -1,
}) {
  const mapWidth = 140;
  const scale = mapWidth / (pageSize.width || 595);
  const mapHeight = (pageSize.height || 842) * scale;

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xl flex flex-col gap-2 backdrop-blur-md">
      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-extrabold">
          <Eye className="h-3 w-3" /> Mini Map
        </span>
        <span>{items.length} Blocks</span>
      </div>

      {/* Thumbnail Canvas Boundary */}
      <div
        className="relative bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded overflow-hidden mx-auto transition-all"
        style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
      >
        {items.map((item, idx) => {
          if (!item.hasCoordinates) return null;
          const isSelected = selectedBlockId === item.id;
          const isAnimated = animationIndex === idx;
          const hasIssue = issues.some((i) => i.blockId === item.id);

          return (
            <div
              key={`minimap-${item.id}`}
              onClick={() => onSelectBlock(item)}
              title={`#${idx + 1}: ${item.text.slice(0, 30)}`}
              className={`absolute rounded-[1px] cursor-pointer transition ${
                hasIssue
                  ? "bg-rose-500"
                  : isAnimated
                    ? "bg-indigo-500 ring-2 ring-indigo-300 z-10 scale-125"
                    : isSelected
                      ? "bg-indigo-600 ring-1 ring-white z-10"
                      : "bg-slate-400 dark:bg-slate-700/80 hover:bg-indigo-400"
              }`}
              style={{
                left: `${item.x * scale}px`,
                top: `${item.y * scale}px`,
                width: `${Math.max(item.width * scale, 3)}px`,
                height: `${Math.max(item.height * scale, 2)}px`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
