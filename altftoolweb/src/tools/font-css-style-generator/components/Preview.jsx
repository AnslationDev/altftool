import { buildTypography } from "../utils/typographyUtils";

export default function Preview({ settings, previewRef }) {
  const { style } = buildTypography(settings);

  return (
    <section className="font-css-card p-4 sm:p-5 min-h-[360px] flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-black text-[var(--foreground)]">Live Preview</h2>
          <p className="text-xs text-[var(--muted-foreground)]">Actual CSS rendered from the current state.</p>
        </div>
        <span className="text-[10px] uppercase tracking-widest font-black text-cyan-400">Realtime</span>
      </div>
      <div ref={previewRef} className="font-css-preview flex-1">
        <div className="w-full max-h-[520px] overflow-auto p-3">
          <p style={style} className="transition-all duration-200 whitespace-pre-wrap">
            {settings.text || " "}
          </p>
        </div>
      </div>
    </section>
  );
}
