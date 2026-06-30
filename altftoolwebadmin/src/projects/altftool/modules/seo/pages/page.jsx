"use client";

// ALTF Engine — Page-Level SEO Management workspace.
// Search the page registry, pick any page (or type a path), and edit its full
// SEO field set with live previews. Persists into seo/runtime.pages[path].

import { useCallback, useEffect, useState } from "react";
import { Search, FileEdit, ArrowRight, BadgeCheck, CornerDownLeft, RefreshCw } from "lucide-react";
import { fetchSeoConfig, saveSeoConfig, runPageSearch } from "../services/seoService";
import { getErrorMessage } from "@/lib/apiClient";
import SeoNav from "../components/SeoNav";
import { Banner, BTN_SECONDARY } from "../components/ui";
import { readPageEntry, compactPageEntry } from "../lib/seoModel";
import PageEditor from "./components/PageEditor";

export default function PageSeoWorkspace() {
  const [config, setConfig] = useState(null);
  const [configStatus, setConfigStatus] = useState("loading");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [manualPath, setManualPath] = useState("");

  const [activePath, setActivePath] = useState("");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Load full config once (needed for editing + saving merges).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cfg = await fetchSeoConfig();
        if (!active) return;
        setConfig(cfg || {});
        setConfigStatus("ready");
        const deep = new URLSearchParams(window.location.search).get("path");
        if (deep) openPath(deep, cfg || {});
      } catch (e) {
        if (!active) return;
        setConfigStatus("error");
        setMessage(getErrorMessage(e));
        setIsError(true);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced registry search.
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await runPageSearch(query.trim(), "all");
        setResults(res.results || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const openPath = useCallback((rawPath, cfg) => {
    // Accept a full URL or a path; always edit by the URL pathname so the key
    // matches what the SEO engine resolves at runtime (never "/https://...").
    let normalized = String(rawPath || "").trim();
    if (/^https?:\/\//i.test(normalized)) {
      try {
        normalized = new URL(normalized).pathname || "/";
      } catch {
        /* keep as typed */
      }
    } else if (/^\/https?:\/\//i.test(normalized)) {
      // Repair a previously mangled "/https://host/path" value.
      try {
        normalized = new URL(normalized.slice(1)).pathname || "/";
      } catch {
        /* keep as typed */
      }
    }
    if (!normalized.startsWith("/")) normalized = `/${normalized}`;
    setActivePath(normalized);
    setForm(readPageEntry(cfg || config || {}, normalized));
    setMessage("");
    setIsError(false);
  }, [config]);

  async function persist(nextConfig, successMsg) {
    setSaving(true);
    setMessage("");
    setIsError(false);
    try {
      const res = await saveSeoConfig(nextConfig, {});
      setConfig(nextConfig);
      setMessage(`${successMsg} (v${res.version}). Live within a few seconds.`);
      setIsError(false);
    } catch (e) {
      setIsError(true);
      setMessage(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(schemaError) {
    if (schemaError) return;
    const entry = compactPageEntry(form);
    const pages = { ...(config.pages || {}) };
    if (Object.keys(entry).length) pages[activePath] = entry;
    else delete pages[activePath];
    await persist({ ...config, pages }, "Saved page SEO");
  }

  async function handleDelete() {
    const pages = { ...(config.pages || {}) };
    delete pages[activePath];
    await persist({ ...config, pages }, "Cleared override");
    setForm(readPageEntry({ ...config, pages }, activePath));
  }

  const hasOverride = (path) => Boolean(config?.pages?.[path]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12 animate-slide-in">
      <SeoNav active="pages" />

      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <FileEdit className="h-6 w-6 text-primary" /> Page-Level SEO
        </h1>
        <p className="mt-1 text-sm text-muted">
          Search any page, tool, blog, category or dynamic route and edit its meta, social, schema and indexing — no code changes.
        </p>
      </header>

      {configStatus === "error" && <Banner tone="danger">{message}</Banner>}

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Picker */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages by title or path…"
                className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualPath.trim()) openPath(manualPath.trim());
              }}
              className="mt-3 flex gap-2"
            >
              <input
                value={manualPath}
                onChange={(e) => setManualPath(e.target.value)}
                placeholder="/exact/path"
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button type="submit" className={BTN_SECONDARY} title="Open this path">
                <CornerDownLeft className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-3 max-h-[60vh] space-y-1 overflow-y-auto">
              {searching && (
                <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Searching…
                </div>
              )}
              {!searching && query && results.length === 0 && (
                <p className="px-2 py-3 text-sm text-muted">No matches. You can still edit an exact path above.</p>
              )}
              {results.map((r) => (
                <button
                  key={r.path}
                  type="button"
                  onClick={() => openPath(r.path)}
                  className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left transition ${
                    activePath === r.path
                      ? "border-primary bg-primary-soft"
                      : "border-transparent hover:border-border hover:bg-surface-soft"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">{r.title || r.path}</div>
                    <div className="truncate font-mono text-xs text-muted">{r.path}</div>
                  </div>
                  {hasOverride(r.path) && <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" title="Has override" />}
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Editor */}
        <main>
          {!activePath || !form ? (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
              <FileEdit className="mb-3 h-8 w-8 text-muted" />
              <p className="font-semibold text-foreground">Select a page to edit its SEO</p>
              <p className="mt-1 max-w-sm text-sm text-muted">
                Use the search or type an exact path. Pages with a green badge already have an override.
              </p>
            </div>
          ) : (
            <PageEditor
              config={config}
              path={activePath}
              form={form}
              onChange={setForm}
              onSave={handleSave}
              onDelete={handleDelete}
              saving={saving}
              message={message}
              isError={isError}
            />
          )}
        </main>
      </div>
    </div>
  );
}
