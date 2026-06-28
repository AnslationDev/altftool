"use client";

import { useState } from "react";
import {
  AlertTriangle, CheckCircle2, ExternalLink, FileSearch, Link2, Loader2, Send, XCircle,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { inspectUrl, requestIndexing } from "../services/searchConsoleService";

function Row({ label, value, tone = "text-foreground" }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className={`max-w-[60%] truncate text-right text-xs font-semibold ${tone}`} title={String(value ?? "")}>{value ?? "—"}</span>
    </div>
  );
}

export default function UrlInspectionPanel({ defaultUrl = "" }) {
  const [url, setUrl] = useState(defaultUrl);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [data, setData] = useState(null);

  const run = async () => {
    if (!/^https?:\/\//i.test(url.trim())) {
      emitAlert({ type: "warning", message: "Poora URL daalo (https://…)." });
      return;
    }
    setLoading(true);
    setData(null);
    try {
      setData(await inspectUrl(url.trim()));
    } catch (err) {
      emitAlert({ type: "error", message: err.message || "Inspection failed" });
    } finally {
      setLoading(false);
    }
  };

  const requestIdx = async () => {
    setRequesting(true);
    try {
      const res = await requestIndexing(url.trim());
      const parts = [];
      if (res.sitemapResubmitted) parts.push("sitemap re-submitted");
      if (res.indexingApi?.ok) parts.push("Indexing API accepted");
      else if (res.indexingApi?.reason) parts.push("Indexing API skipped");
      emitAlert({ type: "success", message: `Indexing requested — ${parts.join(", ") || "done"}.` });
      if (res.inspectUrl) window.open(res.inspectUrl, "_blank", "noopener");
    } catch (err) {
      emitAlert({ type: "error", message: err.message || "Index request failed" });
    } finally {
      setRequesting(false);
    }
  };

  const insp = data?.inspection;

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
        <FileSearch className="h-4 w-4 text-primary" /> URL Inspection
      </h3>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="https://altftool.com/blogs/your-post"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        <button onClick={run} disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />} Inspect
        </button>
      </div>

      {insp && (
        <div className="mt-4 space-y-3">
          {/* Verdict banner */}
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
            insp.indexed ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
          }`}>
            {insp.indexed ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {insp.indexed ? "URL is on Google" : "URL is not indexed"} · {insp.coverageState}
          </div>

          {/* Issues */}
          {insp.issues.length > 0 && (
            <ul className="space-y-1.5">
              {insp.issues.map((i, idx) => (
                <li key={idx} className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold ${
                  i.severity === "blocker" ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning"
                }`}>
                  {i.type === "canonical" ? <Link2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                  {i.label}
                </li>
              ))}
            </ul>
          )}

          {/* Details */}
          <div className="rounded-lg border border-border bg-surface-soft px-3 divide-y divide-border">
            <Row label="Coverage" value={insp.coverageState} />
            <Row label="Last crawled" value={insp.lastCrawlTime ? new Date(insp.lastCrawlTime).toLocaleString() : "—"} />
            <Row label="Crawled as" value={insp.crawledAs || "—"} />
            <Row label="Robots.txt" value={insp.robotsTxtState || "—"} />
            <Row label="Your canonical" value={insp.canonical.user || "—"} />
            <Row label="Google canonical" value={insp.canonical.google || "—"} tone={insp.canonical.mismatch ? "text-danger" : "text-foreground"} />
            <Row label="Mobile usability" value={insp.mobileVerdict || "—"} />
            <Row label="Rich results" value={insp.richResultsVerdict || "—"} />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button onClick={requestIdx} disabled={requesting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {requesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Request indexing
            </button>
            {data.inspectUrl && (
              <a href={data.inspectUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-surface-soft">
                Open in Search Console <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <p className="text-[11px] text-muted">
            Note: Google has no API to force-index normal pages. "Request indexing" re-submits the sitemap and opens the official tool for a one-click manual request.
          </p>
        </div>
      )}
    </section>
  );
}
