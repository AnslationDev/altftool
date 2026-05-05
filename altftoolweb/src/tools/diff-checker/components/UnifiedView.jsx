// src/components/DiffChecker/UnifiedView.jsx

const UnifiedView = ({ diff }) => (
  <div className="bg-(--card) rounded-lg border border-(--border) overflow-hidden">
    <div className="bg-gray-800 text-white px-4 py-2 text-sm font-semibold">
      Unified Diff View
    </div>

    <div className="max-h-96 overflow-y-auto">
      {diff.map((line, idx) => (
        <div
          key={idx}
          className={`px-4 py-1 font-mono text-sm border-b 
            ${
              line.type === "added"
                ? "bg-green-50 text-green-800"
                : line.type === "deleted"
                ? "bg-red-50 text-red-800"
                : "bg-white text-gray-700"
            }`}
        >
          <span className="inline-block w-8 text-gray-400">
            {line.origLine || ""}
          </span>
          <span className="inline-block w-8 text-gray-400">
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
