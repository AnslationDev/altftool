export default function HowToUse() {
  const steps = [
    {
      title: "Enter Your Lift Data",
      desc: "Pick exercise, unit, formula, weight, reps, and optional RPE/RIR for a smarter estimate.",
    },
    {
      title: "Calculate 1RM",
      desc: "Click calculate to get your estimated one-rep max and instant training percentage zones.",
    },
    {
      title: "Plan Your Session",
      desc: "Use warm-up planner, plate calculator, and rep chart to convert estimate into practical training loads.",
    },
    {
      title: "Track and Improve",
      desc: "Save history, monitor progress by exercise, set goal timelines, and export your data/report.",
    },
  ];

  return (
    <div className="py-12 bg-[var(--background)]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black tracking-widest uppercase text-[var(--foreground)]">
            How To Use
          </h2>
          <div className="w-16 h-1.5 bg-[var(--primary)] mx-auto mt-4 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className="rounded-2xl p-6 border bg-[var(--card)] border-[var(--border)]"
            >
              <p className="text-xs font-black tracking-widest text-[var(--primary)] mb-2">
                STEP {idx + 1}
              </p>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">{step.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl p-6 border bg-[var(--card)] border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">Safety Notes</h3>
          <ul className="list-disc ml-5 text-sm space-y-1 text-[var(--muted-foreground)]">
            <li>Do not attempt true 1RM without safety pins or a spotter.</li>
            <li>Stop immediately if form breaks, pain starts, or bar speed drops sharply.</li>
            <li>Use 1RM estimation frequently and max testing sparingly.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
