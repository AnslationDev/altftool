"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  BarChart2,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  FilterX,
  Loader2,
  MoreVertical,
  RefreshCw,
  Route,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { METHOD_PILL } from "./toneMaps";
import { USAGE_TONES } from "./ChartsRow";
import { USAGE_CLASSES } from "../utils/scanEngine";

const numberFormat = new Intl.NumberFormat("en-US");
const compactFormat = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const PAGE_SIZE = 50;

const selectClass =
  "min-h-9 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30";
const ghostButton =
  "inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50";

function formatRelativeTime(timestamp) {
  if (!timestamp) return "—";
  const diff = Date.now() - timestamp;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 365) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(timestamp).toLocaleDateString();
}

function buildCurl(endpoint) {
  const base = endpoint.domain ? `https://${endpoint.domain}` : "";
  const methodFlag = endpoint.method === "GET" ? "" : `-X ${endpoint.method} `;
  return `curl ${methodFlag}${base}${endpoint.path}`;
}

function UsagePill({ usage }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${USAGE_TONES[usage].text}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${USAGE_TONES[usage].bg}`} />
      {usage}
    </span>
  );
}

function ExpandedDetails({ endpoint }) {
  return (
    <div className="grid gap-4 rounded-xl border border-border bg-background p-4 md:grid-cols-3">
      <div>
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Traffic
        </h4>
        <dl className="mt-2 space-y-1 text-xs">
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Observed calls</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {numberFormat.format(endpoint.calls)}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Error rate</dt>
            <dd
              className={`font-semibold tabular-nums ${
                endpoint.errorRate >= 5 ? "text-danger" : "text-foreground"
              }`}
            >
              {endpoint.errorRate.toFixed(1)}%
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Avg latency</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {endpoint.avgLatency == null ? "—" : `${endpoint.avgLatency} ms`}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">p95 latency</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {endpoint.p95Latency == null ? "—" : `${endpoint.p95Latency} ms`}
            </dd>
          </div>
        </dl>
        {Object.keys(endpoint.statuses).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(endpoint.statuses)
              .sort()
              .map(([status, count]) => (
                <span
                  key={status}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    Number(status) >= 400 ? "bg-danger-soft text-danger" : "bg-muted text-foreground"
                  }`}
                >
                  {status}: {count}
                </span>
              ))}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {endpoint.summary ? "Description" : "Observed paths"}
        </h4>
        {endpoint.summary ? (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{endpoint.summary}</p>
        ) : null}
        {endpoint.examples.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {endpoint.examples.slice(0, 6).map((example) => (
              <code key={example} className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-foreground">
                {example}
              </code>
            ))}
            {endpoint.examples.length > 6 && (
              <span className="text-[10px] text-muted-foreground">
                +{endpoint.examples.length - 6} more
              </span>
            )}
          </div>
        )}
        {!endpoint.summary && endpoint.examples.length === 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Declared in a spec — no traffic observed.
          </p>
        )}
      </div>

      <div className="min-w-0">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Sources
        </h4>
        <div className="mt-2 flex flex-wrap gap-1">
          {endpoint.sources.map((source) => (
            <span
              key={source}
              className="max-w-full truncate rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {source}
            </span>
          ))}
        </div>
        <h4 className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          As cURL
        </h4>
        <code className="mt-1 block truncate rounded-md bg-muted px-2 py-1 text-[10px] text-foreground">
          {buildCurl(endpoint)}
        </code>
      </div>
    </div>
  );
}

export default function EndpointTable({ scan, favorites, onToggleFavorite, onRescan, rescanning }) {
  const { endpoints } = scan;
  const [query, setQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [domainFilter, setDomainFilter] = useState("ALL");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortBy, setSortBy] = useState({ key: "calls", dir: "desc" });
  const [expandedKey, setExpandedKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [menuKey, setMenuKey] = useState(null);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const methods = useMemo(() => [...new Set(endpoints.map((e) => e.method))], [endpoints]);
  const domains = useMemo(
    () => [...new Set(endpoints.map((e) => e.domain).filter(Boolean))].sort(),
    [endpoints],
  );

  const visible = useMemo(() => {
    const filtered = endpoints.filter(
      (endpoint) =>
        (endpoint.path.toLowerCase().includes(query.trim().toLowerCase()) ||
          endpoint.summary.toLowerCase().includes(query.trim().toLowerCase())) &&
        (methodFilter === "ALL" || endpoint.method === methodFilter) &&
        (statusFilter === "ALL" || endpoint.usage === statusFilter) &&
        (domainFilter === "ALL" || endpoint.domain === domainFilter) &&
        (!favoritesOnly || favorites.has(endpoint.key)) &&
        (!errorsOnly || endpoint.errors > 0),
    );
    const direction = sortBy.dir === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      if (sortBy.key === "path") return a.path.localeCompare(b.path) * direction;
      if (sortBy.key === "lastUsed") return ((a.lastUsed ?? 0) - (b.lastUsed ?? 0)) * direction;
      return (a.calls - b.calls) * direction || a.path.localeCompare(b.path);
    });
  }, [endpoints, query, methodFilter, statusFilter, domainFilter, favoritesOnly, errorsOnly, favorites, sortBy]);

  const filtersActive =
    query || methodFilter !== "ALL" || statusFilter !== "ALL" || domainFilter !== "ALL" || favoritesOnly || errorsOnly;

  const resetFilters = () => {
    setQuery("");
    setMethodFilter("ALL");
    setStatusFilter("ALL");
    setDomainFilter("ALL");
    setFavoritesOnly(false);
    setErrorsOnly(false);
  };

  const toggleSort = (key) => {
    setSortBy((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "path" ? "asc" : "desc" },
    );
  };

  const copyCurl = async (endpoint) => {
    try {
      await navigator.clipboard.writeText(buildCurl(endpoint));
      setCopiedKey(endpoint.key);
      window.setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      setCopiedKey(null);
    }
  };

  const copyPath = async (endpoint) => {
    try {
      await navigator.clipboard.writeText(endpoint.path);
    } catch {
      // clipboard unavailable
    }
    setMenuKey(null);
  };

  const download = (contents, type, name) => {
    const url = URL.createObjectURL(new Blob([contents], { type }));
    const link = Object.assign(document.createElement("a"), { href: url, download: name });
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const rows = [
      ["method", "path", "domain", "calls", "usage_status", "error_rate_percent", "avg_latency_ms", "p95_latency_ms", "last_used", "declared_in_spec", "summary", "sources"],
      ...visible.map((e) => [
        e.method, e.path, e.domain, e.calls, e.usage, e.errorRate.toFixed(1),
        e.avgLatency ?? "", e.p95Latency ?? "",
        e.lastUsed ? new Date(e.lastUsed).toISOString() : "",
        e.declared ? "yes" : "no", e.summary, e.sources.join("; "),
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    download(csv, "text/csv;charset=utf-8", "api-endpoint-usage.csv");
    setExportOpen(false);
  };

  const exportJson = () => {
    download(
      JSON.stringify({ generatedAt: new Date().toISOString(), totals: scan.totals, endpoints: visible }, null, 2),
      "application/json",
      "api-endpoint-usage.json",
    );
    setExportOpen(false);
  };

  const shown = visible.slice(0, limit);

  return (
    <section aria-label="Mapped endpoints" className="rounded-2xl border border-border bg-card shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
        <label className="relative min-w-44 flex-1">
          <span className="sr-only">Search endpoints</span>
          <Search
            aria-hidden="true"
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search endpoints…"
            className="min-h-9 w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </label>
        <label>
          <span className="sr-only">Filter by method</span>
          <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className={selectClass}>
            <option value="ALL">All Methods</option>
            {methods.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by usage status</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
            <option value="ALL">All Status</option>
            {USAGE_CLASSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by domain</span>
          <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className={selectClass}>
            <option value="ALL">All Domains</option>
            {domains.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>

        <div className="relative">
          <button
            type="button"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((open) => !open)}
            className={`${ghostButton} ${favoritesOnly || errorsOnly ? "border-primary text-primary" : ""}`}
          >
            <SlidersHorizontal aria-hidden="true" size={13} /> More Filters
          </button>
          {moreOpen && (
            <div className="absolute right-0 top-full z-30 mt-1 w-48 space-y-1 rounded-xl border border-border bg-card p-2 shadow-lg">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                <input
                  type="checkbox"
                  checked={favoritesOnly}
                  onChange={(e) => setFavoritesOnly(e.target.checked)}
                  className="accent-current"
                />
                Favorites only
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                <input
                  type="checkbox"
                  checked={errorsOnly}
                  onChange={(e) => setErrorsOnly(e.target.checked)}
                  className="accent-current"
                />
                Has errors
              </label>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-expanded={exportOpen}
            disabled={!visible.length}
            onClick={() => setExportOpen((open) => !open)}
            className={ghostButton}
          >
            <Download aria-hidden="true" size={13} /> Export
            <ChevronDown aria-hidden="true" size={12} />
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-full z-30 mt-1 w-36 space-y-0.5 rounded-xl border border-border bg-card p-1.5 shadow-lg">
              <button type="button" onClick={exportCsv} className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-foreground hover:bg-muted">
                CSV
              </button>
              <button type="button" onClick={exportJson} className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-foreground hover:bg-muted">
                JSON
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onRescan}
          disabled={rescanning}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {rescanning ? (
            <Loader2 aria-hidden="true" size={13} className="animate-spin" />
          ) : (
            <RefreshCw aria-hidden="true" size={13} />
          )}
          Rescan
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {endpoints.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
            <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Route aria-hidden="true" size={22} />
            </span>
            <h3 className="text-base font-semibold text-foreground">No endpoints mapped yet</h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
              Upload code or logs, paste a spec, or scan a public API above to build your endpoint
              map.
            </p>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
            <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FilterX aria-hidden="true" size={22} />
            </span>
            <h3 className="text-base font-semibold text-foreground">No endpoints match</h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
              The current search or filters exclude every endpoint.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="w-10 px-3 py-2.5">
                  <span className="sr-only">Favorite</span>
                </th>
                <th scope="col" className="px-3 py-2.5" aria-sort={sortBy.key === "path" ? (sortBy.dir === "asc" ? "ascending" : "descending") : "none"}>
                  <button type="button" onClick={() => toggleSort("path")} className="inline-flex items-center gap-1 font-semibold hover:text-foreground">
                    Endpoint <ArrowUpDown aria-hidden="true" size={11} />
                  </button>
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Method</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Domain</th>
                <th scope="col" className="px-3 py-2.5" aria-sort={sortBy.key === "calls" ? (sortBy.dir === "asc" ? "ascending" : "descending") : "none"}>
                  <button type="button" onClick={() => toggleSort("calls")} className="inline-flex items-center gap-1 font-semibold hover:text-foreground">
                    Usage (Est.) <ArrowUpDown aria-hidden="true" size={11} />
                  </button>
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
                <th scope="col" className="px-3 py-2.5" aria-sort={sortBy.key === "lastUsed" ? (sortBy.dir === "asc" ? "ascending" : "descending") : "none"}>
                  <button type="button" onClick={() => toggleSort("lastUsed")} className="inline-flex items-center gap-1 font-semibold hover:text-foreground">
                    Last Used <ArrowUpDown aria-hidden="true" size={11} />
                  </button>
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((endpoint) => {
                const isExpanded = expandedKey === endpoint.key;
                const isFavorite = favorites.has(endpoint.key);
                return (
                  <FragmentRow
                    key={endpoint.key}
                    endpoint={endpoint}
                    isExpanded={isExpanded}
                    isFavorite={isFavorite}
                    copied={copiedKey === endpoint.key}
                    menuOpen={menuKey === endpoint.key}
                    onToggleExpand={() => setExpandedKey(isExpanded ? null : endpoint.key)}
                    onToggleFavorite={() => onToggleFavorite(endpoint.key)}
                    onCopyCurl={() => copyCurl(endpoint)}
                    onCopyPath={() => copyPath(endpoint)}
                    onToggleMenu={() => setMenuKey(menuKey === endpoint.key ? null : endpoint.key)}
                  />
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {visible.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span aria-live="polite">
            Showing {numberFormat.format(Math.min(limit, visible.length))} of{" "}
            {numberFormat.format(visible.length)} endpoint{visible.length === 1 ? "" : "s"}
            {filtersActive ? ` (filtered from ${numberFormat.format(endpoints.length)})` : ""}
          </span>
          <div className="flex gap-2">
            {filtersActive && (
              <button type="button" onClick={resetFilters} className="font-semibold text-primary hover:underline">
                Reset filters
              </button>
            )}
            {visible.length > limit && (
              <button
                type="button"
                onClick={() => setLimit((value) => value + PAGE_SIZE)}
                className="font-semibold text-primary hover:underline"
              >
                Show {Math.min(PAGE_SIZE, visible.length - limit)} more
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function FragmentRow({
  endpoint,
  isExpanded,
  isFavorite,
  copied,
  menuOpen,
  onToggleExpand,
  onToggleFavorite,
  onCopyCurl,
  onCopyPath,
  onToggleMenu,
}) {
  return (
    <>
      <tr className={`border-b border-border text-sm transition-colors ${isExpanded ? "bg-muted/60" : "hover:bg-muted/40"}`}>
        <td className="px-3 py-2.5">
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
            className={`rounded-md p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              isFavorite ? "text-warning" : "text-muted-foreground hover:text-warning"
            }`}
          >
            <Star aria-hidden="true" size={15} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </td>
        <td className="max-w-64 px-3 py-2.5">
          <p className="truncate font-mono text-xs font-semibold text-foreground">{endpoint.path}</p>
          {endpoint.summary && (
            <p className="truncate text-[11px] text-muted-foreground">{endpoint.summary}</p>
          )}
        </td>
        <td className="px-3 py-2.5">
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${METHOD_PILL[endpoint.method] || "bg-muted text-muted-foreground"}`}>
            {endpoint.method}
          </span>
        </td>
        <td className="max-w-40 truncate px-3 py-2.5 font-mono text-xs text-muted-foreground">
          {endpoint.domain || "—"}
        </td>
        <td className="px-3 py-2.5 text-xs font-semibold tabular-nums text-foreground">
          {endpoint.calls ? compactFormat.format(endpoint.calls) : "0"}
        </td>
        <td className="px-3 py-2.5">
          <UsagePill usage={endpoint.usage} />
        </td>
        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted-foreground">
          {formatRelativeTime(endpoint.lastUsed)}
        </td>
        <td className="px-3 py-2.5">
          <div className="relative flex items-center gap-0.5">
            <button
              type="button"
              onClick={onToggleExpand}
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? "Hide" : "Show"} details for ${endpoint.method} ${endpoint.path}`}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <BarChart2 aria-hidden="true" size={15} />
            </button>
            <button
              type="button"
              onClick={onCopyCurl}
              aria-label={`Copy ${endpoint.method} ${endpoint.path} as cURL`}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {copied ? (
                <Check aria-hidden="true" size={15} className="text-success" />
              ) : (
                <Code2 aria-hidden="true" size={15} />
              )}
            </button>
            <button
              type="button"
              onClick={onToggleMenu}
              aria-expanded={menuOpen}
              aria-label="More actions"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <MoreVertical aria-hidden="true" size={15} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-30 w-36 space-y-0.5 rounded-xl border border-border bg-card p-1.5 shadow-lg">
                <button
                  type="button"
                  onClick={onCopyPath}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-foreground hover:bg-muted"
                >
                  <Copy aria-hidden="true" size={12} /> Copy path
                </button>
                <button
                  type="button"
                  onClick={onCopyCurl}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-foreground hover:bg-muted"
                >
                  <Code2 aria-hidden="true" size={12} /> Copy as cURL
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-border">
          <td colSpan={8} className="px-3 py-3">
            <ExpandedDetails endpoint={endpoint} />
          </td>
        </tr>
      )}
    </>
  );
}
