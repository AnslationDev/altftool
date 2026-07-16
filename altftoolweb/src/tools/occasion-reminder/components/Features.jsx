export default function Features() {
  const items = [
    { title: "Smart Lead-Time Alerts", description: "Set reminders 1, 3, 7, 14, or custom days before an occasion." },
    { title: "Recurring Occasion Support", description: "Handle yearly birthdays, monthly payments, and one-time events." },
    { title: "Upcoming vs Overdue Tracking", description: "Instantly see what is upcoming, due today, or already missed." },
    { title: "Priority-Friendly Planning", description: "Organize tasks by urgency so you can act on high-impact reminders first." },
    { title: "Category Segmentation", description: "Separate personal, family, work, and financial occasions clearly." },
    { title: "Action-Ready Next Steps", description: "Get practical suggestions like gift prep, calls, or booking timelines." },
  ];

  return (
    <section className="mt-8 mb-2">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-(--foreground)">Features</h2>
        <p className="text-(--muted-foreground) mt-2">Pro-level reminder planning for life and work occasions.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.title} className="rounded-xl border border-(--border) bg-(--card) p-4 shadow-sm">
            <p className="text-sm font-semibold text-(--foreground)">{item.title}</p>
            <p className="text-xs text-(--muted-foreground) mt-1 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
