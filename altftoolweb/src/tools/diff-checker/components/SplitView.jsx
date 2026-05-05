// src/components/DiffChecker/SplitView.jsx

const SplitView = ({ diff }) => (
  <div className="grid grid-cols-2 gap-4">
    {/* ORIGINAL */}
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-red-600 text-white px-4 py-2 text-sm font-semibold">
        Original
      </div>
      <div className="max-h-96 overflow-y-auto">
        {diff
          .filter((d) => d.type !== "added")
          .map((line, idx) => (
            <div
              key={idx}
              className={`px-4 py-1 font-mono text-sm border-b ${
                line.type === "deleted"
                  ? "bg-red-50 text-red-800"
                  : "bg-white text-gray-700"
              }`}
            >
              <span className="inline-block w-8 text-gray-400">
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
    <div className="bg-(--card) rounded-lg border border-(--border) overflow-hidden">
      <div className="bg-green-600 text-(--foreground) px-4 py-2 text-sm font-semibold">
        Modified
      </div>
      <div className="max-h-96 overflow-y-auto">
        {diff
          .filter((d) => d.type !== "deleted")
          .map((line, idx) => (
            <div
              key={idx}
              className={`px-4 py-1 font-mono text-sm border-b ${
                line.type === "added"
                  ? "bg-green-50 text-green-800"
                  : "bg-white text-gray-700"
              }`}
            >
              <span className="inline-block w-8 text-(--foreground)">
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
