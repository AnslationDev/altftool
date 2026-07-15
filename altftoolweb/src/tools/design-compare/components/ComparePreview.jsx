export default function ComparePreview({ imageA, imageB, mode, opacity, slider, zoom, pan, showGrid, highlightDiff, previewRef }) {
  const ready = imageA && imageB;
  const transform = { transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` };
  const gridClass = showGrid ? "bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[length:24px_24px]" : "";

  return (
    <div ref={previewRef} className={`min-h-[420px] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] ${gridClass}`}>
      {!ready ? (
        <div className="flex min-h-[360px] items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-[var(--background)] text-center text-sm font-semibold text-[var(--muted-foreground)]">
          Upload two designs to unlock the comparison preview.
        </div>
      ) : mode === "side-by-side" ? (
        <div className="grid min-h-[360px] gap-4 md:grid-cols-2">
          {[imageA, imageB].map((image, index) => (
            <div key={image.name} className="flex items-center justify-center overflow-hidden rounded-md border border-[var(--border)] bg-[var(--background)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={`Design ${index ? "B" : "A"}`} className={`max-h-[520px] object-contain ${highlightDiff && index ? "mix-blend-difference" : ""}`} style={transform} />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative mx-auto flex min-h-[420px] max-w-4xl items-center justify-center overflow-hidden rounded-md border border-[var(--border)] bg-[var(--background)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageA.url} alt="Design A" className="absolute max-h-[620px] object-contain" style={transform} />
          <div className="absolute inset-0 overflow-hidden" style={mode === "slider" ? { clipPath: `inset(0 ${100 - slider}% 0 0)` } : { opacity: opacity / 100 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageB.url} alt="Design B" className={`h-full w-full object-contain ${highlightDiff ? "mix-blend-difference" : ""}`} style={transform} />
          </div>
          {mode === "slider" && <span className="absolute inset-y-0 w-1 bg-[var(--primary)]" style={{ left: `${slider}%` }} aria-hidden="true" />}
        </div>
      )}
    </div>
  );
}
