export default function HowItWorks() {
  const steps = [
    {
      title: "Set Your Training Inputs",
      description:
        "Add goal, days per week, session duration, equipment, and current level to build a realistic plan.",
    },
    {
      title: "Generate Periodized Plan",
      description:
        "Create a 4, 8, or 12-week structure with progressive overload logic and automatic deload guidance.",
    },
    {
      title: "Track Sessions and RPE",
      description:
        "Mark sessions complete and log effort score (RPE) so the planner can adjust weekly recommendations.",
    },
    {
      title: "Review Coach Feedback",
      description:
        "Use adherence, fatigue trend, and recovery targets to decide whether to progress, maintain, or recover.",
    },
  ];

  return (
    <section className="mt-10">
      <div className="p-6 sm:p-8 rounded-lg border border-(--border) bg-(--card)">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-(--foreground)">
            How It Works
          </h2>
          <p className="text-(--muted-foreground) mt-2">
            Follow these simple steps to generate and improve your training
            plan.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="p-4 rounded-lg border border-(--border) bg-(--background)"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-(--primary)/10 text-(--primary) flex items-center justify-center text-sm font-bold shrink-0">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-(--foreground) mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-(--muted-foreground) leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
