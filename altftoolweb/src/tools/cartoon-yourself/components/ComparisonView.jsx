import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";

export default function ComparisonView({ previewUrl, canvasRef }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, x)));
  };

  const handleTouchMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, x)));
  };

  if (!previewUrl) return null;

  return (
    <div className="bg-(--card) border border-(--border) rounded-xl p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center gap-2 mb-4">
        <ArrowLeftRight className="h-5 w-5 text-(--primary)" />
        <h3 className="text-lg font-semibold text-(--foreground)">Before / After</h3>
      </div>

      <div
        className="relative w-full max-w-md mx-auto overflow-hidden rounded-xl border border-(--border) cursor-ew-resize select-none"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        role="slider"
        aria-label="Comparison slider"
        aria-valuenow={Math.round(sliderPos)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setSliderPos((p) => Math.max(0, p - 2));
          if (e.key === "ArrowRight") setSliderPos((p) => Math.min(100, p + 2));
        }}
      >
        <div className="relative aspect-square">
          <img
            src={previewUrl}
            alt="Original"
            className="absolute inset-0 w-full h-full object-contain"
          />

          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
              style={{ imageRendering: "auto" }}
            />
          </div>

          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md z-10"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
              <ArrowLeftRight className="h-4 w-4 text-(--foreground)" />
            </div>
          </div>
        </div>

        <div className="flex justify-between px-3 py-2 text-xs font-semibold text-(--muted-foreground) bg-(--background)">
          <span>Original</span>
          <span>Cartoon</span>
        </div>
      </div>
    </div>
  );
}
