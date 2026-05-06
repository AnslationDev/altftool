"use client";
import { SPLIT_LAYOUTS } from "../utils/splitScreen";
import ManagedImage from "@/components/ui/ManagedImage";

export default function SplitScreenEditor({
  splitLayout,
  onLayoutChange,
  slides,
  splitSlotMap,
  onSlotAssign,
}) {
  if (!slides.length) return null;

  // How many slots does current layout need?
  const slotCount =
    {
      none: 0,
      "side-by-side": 2,
      "top-bottom": 2,
      trio: 3,
      "before-after": 2,
      collage: 3,
    }[splitLayout] ?? 0;

  return (
    <div className="w-full rounded-2xl border border-(--border) bg-(--muted)/20 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-(--foreground)">
          Split-Screen Mode
        </span>
        {splitLayout !== "none" && (
          <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-medium">
            Active
          </span>
        )}
      </div>

      {/* Layout picker */}
      <div className="grid grid-cols-3 gap-1.5">
        {SPLIT_LAYOUTS.map((l) => (
          <button
            key={l.value}
            onClick={() => onLayoutChange(l.value)}
            className={`
              px-2 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer
              ${
                splitLayout === l.value
                  ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                  : "border-(--border) text-(--foreground) hover:border-(--primary)/50"
              }
            `}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Slot assignment — only shown when layout active */}
      {slotCount > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-(--muted-foreground) font-medium">
            Assign images to slots
          </p>

          {Array.from({ length: slotCount }, (_, i) => {
            const assignedId = splitSlotMap[i];
            const assigned = slides.find((s) => s.id === assignedId);

            return (
              <div key={i} className="flex items-center gap-3">
                {/* Slot label */}
                <div className="w-6 h-6 rounded-full bg-(--muted) flex items-center justify-center text-xs font-bold text-(--foreground) flex-shrink-0">
                  {i + 1}
                </div>

                {/* Thumbnail preview */}
                {assigned ? (
                  <ManagedImage
                    src={assigned.url}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover border border-(--border) flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg border border-dashed border-(--border) flex items-center justify-center text-(--muted-foreground) text-xs flex-shrink-0">
                    ?
                  </div>
                )}

                {/* Dropdown */}
                <select
                  value={assignedId ?? ""}
                  onChange={(e) => onSlotAssign(i, e.target.value)}
                  className="flex-1 text-xs bg-(--background) text-(--foreground) border border-(--border) rounded-lg px-2 py-1.5 cursor-pointer"
                >
                  <option value="">— pick image —</option>
                  {slides.map((s, si) => (
                    <option key={s.id} value={s.id}>
                      Slide {si + 1} ({s.orientation})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}

      {/* Visual preview of layout shape */}
      {slotCount > 0 && <LayoutPreview layout={splitLayout} />}
    </div>
  );
}

/* Mini visual diagram of the chosen layout */
function LayoutPreview({ layout }) {
  const configs = {
    "side-by-side": [
      { l: 0, t: 0, w: 47, h: 100 },
      { l: 53, t: 0, w: 47, h: 100 },
    ],
    "top-bottom": [
      { l: 0, t: 0, w: 100, h: 47 },
      { l: 0, t: 53, w: 100, h: 47 },
    ],
    trio: [
      { l: 0, t: 0, w: 30, h: 100 },
      { l: 35, t: 0, w: 30, h: 100 },
      { l: 70, t: 0, w: 30, h: 100 },
    ],
    "before-after": [
      { l: 0, t: 0, w: 52, h: 100 },
      { l: 57, t: 0, w: 43, h: 100 },
    ],
    collage: [
      { l: 0, t: 0, w: 55, h: 100 },
      { l: 60, t: 0, w: 40, h: 47 },
      { l: 60, t: 53, w: 40, h: 47 },
    ],
  };

  const rects = configs[layout] ?? [];

  return (
    <div className="flex justify-center">
      <div
        className="relative bg-(--muted)/40 rounded-lg border border-(--border)"
        style={{ width: 80, height: 48 }}
      >
        {rects.map((r, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${r.l}%`,
              top: `${r.t}%`,
              width: `${r.w}%`,
              height: `${r.h}%`,
              background: `hsl(${240 + i * 40}, 55%, 65%)`,
              borderRadius: 2,
              opacity: 0.75,
            }}
          />
        ))}
      </div>
    </div>
  );
}
