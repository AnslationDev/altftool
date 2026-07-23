"use client";

export default function HowItWorks() {
  const steps = [
    { title: "Add Room Details", text: "Enter wall dimensions, room height, and optional ceiling area for each room." },
    { title: "Deduct Openings", text: "Subtract door and window areas to avoid overestimating paint quantity." },
    { title: "Set Paint Strategy", text: "Choose paint type, coverage, coats, primer, wastage, and can sizes." },
    { title: "Review Cost and Shopping List", text: "Get liters needed, can distribution, paint + labor cost, and total project estimate." },
  ];

  return (
    <section className="mt-10">
      <div className="rounded-2xl rpc-main-card p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-(--foreground)">How It Works</h2>
          <p className="text-(--muted-foreground) mt-2">From room dimensions to final purchase plan in four steps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, i) => (
            <div key={step.title} className="rounded-xl rpc-panel p-4">
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
