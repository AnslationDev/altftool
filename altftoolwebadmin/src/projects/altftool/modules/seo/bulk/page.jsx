"use client";

// ALTF Engine — Bulk SEO Management.
// Search & filter pages, apply bulk meta updates, import/export CSV (Excel-compatible).

import { useEffect, useMemo, useState } from "react";
import {
  ListChecks,
  Search,
  Download,
  Upload,
  Wand2,
  RefreshCw,
  CheckSquare,
  Square,
  BadgeCheck,
} from "lucide-react";
import { fetchSeoConfig, saveSeoConfig, runPageSearch } from "../services/seoService";
import { getErrorMessage } from "@/lib/apiClient";
import SeoNav from "../components/SeoNav";
import { Field, Select, TextInput, KeywordsInput, Banner, SectionCard, BTN_PRIMARY, BTN_SECONDARY } from "../components/ui";
import {
  PAGE_TYPE_OPTIONS,
  CHANGE_FREQ_OPTIONS,
  pagesToCsv,
  csvToPages,
  downloadFile,
} from "../lib/seoModel";

const BULK_FIELDS = [
  { value: "noindex", label: "Robots: indexing" },
  { value: "follow", label: "Robots: follow links" },
  { value: "include", label: "Sitemap: include" },
  { value: "changeFreq", label: "Sitemap: change frequency" },
  { value: "priority", label: "Sitemap: priority" },
  { value: "addKeywords", label: "Append keywords" },
];

export default function BulkSeoPage() {
  const [config, setConfig] = useState(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(() => new Set());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // bulk patch controls
  const [field, setField] = useState("noindex");
  const [boolVal, setBoolVal] = useState("true");
  const [freqVal, setFreqVal] = useState("weekly");
  const [priorityVal, setPriorityVal] = useState("0.5");
  const [keywordsVal, setKeywordsVal] = useState([]);

  // import
  const [importText, setImportText] = useState("");
  const [importPreview, setImportPreview] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const cfg = await fetchSeoConfig();
        setConfig(cfg || {});
      } catch (e) {
        setIsError(true);
        setMessage(getErrorMessage(e));
      }
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await runPageSearch(query.trim() || " ", typeFilter);
        setRows(res.results || []);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, typeFilter]);

  const filteredRows = useMemo(() => {
    if (typeFilter === "all") return rows;
    return rows.filter((r) => r.pageType === typeFilter);
  }, [rows, typeFilter]);

  const allSelected = filteredRows.length > 0 && filteredRows.every((r) => selected.has(r.path));

  function toggle(path) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  }
  function toggleAll() {
    setSelected((prev) => {
      if (filteredRows.every((r) => prev.has(r.path))) {
        const next = new Set(prev);
        filteredRows.forEach((r) => next.delete(r.path));
        return next;
      }
      const next = new Set(prev);
      filteredRows.forEach((r) => next.add(r.path));
      return next;
    });
  }

  function patchForField(existing) {
    const entry = { ...existing };
    switch (field) {
      case "noindex":
        if (boolVal === "true") delete entry.noindex; // index = default
        else entry.noindex = true;
        break;
      case "follow":
        if (boolVal === "true") delete entry.follow;
        else entry.follow = false;
        break;
      case "include":
        entry.sitemap = { ...(entry.sitemap || {}), include: boolVal === "true" };
        break;
      case "changeFreq":
        entry.sitemap = { ...(entry.sitemap || {}), changeFreq: freqVal };
        break;
      case "priority": {
        const n = Math.max(0, Math.min(1, Number(priorityVal)));
        entry.sitemap = { ...(entry.sitemap || {}), priority: n };
        break;
      }
      case "addKeywords": {
        const merged = [...new Set([...(entry.keywords || []), ...keywordsVal])].filter(Boolean);
        if (merged.length) entry.keywords = merged;
        break;
      }
      default:
        break;
    }
    return entry;
  }

  async function applyBulk() {
    if (!selected.size) return;
    setSaving(true);
    setMessage("");
    setIsError(false);
    const pages = { ...(config.pages || {}) };
    for (const path of selected) {
      pages[path] = patchForField(pages[path] || {});
      if (!Object.keys(pages[path]).length) delete pages[path];
    }
    try {
      const res = await saveSeoConfig({ ...config, pages }, {});
      setConfig({ ...config, pages });
      setMessage(`Applied to ${selected.size} page(s) (v${res.version}).`);
    } catch (e) {
      setIsError(true);
      setMessage(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  function exportCsv(scope) {
    const pages = config?.pages || {};
    const paths = scope === "selected" ? [...selected] : Object.keys(pages);
    if (!paths.length) {
      setIsError(true);
      setMessage(scope === "selected" ? "No rows selected to export." : "No page overrides to export yet.");
      return;
    }
    downloadFile(`altftool-seo-${scope}-${Date.now()}.csv`, pagesToCsv(pages, paths));
  }

  function onImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setImportText(text);
      setImportPreview(csvToPages(text));
    };
    reader.readAsText(file);
  }

  function previewImportText(text) {
    setImportText(text);
    setImportPreview(text.trim() ? csvToPages(text) : null);
  }

  async function applyImport() {
    if (!importPreview) return;
    const merged = { ...(config.pages || {}) };
    for (const [path, entry] of Object.entries(importPreview.pages)) {
      merged[path] = { ...(merged[path] || {}), ...entry };
    }
    setSaving(true);
    setMessage("");
    setIsError(false);
    try {
      const res = await saveSeoConfig({ ...config, pages: merged }, {});
      setConfig({ ...config, pages: merged });
      setMessage(`Imported ${Object.keys(importPreview.pages).length} page override(s) (v${res.version}).`);
      setImportText("");
      setImportPreview(null);
    } catch (e) {
      setIsError(true);
      setMessage(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12 animate-slide-in">
      <SeoNav active="bulk" />

      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <ListChecks className="h-6 w-6 text-primary" /> Bulk SEO Management
        </h1>
        <p className="mt-1 text-sm text-muted">Search, filter and update many pages at once, or import/export overrides as CSV.</p>
      </header>

      {message && (
        <Banner tone={isError ? "danger" : "success"}>{message}</Banner>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Table */}
        <SectionCard
          title="Pages"
          icon={Search}
          description="Select rows to apply a bulk change."
          actions={
            <div className="flex items-center gap-2">
              <Select value={typeFilter} onChange={setTypeFilter} options={["all", ...PAGE_TYPE_OPTIONS]} />
            </div>
          }
        >
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by title or path…"
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <div className="flex items-center gap-2 border-b border-border bg-surface-soft px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
              <button type="button" onClick={toggleAll} className="text-muted hover:text-foreground" aria-label="Select all">
                {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              </button>
              <span className="flex-1">Page</span>
              <span className="w-20">Type</span>
              <span className="w-16 text-right">Override</span>
            </div>
            <div className="max-h-[52vh] overflow-y-auto">
              {loading ? (
                <div className="flex items-center gap-2 px-3 py-6 text-sm text-muted">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Loading pages…
                </div>
              ) : filteredRows.length === 0 ? (
                <p className="px-3 py-6 text-sm text-muted">No pages match the current filter.</p>
              ) : (
                filteredRows.map((r) => (
                  <label
                    key={r.path}
                    className={`flex cursor-pointer items-center gap-2 border-b border-border px-3 py-2 text-sm last:border-0 hover:bg-surface-soft ${
                      selected.has(r.path) ? "bg-primary-soft/40" : ""
                    }`}
                  >
                    <button type="button" onClick={() => toggle(r.path)} className="text-muted" aria-label="Select row">
                      {selected.has(r.path) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                    </button>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-foreground">{r.title || r.path}</span>
                      <span className="block truncate font-mono text-xs text-muted">{r.path}</span>
                    </span>
                    <span className="w-20 truncate text-xs capitalize text-muted">{r.pageType}</span>
                    <span className="flex w-16 justify-end">
                      {config?.pages?.[r.path] ? <BadgeCheck className="h-4 w-4 text-success" /> : <span className="text-xs text-muted">—</span>}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">{selected.size} selected · {filteredRows.length} shown</p>
        </SectionCard>

        {/* Bulk + CSV panel */}
        <div className="space-y-6">
          <SectionCard title="Bulk update" icon={Wand2} description="Apply one change to all selected pages.">
            <Field label="Field">
              <Select value={field} onChange={setField} options={BULK_FIELDS} />
            </Field>
            {(field === "noindex" || field === "follow" || field === "include") && (
              <Field label="Value">
                <Select
                  value={boolVal}
                  onChange={setBoolVal}
                  options={
                    field === "noindex"
                      ? [{ value: "true", label: "Indexable (index)" }, { value: "false", label: "Noindex" }]
                      : field === "follow"
                        ? [{ value: "true", label: "Follow" }, { value: "false", label: "Nofollow" }]
                        : [{ value: "true", label: "Include in sitemap" }, { value: "false", label: "Exclude from sitemap" }]
                  }
                />
              </Field>
            )}
            {field === "changeFreq" && (
              <Field label="Change frequency">
                <Select value={freqVal} onChange={setFreqVal} options={CHANGE_FREQ_OPTIONS} />
              </Field>
            )}
            {field === "priority" && (
              <Field label="Priority (0.0–1.0)">
                <TextInput type="number" value={priorityVal} onChange={setPriorityVal} placeholder="0.5" />
              </Field>
            )}
            {field === "addKeywords" && (
              <Field label="Keywords to append">
                <KeywordsInput value={keywordsVal} onChange={setKeywordsVal} />
              </Field>
            )}
            <button type="button" onClick={applyBulk} disabled={saving || !selected.size} className={`${BTN_PRIMARY} w-full`}>
              <Wand2 className="h-4 w-4" /> {saving ? "Applying…" : `Apply to ${selected.size || 0} page(s)`}
            </button>
          </SectionCard>

          <SectionCard title="Export" icon={Download} description="Download overrides as CSV (opens in Excel/Sheets).">
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => exportCsv("all")} className={BTN_SECONDARY}>
                <Download className="h-4 w-4" /> Export all overrides
              </button>
              <button type="button" onClick={() => exportCsv("selected")} disabled={!selected.size} className={BTN_SECONDARY}>
                <Download className="h-4 w-4" /> Export selected ({selected.size})
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Import" icon={Upload} description="Upload or paste CSV. The path column is required.">
            <input type="file" accept=".csv,text/csv" onChange={onImportFile} className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary" />
            <textarea
              value={importText}
              onChange={(e) => previewImportText(e.target.value)}
              rows={5}
              placeholder="path,title,description,keywords,canonical,…"
              className="mt-2 w-full rounded-lg border border-border bg-surface-soft p-2 font-mono text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
            {importPreview && (
              <div className="mt-2 space-y-2">
                <Banner tone={importPreview.errors.length ? "warning" : "info"}>
                  {Object.keys(importPreview.pages).length} page(s) parsed
                  {importPreview.errors.length ? ` · ${importPreview.errors.length} warning(s)` : ""}
                </Banner>
                {importPreview.errors.length > 0 && (
                  <ul className="max-h-24 list-disc space-y-0.5 overflow-y-auto pl-4 text-xs text-warning">
                    {importPreview.errors.slice(0, 10).map((er, i) => (
                      <li key={i}>{er}</li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  onClick={applyImport}
                  disabled={saving || !Object.keys(importPreview.pages).length}
                  className={`${BTN_PRIMARY} w-full`}
                >
                  <Upload className="h-4 w-4" /> {saving ? "Importing…" : "Merge & save import"}
                </button>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
