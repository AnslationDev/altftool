import { useState } from "react";
import { CheckCircle, XCircle, Loader } from "lucide-react";

export default function HealthChecker({ baseUrl }) {
  const [results, setResults] = useState(null);
  const [checking, setChecking] = useState(false);

  const check = async () => {
    setChecking(true);
    setResults(null);

    const checks = {
      reachable: false,
      jsonResponse: false,
      https: false,
    };

    // HTTPS check — no fetch needed
    checks.https = baseUrl.startsWith("https://");

    // Reachable + JSON check
    try {
      const res = await fetch(baseUrl, { method: "GET", mode: "cors" });
      checks.reachable = res.ok || res.status < 500;
      const contentType = res.headers.get("content-type");
      checks.jsonResponse = contentType?.includes("application/json") || false;
    } catch {
      checks.reachable = false;
      checks.jsonResponse = false;
    }

    setResults(checks);
    setChecking(false);
  };

  const items = [
    { key: "reachable",     label: "API Reachable" },
    { key: "jsonResponse",  label: "JSON Response" },
    { key: "https",         label: "HTTPS Secure" },
  ];

  return (
    <div className="border border-[var(--border)] rounded-lg p-3 bg-[var(--muted)] space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">
          Endpoint Health Checker
        </p>
        <button
          onClick={check}
          disabled={checking}
          className="px-3 py-1 text-xs bg-[var(--primary)] text-[var(--primary-foreground)]
          rounded-lg font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          {checking ? "Checking..." : "Run Check"}
        </button>
      </div>

      {/* URL being checked */}
      <div className="text-xs font-mono text-[var(--muted-foreground)] truncate">
        {baseUrl}
      </div>

      {/* Checking animation */}
      {checking && (
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <Loader size={13} className="animate-spin" />
          Running health checks...
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-2">
          {items.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              {results[key]
                ? <CheckCircle size={15} className="text-green-500 shrink-0" />
                : <XCircle size={15} className="text-red-500 shrink-0" />}
              <span className="text-[var(--foreground)] text-xs">{label}</span>
              <span className={`text-xs ml-auto font-medium ${results[key] ? "text-green-500" : "text-red-500"}`}>
                {results[key] ? "✔ Pass" : "✘ Fail"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}