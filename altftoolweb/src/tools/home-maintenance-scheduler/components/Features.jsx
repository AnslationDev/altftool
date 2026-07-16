export default function Features() {
  const items = [
    { title: "Smart Due-Date Calculation", description: "Auto-computes next due date from last completed date and frequency." },
    { title: "Overdue and Upcoming Alerts", description: "Flags tasks as overdue, due soon, or on track." },
    { title: "Category-Based Planning", description: "Organize tasks by HVAC, Plumbing, Electrical, Exterior, Safety, and Cleaning." },
    { title: "Monthly Workload View", description: "See how many tasks are due each month for better planning." },
    { title: "Effort and Budget Tracking", description: "Estimate total hours and maintenance budget across tasks." },
    { title: "Priority-First Action List", description: "Get a ranked next-step list to tackle urgent tasks first." },
  ];

  return (
    <section className="mt-8 mb-2">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-(--foreground)">Features</h2>
        <p className="text-(--muted-foreground) mt-2">Professional task planning for reliable home upkeep.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.title} className="rounded-xl hms-main-card p-4">
            <p className="text-sm font-semibold text-(--foreground)">{item.title}</p>
            <p className="text-xs text-(--muted-foreground) mt-1 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
