"use client";
import { useState } from "react";
import {
  ImageIcon,
  Type,
  Square,
  GripVertical,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

const LayerTypeIcon = ({ type }) => {
  if (type === "image") return <ImageIcon className="w-3.5 h-3.5" />;
  if (type === "text") return <Type className="w-3.5 h-3.5" />;
  if (type === "shape") return <Square className="w-3.5 h-3.5" />;
  return null;
};

export default function LayerPanel({
  layers = [],
  selectedLayerId,
  onSelectLayer,
  onToggleVisibility,
  onDeleteLayer,
  onReorderLayers,
  onOpacityChange,
  onAddText,
  onAddShape,
  onAddSubtitle,
}) {
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  /* ── drag-to-reorder ── */
  const handleDragStart = (e, idx) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    setOverIdx(idx);
  };
  const handleDrop = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) {
      reset();
      return;
    }
    const next = [...layers];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    onReorderLayers(next);
    reset();
  };
  const reset = () => {
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div className="w-full rounded-2xl border border-(--border) bg-(--muted)/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-(--border) bg-(--muted)/30">
        <span className="text-xs font-semibold uppercase tracking-widest text-(--foreground)">
          Layers
        </span>
        <div className="flex gap-1">
          <button
            onClick={onAddText}
            title="Add text layer"
            className="px-2 py-1 text-[11px] rounded-lg border border-(--border) hover:border-(--primary)/60 hover:bg-(--primary)/10 text-(--foreground) transition-all font-medium cursor-pointer"
          >
            + Text
          </button>
          <button
            onClick={onAddShape}
            title="Add shape layer"
            className="px-2 py-1 text-[11px] rounded-lg border border-(--border) hover:border-(--primary)/60 hover:bg-(--primary)/10 text-(--foreground) transition-all font-medium cursor-pointer"
          >
            + Shape
          </button>
          <button
            onClick={onAddSubtitle}
            title="Add subtitle text at bottom"
            className="px-2 py-1 text-[11px] rounded-lg border border-(--border) hover:border-purple-500/60 hover:bg-purple-500/10 text-(--foreground) transition-all font-medium cursor-pointer"
          >
            + Subtitle
          </button>
        </div>
      </div>

      {/* Layer list — top = highest z-index (rendered last / on top) */}
      <div className="divide-y divide-(--border)/50">
        {[...layers].reverse().map((layer, reversedIdx) => {
          const realIdx = layers.length - 1 - reversedIdx;
          const isSelected = layer.id === selectedLayerId;
          const isDraggingOver = overIdx === realIdx;

          return (
            <div
              key={layer.id}
              draggable
              onDragStart={(e) => handleDragStart(e, realIdx)}
              onDragOver={(e) => handleDragOver(e, realIdx)}
              onDrop={(e) => handleDrop(e, realIdx)}
              onDragEnd={reset}
              onClick={() => onSelectLayer(layer.id)}
              className={`
                flex items-center gap-2 px-3 py-2 cursor-pointer transition-all select-none
                ${
                  isSelected
                    ? "bg-(--primary)/12 border-l-2 border-(--primary)"
                    : "hover:bg-(--muted)/40 border-l-2 border-transparent"
                }
                ${isDraggingOver ? "ring-1 ring-(--primary)/40" : ""}
                ${!layer.visible ? "opacity-40" : ""}
              `}
            >
              {/* Drag handle */}
              <span className="text-[10px] text-(--muted-foreground)/60 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-3 h-3 text-(--muted-foreground)/60" />
              </span>

              {/* Type icon */}
              <span className="text-[13px] w-4 text-center shrink-0">
                <LayerTypeIcon type={layer.type} />
              </span>

              {/* Name */}
              <span className="flex-1 text-xs font-medium text-(--foreground) truncate">
                {layer.name}
              </span>

              {/* Opacity mini-display */}
              <span className="text-xs text-(--muted-foreground) w-7 text-right shrink-0">
                {Math.round((layer.opacity ?? 1) * 100)}%
              </span>

              {/* Visibility toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(layer.id);
                }}
                title={layer.visible ? "Hide layer" : "Show layer"}
                className="text-[13px] hover:opacity-70 transition shrink-0 cursor-pointer"
              >
                {layer.visible ? (
                  <Eye className="w-4 h-4 hover:text-(--primary)" />
                ) : (
                  <EyeOff className="w-4 h-4 hover:text-(--primary)" />
                )}
              </button>

              {/* Delete (not for image base layer) */}
              {layer.type !== "image" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLayer(layer.id);
                  }}
                  title="Delete layer"
                  className="text-[11px] text-(--muted-foreground) hover:text-red-400 transition shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 hover:text-red-600" />
                </button>
              )}
            </div>
          );
        })}

        {layers.length === 0 && (
          <div className="px-3 py-5 text-center text-xs text-(--muted-foreground)">
            No slide selected
          </div>
        )}
      </div>

      {/* Opacity slider for selected layer */}
      {selectedLayerId &&
        (() => {
          const sel = layers.find((l) => l.id === selectedLayerId);
          if (!sel) return null;
          return (
            <div className="px-3 py-2.5 border-t border-(--border)/60 bg-(--muted)/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-(--muted-foreground) font-medium">
                  Opacity
                </span>
                <span className="text-[11px] font-semibold text-(--primary)">
                  {Math.round((sel.opacity ?? 1) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={sel.opacity ?? 1}
                onChange={(e) =>
                  onOpacityChange(sel.id, parseFloat(e.target.value))
                }
                className="w-full h-1.5 accent-(--primary)"
              />
            </div>
          );
        })()}
    </div>
  );
}
