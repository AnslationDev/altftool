export default function HowItWorks() {
  const steps = [
    { title: "Set Your Goal and Preferences", text: "Choose your meal goal, diet style, and daily meal count." },
    { title: "Generate Weekly Plan", text: "Get breakfast, lunch, dinner, and optional snack suggestions for all 7 days." },
    { title: "Review Nutrition Totals", text: "Check estimated calories and macros to align with your target." },
    { title: "Use Grocery List", text: "Buy ingredients in one run with a categorized shopping list." },
  ];

  return (
    <section className="mt-10">
      <div className="rounded-2xl border border-(--border) bg-(--card) p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-(--foreground)">How It Works</h2>
          <p className="text-(--muted-foreground) mt-2">From preferences to full weekly meal execution in four steps.</p>
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
