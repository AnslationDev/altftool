"use client";

export default function FilterTabs({ filter, setFilter, stats }) {
  const tabs = [
    { key: "all", label: "All", count: stats.total },
    { key: "active", label: "Active", count: stats.active },
    { key: "important", label: "Important", count: stats.important },
    { key: "completed", label: "Completed", count: stats.completed },
  ];

  return (
    <div className="flex flex-wrap gap-2 sm:gap-0 border-b border-(--border) bg-(--muted) p-2 sm:p-0 transition-colors">
      {tabs.map((f) => {
        const isActive = filter === f.key;

        return (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-1 cursor-pointer sm:flex-1 min-w-[45%] sm:min-w-0 py-2 sm:py-4 text-sm font-medium text-center transition-all relative rounded-md sm:rounded-none 
              ${
                isActive
                  ? "text-(--primary) bg-(--card) shadow-sm sm:shadow-none"
                  : "text-(--muted-foreground) bg-(--muted) sm:bg-transparent"
              }`}
          >
            <span>{f.label}</span>

            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs transition-colors 
                ${
                  isActive
                    ? "bg-(--primary)/15 text-(--primary)"
                    : "bg-(--muted) text-(--muted-foreground)"
                }`}
            >
              {f.count}
            </span>

            {isActive && (
              <div className="hidden sm:block absolute bottom-0 left-0 right-0 h-0.5 bg-(--primary)"></div>
            )}
          </button>
        );
      })}
    </div>
  );
}
