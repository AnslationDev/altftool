export default function HowItWorks() {
  const steps = [
    { title: "Add Maintenance Task", text: "Enter task name, area, frequency, estimated time, and cost." },
    { title: "Set Last Completed Date", text: "The scheduler calculates your next due date automatically." },
    { title: "Generate Monthly Plan", text: "View due, upcoming, and overdue tasks in one clear schedule." },
    { title: "Execute Next Actions", text: "Use priority-ranked actions to focus on high-impact maintenance first." },
  ];

  return (
    <section className="mt-10">
      <div className="rounded-2xl hms-main-card p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-(--foreground)">How It Works</h2>
          <p className="text-(--muted-foreground) mt-2">Simple maintenance scheduling in four steps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, i) => (
            <div key={step.title} className="rounded-xl hms-panel p-4">
              <p className="text-xs font-bold text-(--primary) mb-1">STEP {i + 1}</p>
              <h3 className="font-semibold text-(--foreground)">{step.title}</h3>
              <p className="text-sm text-(--muted-foreground) mt-1">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
