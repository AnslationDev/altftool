// src/components/DiffChecker/UnifiedView.jsx

const UnifiedView = ({ diff }) => (
  <div className="bg-(--card) rounded-xl ring-1 ring-(--border) overflow-hidden">
    <div className="bg-(--muted) text-(--foreground) px-4 py-2 text-sm font-semibold">
      Unified Diff View
    </div>

    <div className="max-h-96 overflow-y-auto">
      {diff.map((line, idx) => (
        <div
          key={idx}
          className={`px-4 py-1 font-mono text-sm border-b border-(--border)
            ${
              line.type === "added"
                ? "bg-(--success-soft) text-(--success)"
                : line.type === "deleted"
                ? "bg-(--danger-soft) text-(--danger)"
                : "bg-(--card) text-(--foreground)"
            }`}
        >
          <span className="inline-block w-8 text-(--muted-foreground)">
            {line.origLine || ""}
          </span>
          <span className="inline-block w-8 text-(--muted-foreground)">
            {line.modLine || ""}
          </span>
          <span className="mr-2">
            {line.type === "added" ? "+" : line.type === "deleted" ? "-" : " "}
          </span>
          {line.original || line.modified}
        </div>
      ))}
    </div>
  </div>
);

export default UnifiedView;
