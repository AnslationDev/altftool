"use client";

import { useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownUp,
  BarChart3,
  Check,
  ChevronDown,
  Clipboard,
  Download,
  FileJson,
  FileText,
  Filter,
  Gauge,
  Layers,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  Wand2,
  X,
  Zap,
} from "lucide-react";

/* ---------------------------------------------------------------------------
   Parsing & analysis (unchanged logic)
--------------------------------------------------------------------------- */

const SAMPLE = `2025-03-18T10:20:31Z GET /api/users/42 200 84ms
2025-03-18T10:20:32Z GET /api/users/73 200 91ms
2025-03-18T10:20:33Z POST /api/orders 201 143ms
2025-03-18T10:20:34Z GET https://example.com/api/orders/ord_91?expand=items 500 201ms
curl -X DELETE https://example.com/api/users/42
fetch('/api/products/550e8400-e29b-41d4-a716-446655440000', { method: 'PATCH' });
axios.get('/api/orders/ord_91');`;

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];

const METHOD_STYLES = {
  GET: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  POST: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  PUT: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  PATCH: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  DELETE: "bg-red-500/10 text-red-600 dark:text-red-400",
  OPTIONS: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  HEAD: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};
const METHOD_BAR = {
  GET: "bg-emerald-500", POST: "bg-blue-500", PUT: "bg-amber-500",
  PATCH: "bg-violet-500", DELETE: "bg-red-500", OPTIONS: "bg-sky-500", HEAD: "bg-slate-500",
};
const STATUS_BAR = { "2xx": "bg-emerald-500", "3xx": "bg-sky-500", "4xx": "bg-amber-500", "5xx": "bg-red-500" };

function cleanUrl(value) {
  if (!value) return "";
  let url = value.trim().replace(/["'`),;]+$/g, "");
  try {
    if (/^https?:\/\//i.test(url)) url = new URL(url).pathname;
  } catch { return ""; }
  const path = url.split(/[?#]/)[0] || "/";
  return path.replace(/\/{2,}/g, "/");
}

function normalizePath(path) {
  return cleanUrl(path).split("/").map((part) => {
    if (!part) return part;
    if (/^\d+$/.test(part)) return ":id";
    if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(part)) return ":id";
    if (/^(?:[a-z]+_)?[0-9a-f]{12,}$/i.test(part) && /\d/.test(part)) return ":id";
    return part;
  }).join("/");
}

function parseLine(line) {
  let method = METHODS.find((item) => new RegExp(`\\b${item}\\b`).test(line.toUpperCase()));
  let url = "";
  const methodUrl = line.match(/\b(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s+(https?:\/\/[^\s"']+|\/[^\s"']+)/i);
  const requestCall = line.match(/\b(?:fetch|axios\.(?:get|post|put|patch|delete)|request)\s*\(\s*["'`](https?:\/\/[^"'`]+|\/[^"'`]+)["'`]/i);
  const routeCall = line.match(/\b(?:app|router)\.(get|post|put|patch|delete|options|head)\s*\(\s*["'`](\/[^"'`]+)["'`]/i);
  const urlFirst = line.match(/(https?:\/\/[^\s"'`]+|\/[A-Za-z0-9._~!$&'()*+,;=:@%\-/{\}]+(?:\?[^\s"'`]*)?)/);

  if (methodUrl) [method, url] = [methodUrl[1].toUpperCase(), methodUrl[2]];
  else if (routeCall) [method, url] = [routeCall[1].toUpperCase(), routeCall[2]];
  else if (requestCall) {
    url = requestCall[1];
    const axiosMethod = line.match(/axios\.(get|post|put|patch|delete)/i);
    if (axiosMethod) method = axiosMethod[1].toUpperCase();
  } else if (urlFirst) url = urlFirst[1];
  if (!url) return null;

  const optionMethod = line.match(/method\s*:\s*["'`](GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)["'`]/i);
  if (optionMethod) method = optionMethod[1].toUpperCase();
  const status = line.match(/(?:\s|status[=: ]+)([1-5]\d{2})(?=\s|$|[,;}])/i);
  const latency = line.match(/(\d+(?:\.\d+)?)\s*ms\b/i);
  return { method: method || "GET", path: cleanUrl(url), normalized: normalizePath(url), status: status ? Number(status[1]) : null, latency: latency ? Number(latency[1]) : null };
}

function analyze(input) {
  const nonEmptyLines = input.split(/\r?\n/).filter((line) => line.trim());
  const records = nonEmptyLines.map(parseLine).filter(Boolean);
  const grouped = new Map();
  records.forEach((item) => {
    const key = `${item.method} ${item.normalized}`;
    const current = grouped.get(key) || { method: item.method, path: item.normalized, count: 0, success: 0, errors: 0, unknown: 0, latencies: [], statuses: {}, examples: new Set() };
    current.count += 1;
    current.examples.add(item.path);
    if (item.status == null) current.unknown += 1;
    else {
      current.statuses[item.status] = (current.statuses[item.status] || 0) + 1;
      if (item.status >= 400) current.errors += 1;
      else current.success += 1;
    }
    if (item.latency != null) current.latencies.push(item.latency);
    grouped.set(key, current);
  });
  const endpoints = [...grouped.values()].map((item) => {
    const sortedLatencies = [...item.latencies].sort((a, b) => a - b);
    const averageLatency = sortedLatencies.length ? Math.round(sortedLatencies.reduce((sum, value) => sum + value, 0) / sortedLatencies.length) : null;
    const p95Latency = sortedLatencies.length ? sortedLatencies[Math.min(sortedLatencies.length - 1, Math.ceil(sortedLatencies.length * .95) - 1)] : null;
    const errorRate = item.count ? item.errors / item.count * 100 : 0;
    const risk = errorRate >= 20 || (p95Latency ?? 0) >= 1000 ? "High" : errorRate >= 5 || (p95Latency ?? 0) >= 500 ? "Medium" : "Low";
    const recommendations = [];
    if (errorRate >= 5) recommendations.push(`Investigate the ${Math.round(errorRate)}% error rate, starting with the most frequent failing status.`);
    if ((p95Latency ?? 0) >= 500) recommendations.push(`Profile slow requests; p95 latency is ${p95Latency} ms.`);
    if (item.unknown > item.count / 2) recommendations.push("Include HTTP status and latency in logs to improve health analysis.");
    if (!recommendations.length) recommendations.push("No immediate reliability or latency concern detected in this sample.");
    return { ...item, examples: [...item.examples], averageLatency, minLatency: sortedLatencies[0] ?? null, maxLatency: sortedLatencies.at(-1) ?? null, p95Latency, errorRate, risk, recommendations };
  }).sort((a, b) => b.count - a.count || a.path.localeCompare(b.path));
  return { endpoints, ignored: nonEmptyLines.length - records.length };
}

function downloadFile(contents, type, name) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = Object.assign(document.createElement("a"), { href: url, download: name });
  link.click(); URL.revokeObjectURL(url);
}

/* ---------------------------------------------------------------------------
   Small presentational helpers
--------------------------------------------------------------------------- */

const RISK_STYLES = {
  High: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  Medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

function RiskBadge({ risk }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${RISK_STYLES[risk]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {risk} risk
    </span>
  );
}

function MethodBadge({ method }) {
  return (
    <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${METHOD_STYLES[method] || METHOD_STYLES.HEAD}`}>
      {method}
    </span>
  );
}

/* ---------------------------------------------------------------------------
   Component
--------------------------------------------------------------------------- */

export default function ApiEndpointUsageMapperPage() {
  const [input, setInput] = useState(SAMPLE);
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("ALL");
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [risk, setRisk] = useState("ALL");
  const [sort, setSort] = useState("count");
  const [selectedKey, setSelectedKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const detailRef = useRef(null);

  const { endpoints, ignored } = useMemo(() => analyze(input), [input]);

  const visible = useMemo(
    () =>
      endpoints
        .filter(
          (item) =>
            item.path.toLowerCase().includes(query.trim().toLowerCase()) &&
            (method === "ALL" || item.method === method) &&
            (risk === "ALL" || item.risk === risk) &&
            (!errorsOnly || item.errors > 0),
        )
        .sort((a, b) =>
          sort === "latency" ? (b.p95Latency ?? -1) - (a.p95Latency ?? -1)
          : sort === "errors" ? b.errorRate - a.errorRate
          : sort === "path" ? a.path.localeCompare(b.path)
          : b.count - a.count,
        ),
    [endpoints, query, method, risk, errorsOnly, sort],
  );

  const total = endpoints.reduce((sum, item) => sum + item.count, 0);
  const errors = endpoints.reduce((sum, item) => sum + item.errors, 0);
  const maxCount = Math.max(1, ...visible.map((item) => item.count));
  const selected = endpoints.find((item) => `${item.method} ${item.path}` === selectedKey);
  const methodTotals = METHODS.map((name) => ({ name, count: endpoints.filter((e) => e.method === name).reduce((sum, e) => sum + e.count, 0) })).filter((item) => item.count);
  const statusTotals = endpoints.reduce((all, endpoint) => {
    Object.entries(endpoint.statuses).forEach(([status, count]) => {
      const family = `${status[0]}xx`;
      all[family] = (all[family] || 0) + count;
    });
    return all;
  }, {});
  const knownTotal = Math.max(1, total - endpoints.reduce((sum, e) => sum + e.unknown, 0));
  const summary = visible.map((item) => `${item.method.padEnd(7)} ${item.path} — ${item.count} request${item.count === 1 ? "" : "s"}`).join("\n");
  const lineCount = input.split(/\r?\n/).filter((l) => l.trim()).length;

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch { setCopied(false); }
  }
  function exportCsv() {
    const rows = [["method", "normalized_path", "requests", "successful", "errors", "error_rate_percent", "unknown_status", "min_latency_ms", "average_latency_ms", "p95_latency_ms", "max_latency_ms", "risk", "status_distribution", "recommendations"], ...visible.map((e) => [e.method, e.path, e.count, e.success, e.errors, e.errorRate.toFixed(1), e.unknown, e.minLatency ?? "", e.averageLatency ?? "", e.p95Latency ?? "", e.maxLatency ?? "", e.risk, JSON.stringify(e.statuses), e.recommendations.join(" ")])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    downloadFile(csv, "text/csv;charset=utf-8", "api-endpoint-usage.csv");
  }
  function exportJson() {
    downloadFile(JSON.stringify({ generatedAt: new Date().toISOString(), summary: { requests: total, endpoints: endpoints.length, errors, ignoredLines: ignored }, endpoints: visible }, null, 2), "application/json", "api-endpoint-usage.json");
  }
  function openDetails(key) {
    setSelectedKey(key);
    window.setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);
  }

  const card = "rounded-2xl border border-border bg-card";
  const softBtn = "inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[13px] font-medium text-foreground hover:bg-muted/60 transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const inputCls = "rounded-xl border border-border bg-background text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30";

  const STAT_TILES = [
    { label: "Requests", value: total, sub: "parsed from input", icon: Activity, accent: "text-blue-500 bg-blue-500/10" },
    { label: "Endpoints", value: endpoints.length, sub: "after normalization", icon: Route, accent: "text-violet-500 bg-violet-500/10" },
    { label: "Methods", value: new Set(endpoints.map((e) => e.method)).size, sub: "observed", icon: Layers, accent: "text-emerald-500 bg-emerald-500/10" },
    { label: "Errors", value: errors, sub: total ? `${Math.round((errors / total) * 100)}% error rate` : "0% error rate", icon: AlertTriangle, accent: "text-red-500 bg-red-500/10" },
  ];

  return (
    <main className="min-h-screen bg-background px-3 py-6 text-foreground antialiased sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* ============================================= header */}
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/20">
              <Route className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">API Endpoint Usage Mapper</h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3 w-3" /> Private · runs locally
                </span>
              </div>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                Turn access logs, cURL, fetch/Axios calls, and server routes into a normalized endpoint inventory.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" disabled={!visible.length} onClick={copySummary} className={softBtn}>
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Clipboard className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy Summary"}
            </button>
            <button type="button" disabled={!visible.length} onClick={exportJson} className={softBtn}>
              <FileJson className="h-3.5 w-3.5" /> JSON
            </button>
            <button
              type="button"
              disabled={!visible.length}
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </header>

        {/* ============================================= stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {STAT_TILES.map((s) => (
            <div key={s.label} className={card + " flex items-center gap-3 p-4"}>
              <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.accent}`}>
                <s.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xl font-bold leading-none tabular-nums">{s.value}</p>
                <p className="mt-1 truncate text-[11px] text-muted-foreground">{s.label} · {s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ============================================= main grid */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          {/* ---------- left: input + distribution ---------- */}
          <div className="space-y-5 xl:col-span-5">
            <section className={card + " overflow-hidden"} aria-label="Request data input">
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Terminal className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h2 className="text-[14px] font-bold leading-none">Request Data</h2>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">One request, log line, or code statement per line</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setInput(SAMPLE)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[12px] font-medium text-primary hover:bg-primary/10 transition-colors">
                    <Wand2 className="h-3 w-3" /> Sample
                  </button>
                  <button type="button" onClick={() => setInput("")} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors">
                    <Trash2 className="h-3 w-3" /> Clear
                  </button>
                </div>
              </div>
              <label htmlFor="request-input" className="sr-only">API request data</label>
              <textarea
                id="request-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                spellCheck={false}
                placeholder="Paste access logs, cURL commands, fetch calls, or Axios requests…"
                className="apo-scroll h-[380px] w-full resize-y bg-transparent p-4 font-mono text-[12px] leading-6 text-foreground outline-none placeholder:text-muted-foreground"
              />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live analysis
                </span>
                <span>{lineCount} line{lineCount === 1 ? "" : "s"}</span>
                {ignored > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3 w-3" /> {ignored} unrecognized
                  </span>
                )}
                <span className="ml-auto inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" /> Never leaves your browser
                </span>
              </div>
            </section>

            {!!endpoints.length && (
              <section className={card + " p-4"} aria-label="Traffic distribution">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-[14px] font-bold">Traffic Distribution</h2>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">By method</p>
                    <div className="mt-2.5 space-y-2">
                      {methodTotals.map((item) => (
                        <div key={item.name} className="grid grid-cols-[3.2rem_1fr_2.2rem] items-center gap-2 text-[12px]">
                          <span className={`rounded px-1 py-0.5 text-center font-mono text-[10px] font-bold ${METHOD_STYLES[item.name]}`}>{item.name}</span>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div className={`h-full rounded-full ${METHOD_BAR[item.name]}`} style={{ width: `${(item.count / total) * 100}%` }} />
                          </div>
                          <span className="text-right tabular-nums text-muted-foreground">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">By status</p>
                    <div className="mt-2.5 space-y-2">
                      {Object.entries(statusTotals).sort().map(([family, count]) => (
                        <div key={family} className="grid grid-cols-[3.2rem_1fr_2.2rem] items-center gap-2 text-[12px]">
                          <span className="font-mono text-[11px] font-bold">{family}</span>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div className={`h-full rounded-full ${STATUS_BAR[family] || "bg-primary"}`} style={{ width: `${(count / knownTotal) * 100}%` }} />
                          </div>
                          <span className="text-right tabular-nums text-muted-foreground">{count}</span>
                        </div>
                      ))}
                      {!Object.keys(statusTotals).length && <p className="text-[12px] text-muted-foreground">No status codes detected.</p>}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ---------- right: filters + endpoints ---------- */}
          <div className="space-y-5 xl:col-span-7">
            <section className={card + " p-4"} aria-label="Filters">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <label className="relative flex-1">
                  <span className="sr-only">Filter endpoint paths</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter paths…" className={`w-full py-2 pl-9 pr-3 text-[13px] ${inputCls}`} />
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="relative">
                    <span className="sr-only">HTTP method</span>
                    <select value={method} onChange={(e) => setMethod(e.target.value)} className={`appearance-none py-2 pl-3 pr-8 text-[12px] font-semibold ${inputCls}`}>
                      <option value="ALL">All methods</option>
                      {METHODS.map((item) => <option key={item}>{item}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  </label>
                  <label className="relative">
                    <span className="sr-only">Risk level</span>
                    <select value={risk} onChange={(e) => setRisk(e.target.value)} className={`appearance-none py-2 pl-3 pr-8 text-[12px] font-semibold ${inputCls}`}>
                      <option value="ALL">All risks</option>
                      <option>High</option><option>Medium</option><option>Low</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  </label>
                  <label className="relative">
                    <span className="sr-only">Sort endpoints</span>
                    <ArrowDownUp className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                    <select value={sort} onChange={(e) => setSort(e.target.value)} className={`appearance-none py-2 pl-7 pr-8 text-[12px] font-semibold ${inputCls}`}>
                      <option value="count">Most requests</option>
                      <option value="errors">Highest error rate</option>
                      <option value="latency">Slowest p95</option>
                      <option value="path">Path A–Z</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  </label>
                  <button
                    type="button"
                    aria-pressed={errorsOnly}
                    onClick={() => setErrorsOnly((value) => !value)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold transition-colors ${
                      errorsOnly ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30" : "border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Filter className="h-3 w-3" /> Errors only
                  </button>
                </div>
              </div>
            </section>

            <section className={card} aria-labelledby="results-heading">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <h2 id="results-heading" className="text-[14px] font-bold">Mapped Endpoints</h2>
                </div>
                <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {visible.length} of {endpoints.length}
                </span>
              </div>
              <div className="apo-scroll max-h-[640px] space-y-3 overflow-auto p-3 sm:p-4" aria-live="polite">
                {!visible.length ? (
                  <div className="flex min-h-64 flex-col items-center justify-center text-center">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                      <BarChart3 className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-[15px] font-semibold">No endpoints found</h3>
                    <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">Paste request data or adjust the filters to build your usage map.</p>
                  </div>
                ) : (
                  visible.map((item) => {
                    const key = `${item.method} ${item.path}`;
                    const isOpen = selectedKey === key;
                    return (
                      <article
                        key={key}
                        className={`rounded-xl border p-4 transition-all ${isOpen ? "border-primary/50 bg-primary/[0.03] ring-1 ring-primary/20" : "border-border hover:border-primary/30"}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <MethodBadge method={item.method} />
                              <code className="truncate text-[13px] font-semibold">{item.path}</code>
                              <RiskBadge risk={item.risk} />
                            </div>
                            <p className="mt-1.5 truncate text-[11px] text-muted-foreground" title={item.examples.join(", ")}>
                              {item.examples.length} unique path{item.examples.length === 1 ? "" : "s"} · {item.averageLatency == null ? "no latency data" : `${item.averageLatency} ms avg · ${item.p95Latency} ms p95`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold tabular-nums leading-none">{item.count}</p>
                            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">requests</p>
                          </div>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className={`h-full rounded-full ${METHOD_BAR[item.method] || "bg-primary"}`} style={{ width: `${Math.max(4, (item.count / maxCount) * 100)}%` }} />
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium">
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Check className="h-3 w-3" /> {item.success} ok
                          </span>
                          <span className={`inline-flex items-center gap-1 ${item.errors ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                            <AlertTriangle className="h-3 w-3" /> {item.errors} errors ({item.errorRate.toFixed(1)}%)
                          </span>
                          {item.unknown > 0 && <span className="text-muted-foreground">{item.unknown} unknown</span>}
                          <button
                            type="button"
                            onClick={() => (isOpen ? setSelectedKey(null) : openDetails(key))}
                            className="ml-auto rounded-lg px-2 py-1 text-[12px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                          >
                            {isOpen ? "Hide details" : "View details"}
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </div>

        {/* ============================================= detail panel */}
        {selected && (
          <section ref={detailRef} className={card + " scroll-mt-6 p-5"} aria-labelledby="endpoint-detail-heading">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <MethodBadge method={selected.method} />
                  <h2 id="endpoint-detail-heading" className="break-all font-mono text-[15px] font-bold sm:text-lg">{selected.path}</h2>
                  <RiskBadge risk={selected.risk} />
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground">Health metrics from {selected.count} parsed request{selected.count === 1 ? "" : "s"}.</p>
              </div>
              <button type="button" onClick={() => setSelectedKey(null)} aria-label="Close endpoint details" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "Error rate", value: `${selected.errorRate.toFixed(1)}%`, sub: `${selected.errors} errors`, accent: selected.errors ? "text-red-500" : "text-emerald-500" },
                { label: "Average latency", value: selected.averageLatency == null ? "—" : `${selected.averageLatency} ms`, sub: "mean of samples", accent: "text-blue-500" },
                { label: "P95 latency", value: selected.p95Latency == null ? "—" : `${selected.p95Latency} ms`, sub: "95th percentile", accent: "text-violet-500" },
                { label: "Range", value: selected.minLatency == null ? "—" : `${selected.minLatency}–${selected.maxLatency}`, sub: "milliseconds", accent: "text-amber-500" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border p-3.5">
                  <p className="text-[11px] font-medium text-muted-foreground">{s.label}</p>
                  <p className={`mt-1 text-lg font-bold tabular-nums ${s.accent}`}>{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <h3 className="flex items-center gap-2 text-[13px] font-bold">
                  <BarChart3 className="h-4 w-4 text-primary" /> Status codes
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {Object.entries(selected.statuses).sort().map(([status, count]) => (
                    <span key={status} className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-semibold ${Number(status) >= 500 ? "bg-red-500/10 text-red-600 dark:text-red-400" : Number(status) >= 400 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>
                      {status} × {count}
                    </span>
                  ))}
                  {!Object.keys(selected.statuses).length && <p className="text-[13px] text-muted-foreground">No status codes were detected.</p>}
                </div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <h3 className="flex items-center gap-2 text-[13px] font-bold">
                  <Gauge className="h-4 w-4 text-primary" /> Recommendations
                </h3>
                <ul className="mt-3 space-y-2">
                  {selected.recommendations.map((recommendation) => (
                    <li key={recommendation} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-[13px] font-bold">Observed paths</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selected.examples.map((example) => (
                  <code key={example} className="rounded-lg bg-muted px-2 py-1 text-[11px]">{example}</code>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .apo-scroll::-webkit-scrollbar { height: 6px; width: 6px }
        .apo-scroll::-webkit-scrollbar-thumb { background: color-mix(in oklab, currentColor 18%, transparent); border-radius: 9999px }
      ` }} />
    </main>
  );
}
