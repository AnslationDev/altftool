"use client";

export default function Stats({ stats }) {
  const colorStyles = {
    blue: { borderColor: "var(--primary)", textColor: "var(--primary)" },
    orange: { borderColor: "#f97316", textColor: "#f97316" },
    green: { borderColor: "#16a34a", textColor: "#16a34a" },
    yellow: { borderColor: "#eab308", textColor: "#eab308" },
  };

  const cards = [
    { label: "Total Tasks", value: stats.total, color: "blue" },
    { label: "Active", value: stats.active, color: "orange" },
    { label: "Completed", value: stats.completed, color: "green" },
    { label: "Important", value: stats.important, color: "yellow" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl p-4 shadow-sm border-l-4 bg-(--card) transition-colors"
          style={{ borderColor: colorStyles[c.color].borderColor }}
        >
          <div
            className="text-2xl font-bold"
            style={{ color: colorStyles[c.color].textColor }}
          >
            {c.value}
          </div>

          <div className="text-sm text-(--muted-foreground)">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
