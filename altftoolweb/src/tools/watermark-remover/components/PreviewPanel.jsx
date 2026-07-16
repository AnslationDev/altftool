"use client";

export default function PreviewPanel({ processedCanvas, originalImage, viewMode, setViewMode }) {
  if (!processedCanvas) return null;

  return (
    <div className="rounded-xl border border-(--border) bg-(--card) overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-(--border)">
        <h4 className="text-sm font-semibold text-(--foreground)">Preview</h4>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode("split")}
            className={`px-2.5 py-1 text-xs rounded cursor-pointer transition ${
              viewMode === "split" ? "bg-(--primary) text-(--primary-foreground)" : "text-(--muted-foreground) hover:text-(--foreground)"
            }`}
          >Split</button>
          <button
            onClick={() => setViewMode("before")}
            className={`px-2.5 py-1 text-xs rounded cursor-pointer transition ${
              viewMode === "before" ? "bg-(--primary) text-(--primary-foreground)" : "text-(--muted-foreground) hover:text-(--foreground)"
            }`}
          >Before</button>
          <button
            onClick={() => setViewMode("after")}
            className={`px-2.5 py-1 text-xs rounded cursor-pointer transition ${
              viewMode === "after" ? "bg-(--primary) text-(--primary-foreground)" : "text-(--muted-foreground) hover:text-(--foreground)"
            }`}
          >After</button>
        </div>
      </div>
      <div className="p-4">
        <div className="relative w-full rounded-lg overflow-hidden bg-(--muted)" style={{ minHeight: 200, maxHeight: 400 }}>
          {viewMode === "split" && (
            <div className="flex h-full">
              <div className="w-1/2 border-r border-(--border)">
                {originalImage?.canvas && (
                  <img src={originalImage.canvas.toDataURL()} alt="Before" className="w-full h-full object-contain" />
                )}
              </div>
              <div className="w-1/2">
                <img src={processedCanvas.toDataURL()} alt="After" className="w-full h-full object-contain" />
              </div>
            </div>
          )}
          {viewMode === "before" && originalImage?.canvas && (
            <img src={originalImage.canvas.toDataURL()} alt="Before" className="w-full h-full object-contain" style={{ maxHeight: 380 }} />
          )}
          {viewMode === "after" && (
            <img src={processedCanvas.toDataURL()} alt="After" className="w-full h-full object-contain" style={{ maxHeight: 380 }} />
          )}
        </div>
      </div>
    </div>
  );
}
