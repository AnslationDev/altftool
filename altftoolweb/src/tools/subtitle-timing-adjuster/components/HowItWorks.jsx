export default function HowItWorks() {
  const steps = [
    {
      step: "Step 1",
      title: "Paste SRT Input",
      desc: "Add your subtitle file content in the Input SRT panel.",
    },
    {
      step: "Step 2",
      title: "Set Timing Rules",
      desc: "Adjust offset, scale, cue range, and advanced sync options like FPS conversion.",
    },
    {
      step: "Step 3",
      title: "Review QA Metrics",
      desc: "Check overlaps, cue duration warnings, and CPS quality indicators.",
    },
    {
      step: "Step 4",
      title: "Export Final SRT",
      desc: "Copy output directly or download the adjusted subtitle file.",
    },
  ];

  return (
    <div className="rounded-2xl border border-(--border) bg-(--card) p-6">
      <div className="text-center mb-6">
        <h3 className="text-sm uppercase tracking-[0.2em] font-semibold">How It Works</h3>
        <div className="w-14 h-1 bg-(--primary) rounded-full mx-auto mt-3"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((s) => (
          <div
            key={s.step}
            className="rounded-xl border border-(--border) bg-(--background) p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold text-(--primary) mb-1 tracking-wide">{s.step}</p>
            <p className="font-semibold mb-2 text-(--foreground)">{s.title}</p>
            <p className="text-sm text-(--muted-foreground) leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
