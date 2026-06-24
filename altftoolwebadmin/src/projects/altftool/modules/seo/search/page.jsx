"use client";

// ALTF Engine — Global Search (Phase A): search any page across all sources.

import { useState } from "react";
import { runPageSearch } from "../services/seoService";
import { getErrorMessage } from "@/lib/apiClient";
import {
  Search as SearchIcon,
  Layers,
  FileText,
  Globe,
  ExternalLink,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  EyeOff,
} from "lucide-react";

const TYPES = ["all", "tools", "blogs", "news", "policies", "static"];

const TYPE_BADGE = {
  tools: "bg-primary-soft text-primary",
  blogs: "bg-accent-soft text-accent",
  news: "bg-warning-soft text-warning",
  policies: "bg-surface-soft text-muted",
  static: "bg-surface-soft text-muted",
};

export default function SeoSearchPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [active, setActive] = useState(null);

  async function doSearch(e, overrideType) {
    e?.preventDefault?.();
    const activeType = overrideType ?? type;
    setStatus("searching");
    setError("");
    try {
      const res = await runPageSearch(q, activeType);
      setResults(res.results || []);
      setTotal(res.total ?? null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setStatus("idle");
    }
  }

  // Re-filter instantly when the type changes (if a query is already present).
  function handleTypeChange(e) {
    const next = e.target.value;
    setType(next);
    if (q.trim()) doSearch(null, next);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-slide-in">
      {/* Tab nav */}
      <nav className="flex items-center gap-6 border-b border-border pb-3">
        <a href="/altftool/seo/dashboard" className="text-muted hover:text-foreground pb-3 -mb-3.5 transition-colors flex items-center gap-1.5">
          <Layers className="w-4 h-4" /> Dashboard
        </a>
        <span className="font-semibold text-primary border-b-2 border-primary pb-3 -mb-3.5 flex items-center gap-1.5">
          <SearchIcon className="w-4 h-4" /> Search
        </span>
        <a href="/altftool/seo" className="text-muted hover:text-foreground pb-3 -mb-3.5 transition-colors flex items-center gap-1.5">
          <FileText className="w-4 h-4" /> Config
        </a>
        <a href="/altftool/seo/gsc" className="text-muted hover:text-foreground pb-3 -mb-3.5 transition-colors flex items-center gap-1.5">
          <Globe className="w-4 h-4" /> Search Console
        </a>
      </nav>

      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Global Search</h1>
        <p className="text-sm text-muted mt-1">
          Search any tool, blog, news article, landing or policy page
          {total != null ? <span className="font-medium text-foreground"> — {total} pages indexed</span> : ""}.
        </p>
      </header>

      <form onSubmit={doSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='e.g. "Image Compressor"'
            className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
        <select
          value={type}
          onChange={handleTypeChange}
          className="px-3 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground capitalize focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
        </select>
        <button
          type="submit"
          disabled={status === "searching"}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50 shadow-sm"
        >
          <SearchIcon className="w-4 h-4" />
          {status === "searching" ? "Searching…" : "Search"}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-danger-soft border border-danger/20 text-danger rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Results */}
        <div className="lg:col-span-2 space-y-2.5">
          {results.map((r) => (
            <button
              key={r.path}
              onClick={() => setActive(r)}
              className={`w-full text-left p-4 rounded-xl border bg-card transition-all hover:shadow-md ${
                active?.path === r.path ? "border-primary ring-1 ring-primary/30" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <strong className="text-sm font-semibold text-foreground">{r.title || r.path}</strong>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${TYPE_BADGE[r.pageType] || "bg-surface-soft text-muted"}`}>
                    {r.pageType}
                  </span>
                  {r.indexState === "noindex" && (
                    <span title="noindex" className="text-warning"><EyeOff className="w-3.5 h-3.5" /></span>
                  )}
                </span>
              </div>
              <div className="text-xs text-primary mt-1 truncate">{r.path}</div>
              {r.description && <div className="text-xs text-muted mt-1.5 line-clamp-2">{r.description}</div>}
            </button>
          ))}
          {status === "idle" && q && !results.length && (
            <div className="p-8 text-center text-sm text-muted border border-dashed border-border rounded-xl">
              No matches for “{q}”.
            </div>
          )}
          {!q && !results.length && (
            <div className="p-8 text-center text-sm text-muted border border-dashed border-border rounded-xl">
              Type a query above to search across all pages.
            </div>
          )}
        </div>

        {/* Detail panel */}
        {active && (
          <aside className="bg-card border border-border rounded-xl p-5 h-fit lg:sticky lg:top-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-foreground">{active.title || active.path}</h3>
              <a href={active.path} target="_blank" rel="noreferrer" title="Open page" className="text-muted hover:text-primary">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <dl className="text-sm space-y-2">
              <Row label="URL" value={active.path} mono />
              <Row label="Type" value={active.pageType} />
              <Row label="Canonical" value={active.canonical} mono />
              <Row label="H1" value={active.h1 || "—"} />
              <Row label="Index" value={
                <span className={`inline-flex items-center gap-1 ${active.indexState === "noindex" ? "text-warning" : "text-success"}`}>
                  {active.indexState === "noindex" ? <EyeOff className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {active.indexState}
                </span>
              } />
              <Row label="Override" value={active.hasOverride ? "Yes" : "No (code default)"} />
              <Row label="Description" value={active.description || "—"} />
            </dl>
            <a
              href={`/altftool/seo?path=${encodeURIComponent(active.path)}`}
              className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-primary hover:underline"
            >
              <Sparkles className="w-4 h-4" /> Edit SEO / get AI suggestion
            </a>
          </aside>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex gap-3">
      <dt className="text-muted w-20 shrink-0">{label}</dt>
      <dd className={`text-foreground break-words ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
