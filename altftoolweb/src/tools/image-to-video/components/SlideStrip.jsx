"use client";
import { ANIMATION_OPTIONS } from "../utils/motionBuilder";
import ManagedImage from "@/components/ui/ManagedImage";

export default function SlideStrip({ slides, selectedId, onSelect, onRemove, onAnimationChange }) {
  if (!slides.length) return null;

  return (
    <div className="w-full">
      <p className="text-xs text-(--muted-foreground) mb-2 font-medium uppercase tracking-wider">
        {slides.length} slide{slides.length !== 1 ? "s" : ""}
      </p>

      <div className="flex gap-2 overflow-x-auto w-full pb-2 snap-x snap-mandatory no-scrollbar   ">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            onClick={() => onSelect(slide.id)}
            className={`
              shrink-0 snap-start w-22 sm:w-25
              rounded-xl border-2 overflow-hidden cursor-pointer transition-all
              ${selectedId === slide.id
                ? "border-(--primary) scale-[1.02]"
                : "border-(--border) hover:border-(--primary)/50"}
            `}
          >
            {/* Thumbnail */}
            <div className="relative">
              <ManagedImage
                src={slide.url} alt={`Slide ${i + 1}`}
                className="w-full h-[66px] object-cover"
              />
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(slide.id); }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-red-500 transition"
              >×</button>
              <span className="absolute bottom-1 left-1 text-[9px] bg-black/50 text-white px-1.5 py-0.5 rounded-full">
                {slide.orientation === "landscape" ? "↔" : slide.orientation === "portrait" ? "↕" : "⊡"}
              </span>
            </div>

            {/* Per-slide animation */}
            <div className="p-1" onClick={(e) => e.stopPropagation()}>
              <select
                value={slide.animation}
                onChange={(e) => onAnimationChange(slide.id, e.target.value)}
                className="w-full text-[10px] bg-(--background) text-(--foreground) border border-(--border) rounded px-1 py-0.5 cursor-pointer"
              >
                {ANIMATION_OPTIONS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}