export default function Features() {
  const features = [
    {
      title: "Smart Progression Engine",
      description: "Uses completion and RPE logs to guide overload or hold volume when fatigue rises.",
    },
    {
      title: "Exercise Substitutions",
      description: "Auto-adjusts movement choices for no-equipment, basic-home, or full-gym setups.",
    },
    {
      title: "Periodization Blocks",
      description: "Supports 4/8/12-week plans with built-in deload logic for safer long-term progress.",
    },
    {
      title: "Constraint-Aware Planning",
      description: "Includes time cap, rest day planning, calendar-day scheduling, and injury-aware notes.",
    },
    {
      title: "Recovery and Nutrition Targets",
      description: "Provides practical daily calories, protein, hydration, and sleep targets from your goal.",
    },
    {
      title: "Portable Plan Export",
      description: "Download plan JSON or print as PDF for sharing with coach, manager, or training partner.",
    },
  ];

  return (
    <section className="mt-8 mb-2">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-(--foreground)">Features</h2>
        <p className="text-(--muted-foreground) mt-2">Everything needed to plan, execute, and improve workouts consistently.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <div key={feature.title} className="p-5 rounded-lg border border-(--border) bg-(--card)">
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">{feature.title}</h3>
            <p className="text-sm text-(--muted-foreground) leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
