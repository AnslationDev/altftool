export default function HowItWorks() {
  const steps = [
    { title: "Add Occasion Details", text: "Enter title, date, type, and optional notes for each reminder." },
    { title: "Set Reminder Lead Time", text: "Choose how many days before the event you want an alert." },
    { title: "Apply Recurrence", text: "Use one-time, yearly, or monthly recurrence to match how each occasion repeats." },
    { title: "Execute Next Actions", text: "View upcoming reminders and prepare gifts, calls, or tasks in advance." },
  ];

  return (
    <section className="mt-10">
      <div className="rounded-2xl border border-(--border) bg-(--card) p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-(--foreground)">How It Works</h2>
          <p className="text-(--muted-foreground) mt-2">Never miss an important date with this simple workflow.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, i) => (
            <div key={step.title} className="rounded-xl border border-(--border) bg-(--background) p-4">
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
