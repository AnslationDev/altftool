export default function HowItWorks() {
  const steps = [
    { title: "Add Participants", text: "Enter all names participating in Secret Santa." },
    { title: "Set Exclusions", text: "Optionally block pairings like spouses, siblings, or previous-year matches." },
    { title: "Generate Pairings", text: "Run random assignment with no self-matches and retry-safe logic." },
    { title: "Reveal Privately", text: "Use reveal mode to show each person only their assigned recipient." },
  ];

  return (
    <section className="mt-10">
      <div className="rounded-2xl border border-(--border) bg-(--card) p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-(--foreground)">How It Works</h2>
          <p className="text-(--muted-foreground) mt-2">Fast, fair, and conflict-free Secret Santa in four steps.</p>
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
