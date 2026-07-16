"use client";

const difficultCases = [
  "Face", "Sky", "Hair", "Fabric", "Grass", "Building",
  "Vehicle", "Glass", "Reflection", "Text", "Artwork",
];

const detectionTypes = [
  { label: "Logo watermark", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
  { label: "Text watermark", icon: "M3 5h18M3 12h18M3 19h18" },
  { label: "Transparent overlay", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" },
  { label: "Corner logo", icon: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" },
  { label: "Repeated watermark", icon: "M4 5h3v3H4zM9 5h3v3H9zM14 5h3v3h-3zM4 10h3v3H4z" },
  { label: "Pattern watermark", icon: "M4 4l16 16M20 4L4 16" },
];

export default function InfoPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-(--foreground) mb-3">
          <svg className="w-4 h-4 inline mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI Detection
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {detectionTypes.map((d, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-(--border) bg-(--background)">
              <svg className="w-4 h-4 text-(--primary) shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d.icon} />
              </svg>
              <span className="text-xs text-(--foreground)">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-(--foreground) mb-3">Difficult Cases</h4>
        <div className="flex flex-wrap gap-2">
          {difficultCases.map((c, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full text-xs border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
              {c}
            </span>
          ))}
        </div>
        <p className="text-xs text-(--muted-foreground) mt-2">
          AI maintains texture naturally even in challenging areas. Results vary based on watermark complexity.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-(--foreground) mb-3">Privacy</h4>
        <div className="space-y-2">
          {[
            "Client-side processing when possible",
            "Large files processed securely on server",
            "Never permanently store images",
            "Auto-delete temporary files",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs text-(--foreground)">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-(--foreground) mb-3">Image Quality</h4>
        <div className="flex flex-wrap gap-2">
          {["Sharpness", "Edges", "Colors", "Textures", "Lighting", "Shadows", "Noise consistency"].map((q, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full text-xs border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 text-green-700 dark:text-green-300">
              {q}
            </span>
          ))}
        </div>
        <p className="text-xs text-(--muted-foreground) mt-2">Avoids blurry patches for natural results.</p>
      </div>
    </div>
  );
}
