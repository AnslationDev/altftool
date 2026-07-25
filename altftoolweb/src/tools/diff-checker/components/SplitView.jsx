// src/components/DiffChecker/SplitView.jsx

const SplitView = ({ diff }) => (
  <div className="grid grid-cols-2 gap-4">
    {/* ORIGINAL */}
    <div className="bg-(--card) rounded-xl ring-1 ring-(--border) overflow-hidden">
      <div className="bg-(--danger) text-white px-4 py-2 text-sm font-semibold">
        Original
      </div>
      <div className="max-h-96 overflow-y-auto">
        {diff
          .filter((d) => d.type !== "added")
          .map((line, idx) => (
            <div
              key={idx}
              className={`px-4 py-1 font-mono text-sm border-b border-(--border) ${
                line.type === "deleted"
                  ? "bg-(--danger-soft) text-(--danger)"
                  : "bg-(--card) text-(--foreground)"
              }`}
            >
              <span className="inline-block w-8 text-(--muted-foreground)">
                {line.origLine}
              </span>
              <span className="mr-2">
                {line.type === "deleted" ? "-" : " "}
              </span>
              {line.original}
            </div>
          ))}
      </div>
    </div>

    {/* MODIFIED */}
    <div className="bg-(--card) rounded-xl ring-1 ring-(--border) overflow-hidden">
      <div className="bg-(--success) text-white px-4 py-2 text-sm font-semibold">
        Modified
      </div>
      <div className="max-h-96 overflow-y-auto">
        {diff
          .filter((d) => d.type !== "deleted")
          .map((line, idx) => (
            <div
              key={idx}
              className={`px-4 py-1 font-mono text-sm border-b border-(--border) ${
                line.type === "added"
                  ? "bg-(--success-soft) text-(--success)"
                  : "bg-(--card) text-(--foreground)"
              }`}
            >
              <span className="inline-block w-8 text-(--muted-foreground)">
                {line.modLine}
              </span>
              <span className="mr-2">{line.type === "added" ? "+" : " "}</span>
              {line.modified}
            </div>
          ))}
      </div>
    </div>
  </div>
);

export default SplitView;
