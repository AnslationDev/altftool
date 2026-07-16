"use client";

const enhancements = [
  { key: "sharpen", label: "Sharpen", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" },
  { key: "denoise", label: "Denoise", icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" },
  { key: "brightness", label: "Brightness", icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" },
  { key: "contrast", label: "Contrast", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { key: "color-balance", label: "Color Balance", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
];

export default function EnhancementPanel({ settings, setSettings, onApply, isProcessing }) {
  const toggleEnhancement = (key) => {
    setSettings((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = 0.5;
      return next;
    });
  };

  const setIntensity = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const hasEnhancements = Object.keys(settings).length > 0;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-(--foreground)">AI Enhancement (Optional)</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {enhancements.map((enh) => {
          const active = settings[enh.key] !== undefined;
          return (
            <button
              key={enh.key}
              onClick={() => toggleEnhancement(enh.key)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                active
                  ? "border-(--primary) bg-(--primary)/5 text-(--primary)"
                  : "border-(--border) bg-(--background) text-(--foreground) hover:bg-(--muted)"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={enh.icon} />
              </svg>
              <span className="text-xs font-medium">{enh.label}</span>
            </button>
          );
        })}
      </div>

      {hasEnhancements && (
        <div className="space-y-3 p-4 rounded-xl border border-(--border) bg-(--background)">
          {Object.entries(settings).map(([key, value]) => {
            const enh = enhancements.find(e => e.key === key);
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-(--foreground) w-20 shrink-0">{enh?.label || key}</span>
                <input
                  type="range" min="0.1" max="1" step="0.1" value={value}
                  onChange={(e) => setIntensity(key, Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-(--border) accent-(--primary)"
                />
                <span className="text-xs text-(--muted-foreground) w-8 text-right">{Math.round(value * 100)}%</span>
                <button
                  onClick={() => toggleEnhancement(key)}
                  className="text-(--muted-foreground) hover:text-red-500 transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
          <button
            onClick={() => onApply(settings)}
            disabled={isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition text-sm cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Apply Enhancements
          </button>
        </div>
      )}
    </div>
  );
}
