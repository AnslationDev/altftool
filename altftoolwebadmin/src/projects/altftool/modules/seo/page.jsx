"use client";

// ALTF Engine — SEO & Index Management (Config).
// Structured-JSON editor for the central SEO config + SEO Health + AI recos.

import { useEffect, useMemo, useState } from "react";
import {
  fetchSeoConfig,
  saveSeoConfig,
  runHealthCheck,
  fetchHealthHistory,
  getRecommendation,
} from "./services/seoService";
import { getErrorMessage } from "@/lib/apiClient";
import {
  Layers,
  Search,
  FileText,
  Globe,
  Save,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const SECTION_HINT = `{
  "enabled": false,
  "global": { "siteName": "AltFTool", "defaultBrandId": "altftool" },
  "brands": { "altftool": { "name": "AltFTool", "url": "https://altftool.com" } },
  "types": { "policies": { "description": "Official AltFTool policy page." } },
  "rules": [ { "pathGlob": "/news/topics/*", "set": { "noindex": true } } ],
  "pages": { "/tools/all/json-formatter": { "title": "Custom title" } }
}`;

const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";
const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border border-border bg-card text-foreground hover:bg-surface-soft transition disabled:opacity-50 disabled:cursor-not-allowed";
const INPUT =
  "w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";
const SEVERITY = {
  error: "bg-danger-soft text-danger",
  warn: "bg-warning-soft text-warning",
  info: "bg-primary-soft text-primary",
};

export default function SeoEnginePage() {
  const [text, setText] = useState("");
  const [original, setOriginal] = useState("");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [enabled, setEnabled] = useState(false);

  // Health
  const [health, setHealth] = useState(null);
  const [healthHistory, setHealthHistory] = useState([]);
  const [healthStatus, setHealthStatus] = useState("idle");

  // AI recommendations
  const [recoPath, setRecoPath] = useState("");
  const [recoContent, setRecoContent] = useState("");
  const [reco, setReco] = useState(null);
  const [recoStatus, setRecoStatus] = useState("idle");

  useEffect(() => {
    fetchHealthHistory().then(setHealthHistory).catch(() => {});
  }, []);

  // Deep-link: /altftool/seo?path=... pre-fills the AI section and scrolls to it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlPath = new URLSearchParams(window.location.search).get("path");
    if (urlPath) {
      setRecoPath(urlPath);
      setTimeout(() => document.getElementById("ai-recommendations")?.scrollIntoView({ behavior: "smooth" }), 300);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cfg = await fetchSeoConfig();
        if (!active) return;
        const pretty = JSON.stringify(cfg ?? {}, null, 2);
        setText(pretty);
        setOriginal(pretty);
        setEnabled(Boolean(cfg?.enabled));
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("ready");
        setIsError(true);
        setMessage(getErrorMessage(error));
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const dirty = useMemo(() => text !== original, [text, original]);

  async function handleSave(force = false) {
    setMessage("");
    setWarnings([]);
    setIsError(false);
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      setIsError(true);
      setMessage("Config is not valid JSON. Fix syntax before saving.");
      return;
    }
    parsed.enabled = enabled;
    setStatus("saving");
    try {
      const res = await saveSeoConfig(parsed, { force });
      const saved = JSON.stringify(parsed, null, 2);
      setOriginal(saved);
      setText(saved);
      setStatus("ready");
      setMessage(`Saved successfully (v${res.version}). Live within a few seconds.`);
      setWarnings(res.warnings || []);
    } catch (error) {
      setStatus("ready");
      setIsError(true);
      setMessage(getErrorMessage(error));
      setWarnings(error?.payload?.errors || []);
    }
  }

  async function handleRunHealth() {
    setHealthStatus("running");
    try {
      const report = await runHealthCheck();
      setHealth(report);
      setHealthStatus("idle");
      fetchHealthHistory().then(setHealthHistory).catch(() => {});
    } catch (error) {
      setHealthStatus("idle");
      setHealth({ error: getErrorMessage(error) });
    }
  }

  async function handleSuggest() {
    if (!recoPath.trim()) {
      setReco({ error: "Enter the page path first (e.g. /tools/all/json-formatter)." });
      return;
    }
    setRecoStatus("running");
    try {
      const result = await getRecommendation({ path: recoPath.trim(), content: recoContent });
      setReco(result);
    } catch (error) {
      setReco({ error: getErrorMessage(error) });
    } finally {
      setRecoStatus("idle");
    }
  }

  function handleApplyReco() {
    if (!reco?.suggestion || !recoPath.trim()) return;
    let cfg;
    try {
      cfg = JSON.parse(text);
    } catch {
      setMessage("Fix the config JSON before applying a suggestion.");
      setIsError(true);
      return;
    }
    cfg.pages = cfg.pages || {};
    const prev = cfg.pages[recoPath.trim()] || {};
    const { title, description, keywords } = reco.suggestion;
    cfg.pages[recoPath.trim()] = {
      ...prev,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(keywords?.length ? { keywords } : {}),
    };
    setText(JSON.stringify(cfg, null, 2));
    setMessage(`Applied suggestion to pages["${recoPath.trim()}"]. Review and Save to publish.`);
    setIsError(false);
  }

  const healthMetrics = health && !health.error ? health.metrics : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-slide-in">
      {/* Tab nav */}
      <nav className="flex items-center gap-6 border-b border-border pb-3">
        <a href="/altftool/seo/dashboard" className="text-muted hover:text-foreground pb-3 -mb-3.5 transition-colors flex items-center gap-1.5">
          <Layers className="w-4 h-4" /> Dashboard
        </a>
        <a href="/altftool/seo/search" className="text-muted hover:text-foreground pb-3 -mb-3.5 transition-colors flex items-center gap-1.5">
          <Search className="w-4 h-4" /> Search
        </a>
        <span className="font-semibold text-primary border-b-2 border-primary pb-3 -mb-3.5 flex items-center gap-1.5">
          <FileText className="w-4 h-4" /> Config
        </span>
        <a href="/altftool/seo/gsc" className="text-muted hover:text-foreground pb-3 -mb-3.5 transition-colors flex items-center gap-1.5">
          <Globe className="w-4 h-4" /> Search Console
        </a>
      </nav>

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">SEO Engine</h1>
          <p className="text-sm text-muted mt-1">
            Centralized SEO &amp; index management. Edits apply site-wide; page code still wins unless overridden per-URL.
          </p>
        </div>
        <label className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-border bg-card text-sm font-medium cursor-pointer select-none">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="accent-[var(--primary)] w-4 h-4" />
          Engine enabled
        </label>
      </header>

      {status === "loading" ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted">Loading config…</div>
      ) : (
        <>
          {/* Config editor */}
          <section className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="w-4 h-4 text-muted" /> Config (JSON)
            </div>
            <textarea
              spellCheck={false}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={SECTION_HINT}
              className="w-full min-h-[420px] font-mono text-[13px] leading-relaxed p-3 rounded-lg border border-border bg-surface-soft text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
            />

            {message && (
              <p className={`text-sm flex items-center gap-1.5 ${isError ? "text-danger" : "text-success"}`}>
                {isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                {message}
              </p>
            )}
            {warnings.length > 0 && (
              <ul className="space-y-1">
                {warnings.map((w, i) => (
                  <li key={i} className="text-xs text-warning flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {w}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex gap-2">
              <button type="button" disabled={status === "saving" || !dirty} onClick={() => handleSave(false)} className={BTN_PRIMARY}>
                <Save className="w-4 h-4" />
                {status === "saving" ? "Saving…" : "Save config"}
              </button>
              {warnings.length > 0 && (
                <button type="button" disabled={status === "saving"} onClick={() => handleSave(true)} className={BTN_SECONDARY} title="Save despite validation warnings">
                  Save anyway
                </button>
              )}
            </div>
          </section>

          {/* SEO Health */}
          <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-muted" /> SEO Health
                </h2>
                <p className="text-xs text-muted mt-0.5">Scans the config for noindex risks, redirect loops/chains, duplicate canonicals and conflicts.</p>
              </div>
              <button type="button" onClick={handleRunHealth} disabled={healthStatus === "running"} className={BTN_SECONDARY}>
                {healthStatus === "running" ? "Running…" : "Run health check"}
              </button>
            </div>

            {health?.error && <p className="text-danger text-sm mt-3 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{health.error}</p>}

            {healthMetrics && (
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Metric label="Score" value={`${healthMetrics.score}/100`} tone={healthMetrics.score >= 90 ? "success" : healthMetrics.score >= 70 ? "warning" : "danger"} />
                <Metric label="Errors" value={healthMetrics.errors} tone={healthMetrics.errors ? "danger" : "success"} />
                <Metric label="Warnings" value={healthMetrics.warnings} tone={healthMetrics.warnings ? "warning" : "success"} />
                <Metric label="Redirects" value={healthMetrics.redirects} />
                <Metric label="Noindex" value={healthMetrics.noindexPages} />
                <Metric label="Rules" value={healthMetrics.rules} />
              </div>
            )}

            {health?.findings?.length ? (
              <ul className="mt-4 space-y-1.5">
                {health.findings.map((f, i) => (
                  <li key={i} className="text-xs flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] ${SEVERITY[f.severity] || "bg-surface-soft text-muted"}`}>{f.severity}</span>
                    <span className="text-foreground">{f.message}</span>
                  </li>
                ))}
              </ul>
            ) : healthMetrics ? (
              <p className="mt-4 text-sm text-success flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> No issues found.</p>
            ) : null}

            {healthHistory.length > 0 && (
              <details className="mt-4">
                <summary className="text-xs text-muted cursor-pointer">History ({healthHistory.length})</summary>
                <ul className="mt-2 pl-4 space-y-1 text-xs text-muted">
                  {healthHistory.map((h) => (
                    <li key={h.id}>
                      {(h.createdAt || h.generatedAt || "").slice(0, 19).replace("T", " ")} — score {h.metrics?.score ?? "?"}, {h.metrics?.errors ?? 0} err / {h.metrics?.warnings ?? 0} warn{h.actorEmail ? ` (${h.actorEmail})` : ""}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </section>

          {/* AI Recommendations */}
          <section id="ai-recommendations" className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-muted" /> AI Recommendations
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Suggest title, description &amp; keywords for a page. Uses Gemini when configured, otherwise a heuristic. Applying writes a draft into the config — review and Save to publish.
              </p>
            </div>
            <input value={recoPath} onChange={(e) => setRecoPath(e.target.value)} placeholder="/tools/all/json-formatter" className={INPUT} />
            <textarea value={recoContent} onChange={(e) => setRecoContent(e.target.value)} placeholder="Paste the page's main content / description here (optional but improves results)" className={`${INPUT} min-h-[90px] resize-y`} />
            <button type="button" onClick={handleSuggest} disabled={recoStatus === "running"} className={BTN_PRIMARY}>
              <Sparkles className="w-4 h-4" />
              {recoStatus === "running" ? "Thinking…" : "Suggest SEO"}
            </button>

            {reco?.error && <p className="text-danger text-sm flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{reco.error}</p>}

            {reco?.suggestion && (
              <div className="rounded-lg border border-border bg-surface-soft p-4 space-y-1.5">
                <div className="text-[11px] uppercase tracking-wider text-muted">
                  Source: {reco.source === "ai" ? "Gemini AI" : "Heuristic (no AI key configured)"}
                </div>
                <p className="text-sm"><span className="font-semibold text-foreground">Title:</span> <span className="text-muted">{reco.suggestion.title || "—"}</span></p>
                <p className="text-sm"><span className="font-semibold text-foreground">Description:</span> <span className="text-muted">{reco.suggestion.description || "—"}</span></p>
                <p className="text-sm"><span className="font-semibold text-foreground">Keywords:</span> <span className="text-muted">{(reco.suggestion.keywords || []).join(", ") || "—"}</span></p>
                <button type="button" onClick={handleApplyReco} className={`${BTN_SECONDARY} mt-2`}>
                  Apply to config draft <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

const TONE = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

function Metric({ label, value, tone }) {
  return (
    <div className="min-w-[100px] px-3.5 py-2.5 rounded-lg border border-border bg-surface-soft">
      <div className="text-[11px] text-muted">{label}</div>
      <div className={`text-xl font-bold ${TONE[tone] || "text-foreground"}`}>{value}</div>
    </div>
  );
}
