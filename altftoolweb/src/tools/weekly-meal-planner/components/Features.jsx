export default function Features() {
  const items = [
    { title: "Goal-Based Meal Templates", description: "Supports fat-loss, maintenance, and muscle-gain planning." },
    { title: "Diet Preference Modes", description: "Switch between standard, vegetarian, and high-protein meal ideas." },
    { title: "7-Day Structured Planner", description: "Generates breakfast, lunch, dinner, and snack flow day-by-day." },
    { title: "Nutrition Summary", description: "Shows estimated calories, protein, carbs, and fats for the week." },
    { title: "Smart Grocery List", description: "Creates category-based ingredient checklist for efficient shopping." },
    { title: "Execution-Ready Next Steps", description: "Provides clear actions for prep, shopping, and meal timing." },
  ];

  return (
    <section className="mt-8 mb-2">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-(--foreground)">Features</h2>
        <p className="text-(--muted-foreground) mt-2">Built for practical weekly planning and consistent nutrition execution.</p>
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
