import { useState } from "react";
import { Plus, Minus, RefreshCw } from "lucide-react";
import ChangelogGenerator from "./ChangelogGenerator";

function parseEndpoints(jsonText) {
  try {
    const spec = JSON.parse(jsonText);
    const endpoints = [];

    // Swagger format — paths key
    if (spec?.paths) {
      Object.entries(spec.paths).forEach(([path, methods]) => {
        Object.entries(methods).forEach(([method]) => {
          endpoints.push(`${method.toUpperCase()} ${path}`);
        });
      });
    }
    // Input JSON format — endpoints array
    else if (spec?.endpoints && Array.isArray(spec.endpoints)) {
      spec.endpoints.forEach((ep) => {
        if (ep.method && ep.path) {
          endpoints.push(`${ep.method.toUpperCase()} ${ep.path}`);
        }
      });
    }
    return { endpoints, valid: true };
  } catch {
    return { endpoints: [], valid: false };
  }
}

export default function VersionComparisonTab() {
  const [v1Input, setV1Input] = useState("");
  const [v2Input, setV2Input] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const compare = () => {
    setError("");
    setResult(null);

    const v1 = parseEndpoints(v1Input);
    const v2 = parseEndpoints(v2Input);

    if (!v1.valid) {
      setError("V1 JSON invalid hai.");
      return;
    }
    if (!v2.valid) {
      setError("V2 JSON invalid hai.");
      return;
    }

    const v1Set = new Set(v1.endpoints);
    const v2Set = new Set(v2.endpoints);

    const added = v2.endpoints.filter((e) => !v1Set.has(e));
    const removed = v1.endpoints.filter((e) => !v2Set.has(e));
    const unchanged = v1.endpoints.filter((e) => v2Set.has(e));

    setResult({ added, removed, unchanged });
  };

  const reset = () => {
    setV1Input("");
    setV2Input("");
    setResult(null);
    setError("");
  };

const METHOD_COLORS = {
  GET:    "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
  POST:   "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  PUT:    "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
  PATCH:  "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300",
  DELETE: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
};

  const EndpointRow = ({ endpoint, type }) => {
    const [method, ...pathParts] = endpoint.split(" ");
    const path = pathParts.join(" ");
    const bgRow =
      type === "added"
        ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
        : type === "removed"
          ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
          : "bg-zinc-100 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-500";

    return (
      <div
        className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${bgRow}`}
      >
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${METHOD_COLORS[method] || "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}"}`}
        >
          {method}
        </span>
        <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white flex-1 truncate">
          {path}
        </span>
        {type === "added" && (
          <Plus size={14} className="text-green-500 shrink-0" />
        )}
        {type === "removed" && (
          <Minus size={14} className="text-red-500 shrink-0" />
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          Version Comparison
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Compare the two API versions — see what has been added and what has
          been removed.
        </p>
      </div>

      {/* Input area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* V1 */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">
            Version 1 (Old)
          </label>
          <textarea
            value={v1Input}
            onChange={(e) => setV1Input(e.target.value)}
            placeholder="Paste V1 Swagger JSON here..."
            className="w-full h-40 p-3 text-xs font-mono rounded-lg border-2 
            border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]
            focus:border-[var(--primary)] focus:outline-none resize-none
            placeholder:text-[var(--muted-foreground)]"
          />
        </div>

        {/* V2 */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">
            Version 2 (New)
          </label>
          <textarea
            value={v2Input}
            onChange={(e) => setV2Input(e.target.value)}
            placeholder="Paste V2 Swagger JSON here..."
            className="w-full h-40 p-3 text-xs font-mono rounded-lg border-2 
            border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]
            focus:border-[var(--primary)] focus:outline-none resize-none
            placeholder:text-[var(--muted-foreground)]"
          />
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={compare}
          className="sm:px-4 sm:py-2 px-2 py-1 bg-[var(--primary)] text-[var(--primary-foreground)]
          rounded-lg text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          Compare Versions
        </button>
        <button
          onClick={reset}
          className="sm:px-4 sm:py-2 px-2 py-1 border border-[var(--border)] text-[var(--muted-foreground)]
          rounded-lg text-xs sm:text-sm font-medium hover:bg-[var(--muted)] transition-colors 
          cursor-pointer flex items-center gap-2"
        >
          <RefreshCw size={14} /> Reset
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary badges */}
          <div className="flex flex-wrap gap-3">
            <span
              className="px-3 py-1.5 bg-green-100 dark:bg-green-900 
            text-green-700 dark:text-green-300 rounded-full text-xs font-semibold"
            >
              ✅ {result.added.length} Added
            </span>
            <span
              className="px-3 py-1.5 bg-red-100 dark:bg-red-900 
            text-red-700 dark:text-red-300 rounded-full text-xs font-semibold"
            >
              ❌ {result.removed.length} Removed
            </span>
            <span
              className="px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)]
            text-[var(--muted-foreground)] rounded-full text-xs font-semibold"
            >
              ✔ {result.unchanged.length} Unchanged
            </span>
          </div>

          {/* Added */}
          {result.added.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase mb-2">
                Added
              </p>
              <div className="space-y-2">
                {result.added.map((e, i) => (
                  <EndpointRow key={i} endpoint={e} type="added" />
                ))}
              </div>
            </div>
          )}

          {/* Removed */}
          {result.removed.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase mb-2">
                Removed
              </p>
              <div className="space-y-2">
                {result.removed.map((e, i) => (
                  <EndpointRow key={i} endpoint={e} type="removed" />
                ))}
              </div>
            </div>
          )}

          {/* Unchanged */}
          {result.unchanged.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase mb-2">
                Unchanged
              </p>
              <div className="space-y-2">
                {result.unchanged.map((e, i) => (
                  <EndpointRow key={i} endpoint={e} type="unchanged" />
                ))}
              </div>
            </div>
          )}

          {/* No difference */}
          {result.added.length === 0 && result.removed.length === 0 && (
            <div className="text-center py-8 text-[var(--muted-foreground)]">
              <p className="font-medium">Both versions are identical.</p>
              <p className="text-sm mt-1">didn’t find any difference.</p>
            </div>
          )}

          {result && result.added.length + result.removed.length > 0 && (
            <ChangelogGenerator result={result} v1Label="v1" v2Label="v2" />
          )}

        </div>
      )}
    </div>
  );
}
