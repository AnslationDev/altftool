"use client";

const PHASE_COLORS = ["#534AB7", "#1D9E75", "#BA7517", "#D85A30"];

export default function TimelineEditor({ slides, selectedId, onSelect, globalDuration }) {
  if (!slides.length) return null;

  const totalDuration = slides.reduce((s, sl) => s + (sl.duration ?? globalDuration), 0);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-(--muted-foreground) uppercase tracking-wider">
          Timeline
        </span>
        <span className="text-xs text-(--muted-foreground)">
          Total: {totalDuration.toFixed(1)}s
        </span>
      </div>

      {/* Track */}
      <div className="relative w-full h-14 flex rounded-xl overflow-hidden border border-(--border) bg-(--muted)/20">
        {slides.map((slide, i) => {
          const dur     = slide.duration ?? globalDuration;
          const widthPc = (dur / totalDuration) * 100;
          const isActive = slide.id === selectedId;
          const color   = PHASE_COLORS[i % PHASE_COLORS.length];

          return (
            <div
              key={slide.id}
              onClick={() => onSelect(slide.id)}
              title={`Slide ${i + 1} · ${dur}s`}
              style={{
                width:           `${widthPc}%`,
                backgroundImage: `url(${slide.url})`,
                backgroundSize:  "cover",
                backgroundPosition: "center",
                borderRight:     i < slides.length - 1 ? "2px solid rgba(0,0,0,0.4)" : "none",
                outline:         isActive ? `2px solid ${color}` : "none",
                outlineOffset:   "-2px",
                position:        "relative",
                cursor:          "pointer",
                flexShrink:      0,
                transition:      "outline 0.15s",
              }}
            >
              {/* Entry cap */}
              {slide.entryAnim && slide.entryAnim !== "none" && (
                <div
                  style={{
                    position:   "absolute", left: 0, top: 0, bottom: 0,
                    width:      `${(slide.entryFrac ?? 0.2) * 100}%`,
                    background: "rgba(83,74,183,0.55)",
                    minWidth:   4,
                  }}
                />
              )}
              {/* Exit cap */}
              {slide.exitAnim && slide.exitAnim !== "none" && (
                <div
                  style={{
                    position:   "absolute", right: 0, top: 0, bottom: 0,
                    width:      `${(slide.exitFrac ?? 0.2) * 100}%`,
                    background: "rgba(216,90,48,0.55)",
                    minWidth:   4,
                  }}
                />
              )}
              {/* Slide number */}
              <span
                style={{
                  position:   "absolute", bottom: 3, left: "50%",
                  transform:  "translateX(-50%)",
                  fontSize:   10, color: "#fff",
                  background: "rgba(0,0,0,0.55)",
                  borderRadius: 8, padding: "1px 5px",
                  whiteSpace: "nowrap",
                }}
              >
                {i + 1} · {dur}s
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-1.5">
        <span className="flex items-center gap-1 text-[10px] text-(--muted-foreground)">
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(83,74,183,0.6)", display: "inline-block" }} />
          Entry
        </span>
        <span className="flex items-center gap-1 text-[10px] text-(--muted-foreground)">
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(216,90,48,0.6)", display: "inline-block" }} />
          Exit
        </span>
      </div>
    </div>
  );
}