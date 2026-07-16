export default function ToolFeatures() {
  const items = [
    {
      title: "Global Offset",
      desc: "Shift all subtitle cues forward or backward using millisecond precision.",
    },
    {
      title: "Scale / Stretch Timeline",
      desc: "Expand or compress subtitle timing with percentage-based scaling for drift fixes.",
    },
    {
      title: "Range Targeting",
      desc: "Apply timing changes only to selected cue ranges using start and end indexes.",
    },
    {
      title: "FPS Conversion",
      desc: "Convert subtitle timing between source and target frame rates for re-timed videos.",
    },
    {
      title: "Overlap Protection",
      desc: "Auto-fix overlapping cues and enforce a minimum gap between subtitles.",
    },
    {
      title: "Quality Metrics",
      desc: "Review overlaps, short cues, CPS warnings, and first/last cue timestamps instantly.",
    },
    {
      title: "Find / Replace Engine",
      desc: "Apply subtitle-wide text edits with normal find/replace or regex-powered replacement.",
    },
    {
      title: "Text Cleanup Utilities",
      desc: "Trim cue whitespace, remove HTML tags, and add cue prefix/suffix for batch formatting.",
    },
    {
      title: "Dual Export Formats",
      desc: "Export adjusted subtitles as SRT or WebVTT for broader player/platform compatibility.",
    },
  ];

  return (
    <div className="rounded-2xl border border-(--border) bg-(--card) p-6">
      <div className="text-center mb-6">
        <h3 className="text-sm uppercase tracking-[0.2em] font-semibold">Key Features</h3>
        <div className="w-14 h-1 bg-(--primary) rounded-full mx-auto mt-3"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-(--border) bg-(--background) p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="font-semibold mb-2 text-(--foreground)">{item.title}</p>
            <p className="text-sm text-(--muted-foreground) leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
