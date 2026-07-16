"use client";

const formats = [
  { key: "png", label: "PNG" },
  { key: "jpg", label: "JPG" },
  { key: "webp", label: "WEBP" },
  { key: "tiff", label: "TIFF" },
  { key: "avif", label: "AVIF" },
];

export default function ExportPanel({
  format, setFormat, quality, setQuality, keepExif, setKeepExif,
  onDownload, hasImage, isProcessing,
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-(--foreground)">Export</h4>
      <div className="flex flex-wrap gap-2">
        {formats.map((f) => (
          <button
            key={f.key}
            onClick={() => setFormat(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              format === f.key
                ? "bg-(--primary) text-(--primary-foreground) shadow-md"
                : "border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--muted)"
            }`}
          >{f.label}</button>
        ))}
      </div>

      <div>
        <label className="block text-xs text-(--muted-foreground) mb-1">Quality: {quality}%</label>
        <input
          type="range" min="30" max="100" value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-(--border) accent-(--primary)"
        />
        <div className="flex justify-between text-xs text-(--muted-foreground) mt-0.5">
          <span>30%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox" checked={keepExif}
            onChange={(e) => setKeepExif(e.target.checked)}
            className="rounded border-(--border) text-(--primary) accent-(--primary)"
          />
          <span className="text-xs text-(--foreground)">Keep EXIF</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox" checked={!keepExif}
            onChange={(e) => setKeepExif(!e.target.checked)}
            className="rounded border-(--border) text-(--primary) accent-(--primary)"
          />
          <span className="text-xs text-(--foreground)">Remove Metadata</span>
        </label>
      </div>

      <button
        onClick={() => onDownload(format, quality)}
        disabled={!hasImage || isProcessing}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-(--primary) text-(--primary-foreground) font-medium hover:opacity-90 transition text-sm cursor-pointer disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download Image
      </button>
    </div>
  );
}
