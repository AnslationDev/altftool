"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle, BarChart3, Check, ChevronDown, Clipboard, Download, Filter,
  Gauge, Route, Search, ShieldCheck, Sparkles, Trash2, X,
} from "lucide-react";

const SAMPLE = `2025-03-18T10:20:31Z GET /api/users/42 200 84ms
2025-03-18T10:20:32Z GET /api/users/73 200 91ms
2025-03-18T10:20:33Z POST /api/orders 201 143ms
2025-03-18T10:20:34Z GET https://example.com/api/orders/ord_91?expand=items 500 201ms
curl -X DELETE https://example.com/api/users/42
fetch('/api/products/550e8400-e29b-41d4-a716-446655440000', { method: 'PATCH' });
axios.get('/api/orders/ord_91');`;

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];

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

function RiskBadge({ risk }) {
  const tone = risk === "High" ? "border-destructive/30 bg-destructive/10 text-destructive" : risk === "Medium" ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-muted text-foreground";
  return <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${tone}`}>{risk} risk</span>;
}

function Stat({ label, value, detail }) {
  return <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
    <div className="mt-2 min-w-0">
      <span className="block max-w-full break-all text-2xl font-bold tabular-nums leading-tight text-foreground sm:text-3xl">{value}</span>
      <span className="mt-1 block break-words text-xs leading-4 text-muted-foreground">{detail}</span>
    </div>
  </div>;
}

const controlClass = "min-h-10 rounded-md border border-border bg-background text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30";
const secondaryButton = `inline-flex min-h-10 items-center justify-center gap-2 px-3 text-sm font-semibold ${controlClass} hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60`;

export default function ApiEndpointUsageMapperPage() {
  const [input, setInput] = useState(SAMPLE);
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("ALL");
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [risk, setRisk] = useState("ALL");
  const [sort, setSort] = useState("count");
  const [selectedKey, setSelectedKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const { endpoints, ignored } = useMemo(() => analyze(input), [input]);
  const visible = useMemo(() => endpoints.filter((item) => item.path.toLowerCase().includes(query.trim().toLowerCase()) && (method === "ALL" || item.method === method) && (risk === "ALL" || item.risk === risk) && (!errorsOnly || item.errors > 0)).sort((a, b) => sort === "latency" ? (b.p95Latency ?? -1) - (a.p95Latency ?? -1) : sort === "errors" ? b.errorRate - a.errorRate : sort === "path" ? a.path.localeCompare(b.path) : b.count - a.count), [endpoints, query, method, risk, errorsOnly, sort]);
  const total = endpoints.reduce((sum, item) => sum + item.count, 0);
  const errors = endpoints.reduce((sum, item) => sum + item.errors, 0);
  const maxCount = Math.max(1, ...visible.map((item) => item.count));
  const selected = endpoints.find((item) => `${item.method} ${item.path}` === selectedKey);
  const methodTotals = METHODS.map((name) => ({ name, count: endpoints.filter((e) => e.method === name).reduce((sum, e) => sum + e.count, 0) })).filter((item) => item.count);
  const statusTotals = endpoints.reduce((all, endpoint) => { Object.entries(endpoint.statuses).forEach(([status, count]) => { const family = `${status[0]}xx`; all[family] = (all[family] || 0) + count; }); return all; }, {});
  const summary = visible.map((item) => `${item.method.padEnd(7)} ${item.path} — ${item.count} request${item.count === 1 ? "" : "s"}`).join("\n");

  async function copySummary() {
    try { await navigator.clipboard.writeText(summary); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); }
  }
  function exportCsv() {
    const rows = [["method", "normalized_path", "requests", "successful", "errors", "error_rate_percent", "unknown_status", "min_latency_ms", "average_latency_ms", "p95_latency_ms", "max_latency_ms", "risk", "status_distribution", "recommendations"], ...visible.map((e) => [e.method, e.path, e.count, e.success, e.errors, e.errorRate.toFixed(1), e.unknown, e.minLatency ?? "", e.averageLatency ?? "", e.p95Latency ?? "", e.maxLatency ?? "", e.risk, JSON.stringify(e.statuses), e.recommendations.join(" ")])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    downloadFile(csv, "text/csv;charset=utf-8", "api-endpoint-usage.csv");
  }
  function exportJson() { downloadFile(JSON.stringify({ generatedAt: new Date().toISOString(), summary: { requests: total, endpoints: endpoints.length, errors, ignoredLines: ignored }, endpoints: visible }, null, 2), "application/json", "api-endpoint-usage.json"); }

  return <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><ShieldCheck aria-hidden="true" size={14} /> Private, local analysis</div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">API Endpoint Usage Mapper</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Turn access logs, cURL commands, fetch or Axios calls, and server routes into a normalized endpoint inventory.</p>
          </div><Route className="hidden shrink-0 text-primary sm:block" aria-hidden="true" size={64} strokeWidth={1.5} />
        </div>
      </header>

      <section className="space-y-6" aria-label="Endpoint mapper workspace">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">Request data</h2><p id="input-help" className="text-xs text-muted-foreground">One request, log, or code statement per line</p></div>
            <button type="button" onClick={() => setInput("")} className={secondaryButton}><Trash2 aria-hidden="true" size={16} /> Clear</button></div>
          <label htmlFor="request-input" className="sr-only">API request data</label>
          <textarea id="request-input" value={input} onChange={(event) => setInput(event.target.value)} spellCheck={false} aria-describedby="input-help input-status" placeholder="Paste access logs, cURL commands, fetch calls, or Axios requests…" className={`h-[430px] w-full resize-y p-4 font-mono text-xs leading-6 ${controlClass}`} />
          <p id="input-status" className="mt-3 flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite"><Sparkles aria-hidden="true" size={14} className="text-primary" /> {ignored ? `${ignored} non-empty line${ignored === 1 ? " was" : "s were"} not recognized.` : "Analysis updates instantly and stays in your browser."}</p>
        </div>

        <div className="min-w-0 space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="Requests" value={total} detail="parsed" /><Stat label="Endpoints" value={endpoints.length} detail="grouped" /><Stat label="Methods" value={new Set(endpoints.map((e) => e.method)).size} detail="observed" /><Stat label="Errors" value={errors} detail={total ? `${Math.round(errors / total * 100)}% rate` : "0% rate"} /></div>
          {!!endpoints.length && <section className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2" aria-label="Traffic distribution">
            <div><h2 className="text-sm font-semibold">Requests by method</h2><div className="mt-3 space-y-2">{methodTotals.map((item) => <div key={item.name} className="grid grid-cols-[3rem_1fr_2.5rem] items-center gap-2 text-xs"><span className="font-semibold">{item.name}</span><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${item.count / total * 100}%` }} /></div><span className="text-right text-muted-foreground">{item.count}</span></div>)}</div></div>
            <div><h2 className="text-sm font-semibold">Known status distribution</h2><div className="mt-3 space-y-2">{Object.entries(statusTotals).sort().map(([family, count]) => <div key={family} className="grid grid-cols-[3rem_1fr_2.5rem] items-center gap-2 text-xs"><span className="font-semibold">{family}</span><div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${family.startsWith("4") || family.startsWith("5") ? "bg-destructive" : "bg-primary"}`} style={{ width: `${count / Math.max(1, total - endpoints.reduce((sum, e) => sum + e.unknown, 0)) * 100}%` }} /></div><span className="text-right text-muted-foreground">{count}</span></div>)}</div></div>
          </section>}
          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5" aria-labelledby="filters-heading">
            <h2 id="filters-heading" className="mb-1 text-lg font-semibold">Filter and export</h2>
            <p className="mb-4 text-sm text-muted-foreground">Narrow the mapped endpoints, change their order, or export the current view.</p>
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <label className="relative flex-1"><span className="sr-only">Filter endpoint paths</span><Search aria-hidden="true" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter paths…" className={`w-full py-2 pl-9 pr-3 text-sm ${controlClass}`} /></label>
              <div className="flex flex-wrap gap-2"><label><span className="sr-only">HTTP method</span><select value={method} onChange={(e) => setMethod(e.target.value)} className={`px-3 text-sm font-semibold ${controlClass}`}><option value="ALL">All methods</option>{METHODS.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label><span className="sr-only">Risk level</span><select value={risk} onChange={(e) => setRisk(e.target.value)} className={`px-3 text-sm font-semibold ${controlClass}`}><option value="ALL">All risks</option><option>High</option><option>Medium</option><option>Low</option></select></label>
                <label className="relative"><span className="sr-only">Sort endpoints</span><select value={sort} onChange={(e) => setSort(e.target.value)} className={`appearance-none py-2 pl-3 pr-8 text-sm font-semibold ${controlClass}`}><option value="count">Most requests</option><option value="errors">Highest error rate</option><option value="latency">Slowest p95</option><option value="path">Path A–Z</option></select><ChevronDown aria-hidden="true" size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" /></label>
                <button type="button" aria-pressed={errorsOnly} onClick={() => setErrorsOnly((value) => !value)} className={`${secondaryButton} ${errorsOnly ? "border-primary bg-primary/10 text-primary" : ""}`}><Filter aria-hidden="true" size={15} /> Errors only</button>
                <button type="button" disabled={!visible.length} onClick={copySummary} className={secondaryButton}>{copied ? <Check aria-hidden="true" size={15} /> : <Clipboard aria-hidden="true" size={15} />} {copied ? "Copied" : "Copy"}</button>
                <button type="button" disabled={!visible.length} onClick={exportCsv} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"><Download aria-hidden="true" size={15} /> Export CSV</button>
                <button type="button" disabled={!visible.length} onClick={exportJson} className={secondaryButton}><Download aria-hidden="true" size={15} /> JSON</button>
              </div></div>
          </section>
          <section className="rounded-xl border border-border bg-card shadow-sm" aria-labelledby="results-heading">
            <div className="border-b border-border p-4 sm:p-5"><h2 id="results-heading" className="text-lg font-semibold">Mapped endpoints</h2><p className="mt-1 text-sm text-muted-foreground">Showing {visible.length} of {endpoints.length} normalized endpoint{endpoints.length === 1 ? "" : "s"}.</p></div>
            <div className="max-h-[520px] overflow-auto p-3 sm:p-4" aria-live="polite">
              {!visible.length ? <div className="flex min-h-64 flex-col items-center justify-center text-center"><BarChart3 aria-hidden="true" size={44} className="mb-3 text-muted-foreground" /><h3 className="font-semibold">No endpoints found</h3><p className="mt-1 max-w-xs text-sm text-muted-foreground">Paste request data or adjust the filters to build your usage map.</p></div> : visible.map((item) => <article key={`${item.method}-${item.path}`} className="mb-3 rounded-lg border border-border p-4 last:mb-0">
                <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{item.method}</span><code className="truncate text-sm font-semibold">{item.path}</code><RiskBadge risk={item.risk} /></div><p className="mt-2 truncate text-xs text-muted-foreground" title={item.examples.join(", ")}>{item.examples.length} unique path{item.examples.length === 1 ? "" : "s"} · {item.averageLatency == null ? "No latency data" : `${item.averageLatency} ms avg · ${item.p95Latency} ms p95`}</p></div><div className="text-right"><p className="text-2xl font-bold">{item.count}</p><p className="text-xs uppercase tracking-wider text-muted-foreground">requests</p></div></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`${item.method} ${item.path} relative request volume`} aria-valuemin={0} aria-valuemax={maxCount} aria-valuenow={item.count}><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, item.count / maxCount * 100)}%` }} /></div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold"><span className="text-foreground">{item.success} successful</span><span className={item.errors ? "text-destructive" : "text-muted-foreground"}>{item.errors} errors ({item.errorRate.toFixed(1)}%)</span>{item.unknown > 0 && <span className="text-muted-foreground">{item.unknown} unknown</span>}<button type="button" onClick={() => setSelectedKey(`${item.method} ${item.path}`)} className="ml-auto min-h-10 rounded-md px-2 text-primary outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/40">View details</button></div>
              </article>)}
            </div>
          </section>
        </div>
      </section>
      {selected && <section className="rounded-xl border border-border bg-card p-5 shadow-sm" aria-labelledby="endpoint-detail-heading">
        <div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{selected.method}</span><h2 id="endpoint-detail-heading" className="break-all font-mono text-lg font-semibold">{selected.path}</h2><RiskBadge risk={selected.risk} /></div><p className="mt-2 text-sm text-muted-foreground">Detailed health metrics from {selected.count} parsed request{selected.count === 1 ? "" : "s"}.</p></div><button type="button" onClick={() => setSelectedKey(null)} aria-label="Close endpoint details" className={secondaryButton}><X aria-hidden="true" size={16} /></button></div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="Error rate" value={`${selected.errorRate.toFixed(1)}%`} detail={`${selected.errors} errors`} /><Stat label="Average" value={selected.averageLatency == null ? "—" : `${selected.averageLatency} ms`} detail="latency" /><Stat label="P95" value={selected.p95Latency == null ? "—" : `${selected.p95Latency} ms`} detail="latency" /><Stat label="Range" value={selected.minLatency == null ? "—" : `${selected.minLatency}–${selected.maxLatency}`} detail="milliseconds" /></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2"><div className="rounded-lg border border-border p-4"><h3 className="flex items-center gap-2 font-semibold"><BarChart3 aria-hidden="true" size={17} className="text-primary" /> Status codes</h3><div className="mt-3 flex flex-wrap gap-2">{Object.entries(selected.statuses).sort().map(([status, count]) => <span key={status} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{status}: {count}</span>)}{!Object.keys(selected.statuses).length && <p className="text-sm text-muted-foreground">No status codes were detected.</p>}</div></div><div className="rounded-lg border border-border p-4"><h3 className="flex items-center gap-2 font-semibold"><Gauge aria-hidden="true" size={17} className="text-primary" /> Recommendations</h3><ul className="mt-3 space-y-2">{selected.recommendations.map((recommendation) => <li key={recommendation} className="flex gap-2 text-sm text-muted-foreground"><AlertTriangle aria-hidden="true" size={15} className="mt-1 shrink-0 text-primary" />{recommendation}</li>)}</ul></div></div>
        <div className="mt-4"><h3 className="text-sm font-semibold">Observed paths</h3><div className="mt-2 flex flex-wrap gap-2">{selected.examples.map((example) => <code key={example} className="rounded-md bg-muted px-2 py-1 text-xs">{example}</code>)}</div></div>
      </section>}
    </div>
  </main>;
}
